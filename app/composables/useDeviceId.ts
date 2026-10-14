const STORAGE_KEY = 'paywall:device-id'

/**
 * Идентификатор устройства.
 * В продакшене его передаёт приложение в URL webview (?deviceId=...).
 * Если параметра нет — генерируем UUID и храним в localStorage.
 *
 * Демо-режим (?fail=offers | ?fail=purchase без ?deviceId): берём одноразовый id на загрузку
 * страницы, иначе устройство с уже купленной подпиской сразу видит экран «Всё открыто»
 * и до демонстрации ошибки не доходит.
 *
 * Работает только на клиенте.
 */
export function useDeviceId(): () => string {
  const route = useRoute()

  return () => {
    const fromQuery = route.query.deviceId
    if (typeof fromQuery === 'string' && fromQuery.trim()) return fromQuery.trim()

    if (typeof route.query.fail === 'string') return (demoDeviceId ??= `demo-${crypto.randomUUID()}`)

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return stored
      const created = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, created)
      return created
    } catch {
      // localStorage недоступен (приватный режим, запрет в webview) — живём с id на сессию
      return (sessionDeviceId ??= crypto.randomUUID())
    }
  }
}

let sessionDeviceId: string | undefined
let demoDeviceId: string | undefined
