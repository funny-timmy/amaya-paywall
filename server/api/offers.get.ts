import { asc, eq, sql } from 'drizzle-orm'
import type { OffersResponse } from '#shared/types/paywall'

export default defineEventHandler(async (event): Promise<OffersResponse> => {
  failIfDemoRequested(event, 'offers')

  const { plans, paywallOffers } = schema
  const rows = await useDb()
    .select({
      planId: plans.id,
      title: paywallOffers.title,
      note: paywallOffers.note,
      badge: paywallOffers.badge,
      isDefault: paywallOffers.isDefault,
      priceMinor: plans.priceMinor,
      currency: plans.currency,
      durationMonths: sql<number>`(extract(year from ${plans.duration}) * 12 + extract(month from ${plans.duration}))::int`,
    })
    .from(paywallOffers)
    .innerJoin(plans, eq(plans.id, paywallOffers.planId))
    .where(eq(plans.isActive, true))
    .orderBy(asc(paywallOffers.sortOrder))

  setResponseHeader(event, 'Cache-Control', 'no-store')

  return {
    offers: rows.map((r) => ({
      planId: r.planId,
      title: r.title,
      note: r.note,
      badge: r.badge,
      isDefault: r.isDefault,
      price: { amountMinor: r.priceMinor, currency: r.currency },
      durationMonths: r.durationMonths,
      pricePerMonth:
        r.durationMonths > 1
          ? // округляем до целых рублей: «166 ₽ в месяц», а не «165,83 ₽»
            { amountMinor: Math.round(r.priceMinor / r.durationMonths / 100) * 100, currency: r.currency }
          : null,
    })),
  }
})
