import { Client } from '../types/client';

export function resolveInvoiceType(client: Client | null, taxCondition: 'RI' | 'MONO'): { cbteTipo: number, docTipo: number, docNro: string } {
  // If no client, they are an anonymous final consumer
  let docTipo = 99; // Consumidor Final
  let docNro = '0';

  if (client) {
    // Map internal docType to AFIP docTipo
    if (client.docType === 'CUIT') {
      docTipo = 80;
    } else if (client.docType === 'CUIL') {
      docTipo = 86;
    } else if (client.docType === 'DNI') {
      docTipo = 96;
    }
    docNro = client.docNumber || '0';
  }

  // If the issuer is a Monotributista, always issue Factura C (code 11)
  if (taxCondition === 'MONO') {
    return {
      cbteTipo: 11,
      docTipo,
      docNro
    };
  }

  // If the issuer is Responsable Inscripto:
  // - Factura A (code 1) for clients with CUIT
  // - Factura B (code 6) for Final Consumers / Monotributistas (DNI/CUIL or no client)
  if (docTipo === 80) { // CUIT
    return {
      cbteTipo: 1, // Factura A
      docTipo,
      docNro
    };
  }

  return {
    cbteTipo: 6, // Factura B
    docTipo,
    docNro
  };
}
