'use client';

import { CheckCircle2, XCircle, Printer, FileDown } from 'lucide-react';
import type { SaleResult } from '@/lib/types';
import { printReceipt } from '@/lib/receipt';
import { generatePdf } from '@/lib/pdf';

interface ResultModalProps {
  result: SaleResult | null;
  error: string | null;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ResultModal({ result, error, onClose }: ResultModalProps) {
  if (!result && !error) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: 'var(--modal-overlay)' }}
    >
      <div className="glass-panel-solid p-8 max-w-md w-full mx-4 animate-scale-in shadow-2xl">
        {result ? (
          // Success
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {result.type === 'FISCAL' ? '¡Factura Creada con Éxito!' : '¡Venta Registrada!'}
            </h3>

            <div
              className="space-y-2 my-5 p-4 rounded-lg text-left"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>Venta #</span>
                <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{result.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>Total</span>
                <span className="font-bold font-tabular" style={{ color: 'var(--accent)' }}>
                  {formatCurrency(Number(result.total))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-tertiary)' }}>Tipo</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {result.type === 'FISCAL' 
                    ? (result.cbteTipo === 1 ? 'Factura A' : result.cbteTipo === 11 ? 'Factura C' : 'Factura B')
                    : 'Interno'}
                </span>
              </div>
              {result.cae && (
                <>
                  <div className="my-2" style={{ borderTop: '1px solid var(--border-secondary)' }} />
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-tertiary)' }}>CAE</span>
                    <span className="font-mono text-xs text-green-500">{result.cae}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-tertiary)' }}>Factura Nº</span>
                    <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{result.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-tertiary)' }}>Vto. CAE</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {result.vtoCae ? new Date(result.vtoCae).toLocaleDateString('es-AR') : '-'}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => printReceipt(result)}
                className="btn-internal py-3 flex items-center justify-center gap-2"
                id="modal-print"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
              <button
                onClick={() => generatePdf(result)}
                className="btn-internal py-3 flex items-center justify-center gap-2 bg-gradient-to-br from-gray-700 to-gray-900"
                style={{ background: 'var(--text-secondary)' }}
                id="modal-download-pdf"
              >
                <FileDown className="w-5 h-5" />
                PDF
              </button>
              <button
                onClick={onClose}
                className="col-span-2 btn-ghost py-3 border border-gray-200"
                id="modal-close-success"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          // Error
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Error al Procesar
            </h3>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              {error}
            </p>
            <button
              onClick={onClose}
              className="btn-danger w-full py-3"
              id="modal-close-error"
              autoFocus
            >
              Cerrar y Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
