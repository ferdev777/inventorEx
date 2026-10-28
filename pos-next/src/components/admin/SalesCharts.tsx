'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { SaleResult } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface SalesChartsProps {
  sales: SaleResult[];
  loading: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const TimeControls = ({ 
  active, 
  onChange 
}: { 
  active: 'day' | 'week' | 'month' | 'year'; 
  onChange: (v: 'day' | 'week' | 'month' | 'year') => void 
}) => (
  <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 text-xs sm:text-xs">
    {(['day', 'week', 'month', 'year'] as const).map((t) => (
       <button 
         key={t}
         onClick={() => onChange(t)} 
         className={`px-2 py-1 rounded capitalize ${active === t ? 'bg-white shadow dark:bg-gray-700 text-accent font-semibold' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
       >
         {t === 'day' ? 'Hoy' : t === 'week' ? 'Semana' : t === 'month' ? 'Mes' : 'Año'}
       </button>
    ))}
  </div>
);

export function SalesCharts({ sales, loading }: SalesChartsProps) {
  const [barTimeRange, setBarTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [pieTimeRange, setPieTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week'); // Independent filter

  const stats = useMemo(() => {
    if (!sales.length) return null;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Helper to filter sales by time range
    const filterSales = (range: 'day' | 'week' | 'month' | 'year') => {
      return sales.filter((sale) => {
        const date = new Date(sale.createdAt);
        if (range === 'day') return date >= todayStart;
        if (range === 'week') {
            const d = new Date(now); d.setDate(d.getDate() - 7); return date >= d;
        }
        if (range === 'month') {
            const d = new Date(now); d.setMonth(d.getMonth() - 1); return date >= d;
        }
        if (range === 'year') {
            const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return date >= d;
        }
        return true;
      });
    };

    // --- 1. Top Products (Pie Chart) ---
    const pieSales = filterSales(pieTimeRange);
    const productSales = new Map<string, number>();
    
    pieSales.forEach((sale) => {
      sale.items.forEach((item) => {
        productSales.set(item.productName, (productSales.get(item.productName) || 0) + item.quantity);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // --- 2. Sales Trend (Bar Chart) ---
    const barSales = filterSales(barTimeRange);
    const timeDataMap = new Map<string, number>();

    // Initializing structure based on range to ensure all points exist (optional but good for empty charts)
    // For now, simpler map approach is fine, but we need correct key formatting.

    barSales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      let key = '';

      if (barTimeRange === 'day') {
        // Group by Hour (00:00 - 23:00)
        key = `${date.getHours().toString().padStart(2, '0')}:00`;
      } else if (barTimeRange === 'week') {
        // Group by Day Name (Lun, Mar...)
        key = date.toLocaleDateString('es-AR', { weekday: 'short' });
      } else if (barTimeRange === 'month') {
        // Group by Date (DD/MM)
        key = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      } else if (barTimeRange === 'year') {
        // Group by Month (MMM-YY)
        key = date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
      }

      timeDataMap.set(key, (timeDataMap.get(key) || 0) + Number(sale.total));
    });

    // Sort the keys logic
    // Sort the keys logic
    const salesTrend = Array.from(timeDataMap.entries()).map(([name, amount]) => ({ name, amount }));

    return { topProducts, salesTrend };
  }, [sales, barTimeRange, pieTimeRange]);

  if (loading) {
     return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-accent" /></div>;
  }

  if (!stats || sales.length === 0) {
      return <div className="text-center p-10 text-gray-500">No hay datos suficientes para gráficos</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1 animate-fade-in">
      {/* Top Products */}
      <div className="glass-panel-solid p-5 rounded-xl border border-border">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Productos Más Vendidos</h3>
            <TimeControls active={pieTimeRange} onChange={setPieTimeRange} />
        </div>
        <div className="h-[300px] w-full">
          {stats.topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={stats.topProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {stats.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number | undefined) => [`${value ?? 0} unidades`, 'Ventas']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">Sin datos en este período</div>
          )}
        </div>
        
        {/* Custom Legend */}
        {stats.topProducts.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
            {stats.topProducts.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span 
                  className="block w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="truncate max-w-[150px]" title={entry.name}>
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Sales Trend */}
      <div className="glass-panel-solid p-5 rounded-xl border border-border">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Tendencia de Ingresos</h3>
            <TimeControls active={barTimeRange} onChange={setBarTimeRange} />
        </div>
        
        <div className="h-[300px] w-full">
          {stats.salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-secondary)" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                    dy={10}
                    interval={0} 
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                    tickFormatter={(value) => `$${value}`}
                    width={45} // prevent cut off
                />
                <Tooltip 
                    cursor={{ fill: 'var(--bg-tertiary)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Ingresos']}
                />
                <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">Sin datos en este período</div>
          )}
        </div>
      </div>
    </div>
  );
}
