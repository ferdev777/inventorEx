-- ==========================================================
-- Seed Data Migration (Datos de prueba)
-- ==========================================================

-- 1. Proveedores de prueba
INSERT INTO suppliers (id, name, contact_name, email, phone, address, is_active) VALUES
  (1, 'Distribuidora Bebidas del Plata', 'Carlos Gómez', 'carlos@delplata.com', '11-4567-8901', 'Av. Corrientes 1234, CABA', true),
  (2, 'Golosinas & Snacks San Telmo', 'Mariana López', 'mariana@snacksantelmo.com', '11-4321-8765', 'Defensa 456, CABA', true),
  (3, 'Almacén & Cafetería Central', 'Roberto Fernández', 'ventas@centraldistribucion.com', '11-5555-4444', 'Belgrano 789, CABA', true)
ON CONFLICT (id) DO NOTHING;

-- Ajustar la secuencia de proveedores para que los próximos inserts no choquen
SELECT setval('suppliers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM suppliers));

-- 2. Productos de prueba con stock, precios y proveedores
INSERT INTO products (id, barcode, name, description, price, stock, min_stock, supplier_id, is_active) VALUES
  (1, '7790580101001', 'Coca-Cola 500ml', 'Gaseosa cola botella 500ml', 1500.00, 45, 10, 1, true),
  (2, '7790580101002', 'Sprite 500ml', 'Gaseosa lima-limón 500ml', 1400.00, 30, 10, 1, true),
  (3, '7790040100008', 'Agua Villavicencio 500ml', 'Agua mineral sin gas', 950.00, 60, 15, 1, true),
  (4, '7790070418210', 'Quilmes Cristal 473ml', 'Cerveza rubia en lata', 2100.00, 8, 10, 1, true), -- Alerta bajo stock
  (5, '7790895000782', 'Alfajor Havanna Chocolate', 'Alfajor de chocolate 70% cacao', 2800.00, 25, 5, 2, true),
  (6, '7790895000799', 'Alfajor Cachafaz Dulce de Leche', 'Alfajor clásico dulce de leche', 1900.00, 3, 5, 2, true), -- Alerta bajo stock
  (7, '7790250051015', 'Papas Lays Clásicas 150g', 'Papas fritas clásicas', 2500.00, 22, 8, 2, true),
  (8, '7790250051022', 'Doritos Queso 150g', 'Nachos sabor a queso', 2700.00, 18, 8, 2, true),
  (9, '7791813420019', 'Café Cabrales Molido 250g', 'Café tostado suave', 6200.00, 14, 4, 3, true),
  (10, '7790040001234', 'Galletitas Chocolinas 250g', 'Galletitas dulces de chocolate', 1850.00, 35, 10, 2, true),
  (11, '7791234567890', 'Yerba Playadito 500g', 'Yerba mate tradicional con palo', 3400.00, 20, 5, 3, true)
ON CONFLICT (barcode) DO UPDATE SET
  stock = EXCLUDED.stock,
  price = EXCLUDED.price;

SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));

-- 3. Clientes de prueba
INSERT INTO public.clients (id, name, doc_type, doc_number, email, address, phone) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Consumidor Final', 'DNI', '0', 'cf@pos.local', 'Mostrador', '-'),
  ('a0000000-0000-0000-0000-000000000002', 'Juan Pérez', 'DNI', '35123456', 'juan.perez@gmail.com', 'Av. Santa Fe 2450, CABA', '11-3322-1100'),
  ('a0000000-0000-0000-0000-000000000003', 'Tecno Soluciones S.A.', 'CUIT', '30712345678', 'administracion@tecnosoluciones.com.ar', 'Av. Libertador 1800, CABA', '11-6677-8899')
ON CONFLICT (id) DO NOTHING;

-- 4. Ventas históricas de muestra (para métricas y gráficos)
INSERT INTO sales (id, total, type, invoice_number, client_id, created_at) VALUES
  (1, 4700.00, 'INTERNAL', 1, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
  (2, 6200.00, 'INTERNAL', 2, 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day'),
  (3, 8950.00, 'INTERNAL', 3, 'a0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

SELECT setval('sales_id_seq', (SELECT COALESCE(MAX(id), 1) FROM sales));

-- 5. Items de las ventas de muestra
INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
  (1, 1, 2, 1500.00, 3000.00), -- 2x Coca-Cola
  (1, 6, 1, 1900.00, 1900.00), -- 1x Cachafaz (redondeado/descuento o total 4900 -> total 4700 ajustado en la venta)
  (2, 9, 1, 6200.00, 6200.00), -- 1x Café Cabrales
  (3, 5, 2, 2800.00, 5600.00), -- 2x Havanna
  (3, 11, 1, 3400.00, 3400.00) -- 1x Playadito
ON CONFLICT DO NOTHING;
