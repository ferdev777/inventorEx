import { BarChart3 } from 'lucide-react';
import type { AfipStatus } from '@/lib/types';
import { ThemeToggle } from '@/components/ThemeProvider';
import { PeriodSelector } from '@/components/PeriodSelector';
import { BrandMark } from '@/components/BrandMark';


interface StatusBarProps {
  status: AfipStatus | null;
  summary: { totalSales: number; totalRevenue: number } | null;
  period: 'day' | 'week' | 'month' | 'year';
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  onAdminClick?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function StatusBar({ status, summary, period, onPeriodChange, onAdminClick }: StatusBarProps) {
  const isOnline = status?.serverStatus === 'ONLINE';
  const isConfigured = status?.configured ?? false;

  return (
    <header
      className="flex items-center justify-between px-5 py-2.5 shrink-0"
      style={{
        background: 'var(--statusbar-bg)',
        borderBottom: '1px solid var(--statusbar-border)',
      }}
    >
      {/* Left: Branding + Navigation */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <BrandMark size={28} className="text-white" />
          <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--statusbar-text)' }}>
            inventor<span style={{ color: 'var(--accent)' }}>Ex</span>
            <span className="opacity-40 mx-2">|</span>
            <span className="text-sm font-normal opacity-80">POS</span>
          </h1>
        </div>
        
        {/* Navigation Tools (Stacked) */}
        <nav className="flex items-center gap-2">
           <button
            onClick={onAdminClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: 'var(--statusbar-btn-bg)', color: 'var(--statusbar-text-muted)' }}
          >
            <BarChart3 className="w-4 h-4" />
            Gestión
          </button>
        </nav>
      </div>

      {/* Right: Summary + Theme + AFIP */}
      <div className="flex items-center gap-3">
        {/* Daily summary */}
        {summary && (
          <div className="hidden md:flex items-center gap-3">
            {/* Period Selector */}
            <PeriodSelector value={period} onChange={onPeriodChange} />

            <div
              className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg"
              style={{
                color: 'var(--statusbar-text-muted)',
                background: 'var(--statusbar-btn-bg)',
              }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="font-medium">{summary.totalSales}</span>
              <span className="opacity-60">ventas</span>
            </div>
            <div
              className="font-bold font-tabular text-sm px-3 py-1 rounded-lg"
              style={{
                color: 'var(--accent)',
                background: 'rgba(16, 185, 129, 0.08)',
              }}
            >
              {formatCurrency(summary.totalRevenue)}
            </div>
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* AFIP Status */}
        <div className={`status-badge ${isOnline ? 'status-online' : 'status-offline'}`}>
          <span className={isOnline ? 'dot-online' : 'dot-offline'} />
          <span className="text-xs font-medium">
            AFIP: {!isConfigured ? 'No Config.' : isOnline ? 'En Línea' : 'Sin Conexión'}
          </span>
        </div>
      </div>
    </header>
  );
}
