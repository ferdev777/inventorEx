import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import { CreateSupplierSchema } from '@/lib/dto/schemas';
import * as suppliersService from '@/lib/services/suppliers.service';

export const GET = withErrorHandler(async () => {
  const suppliers = await suppliersService.findAllSuppliers();
  return NextResponse.json(suppliers);
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const validated = CreateSupplierSchema.parse(body);
  const supplier = await suppliersService.createSupplier(validated);
  return NextResponse.json(supplier, { status: 201 });
});
