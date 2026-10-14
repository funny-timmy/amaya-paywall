// Типизированное описание таблиц для запросов через Drizzle.
// Источник правды для структуры БД — SQL-миграции в ./migrations
// (там же CHECK- и EXCLUDE-ограничения, которые Drizzle не описывает).
import { boolean, integer, interval, pgTable, smallint, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  priceMinor: integer('price_minor').notNull(),
  currency: text('currency').notNull(),
  duration: interval('duration').notNull(),
  storeProductId: text('store_product_id').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const paywallOffers = pgTable('paywall_offers', {
  planId: text('plan_id').primaryKey().references(() => plans.id),
  title: text('title').notNull(),
  note: text('note').notNull(),
  badge: text('badge'),
  sortOrder: smallint('sort_order').notNull().default(0),
  isDefault: boolean('is_default').notNull().default(false),
})

export const purchases = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: text('plan_id').notNull().references(() => plans.id),
  deviceId: text('device_id').notNull(),
  requestId: uuid('request_id').notNull().unique(),
  priceMinor: integer('price_minor').notNull(),
  currency: text('currency').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const planAccess = pgTable('plan_access', {
  id: uuid('id').primaryKey().defaultRandom(),
  deviceId: text('device_id').notNull(),
  planId: text('plan_id').notNull().references(() => plans.id),
  purchaseId: uuid('purchase_id').notNull().unique().references(() => purchases.id),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
