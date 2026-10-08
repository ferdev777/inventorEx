-- ===================================================================
-- Supabase Seed Data for Local Development
-- ===================================================================

-- 1. Default Admin User (admin@pos.local / admin123)
-- Uses extensions.pgcrypto to hash the password with bcrypt
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@pos.local',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin POS"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('admin123', gen_salt('bf')),
    email_confirmed_at = now();

-- Identity linked to the user for email/password login
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    format('{"sub":"%s","email":"%s"}', 'a0000000-0000-0000-0000-000000000001', 'admin@pos.local')::jsonb,
    'email',
    'admin@pos.local',
    now(),
    now(),
    now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- 2. Seed Suppliers
INSERT INTO suppliers (id, name, contact_name, email, phone, address, is_active)
VALUES 
    (1, 'Distribuidora Alimentos S.A.', 'Carlos Martínez', 'carlos@distribuidora.com', '1145678901', 'Av. Corrientes 1234, CABA', true),
    (2, 'Bebidas del Plata', 'Laura Gómez', 'ventas@bebidasdelplata.com', '1198765432', 'Ruta 8 Km 45, Buenos Aires', true)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for suppliers
SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM suppliers));

-- 3. Seed Products
INSERT INTO products (barcode, name, description, price, stock, min_stock, always_in_stock, supplier_id, is_active)
VALUES 
    ('7791234567890', 'Coca Cola 500ml', 'Bebida gaseosa sabor cola', 1500.00, 50, 10, false, 2, true),
    ('7791234567891', 'Agua Mineral 500ml', 'Agua sin gas baja en sodio', 1000.00, 40, 10, false, 2, true),
    ('7799876543210', 'Café Espresso', 'Café molido tostado clásico', 2200.00, 25, 5, false, 1, true),
    ('7790001112223', 'Alfajor Havanna Chocolate', 'Alfajor relleno con dulce de leche', 1800.00, 30, 8, false, 1, true),
    ('7790001112224', 'Sándwich de Miga Jamón y Queso', 'Sándwich triple tostado artesanal', 3500.00, 15, 3, false, 1, true),
    ('9999999999999', 'Bolsa Ecológica', 'Bolsa reutilizable de tela', 500.00, 100, 20, true, 1, true)
ON CONFLICT (barcode) DO NOTHING;

-- 4. Seed Clients
INSERT INTO clients (name, doc_type, doc_number, email, address, phone)
VALUES 
    ('Consumidor Final', 'DNI', '0', 'consumidor@final.com', 'Local', '00000000'),
    ('Juan Pérez', 'DNI', '30123456', 'juan.perez@example.com', 'San Martín 450, CABA', '1122334455'),
    ('Empresa Test S.R.L.', 'CUIT', '30712345678', 'contacto@empresatest.com', 'Av. Libertador 2000, CABA', '1144332211');
