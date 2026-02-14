// ==========================================================
// Product Low Stock API
// GET /api/products/low-stock
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import * as productsService from '@/lib/services/products.service';

export const GET = withErrorHandler(async () => {
  const products = await productsService.getLowStockProducts();
  return NextResponse.json(products);
});
