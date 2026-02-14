import { NextResponse } from 'next/server';
import { withErrorHandler, parseIdParam } from '@/lib/api/helpers';
import { BulkUpdatePriceSchema } from '@/lib/dto/schemas';
import * as suppliersService from '@/lib/services/suppliers.service';

export const POST = withErrorHandler(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const supplierId = parseIdParam(id);
  const body = await request.json();
  
  const { percentage } = BulkUpdatePriceSchema.parse(body);
  
  await suppliersService.updatePricesBySupplier(supplierId, percentage);
  
  return NextResponse.json({ success: true, message: 'Precios actualizados' });
});
