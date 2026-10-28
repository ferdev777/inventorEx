// ==========================================================
// Daily Summary API
// GET /api/sales/summary
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import * as salesService from '@/lib/services/sales.service';

export const GET = withErrorHandler(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' | null;

  const summary = await salesService.getSalesSummary(period ?? 'day');
  return NextResponse.json(summary);
});
