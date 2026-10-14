<script setup lang="ts">
const {
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
} = usePaywall()

const ctaLabel = computed(() => (selectedOffer.value ? `Купить за ${formatMoney(selectedOffer.value.price)}` : 'Купить'))

const purchasedTitle = computed(() => {
  if (purchase.value.status !== 'success') return ''
  const { planId } = purchase.value.access
  return offers.value.find((o) => o.planId === planId)?.title ?? planId
})

// --- «Восстановить покупки»
const toast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined
function showToast(message: string) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2500)
}

const restoring = ref(false)
async function onRestore() {
  if (restoring.value) return
  restoring.value = true
  try {
    const access = await restore()
    if (!access) showToast('Покупок на этом устройстве не найдено')
  } catch {
    showToast('Не удалось проверить покупки. Попробуй ещё раз')
  } finally {
    restoring.value = false
  }
}

const close = () => postToNative({ type: 'close' })
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col pt-[env(safe-area-inset-top)]">
    <PurchaseSuccess
      v-if="purchase.status === 'success'"
      :plan-title="purchasedTitle"
      :ends-at="purchase.access.endsAt"
      @play="close"
    />

    <template v-else>
      <main class="flex-1 pr-[max(20px,env(safe-area-inset-right))] pl-[max(20px,env(safe-area-inset-left))]">
        <div class="relative h-11">
          <button
            type="button"
            aria-label="Закрыть"
            class="absolute top-0 -right-2.5 grid size-11 place-items-center rounded-full enabled:active:bg-black/5"
            @click="close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="text-fg-muted" />
            </svg>
          </button>
        </div>

        <PaywallHero />

        <PerkList class="pt-5" />

        <section class="pt-5" aria-label="Тарифы">
          <OffersLoadError v-if="offersFailed" :retrying="offersLoading" @retry="reloadOffers()" />

          <!-- Пока не проверили доступ устройства, тарифы не показываем: вдруг подписка уже есть -->
          <div v-else-if="offersLoading || !accessChecked" class="flex flex-col gap-3" aria-busy="true">
            <OfferCardSkeleton v-for="i in 2" :key="i" />
          </div>

          <div v-else role="radiogroup" aria-label="Тариф" class="flex flex-col gap-3">
            <OfferCard
              v-for="offer in offers"
              :key="offer.planId"
              :offer="offer"
              :selected="offer.planId === selectedPlanId"
              :disabled="isPurchasing"
              @select="selectPlan(offer.planId)"
            />
          </div>
        </section>
      </main>

      <PaywallFooter
        :cta-label="ctaLabel"
        :loading="isPurchasing"
        :preparing="!offersFailed && (offersLoading || !accessChecked)"
        :disabled="!selectedOffer || !accessChecked"
        :restoring="restoring"
        :error="purchase.status === 'error' ? 'Не получилось оформить покупку. Попробуй ещё раз' : null"
        @buy="buy"
        @restore="onRestore"
      />
    </template>

    <AppToast :message="toast" />
  </div>
</template>
