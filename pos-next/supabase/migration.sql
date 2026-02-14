-- ==========================================================
-- POS & Inventario - Supabase Schema
-- Run this in Supabase SQL Editor (supabase.com/dashboard → SQL Editor)
-- ==========================================================

-- ===== Products =====
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  barcode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ===== Sales =====
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('FISCAL', 'INTERNAL')),
  cae TEXT,
  vto_cae TIMESTAMPTZ,
  invoice_number BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Sale Items =====
CREATE TABLE IF NOT EXISTS sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);

-- ===== AFIP Tokens =====
CREATE TABLE IF NOT EXISTS afip_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  sign TEXT NOT NULL,
  expiration TIMESTAMPTZ NOT NULL,
  service TEXT NOT NULL DEFAULT 'wsfe',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Indexes for performance =====
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_type ON sales(type);

-- ===== Sample products (optional - delete if not needed) =====
INSERT INTO products (barcode, name, description, price, stock, min_stock) VALUES
  ('7790580101001', 'Coca-Cola 500ml', 'Gaseosa cola 500ml', 1200.00, 50, 10),
  ('7790580101002', 'Sprite 500ml', 'Gaseosa lima-limón 500ml', 1150.00, 35, 10),
  ('7790580101003', 'Fanta 500ml', 'Gaseosa naranja 500ml', 1150.00, 28, 10),
  ('7790070418210', 'Quilmes Cristal 473ml', 'Cerveza lager 473ml', 1800.00, 40, 8),
  ('7790040100008', 'Agua Villavicencio 500ml', 'Agua mineral sin gas', 800.00, 60, 15),
  ('7790895000782', 'Alfajor Havanna', 'Alfajor chocolate mixto', 2500.00, 20, 5),
  ('7790895000799', 'Alfajor Cachafaz', 'Alfajor dulce de leche', 1600.00, 30, 5),
  ('7790250051015', 'Papas Lays Clásicas', 'Papas fritas 150g', 2200.00, 25, 8),
  ('7790250051022', 'Doritos Queso', 'Nachos sabor queso 150g', 2400.00, 18, 8),
  ('7791813420019', 'Café Cabrales 250g', 'Café molido torrado', 5500.00, 15, 5);
