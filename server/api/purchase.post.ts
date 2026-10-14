import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import type { PurchaseResponse } from '#shared/types/paywall'
import type { Db } from '../utils/db'
import { findActiveAccess } from '../utils/access'

const bodySchema = z.object({
  planId: z.string().trim().min(1).max(64),
  deviceId: z.string().trim().min(1).max(128),
})

const idempotencyKeySchema = z.uuid()

/**
 * Тестовая покупка тарифа.
 *
 * Idempotency-Key (UUID) генерирует клиент на попытку покупки и повторяет его при ретрае:
 * повторный запрос с тем же ключом вернёт ту же покупку, а не создаст новую.
 *
 * В одной транзакции: запись в purchases + период доступа в plan_access.
 * У устройства может быть только один действующий доступ: если он уже есть,
 * покупка отклоняется с 409 already_active, а в ответе приходит текущий доступ.
 */
export default defineEventHandler(async (event): Promise<PurchaseResponse> => {
  const key = idempotencyKeySchema.safeParse(getHeader(event, 'idempotency-key'))
  if (!key.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Idempotency-Key header must be a UUID',
      data: { code: 'invalid_idempotency_key' },
    })
  }
  const requestId = key.data
  const { planId, deviceId } = await readValidatedBody(event, bodySchema.parse)

  failIfDemoRequested(event, 'purchase')
  // Имитация ответа стора, чтобы состояние «Оформляем…» было видно
  await sleep(700)

  try {
    return await purchase({ requestId, planId, deviceId })
  } catch (error) {
    const pg = postgresError(error)
    // Параллельный запрос с тем же ключом успел первым — отдаём его результат
    if (pg?.code === '23505' && pg.constraint_name === 'purchases_request_uq') {
      const existing = await findByRequestId(useDb(), requestId)
      if (existing) return ensureSameRequest(existing, { planId, deviceId })
    }
    // Сработал plan_access_no_overlap — пересечение периодов доступа
    if (pg?.code === '23P01') {
      throw createError({ statusCode: 409, statusMessage: 'Access periods overlap', data: { code: 'access_overlap' } })
    }
    throw error
  }
})

type Input = { requestId: string; planId: string; deviceId: string }

async function purchase({ requestId, planId, deviceId }: Input): Promise<PurchaseResponse> {
  return useDb().transaction(async (tx) => {
    // Сериализуем покупки одного устройства: проверка «нет активного доступа» и вставка
    // не должны гоняться между параллельными запросами
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${deviceId}, 0))`)

    const existing = await findByRequestId(tx, requestId)
    if (existing) return ensureSameRequest(existing, { planId, deviceId })

    const { plans, purchases } = schema
    const [plan] = await tx
      .select({ id: plans.id, priceMinor: plans.priceMinor, currency: plans.currency })
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.isActive, true)))
    if (!plan) {
      throw createError({ statusCode: 404, statusMessage: 'Plan not found', data: { code: 'plan_not_found' } })
    }

    const active = await findActiveAccess(tx, deviceId)
    if (active) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Device already has active access',
        data: { code: 'already_active', access: active },
      })
    }

    const [created] = await tx
      .insert(purchases)
      .values({ planId: plan.id, deviceId, requestId, priceMinor: plan.priceMinor, currency: plan.currency })
      .returning({ id: purchases.id, createdAt: purchases.createdAt })

    const [access] = await tx.execute<{ plan_id: string; starts_at: Date; ends_at: Date }>(sql`
      INSERT INTO plan_access (device_id, plan_id, purchase_id, starts_at, ends_at)
      SELECT ${deviceId}, p.id, ${created!.id}, now(), now() + p.duration
      FROM plans p
      WHERE p.id = ${plan.id}
      RETURNING plan_id, starts_at, ends_at
    `)

    return {
      purchaseId: created!.id,
      planId: plan.id,
      createdAt: created!.createdAt.toISOString(),
      access: {
        planId: access!.plan_id,
        startsAt: new Date(access!.starts_at).toISOString(),
        endsAt: new Date(access!.ends_at).toISOString(),
      },
    }
  })
}

type Existing = PurchaseResponse & { deviceId: string }

async function findByRequestId(db: Pick<Db, 'select'>, requestId: string): Promise<Existing | null> {
  const { purchases, planAccess } = schema
  const [row] = await db
    .select({
      purchaseId: purchases.id,
      planId: purchases.planId,
      deviceId: purchases.deviceId,
      createdAt: purchases.createdAt,
      startsAt: planAccess.startsAt,
      endsAt: planAccess.endsAt,
    })
    .from(purchases)
    .innerJoin(planAccess, eq(planAccess.purchaseId, purchases.id))
    .where(eq(purchases.requestId, requestId))
  if (!row) return null
  return {
    purchaseId: row.purchaseId,
    planId: row.planId,
    deviceId: row.deviceId,
    createdAt: row.createdAt.toISOString(),
    access: { planId: row.planId, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString() },
  }
}

/** Тот же ключ, но другой тариф или устройство — ошибка клиента, а не повтор */
function ensureSameRequest(existing: Existing, input: { planId: string; deviceId: string }): PurchaseResponse {
  if (existing.planId !== input.planId || existing.deviceId !== input.deviceId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Idempotency-Key was used for a different purchase',
      data: { code: 'idempotency_key_reused' },
    })
  }
  const { deviceId: _, ...response } = existing
  return response
}

function postgresError(error: unknown): { code?: string; constraint_name?: string } | null {
  const candidate = (error as { cause?: unknown })?.cause ?? error
  return candidate && typeof candidate === 'object' && 'code' in candidate
    ? (candidate as { code?: string; constraint_name?: string })
    : null
}
