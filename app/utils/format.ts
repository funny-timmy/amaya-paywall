import type { Money } from '#shared/types/paywall'

const formatters = new Map<string, Intl.NumberFormat>()

/** 199000 RUB → «1 990 ₽» */
export function formatMoney({ amountMinor, currency }: Money): string {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    formatters.set(currency, formatter)
  }
  return formatter.format(amountMinor / 100)
}
