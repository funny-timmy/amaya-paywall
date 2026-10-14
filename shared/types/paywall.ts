// Общие типы ответов API — используются и сервером, и клиентом.

export interface Money {
  /** Сумма в минимальных единицах валюты: 199000 = 1990.00 ₽ */
  amountMinor: number
  /** ISO 4217 */
  currency: string
}

/** Оффер = тариф (plans) + как он показан на paywall (paywall_offers) */
export interface Offer {
  planId: string
  title: string
  note: string
  badge: string | null
  isDefault: boolean
  price: Money
  durationMonths: number
  /** Цена в пересчёте на месяц — только для тарифов длиннее месяца */
  pricePerMonth: Money | null
}

export interface OffersResponse {
  offers: Offer[]
}

export interface PlanAccessInfo {
  planId: string
  startsAt: string
  endsAt: string
}

export interface PurchaseResponse {
  purchaseId: string
  planId: string
  createdAt: string
  access: PlanAccessInfo
}

export interface AccessResponse {
  access: PlanAccessInfo | null
}

/** data у ошибки 409 от POST /api/purchase, когда доступ уже действует */
export interface AlreadyActiveErrorData {
  code: 'already_active'
  access: PlanAccessInfo
}
