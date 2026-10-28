-- ==========================================================
-- POS & Inventario - Supabase Schema
-- Combined initialization migration
-- ==========================================================

-- Enable pg_trgm extension for text search indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

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
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_type ON sales(type);

-- ===================================================================
-- SUPPLIERS
-- ===================================================================

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

-- Add 'always_in_stock' flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS always_in_stock BOOLEAN NOT NULL DEFAULT FALSE;

-- Add 'supplier_id' foreign key to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL;

-- Index for fetching products by supplier
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products (supplier_id);

-- RLS Policies for Suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_suppliers" ON suppliers FOR SELECT USING (is_active = true);


-- ===================================================================
-- CLIENTS
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  doc_type TEXT DEFAULT 'DNI',
  doc_number TEXT,
  email TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.clients FOR DELETE USING (true);

-- Add client_id to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);
