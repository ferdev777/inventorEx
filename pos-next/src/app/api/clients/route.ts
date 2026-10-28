import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';
import { CreateClientSchema } from '@/lib/dto/schemas';
import * as clientService from '@/lib/services/client.service';

export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (query) {
    const clients = await clientService.searchClients(query);
    return NextResponse.json(clients);
  } else {
    const clients = await clientService.getAllClients();
    return NextResponse.json(clients);
  }
});

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const validated = CreateClientSchema.parse(body);
  const client = await clientService.createClient(validated);
  return NextResponse.json(client, { status: 201 });
});
