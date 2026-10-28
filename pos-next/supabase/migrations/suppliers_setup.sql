-- ===================================================================
-- Migration: Suppliers Setup
-- Description: Adds suppliers table and updates products table
-- ===================================================================

-- 1. Create Suppliers Table
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

-- Index for supplier search
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers USING gin (name gin_trgm_ops);

-- 2. Update Products Table
-- Add 'always_in_stock' flag (default false)
ALTER TABLE products ADD COLUMN IF NOT EXISTS always_in_stock BOOLEAN NOT NULL DEFAULT FALSE;

-- Add 'supplier_id' foreign key
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL;

-- Index for fetching products by supplier
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);

-- 3. RLS Policies for Suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
CREATE POLICY "service_role_all_suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);

-- Allow authenticated/anon read access (adjust as needed)
CREATE POLICY "anon_read_suppliers" ON suppliers FOR SELECT USING (is_active = true);
