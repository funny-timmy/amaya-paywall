// Drizzle прячет исходную ошибку Postgres в error.cause — выводим её в лог сервера,
// иначе видно только «Failed query: ...» без причины.
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', (error) => {
    let cause: unknown = (error as { cause?: unknown }).cause
    while (cause && typeof cause === 'object' && 'cause' in cause && (cause as { cause?: unknown }).cause) {
      cause = (cause as { cause?: unknown }).cause
    }
    if (cause) console.error('[cause]', cause instanceof Error ? cause.message : cause)
  })
})
