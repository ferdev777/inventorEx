import type { SaleResult } from '@/lib/types';

/**
 * Generates a printable receipt HTML and opens the browser's print dialog.
 * This approach works across all browsers without external dependencies.
 */
export function printReceipt(sale: SaleResult): void {
  const now = new Date(sale.createdAt);
  const dateStr = now.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);

  const isFiscal = sale.type === 'FISCAL';

  const itemsHtml = sale.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 4px 0; border-bottom: 1px dashed #ddd;">${item.productName}</td>
        <td style="padding: 4px 8px; text-align: center; border-bottom: 1px dashed #ddd;">${item.quantity}</td>
        <td style="padding: 4px 0; text-align: right; border-bottom: 1px dashed #ddd;">${formatCurrency(Number(item.unitPrice))}</td>
        <td style="padding: 4px 0; text-align: right; border-bottom: 1px dashed #ddd; font-weight: 600;">${formatCurrency(Number(item.subtotal))}</td>
      </tr>`,
    )
    .join('');

  const fiscalBlock = isFiscal
    ? `
    <div style="margin-top: 12px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 6px; background: #f8fffe;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
        <span style="color: #666;">CAE:</span>
        <span style="font-family: monospace; font-weight: 600; color: #059669;">${sale.cae}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
        <span style="color: #666;">Factura Nº:</span>
        <span style="font-family: monospace;">${sale.invoiceNumber}</span>
      </div>
      ${sale.vtoCae ? `
      <div style="display: flex; justify-content: space-between; font-size: 11px;">
        <span style="color: #666;">Vto. CAE:</span>
        <span>${new Date(sale.vtoCae).toLocaleDateString('es-AR')}</span>
      </div>` : ''}
    </div>`
    : '';

  const receiptHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante #${sale.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      size: 80mm auto;
      margin: 5mm;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      max-width: 300px;
      margin: 0 auto;
      padding: 16px;
    }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #10b981;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 6px;">
      <!-- Logo: Ajustar tamaño según necesidad -->
      <img src="${window.location.origin}/logo.svg" alt="Logo" style="width: 32px; height: 32px;" />
      <h1 style="font-size: 16px; font-weight: 800; color: #1a2332; margin: 0;">
        POS & Inventario
      </h1>
    </div>
    
    <div style="font-size: 9px; color: #555; line-height: 1.3; margin-bottom: 4px;">
      <p><strong>Mi Negocio S.A.</strong></p>
      <p>Av. Corrientes 1234, CABA</p>
      <p>CUIT: 30-12345678-9 | Resp. Inscripto</p>
      <p>Inicio de Actividades: 01/01/2024</p>
    </div>

    <p style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
      ${isFiscal ? (sale.cbteTipo === 1 ? 'FACTURA A' : sale.cbteTipo === 11 ? 'FACTURA C' : 'FACTURA B') : 'COMPROBANTE NO FISCAL'}
    </p>
  </div>

  <!-- Sale Info -->
  <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 12px;">
    <span>Venta #${sale.id}</span>
    <span>${dateStr} ${timeStr}</span>
  </div>

  <!-- Items Table -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
    <thead>
      <tr style="border-bottom: 2px solid #333;">
        <th style="padding: 6px 0; text-align: left; font-size: 10px; text-transform: uppercase; color: #666;">Producto</th>
        <th style="padding: 6px 4px; text-align: center; font-size: 10px; text-transform: uppercase; color: #666;">Cant.</th>
        <th style="padding: 6px 0; text-align: right; font-size: 10px; text-transform: uppercase; color: #666;">P.Unit</th>
        <th style="padding: 6px 0; text-align: right; font-size: 10px; text-transform: uppercase; color: #666;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <!-- Total -->
  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 2px solid #333; margin-top: 4px;">
    <span style="font-size: 14px; font-weight: 700; text-transform: uppercase;">Total</span>
    <span style="font-size: 20px; font-weight: 800; color: #059669;">
      ${formatCurrency(Number(sale.total))}
    </span>
  </div>

  <!-- Fiscal Info -->
  ${fiscalBlock}

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; padding-top: 12px; border-top: 1px dashed #ddd;">
    <p style="font-size: 10px; color: #999;">¡Gracias por su compra!</p>
    <p style="font-size: 9px; color: #bbb; margin-top: 4px;">
      Comprobante generado el ${dateStr} a las ${timeStr}
    </p>
  </div>
</body>
</html>`;

  // Open a new window and trigger print dialog
  const printWindow = window.open('', '_blank', 'width=350,height=600');
  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    // Wait for content to render before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
    // Fallback for fast renders
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  }
}
