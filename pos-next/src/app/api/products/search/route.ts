// ==========================================================
// Product Search API
// GET /api/products/search?q=...
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import * as productsService from '@/lib/services/products.service';

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const products = await productsService.searchProducts(query);
  return NextResponse.json(products);
});
