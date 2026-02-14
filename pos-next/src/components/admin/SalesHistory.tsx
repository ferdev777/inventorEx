'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Receipt, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import type { SaleResult } from '@/lib/types';
import { getRecentSales } from '@/lib/api/client';
import { SalesCharts } from './SalesCharts';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
  const [selectedSale, setSelectedSale] = useState<SaleResult | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');

  const loadSales = async () => {
    setLoading(true);
    try {
      // Fetch more data for charts
      const data = await getRecentSales(500);
      setSales(data);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sales Content */}
      <div className="flex-1 flex flex-col min-w-[400px]" style={{ borderRight: '1px solid var(--border-primary)' }}>
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold">Historial de Ventas</h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {sales.length} ventas registradas
              </p>
            </div>
            {/* View Filter */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 text-sm">
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow dark:bg-gray-700 font-medium' : 'text-gray-500'}`}
                >Lista</button>
                <button 
                  onClick={() => setViewMode('stats')} 
                  className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'stats' ? 'bg-white shadow dark:bg-gray-700 font-medium' : 'text-gray-500'}`}
                >Estadísticas</button>
            </div>
          </div>

          <button
            onClick={loadSales}
            className="qty-btn"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-transparent">
          {viewMode === 'stats' ? (
             <SalesCharts sales={sales} loading={loading} />
          ) : (
            loading ? (
              <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: 'var(--accent)' }} />
                Cargando ventas...
              </div>
            ) : sales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
                <Receipt className="w-12 h-12 mb-3 opacity-20" />
                <p>No hay ventas registradas</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className="cursor-pointer"
                      style={{
                        backgroundColor: selectedSale?.id === sale.id ? 'var(--accent-bg)' : undefined,
                      }}
                    >
                      <td>#{sale.id}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{formatDate(sale.createdAt)}</td>
                      <td>
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            background: sale.type === 'FISCAL'
                              ? 'rgba(59, 130, 246, 0.1)'
                              : 'var(--accent-bg)',
                            color: sale.type === 'FISCAL'
                              ? 'var(--fiscal)'
                              : 'var(--accent-text)',
                          }}
                        >
                          {sale.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-tabular font-semibold" style={{ color: 'var(--accent)' }}>
                          {formatCurrency(Number(sale.total))}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Right: Sale Detail */}
      <div className="w-[400px] flex flex-col" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        {selectedSale ? (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="p-6" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent-bg)' }}
                >
                  <Receipt className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Venta #{selectedSale.id}</h3>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedSale.createdAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-tertiary)' }}>Tipo:</span>
                  <span className="font-bold">{selectedSale.type}</span>
                </div>
                {selectedSale.type === 'FISCAL' && (
                  <>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>CAE:</span>
                      <span className="font-mono text-xs">{selectedSale.cae}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>Factura:</span>
                      <span className="font-mono text-xs">{selectedSale.invoiceNumber}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Items
              </h4>
              <div className="space-y-3">
                {selectedSale.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start text-sm p-3 rounded-lg"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.productName}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {item.quantity} × {formatCurrency(Number(item.unitPrice))}
                      </div>
                    </div>
                    <div className="font-semibold font-tabular" style={{ color: 'var(--accent)' }}>
                      {formatCurrency(Number(item.subtotal))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-6"
              style={{
                borderTop: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  Total
                </span>
                <span className="text-3xl font-extrabold font-tabular" style={{ color: 'var(--accent)' }}>
                  {formatCurrency(Number(selectedSale.total))}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <Receipt className="w-7 h-7 opacity-20" />
            </div>
            <p className="text-sm font-medium">Selecciona una venta</p>
            <p className="text-xs mt-1 opacity-60">para ver el detalle</p>
          </div>
        )}
      </div>
    </div>
  );
}
