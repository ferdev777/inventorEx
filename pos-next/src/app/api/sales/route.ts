// ==========================================================
// Sales API - Route Handlers
// Equivalent to NestJS SalesController
// POST /api/sales           → createSale
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import { CreateSaleSchema } from '@/lib/dto/schemas';
import * as salesService from '@/lib/services/sales.service';

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const validated = CreateSaleSchema.parse(body);
  const result = await salesService.createSale(validated);
  return NextResponse.json(result, { status: 201 });
});
