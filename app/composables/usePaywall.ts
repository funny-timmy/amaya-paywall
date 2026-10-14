import type {
  AccessResponse,
  AlreadyActiveErrorData,
  Offer,
  OffersResponse,
  PlanAccessInfo,
  PurchaseResponse,
} from '#shared/types/paywall'

export type PurchaseState =
  | { status: 'idle' }
  | { status: 'purchasing' }
  | { status: 'error' }
  | { status: 'success'; access: PlanAccessInfo }

export function usePaywall() {
  const route = useRoute()
  const getDeviceId = useDeviceId()

  // ?fail=offers | ?fail=purchase — демо ошибок на живом стенде
  const demoFail = computed(() => (typeof route.query.fail === 'string' ? route.query.fail : undefined))

  // Тарифы грузим на клиенте: экран открывается сразу, карточки показывают скелетон
  const {
    data,
    status: offersStatus,
    refresh: reloadOffers,
  } = useFetch<OffersResponse>('/api/offers', {
    query: { fail: demoFail },
    server: false,
    lazy: true,
  })

  const offers = computed<Offer[]>(() => data.value?.offers ?? [])
  const offersLoading = computed(() => offersStatus.value === 'idle' || offersStatus.value === 'pending')
  const offersFailed = computed(() => offersStatus.value === 'error')

  const selectedPlanId = ref<string | null>(null)
  watch(
    offers,
    (list) => {
      if (selectedPlanId.value && list.some((o) => o.planId === selectedPlanId.value)) return
      selectedPlanId.value = (list.find((o) => o.isDefault) ?? list[0])?.planId ?? null
    },
    { immediate: true },
  )
  const selectedOffer = computed(() => offers.value.find((o) => o.planId === selectedPlanId.value) ?? null)

  const purchase = ref<PurchaseState>({ status: 'idle' })
  const isPurchasing = computed(() => purchase.value.status === 'purchasing')

  // Ключ идемпотентности живёт в рамках одной попытки покупки:
  // ретрай после ошибки идёт с тем же ключом, смена тарифа или успех — сбрасывают его
  let idempotencyKey: string | null = null

  function selectPlan(planId: string) {
    if (isPurchasing.value || planId === selectedPlanId.value) return
    selectedPlanId.value = planId
    idempotencyKey = null
    if (purchase.value.status === 'error') purchase.value = { status: 'idle' }
  }

  async function buy() {
    const offer = selectedOffer.value
    if (!offer || isPurchasing.value) return

    idempotencyKey ??= crypto.randomUUID()
    purchase.value = { status: 'purchasing' }
    try {
      const result = await $fetch<PurchaseResponse>('/api/purchase', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        query: { fail: demoFail.value },
        body: { planId: offer.planId, deviceId: getDeviceId() },
      })
      idempotencyKey = null
      purchase.value = { status: 'success', access: result.access }
      postToNative({ type: 'purchased', planId: result.planId, endsAt: result.access.endsAt })
    } catch (error) {
      // Доступ уже действует (например, куплен на другой вкладке) — показываем его вместо ошибки
      const active = alreadyActiveAccess(error)
      if (active) {
        idempotencyKey = null
        purchase.value = { status: 'success', access: active }
        return
      }
      purchase.value = { status: 'error' }
    }
  }

  /** null — доступа нет; бросает исключение при ошибке сети/сервера */
  async function restore(): Promise<PlanAccessInfo | null> {
    const { access } = await $fetch<AccessResponse>('/api/access', { query: { deviceId: getDeviceId() } })
    if (access) purchase.value = { status: 'success', access }
    return access
  }

  // При открытии проверяем, нет ли у устройства действующего доступа:
  // если есть — сразу экран «Всё открыто», покупать второй тариф нельзя
  const accessChecked = ref(false)
  onMounted(async () => {
    try {
      const { access } = await $fetch<AccessResponse>('/api/access', { query: { deviceId: getDeviceId() } })
      if (access && purchase.value.status !== 'success') purchase.value = { status: 'success', access }
    } catch {
      // Не смогли проверить — показываем paywall; сервер всё равно не даст купить второй раз
    } finally {
      accessChecked.value = true
    }
  })

  return {
    accessChecked,
    offers,
    offersLoading,
    offersFailed,
    reloadOffers,
    selectedPlanId,
    selectedOffer,
    selectPlan,
    purchase,
    isPurchasing,
    buy,
    restore,
  }
}

function alreadyActiveAccess(error: unknown): PlanAccessInfo | null {
  const data = (error as { data?: { data?: Partial<AlreadyActiveErrorData> } })?.data?.data
  return data?.code === 'already_active' && data.access ? data.access : null
}
