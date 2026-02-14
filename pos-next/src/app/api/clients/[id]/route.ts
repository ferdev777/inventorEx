import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import { UpdateClientSchema } from '@/lib/dto/schemas';
import * as clientService from '@/lib/services/client.service';

export const PUT = withErrorHandler(async (request: Request, props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const body = await request.json();
  const validated = UpdateClientSchema.parse(body);
  const client = await clientService.updateClient(params.id, validated);
  return NextResponse.json(client);
});

export const DELETE = withErrorHandler(async (request: Request, props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  await clientService.deleteClient(params.id);
  return new NextResponse(null, { status: 204 });
});
