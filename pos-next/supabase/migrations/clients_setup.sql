-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
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

-- Add unique constraint to doc_number to avoid duplicates (optional but recommended)
-- ALTER TABLE public.clients ADD CONSTRAINT clients_doc_number_key UNIQUE (doc_number);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies (Open for now, will secure with Auth later)
CREATE POLICY "Enable read access for all users" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.clients FOR DELETE USING (true);

-- Add client_id to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);
