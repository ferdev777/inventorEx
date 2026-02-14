import Afip from '@afipsdk/afip.js';
import path from 'path';

// AFIP Instance Singleton
let afipInstance: Afip | null = null;

// Only for server-side use
export function getAfip() {
  if (typeof window !== 'undefined') {
    throw new Error('AFIP SDK cannot be used on client side');
  }

  if (afipInstance) return afipInstance;

  // Use environment variables for production flexibility, 
  // but fallback to known paths for this local setup.
  const certPath = process.env.AFIP_CERT_PATH || path.join(process.cwd(), 'afip_certs', 'certificado.crt');
  const keyPath = process.env.AFIP_KEY_PATH || path.join(process.cwd(), 'afip_certs', 'private.key');
  
  const CUIT = process.env.AFIP_CUIT ? parseInt(process.env.AFIP_CUIT) : 23399135109;

  afipInstance = new Afip({
    CUIT: CUIT,
    cert: certPath,
    key: keyPath,
    production: process.env.AFIP_PRODUCTION === 'true',
    res_folder: path.join(process.cwd(), 'afip_certs'), // Folder to store tokens
    ta_folder: path.join(process.cwd(), 'afip_certs'), // Folder to store tokens
  });

  return afipInstance;
}
