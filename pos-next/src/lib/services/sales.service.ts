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

  // Resolve invoice type if FISCAL
  let cbteTipo: number | null = null;
  let ptoVta: number | null = null;
  let docTipo: number | null = null;
  let docNro: string | null = null;
  let fiscalStatus: 'PENDING' | 'COMPLETED' | 'ERROR' | null = null;
  
  if (type === 'FISCAL') {
    fiscalStatus = 'PENDING';
    ptoVta = process.env.AFIP_POS ? parseInt(process.env.AFIP_POS) : 1;
    
    // Lazy load AFIP resolvers
    const { resolveInvoiceType } = await import('@/lib/afip/invoice-resolver');
    
    const taxCondition = (process.env.AFIP_TAX_CONDITION as 'RI' | 'MONO') || 'MONO';
    // We don't have a clients table yet, pass null to use Consumidor Final
    const resolution = resolveInvoiceType(null, taxCondition);
    
    cbteTipo = resolution.cbteTipo;
    docTipo = resolution.docTipo;
    docNro = resolution.docNro;
  }

  // Insert sale
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      total,
      type,
      cae: null,
      vto_cae: null,
      invoice_number: null,
      fiscal_status: fiscalStatus,
      cbte_tipo: cbteTipo,
      pto_vta: ptoVta,
      doc_tipo: docTipo,
      doc_nro: docNro,
      afip_error: null,
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
      const { getAfip } = await import('@/lib/afip/client');
      const { buildVoucherPayload } = await import('@/lib/afip/voucher-builder');
      const afip = getAfip();
      
      console.log(`[Sales] Starting FISCAL sale processing for Sale #${saleRow.id}`);

      // 1. Get Last Voucher Number
      const lastVoucher = await afip.ElectronicBilling.getLastVoucher(ptoVta!, cbteTipo!);
      const nextVoucher = lastVoucher + 1;

      console.log(`[Sales] Next Voucher: ${nextVoucher} (POS: ${ptoVta}, Type: ${cbteTipo})`);

      // 2. Prepare Payload using builder
      const payload = buildVoucherPayload({
        pos: ptoVta!,
        cbteTipo: cbteTipo!,
        docTipo: docTipo!,
        docNro: docNro!,
        nextVoucher: nextVoucher,
        total: parseFloat(total.toFixed(2))
      });

      // 3. Create Voucher
      const res = await afip.ElectronicBilling.createVoucher(payload);
      
      console.log('[Sales] AFIP Response:', res);

      // 4. Update Sale with CAE
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          cae: res['CAE'],
          vto_cae: res['CAEFchVto'],
          invoice_number: nextVoucher,
          fiscal_status: 'COMPLETED',
        })
        .eq('id', saleRow.id);

      if (updateError) {
         console.error('[Sales] Error saving CAE to DB (CRITICAL):', res['CAE'], updateError);
         // Do not throw; AFIP transaction succeeded.
      }

      // Update local object for return
      saleRow.cae = res['CAE'];
      saleRow.vto_cae = res['CAEFchVto'];
      saleRow.invoice_number = nextVoucher;
      saleRow.fiscal_status = 'COMPLETED';

    } catch (error) {
       console.error('[Sales] AFIP Error:', error);
       
       const errMsg = error instanceof Error ? error.message : String(error);
       
       // Update sale to ERROR
       await supabase
         .from('sales')
         .update({
           fiscal_status: 'ERROR',
           afip_error: errMsg,
         })
         .eq('id', saleRow.id);
         
       saleRow.fiscal_status = 'ERROR';
       saleRow.afip_error = errMsg;
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
    fiscalStatus: saleRow.fiscal_status ?? null,
    cbteTipo: saleRow.cbte_tipo ?? null,
    ptoVta: saleRow.pto_vta ?? null,
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
    fiscalStatus: saleRow.fiscal_status ?? null,
    cbteTipo: saleRow.cbte_tipo ?? null,
    ptoVta: saleRow.pto_vta ?? null,
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
    fiscalStatus: sale.fiscal_status ?? null,
    cbteTipo: sale.cbte_tipo ?? null,
    ptoVta: sale.pto_vta ?? null,
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
