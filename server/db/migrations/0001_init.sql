CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Тарифы: только бизнес-данные
CREATE TABLE plans (
  id               text        NOT NULL,
  price_minor      integer     NOT NULL,
  currency         text        NOT NULL,
  duration         interval    NOT NULL,
  store_product_id text        NOT NULL,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT plans_pk                PRIMARY KEY (id),
  CONSTRAINT plans_store_product_uq  UNIQUE (store_product_id),
  CONSTRAINT plans_price_positive    CHECK (price_minor > 0),
  CONSTRAINT plans_currency_iso      CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT plans_duration_positive CHECK (duration > interval '0')
);

-- Как тариф показан на paywall
CREATE TABLE paywall_offers (
  plan_id     text     NOT NULL,
  title       text     NOT NULL,
  note        text     NOT NULL,
  badge       text,
  sort_order  smallint NOT NULL DEFAULT 0,
  is_default  boolean  NOT NULL DEFAULT false,

  CONSTRAINT paywall_offers_pk      PRIMARY KEY (plan_id),
  CONSTRAINT paywall_offers_plan_fk FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE CASCADE
);

-- Только один оффер выбран по умолчанию
CREATE UNIQUE INDEX paywall_offers_single_default_idx ON paywall_offers (is_default) WHERE is_default;

-- Покупки: неизменяемый журнал
CREATE TABLE purchases (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  plan_id      text        NOT NULL,
  device_id    text        NOT NULL,
  request_id   uuid        NOT NULL,
  price_minor  integer     NOT NULL,
  currency     text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT purchases_pk           PRIMARY KEY (id),
  CONSTRAINT purchases_request_uq   UNIQUE (request_id),
  CONSTRAINT purchases_plan_fk      FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE RESTRICT,
  CONSTRAINT purchases_currency_iso CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX purchases_device_idx ON purchases (device_id, created_at DESC);

-- Доступ по тарифу: устройство, тариф, период
CREATE TABLE plan_access (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  device_id    text        NOT NULL,
  plan_id      text        NOT NULL,
  purchase_id  uuid        NOT NULL,
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz NOT NULL,
  revoked_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT plan_access_pk           PRIMARY KEY (id),
  CONSTRAINT plan_access_purchase_uq  UNIQUE (purchase_id),
  CONSTRAINT plan_access_purchase_fk  FOREIGN KEY (purchase_id) REFERENCES purchases (id) ON DELETE RESTRICT,
  CONSTRAINT plan_access_plan_fk      FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE RESTRICT,
  CONSTRAINT plan_access_period_valid CHECK (ends_at > starts_at),
  CONSTRAINT plan_access_no_overlap   EXCLUDE USING gist (
    device_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  ) WHERE (revoked_at IS NULL)
);

CREATE INDEX plan_access_device_ends_idx ON plan_access (device_id, ends_at DESC);
