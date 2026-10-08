import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SaleResult } from '@/lib/types';

export function generatePdf(sale: SaleResult): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Receipt format
  });

  const now = new Date(sale.createdAt);
  const dateStr = now.toLocaleDateString('es-AR');
  const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Helper to center text
  const centerX = (text: string, y: number, fontSize = 10, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const textWidth = doc.getTextWidth(text);
    const x = (80 - textWidth) / 2;
    doc.text(text, x, y);
  };

  let y = 10;

  // Header
  centerX('POS & Inventario', y, 14, true);
  y += 6;
  centerX('Mi Negocio S.A.', y, 9);
  y += 5;
  centerX('CUIT: 30-12345678-9', y, 9);
  y += 5;
  const invoiceLabel = sale.type === 'FISCAL'
    ? (sale.cbteTipo === 1 ? 'FACTURA A' : sale.cbteTipo === 11 ? 'FACTURA C' : 'FACTURA B')
    : 'NO FISCAL';
  centerX(invoiceLabel, y, 10, true);
  y += 8;

  // Info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Venta #${sale.id}`, 5, y);
  doc.text(`${dateStr} ${timeStr}`, 75, y, { align: 'right' });
  y += 6;

  // Table
  const tableData = sale.items.map(item => [
    item.productName,
    item.quantity.toString(),
    `$${Number(item.subtotal).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Producto', 'Cant', 'Total']],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
    headStyles: { fontStyle: 'bold',  halign: 'center' },
    columnStyles: {
      0: { cellWidth: 35 }, // Producto
      1: { cellWidth: 10, halign: 'center' }, // Cant
      2: { cellWidth: 20, halign: 'right' } // Total
    },
    margin: { left: 5, right: 5 },
  });

  // @ts-expect-error jspdf-autotable type definition issue
  y = doc.lastAutoTable.finalY + 6;

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 5, y);
  doc.text(`$${Number(sale.total).toFixed(2)}`, 75, y, { align: 'right' });
  y += 8;

  // Fiscal Info
  if (sale.type === 'FISCAL' && sale.cae) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`CAE: ${sale.cae}`, 5, y);
    y += 4;
    doc.text(`Vto CAE: ${sale.vtoCae ? new Date(sale.vtoCae).toLocaleDateString('es-AR') : '-'}`, 5, y);
    y += 4;
    doc.text(`Factura N: ${sale.invoiceNumber}`, 5, y);
    y += 6;
  }

  // Footer
  y += 4;
  centerX('¡Gracias por su compra!', y, 9);

  // Save
  doc.save(`ticket-${sale.id}.pdf`);
}
