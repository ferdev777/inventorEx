import { useState, useEffect } from 'react';
import { Receipt, Loader2, Calendar, FileText, Package, ChevronRight, ChevronDown } from 'lucide-react';
import { getRecentSales } from '@/lib/api/client';
import type { SaleResult } from '@/lib/types';
import { toast } from 'sonner';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function SalesHistory() {
  const [sales, setSales] = useState<SaleResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState<number | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getRecentSales(50);
      setSales(data);
    } catch {
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[var(--accent)]" />
            Historial de Ventas
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {sales.length} ventas recientes
          </p>
        </div>
      </div>

      {/* History Table Container */}
      <div className="flex-1 overflow-auto glass-panel">
        <table className="admin-table w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-10"></th>
              <th>Fecha</th>
              <th>Factura</th>
              <th>Tipo</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="!text-center !py-12" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
                    <span>Cargando historial...</span>
                  </div>
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="!text-center !py-12" style={{ color: 'var(--text-muted)' }}>
                  No hay ventas registradas
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <tr 
                    onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                    className="group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="text-center">
                      {expandedSale === sale.id ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                    </td>
                    <td className="text-sm font-tabular">
                      {new Date(sale.createdAt).toLocaleString('es-AR')}
                    </td>
                    <td className="font-mono text-xs opacity-70">
                      {sale.invoiceNumber || '---'}
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sale.type === 'FISCAL' 
                          ? 'bg-blue-500/10 text-blue-500' 
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {sale.type}
                      </span>
                    </td>
                    <td className="text-right font-tabular font-bold text-[var(--accent)]">
                      {formatCurrency(Number(sale.total))}
                    </td>
                  </tr>
                  {expandedSale === sale.id && (
                    <tr className="bg-black/2 dark:bg-white/2">
                      <td colSpan={5} className="p-4">
                        <div className="text-xs space-y-2">
                          <div className="font-bold uppercase tracking-wider opacity-60 mb-2">Detalle de Productos</div>
                          {sale.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-1 border-b border-[var(--border-secondary)] last:border-0">
                              <span className="flex items-center gap-2">
                                <Package className="w-3 h-3 opacity-50" />
                                {item.productName} <span className="opacity-50">x{item.quantity}</span>
                              </span>
                              <span className="font-tabular">{formatCurrency(Number(item.subtotal))}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// React import needed for React.Fragment
import React from 'react';
