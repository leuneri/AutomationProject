-- 002_seed.sql
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
  ('Wireless Headphones',  'Over-ear noise cancelling headphones', 89.99,  50, 'Electronics', 'https://placehold.co/400x400?text=Headphones'),
  ('Mechanical Keyboard',  'TKL layout, brown switches',           129.00, 30, 'Electronics', 'https://placehold.co/400x400?text=Keyboard'),
  ('USB-C Hub',            '7-in-1 multiport adapter',             39.99,  80, 'Electronics', 'https://placehold.co/400x400?text=USB+Hub'),
  ('Desk Lamp',            'LED, adjustable colour temperature',   49.99,  60, 'Home',        'https://placehold.co/400x400?text=Lamp'),
  ('Notebook A5',          'Dotted, 200 pages, lay-flat binding',   14.99, 200, 'Stationery',  'https://placehold.co/400x400?text=Notebook'),
  ('Ballpoint Pens 10pk',  'Smooth ink, black',                     7.99, 300, 'Stationery',  'https://placehold.co/400x400?text=Pens'),
  ('Water Bottle 1L',      'BPA-free, double-wall insulated',      24.99, 100, 'Home',        'https://placehold.co/400x400?text=Bottle'),
  ('Running Shoes',        'Lightweight mesh upper, EU 38-47',     79.99,  40, 'Sports',      'https://placehold.co/400x400?text=Shoes'),
  ('Yoga Mat',             '6mm thick, non-slip surface',          34.99,  70, 'Sports',      'https://placehold.co/400x400?text=Yoga+Mat'),
  ('Coffee Grinder',       'Burr grinder, 15 grind settings',      59.99,  25, 'Kitchen',     'https://placehold.co/400x400?text=Grinder');

INSERT INTO users (email, password, name, role) VALUES
  ('user@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'User1', 'customer'),
  ('demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'customer') -- password is "password"
  ON CONFLICT (email) DO NOTHING;