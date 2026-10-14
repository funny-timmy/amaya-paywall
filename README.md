# Paywall «Совушка» — Nuxt 4

Мобильный paywall детской игры для открытия во встроенном webview: два тарифа, тестовая покупка с записью в Postgres.

- Figma: https://www.figma.com/design/9wuNM9tvWkbuI1p6a2OeFn/Amaya?node-id=2001-396
- Стенд: _TODO_

## Как проверить состояния

| Состояние | Ссылка / действие |
|---|---|
| Основной экран | `/` |
| Ошибка загрузки тарифов | `/?fail=offers` |
| Ошибка покупки | `/?fail=purchase` → «Купить» |
| Загрузка | DevTools → Network → Slow 3G, перезагрузить |
| Успех и «уже куплено» | купить на `/`, затем перезагрузить страницу |
| «Восстановить покупки» | `/?deviceId=любая-строка` — новое устройство, покупок нет |

> [!IMPORTANT]
> **Одно устройство — одна действующая подписка.** Без `?deviceId=` id устройства хранится в localStorage браузера,
> поэтому после покупки этот браузер при открытии сразу видит экран «Готово! Всё открыто», а повторная покупка
> отклоняется сервером (`409 already_active`).
>
> Демо-ссылки с `?fail=...` поэтому работают **от лица нового устройства**: на каждую загрузку берётся одноразовый
> `demo-…` id, который никуда не сохраняется. Ошибки видны даже в браузере, где подписка уже куплена,
> а сама подписка не затрагивается. Чтобы проверить конкретное устройство, передайте `?deviceId=...` явно.

## Локальный запуск

```bash
cp .env.example .env
npm install
npm run db:up        # Postgres 17 в Docker
npm run db:migrate   # схема + тарифы
npm run dev          # http://localhost:3000
```

## Где что лежит

| | |
|---|---|
| Frontend | `app/pages/index.vue`, компоненты `app/components/paywall/*`, логика `app/composables/usePaywall.ts` |
| Server routes | `server/api/offers.get.ts`, `purchase.post.ts`, `access.get.ts` |
| БД | SQL-миграции `server/db/migrations/*`, Drizzle-схема `server/db/schema.ts`, клиент `server/utils/db.ts` |
| Общие типы | `shared/types/paywall.ts` |
| Токены дизайна | `app/assets/css/main.css` (`@theme`, имена соответствуют переменным в Figma) |

**Схема БД:** `plans` (тариф: цена, длительность, ID в сторе) → `paywall_offers` (как тариф показан: тексты, бейдж, порядок) · `purchases` (неизменяемый журнал покупок) → `plan_access` (какое устройство, какой тариф, с какого по какое).

Гарантии на уровне БД: `purchases.request_id UNIQUE` — двойной тап не создаёт вторую покупку (клиент шлёт `Idempotency-Key` и повторяет его при ретрае); `EXCLUDE USING gist` на `plan_access` — у устройства не бывает двух пересекающихся периодов доступа. Покупка при действующем доступе отклоняется (`409 already_active`): проверка идёт в транзакции под advisory-lock по устройству, EXCLUDE — страховка на уровне БД.

## Деплой и БД

_TODO: Vercel + Neon._ Vercel разворачивает Nuxt server routes в функции без настройки. Neon — бесплатный serverless Postgres; нужен Postgres, а не SQLite, ради exclusion constraint. Драйвер `postgres` (postgres.js) с `prepare: false` работает и с локальным Postgres, и с pooled-эндпоинтом Neon.

## AI-инструменты и что проверил сам

_TODO_

## Что упростил

- Тарифы и цены в реальности приходят из стора (`SKProduct` / `ProductDetails`) с локализованной ценой, здесь — из БД.
- «Покупка» — запрос к своему API с задержкой 700 мс вместо системного окна оплаты; в продакшене кнопка вызывала бы нативный bridge (`app/utils/nativeBridge.ts`).
- `deviceId` берётся из `?deviceId=` (так передавало бы приложение), иначе генерируется и хранится в localStorage; с `?fail=...` — одноразовый, см. «Как проверить состояния».
- Миграции — свой мини-раннер на SQL, потому что Drizzle Kit не генерирует `EXCLUDE`.

## Следующие 2 часа

_TODO_
