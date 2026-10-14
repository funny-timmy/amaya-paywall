import { z } from 'zod'
import type { AccessResponse } from '#shared/types/paywall'
import { findActiveAccess } from '../utils/access'

const querySchema = z.object({
  deviceId: z.string().trim().min(1).max(128),
})

/** «Восстановить покупки» и проверка при открытии paywall: действующий доступ устройства */
export default defineEventHandler(async (event): Promise<AccessResponse> => {
  const { deviceId } = await getValidatedQuery(event, querySchema.parse)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { access: await findActiveAccess(useDb(), deviceId) }
})
