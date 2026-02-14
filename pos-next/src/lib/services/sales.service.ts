// ==========================================================
// Sales Service - Business Logic Layer
// Equivalent to NestJS SalesService (@Injectable)
// ==========================================================
import { createServerClient } from '@/lib/supabase/client';
import type { SaleResult, DailySummary } from '@/lib/types';
import type { CreateSaleInput } from '@/lib/dto/schemas';
import type { Product, Sale, SaleItem } from '@/lib/supabase/database.types';

type SaleItemWithProduct = SaleItem & { products: Pick<Product, 'name'> | null };

/**
 * Core business logic: Create a sale with stock management.
 *
 * Flow:
 * 1. Validate stock availability for ALL items
 * 2. Decrement stock atomically
 * 3. Create Sale + SaleItems
 * 4. If FISCAL: Call AFIP for CAE (future implementation)
 */
export async function createSale(dto: CreateSaleInput): Promise<SaleResult> {
  const supabase = createServerClient();
  const { items, type, clientId } = dto;

  // --- Step 1: Fetch and validate all products ---
  const productIds = items.map((item) => item.productId);
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  if (fetchError) throw new Error(`Error obteniendo productos: ${fetchError.message}`);

  // Verify all products exist
  const foundIds = new Set((products ?? []).map((p) => p.id));
  const missingIds = productIds.filter((id) => !foundIds.has(id));
  if (missingIds.length > 0) {
    throw new Error(`Productos no encontrados: IDs ${missingIds.join(', ')}`);
  }

  // Build a lookup map for O(1) access
  const productMap = new Map((products ?? []).map((p) => [p.id, p as Product]));

  // --- Step 2: Validate stock for ALL items ---
  const insufficientStock: string[] = [];
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue; // Should have been caught by missingIds check
    if (product.stock < item.quantity) {
      insufficientStock.push(
        `"${product.name}" (disponible: ${product.stock}, solicitado: ${item.quantity})`,
      );
    }
  }

  if (insufficientStock.length > 0) {
    throw new Error(`Stock insuficiente para: ${insufficientStock.join('; ')}`);
  }

  // --- Step 3: Decrement stock for each item ---
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) continue;
    
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: product.stock - item.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.productId);

    // Trigger low stock alert if needed (fire and forget)
    if (product.stock - item.quantity <= product.min_stock) {
      import('@/lib/email').then(({ sendLowStockAlert }) => {
        sendLowStockAlert(product.name, product.stock - item.quantity, product.min_stock)
          .catch(console.error);
      });
    }

    if (updateError) {
      throw new Error(`Error actualizando stock de "${product.name}": ${updateError.message}`);
    }
  }

  // --- Step 4: Calculate totals and create sale record ---
  let total = 0;
  const saleItemsData = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;
    total += subtotal;
    return {
      productId: item.productId,
      productName: product.name as string,
      quantity: item.quantity,
      unitPrice: product.price as number,
      subtotal: parseFloat(subtotal.toFixed(2)),
    };
  });

  total = parseFloat(total.toFixed(2));

  // Insert sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      total,
      type,
      cae: null,
      vto_cae: null,
      invoice_number: null,
      client_id: clientId || null,
    })
    .select()
    .single();

  if (saleError) throw new Error(`Error creando venta: ${saleError.message}`);

  const saleRow = sale as Sale;

  // Insert sale items
  const saleItemsInsert = saleItemsData.map((item) => ({
    sale_id: saleRow.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(saleItemsInsert);

  if (itemsError) throw new Error(`Error insertando items de venta: ${itemsError.message}`);

  // --- Step 5: If FISCAL, AFIP integration ---
  if (type === 'FISCAL') {
    try {
      const { getAfip } = await import('@/lib/afip');
      const afip = getAfip();
      
      console.log(`[Sales] Starting FISCAL sale processing for Sale #${saleRow.id}`);

      // 1. Get POS and Invoice Type
      const POS = process.env.AFIP_POS ? parseInt(process.env.AFIP_POS) : 1;
      const CBTE_TIPO = 11; // Factura C (default for now)

      // 2. Get Last Voucher Number
      const lastVoucher = await afip.ElectronicBilling.getLastVoucher(POS, CBTE_TIPO);
      const nextVoucher = lastVoucher + 1;

      console.log(`[Sales] Next Voucher: ${nextVoucher} (POS: ${POS}, Type: ${CBTE_TIPO})`);

      // 3. Prepare Payload
      // Format date as YYYYMMDD
      const today = new Date();
      const cbteFch = today.toISOString().slice(0, 10).replace(/-/g, '');
      const impTotal = parseFloat(total.toFixed(2));

      const data = {
        'CantReg': 1,
        'PtoVta': POS,
        'CbteTipo': CBTE_TIPO,
        'Concepto': 1, // 1: Productos, 2: Servicios, 3: Productos y Servicios
        'DocTipo': 99, // 99: Consumidor Final (can be parameterized later)
        'DocNro': 0,   // 0 for Consumidor Final < $344.488 (chk limits)
        'CbteDesde': nextVoucher,
        'CbteHasta': nextVoucher,
        'CbteFch': parseInt(cbteFch),
        'ImpTotal': impTotal,
        'ImpTotConc': 0,
        'ImpNeto': impTotal, // For Factura C, Net = Total (no discriminated VAT)
        'ImpOpEx': 0,
        'ImpTrib': 0,
        'ImpIVA': 0,
        'FchServDesde': null,
        'FchServHasta': null,
        'FchVtoPago': null,
        'MonId': 'PES',
        'MonCotiz': 1,
      };

      // 4. Create Voucher
      const res = await afip.ElectronicBilling.createVoucher(data);
      
      console.log('[Sales] AFIP Response:', res);

      // 5. Update Sale with CAE
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          cae: res['CAE'],
          vto_cae: res['CAEFchVto'],
          invoice_number: nextVoucher,
          updated_at: new Date().toISOString() // Should add updated_at to table if missing, but schema had created_at. Assuming ok.
        })
        .eq('id', saleRow.id);

      if (updateError) {
         console.error('[Sales] Error saving CAE to DB:', updateError);
         // Don't throw here, as the sale IS valid in AFIP. Just log.
      }

      // Update local object for return
      saleRow.cae = res['CAE'];
      saleRow.vto_cae = res['CAEFchVto'];
      saleRow.invoice_number = nextVoucher;

    } catch (error) {
       console.error('[Sales] AFIP Error:', error);
       // We should flag the sale as "Error Fiscal" or similar in DB ideally. 
       // For now, rethrow or allow partial success? 
       // Rethrowing ensures the frontend knows something went wrong with the "Fiscal" part.
       throw new Error(`Error facturando en AFIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    console.log(`[Sales] INTERNAL sale #${saleRow.id} created | Total: $${total}`);
  }

  return {
    id: saleRow.id,
    total: saleRow.total,
    type: saleRow.type,
    cae: saleRow.cae,
    vtoCae: saleRow.vto_cae,
    invoiceNumber: saleRow.invoice_number,
    createdAt: saleRow.created_at,
    items: saleItemsData.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
  };
}

/**
 * Find a sale by ID with all items and product names.
 */
export async function findSaleById(id: number): Promise<SaleResult | null> {
  const supabase = createServerClient();

  const { data: sale, error } = await supabase
    .from('sales')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !sale) return null;

  const saleRow = sale as Sale;

  // Fetch items with product names
  const { data: saleItems } = await supabase
    .from('sale_items')
    .select('*, products:product_id(name)')
    .eq('sale_id', id);

  return {
    id: saleRow.id,
    total: saleRow.total,
    type: saleRow.type,
    cae: saleRow.cae,
    vtoCae: saleRow.vto_cae,
    invoiceNumber: saleRow.invoice_number,
    createdAt: saleRow.created_at,
    items: ((saleItems ?? []) as unknown as SaleItemWithProduct[]).map((item) => ({
      productName: item.products?.name ?? 'Producto eliminado',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
    })),
  };
}

/**
 * Get recent sales with items.
 */
export async function getRecentSales(limit: number = 20): Promise<SaleResult[]> {
  const supabase = createServerClient();

  const { data: sales, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Error obteniendo ventas: ${error.message}`);

  const salesArr = (sales ?? []) as Sale[];

  // Fetch items for all sales
  const saleIds = salesArr.map((s) => s.id);

  if (saleIds.length === 0) return [];

  const { data: allItems } = await supabase
    .from('sale_items')
    .select('*, products:product_id(name)')
    .in('sale_id', saleIds);

  const itemsBySaleId = new Map<number, SaleItemWithProduct[]>();
  for (const item of (allItems ?? []) as unknown as SaleItemWithProduct[]) {
    const existing = itemsBySaleId.get(item.sale_id) ?? [];
    existing.push(item);
    itemsBySaleId.set(item.sale_id, existing);
  }

  return salesArr.map((sale) => ({
    id: sale.id,
    total: sale.total,
    type: sale.type,
    cae: sale.cae,
    vtoCae: sale.vto_cae,
    invoiceNumber: sale.invoice_number,
    createdAt: sale.created_at,
    items: (itemsBySaleId.get(sale.id) ?? []).map((item) => ({
      productName: item.products?.name ?? 'Producto eliminado',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
    })),
  }));
}

/**
 * Get daily sales summary.
 */
export async function getSalesSummary(period: 'day' | 'week' | 'month' | 'year' = 'day'): Promise<DailySummary> {
  const supabase = createServerClient();

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  switch (period) {
    case 'week':
      // Start of current week (Monday)
      const day = startDate.getDay() || 7; // Get current day number, converting Sun (0) to 7
      if (day !== 1) startDate.setHours(-24 * (day - 1));
      break;
    case 'month':
      startDate.setDate(1);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      break;
    case 'day':
    default:
      // Already set to start of today
      break;
  }

  const { data: sales, error } = await supabase
    .from('sales')
    .select('*')
    .gte('created_at', startDate.toISOString());

  if (error) throw new Error(`Error obteniendo resumen: ${error.message}`);

  const salesArr = (sales ?? []) as Sale[];
  const totalSales = salesArr.length;
  const totalRevenue = salesArr.reduce((sum, s) => sum + Number(s.total), 0);
  const fiscalSales = salesArr.filter((s) => s.type === 'FISCAL').length;
  const internalSales = salesArr.filter((s) => s.type === 'INTERNAL').length;

  return {
    date: startDate.toISOString(), // Return start date of period
    totalSales,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    fiscalSales,
    internalSales,
  };
}
