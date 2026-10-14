INSERT INTO plans (id, price_minor, currency, duration, store_product_id) VALUES
  ('year',  199000, 'RUB', '1 year',  'com.sovushka.premium.year'),
  ('month',  27900, 'RUB', '1 month', 'com.sovushka.premium.month');

INSERT INTO paywall_offers (plan_id, title, note, badge, sort_order, is_default) VALUES
  ('year',  'Год',   'Все уровни на 12 месяцев',      'Выгодно −40%', 1, true),
  ('month', 'Месяц', 'Можно отменить в любой момент', NULL,           2, false);
