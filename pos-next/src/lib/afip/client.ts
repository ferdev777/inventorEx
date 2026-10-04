import Afip from '@afipsdk/afip.js';
import path from 'path';
import { createMockAfip, type MockAfipClient } from './mock-client';

// Union type: real SDK instance or our mock
type AfipClient = Afip | MockAfipClient;

// AFIP Instance Singleton
let afipInstance: AfipClient | null = null;

function isMockMode(): boolean {
  return process.env.AFIP_MOCK === 'true';
}

// Only for server-side use
export function getAfip(): AfipClient {
  if (typeof window !== 'undefined') {
    throw new Error('AFIP SDK cannot be used on client side');
  }

  if (afipInstance) return afipInstance;

  // Mock mode: bypass the real SDK entirely
  if (isMockMode()) {
    afipInstance = createMockAfip();
    return afipInstance;
  }

  // Real mode: use @afipsdk/afip.js
  const certPath = process.env.AFIP_CERT_PATH || path.join(process.cwd(), 'afip_certs', 'certificado.crt');
  const keyPath = process.env.AFIP_KEY_PATH || path.join(process.cwd(), 'afip_certs', 'private.key');
  
  const CUIT = process.env.AFIP_CUIT ? parseInt(process.env.AFIP_CUIT) : 23399135109;

  afipInstance = new Afip({
    CUIT: CUIT,
    cert: certPath,
    key: keyPath,
    production: process.env.AFIP_PRODUCTION === 'true',
    res_folder: path.join(process.cwd(), 'afip_certs'),
    ta_folder: path.join(process.cwd(), 'afip_certs'),
  });

  return afipInstance;
}

/**
 * Reset the singleton (useful for tests or when switching modes).
 */
export function resetAfipInstance(): void {
  afipInstance = null;
}
