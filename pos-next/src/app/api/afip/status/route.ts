// ==========================================================
// AFIP Status API
// GET /api/afip/status
// ==========================================================
import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api/helpers';

export const GET = withErrorHandler(async () => {
  // AFIP integration is server-side only.
  // For Vercel deployment, AFIP SDK requires server environment.
  // Until AFIP certificates are configured, return NOT_CONFIGURED.
  const isConfigured = !!(
    process.env.AFIP_CUIT &&
    process.env.AFIP_CERT_PATH &&
    process.env.AFIP_KEY_PATH
  );

  return NextResponse.json({
    configured: isConfigured,
    serverStatus: isConfigured ? 'ONLINE' : 'NOT_CONFIGURED',
  });
});
