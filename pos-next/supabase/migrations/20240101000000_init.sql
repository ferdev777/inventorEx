-- ===================================================================
-- Supabase Database Schema (PostgreSQL) - Initial Migration
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Suppliers Table (Must be created before products to resolve foreign key)
CREATE TABLE IF NOT EXISTS suppliers (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  contact_name  TEXT,
  email         TEXT,
  phone         TEXT,
  address       TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers USING gin (name gin_trgm_ops);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id            BIGSERIAL PRIMARY KEY,
  barcode       TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock         INTEGER     NOT NULL DEFAULT 0,
  min_stock     INTEGER     NOT NULL DEFAULT 5,
  always_in_stock BOOLEAN   NOT NULL DEFAULT FALSE,
  supplier_id   BIGINT      REFERENCES suppliers(id) ON DELETE SET NULL,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  doc_type TEXT DEFAULT 'DNI', -- DNI, CUIT, CUIL
  doc_number TEXT,
  email TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id              BIGSERIAL PRIMARY KEY,
  client_id       UUID REFERENCES clients(id),
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  type            TEXT          NOT NULL DEFAULT 'INTERNAL' CHECK (type IN ('FISCAL', 'INTERNAL')),
  fiscal_status   TEXT CHECK (fiscal_status IN ('PENDING', 'COMPLETED', 'ERROR')),
  cbte_tipo       INTEGER,
  pto_vta         INTEGER,
  doc_tipo        INTEGER,
  doc_nro         TEXT,
  afip_error      TEXT,
  cae             TEXT,
  vto_cae         TEXT,
  invoice_number  INTEGER,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at DESC);

-- Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
  id          BIGSERIAL PRIMARY KEY,
  sale_id     BIGINT      NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id  BIGINT      NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER     NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal    DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items (sale_id);

-- AFIP Token Cache Table
CREATE TABLE IF NOT EXISTS afip_tokens (
  id          BIGSERIAL PRIMARY KEY,
  token       TEXT        NOT NULL,
  sign        TEXT        NOT NULL,
  expiration  TIMESTAMPTZ NOT NULL,
  service     TEXT        NOT NULL DEFAULT 'wsfe',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================================
-- Row Level Security (RLS)
-- ===================================================================

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE afip_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "service_role_all_suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON afip_tokens FOR ALL USING (true) WITH CHECK (true);

-- Allow anon read-only access (adjust as needed)
CREATE POLICY "anon_read_suppliers" ON suppliers FOR SELECT USING (is_active = true);
CREATE POLICY "anon_read_products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "anon_read_clients" ON clients FOR SELECT USING (true);
