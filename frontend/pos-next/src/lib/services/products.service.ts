// ==========================================================
// Products Service - Business Logic Layer
// Equivalent to NestJS ProductsService (@Injectable)
// ==========================================================
import { createServerClient } from '@/lib/supabase/client';
import type { ProductView, CreateProductDto, UpdateProductDto } from '@/lib/types';
import type { Product } from '@/lib/supabase/database.types';

// Extended type for join result
// Extended type for join result
type ProductRow = Product & { suppliers: { name: string } | null };

/** Maps a Supabase row (snake_case) to frontend ProductView (camelCase). */
function toProductView(row: ProductRow | Product): ProductView {
  const supplierName = 'suppliers' in row ? (row as ProductRow).suppliers?.name : undefined;

  return {
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    description: row.description,
    price: row.price,
    stock: row.stock,
    minStock: row.min_stock,
    alwaysInStock: row.always_in_stock,
    supplierId: row.supplier_id ?? undefined,
    supplierName,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

const PRODUCTS_SELECT = '*, suppliers(name)';

/**
 * Search products by barcode or name (partial match).
 * Optimized for barcode scanner input (exact match first, then partial).
 */
export async function searchProducts(query: string): Promise<ProductView[]> {
  const supabase = createServerClient();

  if (!query || query.trim().length === 0) {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCTS_SELECT)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(50);

    if (error) throw new Error(`Error buscando productos: ${error.message}`);
    return (data as unknown as ProductRow[] ?? []).map((row) => toProductView(row));
  }

  const trimmed = query.trim();

  // Priority 1: Exact barcode match (most common for scanners)
  const { data: exactMatch } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('barcode', trimmed)
    .eq('is_active', true)
    .limit(1);

  if (exactMatch && exactMatch.length > 0) {
    return (exactMatch as unknown as ProductRow[]).map((row) => toProductView(row));
  }

  // Priority 2: Partial name/barcode search (ilike for case-insensitive)
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('is_active', true)
    .or(`name.ilike.%${trimmed}%,barcode.ilike.%${trimmed}%`)
    .order('name', { ascending: true })
    .limit(20);

  if (error) throw new Error(`Error buscando productos: ${error.message}`);
  return (data as unknown as ProductRow[] ?? []).map((row) => toProductView(row));
}

export async function findAllProducts(): Promise<ProductView[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw new Error(`Error listando productos: ${error.message}`);
  return (data as unknown as ProductRow[] ?? []).map((row) => toProductView(row));
}

export async function findProductById(id: number): Promise<ProductView> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) throw new Error(`Producto con ID ${id} no encontrado`);
  return toProductView(data as unknown as ProductRow);
}

export async function createProduct(dto: CreateProductDto): Promise<ProductView> {
  const supabase = createServerClient();

  // Check for existing barcode
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('barcode', dto.barcode)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error(`Ya existe un producto con código de barras ${dto.barcode}`);
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      barcode: dto.barcode,
      name: dto.name,
      description: dto.description ?? '',
      price: dto.price,
      stock: dto.stock,
      min_stock: dto.minStock ?? 5,
      always_in_stock: dto.alwaysInStock ?? false,
      supplier_id: dto.supplierId ?? null,
      is_active: true,
    })
    .select(PRODUCTS_SELECT)
    .single();

  if (error) throw new Error(`Error creando producto: ${error.message}`);
  return toProductView(data as unknown as ProductRow);
}

export async function updateProduct(id: number, dto: UpdateProductDto): Promise<ProductView> {
  const supabase = createServerClient();

  // Build update object mapping camelCase to snake_case
  const updateData: Record<string, unknown> = {};
  if (dto.name !== undefined) updateData.name = dto.name;
  if (dto.description !== undefined) updateData.description = dto.description;
  if (dto.price !== undefined) updateData.price = dto.price;
  if (dto.stock !== undefined) updateData.stock = dto.stock;
  if (dto.minStock !== undefined) updateData.min_stock = dto.minStock;
  if (dto.alwaysInStock !== undefined) updateData.always_in_stock = dto.alwaysInStock;
  if (dto.supplierId !== undefined) updateData.supplier_id = dto.supplierId;
  if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select(PRODUCTS_SELECT)
    .single();

  if (error) throw new Error(`Error actualizando producto: ${error.message}`);
  return toProductView(data as unknown as ProductRow);
}

export async function deleteProduct(id: number): Promise<void> {
  const supabase = createServerClient();

  // Soft delete (set is_active = false) to preserve sales history integrity
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Error eliminando producto: ${error.message}`);
}

export async function getLowStockProducts(): Promise<ProductView[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('is_active', true)
    .eq('always_in_stock', false) // Use eq false to filter in DB if possible, or filter in JS
    .order('stock', { ascending: true });
    // Note: eq('always_in_stock', false) is better for performance

  if (error) throw new Error(`Error obteniendo stock bajo: ${error.message}`);

  return (data as unknown as ProductRow[] ?? [])
    .filter((p) => p.stock <= p.min_stock)
    .map(toProductView);
}
