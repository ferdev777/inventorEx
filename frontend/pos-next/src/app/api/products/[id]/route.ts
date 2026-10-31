// ==========================================================
// Single Product API - Route Handlers
// GET /api/products/[id]    → findById
// PUT /api/products/[id]    → update
// DELETE /api/products/[id] → delete (soft)
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import { UpdateProductSchema } from '@/lib/dto/schemas';
import * as productsService from '@/lib/services/products.service';

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_request: Request, context: RouteContext) => {
  const { id } = await context.params;
  const product = await productsService.findProductById(Number(id));
  return NextResponse.json(product);
});

export const PUT = withErrorHandler(async (request: Request, context: RouteContext) => {
  const { id } = await context.params;
  const body = await request.json();
  const validated = UpdateProductSchema.parse(body);
  const product = await productsService.updateProduct(Number(id), validated);
  return NextResponse.json(product);
});

export const DELETE = withErrorHandler(async (_request: Request, context: RouteContext) => {
  const { id } = await context.params;
  await productsService.deleteProduct(Number(id));
  return NextResponse.json({ message: 'Producto eliminado' });
});
