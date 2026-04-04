INSERT INTO users (name, email, password, role)
VALUES
  ('Admin User', 'admin@poscafe.local', encode(digest('admin123', 'sha256'), 'hex'), 'admin'),
  ('Cashier Staff', 'staff@poscafe.local', encode(digest('staff123', 'sha256'), 'hex'), 'staff')
ON CONFLICT (email) DO NOTHING;

INSERT INTO staff (name, role, status)
SELECT seed.name, seed.role, seed.status
FROM (
  VALUES
    ('Aarav Singh', 'Cashier', 'active'),
    ('Maya Kapoor', 'Chef', 'active'),
    ('Ishaan Rao', 'Manager', 'active')
) AS seed(name, role, status)
WHERE NOT EXISTS (
  SELECT 1
  FROM staff existing
  WHERE existing.name = seed.name AND existing.role = seed.role
);

INSERT INTO tables (table_number, qr_token, seats)
VALUES
  (1, 'table-a1', 2),
  (2, 'table-b2', 4),
  (3, 'table-c3', 4),
  (4, 'table-d4', 6)
ON CONFLICT (table_number) DO NOTHING;

INSERT INTO cuisines (name)
VALUES
  ('Pizza'),
  ('Pasta'),
  ('Wraps'),
  ('Beverages')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, category, price, tax, prep_time_minutes, is_active)
SELECT seed.name, seed.category, seed.price, seed.tax, seed.prep_time_minutes, seed.is_active
FROM (
  VALUES
    ('Classic Margherita', 'Pizza', 249, 5, 12, TRUE),
    ('Farmhouse Supreme', 'Pizza', 329, 5, 15, TRUE),
    ('Creamy Alfredo Pasta', 'Pasta', 279, 5, 10, TRUE),
    ('Tandoori Paneer Wrap', 'Wraps', 199, 5, 8, TRUE),
    ('Masala Lemonade', 'Beverages', 89, 0, 2, TRUE),
    ('Cold Coffee', 'Beverages', 129, 0, 3, TRUE)
) AS seed(name, category, price, tax, prep_time_minutes, is_active)
WHERE NOT EXISTS (
  SELECT 1
  FROM products existing
  WHERE existing.name = seed.name AND existing.category = seed.category
);
