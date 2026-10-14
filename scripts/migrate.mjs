// Простой раннер SQL-миграций: применяет server/db/migrations/*.sql по порядку,
// каждую в своей транзакции, и запоминает применённые в таблице schema_migrations.
// Миграции пишутся руками: EXCLUDE-ограничение Drizzle Kit сгенерировать не умеет.
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import postgres from 'postgres'

const url = process.env.NUXT_DATABASE_URL
if (!url) {
  console.error('NUXT_DATABASE_URL не задан. Скопируй .env.example в .env')
  process.exit(1)
}

const dir = join(import.meta.dirname, '..', 'server', 'db', 'migrations')
const sql = postgres(url, { max: 1, onnotice: () => {} })

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text        PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`

  const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((r) => r.name))
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    if (applied.has(file)) continue
    const body = await readFile(join(dir, file), 'utf8')
    await sql.begin(async (tx) => {
      await tx.unsafe(body)
      await tx`INSERT INTO schema_migrations (name) VALUES (${file})`
    })
    console.log(`applied ${file}`)
  }
  console.log('migrations up to date')
} finally {
  await sql.end()
}
