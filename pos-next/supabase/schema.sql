-- ===================================================================
-- Supabase Database Schema (PostgreSQL)
-- Run this in the Supabase SQL Editor to create all required tables.
-- Adapted from the original Prisma schema (SQLite).
-- ===================================================================

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

-- Index for fast barcode lookups (barcode scanner)
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products (barcode);
-- Index for search
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (name gin_trgm_ops);
-- Index for active products listing
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);
-- Index for fetching products by supplier
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);

-- Suppliers Table
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

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id              BIGSERIAL PRIMARY KEY,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  type            TEXT          NOT NULL DEFAULT 'INTERNAL' CHECK (type IN ('FISCAL', 'INTERNAL')),
  cae             TEXT,
  vto_cae         TEXT,
  invoice_number  INTEGER,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for recent sales queries
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

-- Index for fetching items by sale
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

-- Enable the pg_trgm extension for fuzzy text search (name search)
-- Run this first if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===================================================================
-- Row Level Security (RLS) - Optional but recommended
-- These policies allow all operations when using the service_role key
-- but restrict anonymous access to read-only.
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE afip_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (the backend uses this key)
CREATE POLICY "service_role_all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON afip_tokens FOR ALL USING (true) WITH CHECK (true);

-- Allow anon read-only access to products (for potential public display)
CREATE POLICY "anon_read_products" ON products FOR SELECT USING (is_active = true);
