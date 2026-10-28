import { NextResponse } from 'next/server';
import { withErrorHandler, parseIdParam } from '@/lib/api/helpers';
import { UpdateSupplierSchema } from '@/lib/dto/schemas';
import * as suppliersService from '@/lib/services/suppliers.service';

export const GET = withErrorHandler(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const supplierId = parseIdParam(id);
  const supplier = await suppliersService.findSupplierById(supplierId);
  return NextResponse.json(supplier);
});

export const PUT = withErrorHandler(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const supplierId = parseIdParam(id);
  const body = await request.json();
  const validated = UpdateSupplierSchema.parse(body);
  const supplier = await suppliersService.updateSupplier(supplierId, validated);
  return NextResponse.json(supplier);
});

export const DELETE = withErrorHandler(async (request: Request, context: { params: Promise<{ id: string }> }) => {
  const { id } = await context.params;
  const supplierId = parseIdParam(id);
  await suppliersService.deleteSupplier(supplierId);
  return new NextResponse(null, { status: 204 });
});
