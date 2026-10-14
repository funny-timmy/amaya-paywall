/**
 * Связь с нативным приложением, внутри которого открыт webview.
 * iOS: window.webkit.messageHandlers.paywall.postMessage(...)
 * Android: window.PaywallBridge.postMessage(JSON)
 * В обычном браузере сообщения просто логируются.
 */
type BridgeMessage = { type: 'close' } | { type: 'purchased'; planId: string; endsAt: string }

interface BridgeWindow {
  webkit?: { messageHandlers?: { paywall?: { postMessage: (message: unknown) => void } } }
  PaywallBridge?: { postMessage: (message: string) => void }
}

export function postToNative(message: BridgeMessage) {
  if (import.meta.server) return
  const w = window as unknown as BridgeWindow
  if (w.webkit?.messageHandlers?.paywall) {
    w.webkit.messageHandlers.paywall.postMessage(message)
  } else if (w.PaywallBridge) {
    w.PaywallBridge.postMessage(JSON.stringify(message))
  } else {
    console.info('[native bridge]', message)
  }
}
