import { and, asc, eq, gt, isNull, sql } from 'drizzle-orm'
import type { PlanAccessInfo } from '#shared/types/paywall'
import type { Db } from './db'

/** Действующий доступ устройства: не отозван и ещё не закончился */
export async function findActiveAccess(db: Pick<Db, 'select'>, deviceId: string): Promise<PlanAccessInfo | null> {
  const { planAccess } = schema
  const [row] = await db
    .select({ planId: planAccess.planId, startsAt: planAccess.startsAt, endsAt: planAccess.endsAt })
    .from(planAccess)
    .where(and(eq(planAccess.deviceId, deviceId), isNull(planAccess.revokedAt), gt(planAccess.endsAt, sql`now()`)))
    .orderBy(asc(planAccess.startsAt))
    .limit(1)

  return row ? { planId: row.planId, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString() } : null
}
