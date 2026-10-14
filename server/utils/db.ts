import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

export type Db = PostgresJsDatabase<typeof schema>

let db: Db | undefined

/**
 * Один клиент на инстанс функции.
 * max: 1 — в serverless каждая функция держит одно соединение;
 * prepare: false — совместимость с pooled-эндпоинтом Neon (PgBouncer в transaction mode).
 */
export function useDb(): Db {
  if (db) return db
  const { databaseUrl } = useRuntimeConfig()
  if (!databaseUrl) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_DATABASE_URL is not set' })
  }
  const client = postgres(databaseUrl, { max: 1, prepare: false, onnotice: () => {} })
  db = drizzle(client, { schema })
  return db
}

export { schema }
