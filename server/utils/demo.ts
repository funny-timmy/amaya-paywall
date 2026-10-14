import type { H3Event } from 'h3'

/**
 * Демо-режим для проверки состояний на живом стенде:
 * ?fail=offers   — GET /api/offers отвечает 503
 * ?fail=purchase — POST /api/purchase отвечает 503
 */
export function failIfDemoRequested(event: H3Event, target: 'offers' | 'purchase') {
  if (getQuery(event).fail === target) {
    throw createError({ statusCode: 503, statusMessage: 'Demo failure', data: { code: 'demo_failure' } })
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
