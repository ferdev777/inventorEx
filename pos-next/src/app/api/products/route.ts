// ==========================================================
// Products API - Route Handlers
// Equivalent to NestJS ProductsController
// GET /api/products         → findAll
// POST /api/products        → create
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import { CreateProductSchema } from '@/lib/dto/schemas';
import * as productsService from '@/lib/services/products.service';

export const GET = withErrorHandler(async () => {
  const products = await productsService.findAllProducts();
  return NextResponse.json(products);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const validated = CreateProductSchema.parse(body);
  const product = await productsService.createProduct(validated);
  return NextResponse.json(product, { status: 201 });
});
