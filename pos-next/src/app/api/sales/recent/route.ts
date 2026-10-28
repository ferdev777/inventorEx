// ==========================================================
// Recent Sales API
// GET /api/sales/recent?limit=20
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import * as salesService from '@/lib/services/sales.service';

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit')) || 20;
  const sales = await salesService.getRecentSales(limit);
  return NextResponse.json(sales);
});
