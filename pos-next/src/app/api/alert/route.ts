import { NextResponse } from 'next/server';
import { sendLowStockAlert } from '@/lib/email';
import { z } from 'zod';

const AlertSchema = z.object({
  productName: z.string(),
  currentStock: z.number(),
  minStock: z.number(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, currentStock, minStock } = AlertSchema.parse(body);

    // Run asynchronously, don't block response
    sendLowStockAlert(productName, currentStock, minStock).catch(console.error);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
