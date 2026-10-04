/**
 * Mock AFIP Client
 *
 * Simulates the @afipsdk/afip.js interface so the entire
 * billing flow (stock → DB → "AFIP" → DB update) can be
 * tested locally without certificates, CUIT, or network.
 *
 * Activate by setting AFIP_MOCK=true in .env.local
 */

let mockVoucherCounter = 0;

function generateMockCAE(): string {
  // Real CAEs are 14-digit numbers. We generate a realistic-looking one.
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 9000 + 1000).toString();
  return timestamp + random;
}

function generateMockCAEExpiry(): string {
  // Return a date 10 days from now in AFIP format: yyyyMMdd
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 10);
  return expiry.toISOString().split('T')[0].replace(/-/g, '');
}

export interface MockAfipClient {
  ElectronicBilling: {
    getLastVoucher: (pos: number, cbteTipo: number) => Promise<number>;
    createVoucher: (payload: any) => Promise<{ CAE: string; CAEFchVto: string }>;
  };
}

export function createMockAfip(): MockAfipClient {
  console.log('[AFIP-MOCK] 🧪 Using SIMULATED AFIP client — no real fiscal operations');

  return {
    ElectronicBilling: {
      async getLastVoucher(pos: number, cbteTipo: number): Promise<number> {
        mockVoucherCounter++;
        const lastVoucher = mockVoucherCounter;
        console.log(
          `[AFIP-MOCK] getLastVoucher(POS: ${pos}, CbteTipo: ${cbteTipo}) → ${lastVoucher}`,
        );
        return lastVoucher;
      },

      async createVoucher(payload: any): Promise<{ CAE: string; CAEFchVto: string }> {
        const cae = generateMockCAE();
        const caeVto = generateMockCAEExpiry();

        console.log('[AFIP-MOCK] createVoucher called with payload:', {
          PtoVta: payload.PtoVta,
          CbteTipo: payload.CbteTipo,
          DocTipo: payload.DocTipo,
          DocNro: payload.DocNro,
          ImpTotal: payload.ImpTotal,
          CbteDesde: payload.CbteDesde,
        });
        console.log(`[AFIP-MOCK] ✅ Voucher approved — CAE: ${cae} | Vto: ${caeVto}`);

        return { CAE: cae, CAEFchVto: caeVto };
      },
    },
  };
}
