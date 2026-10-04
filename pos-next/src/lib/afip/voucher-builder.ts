export interface VoucherParams {
  pos: number;
  cbteTipo: number;
  docTipo: number;
  docNro: string;
  nextVoucher: number;
  total: number;
}

export function buildVoucherPayload(params: VoucherParams): any {
  // Format dates: yyyyMMdd
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  
  const payload: any = {
    CantReg: 1,
    PtoVta: params.pos,
    CbteTipo: params.cbteTipo,
    Concepto: 1, // Products (1)
    DocTipo: params.docTipo,
    DocNro: parseInt(params.docNro, 10) || 0,
    CbteDesde: params.nextVoucher,
    CbteHasta: params.nextVoucher,
    CbteFch: parseInt(dateStr, 10),
    ImpTotal: params.total,
    ImpTotConc: 0,
    ImpOpEx: 0,
    ImpTrib: 0,
    ImpIVA: 0,
    ImpNeto: params.total,
    MonId: 'PES',
    MonCotiz: 1,
  };

  // Factura A (code 1) discriminates VAT
  if (params.cbteTipo === 1) {
    const impNeto = Math.round((params.total / 1.21) * 100) / 100;
    const impIva = Math.round((params.total - impNeto) * 100) / 100;

    payload.ImpNeto = impNeto;
    payload.ImpIVA = impIva;
    
    payload.Iva = [{
      Id: 5, // 21%
      BaseImp: impNeto,
      Importe: impIva
    }];
  }

  return payload;
}
