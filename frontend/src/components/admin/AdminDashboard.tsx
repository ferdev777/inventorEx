import { useState } from 'react';
import { Package, X, Receipt, Users, Truck, ArrowLeft } from 'lucide-react';
import { ProductManager } from './ProductManager';
import { ClientManager } from './ClientManager';
import { SalesHistory } from './SalesHistory';
import { SupplierManager } from './SupplierManager';
import { useAuth } from '@/lib/auth-context';
import { BrandMark } from '@/components/BrandMark';

interface AdminDashboardProps {
  onExit: () => void;
}

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'clients' | 'suppliers'>('products');
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left Sidebar (Scalable Nav) */}
      <aside 
        className="w-64 flex flex-col shrink-0 border-r"
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          borderColor: 'var(--border-primary)' 
        }}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="p-1.5 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent)]/20">
            <BrandMark size={24} monochrome />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
              inventor<span style={{ color: 'var(--accent)' }}>Ex</span>
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60" style={{ color: 'var(--text-tertiary)' }}>
              Gestión
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Módulos
          </div>

          <NavItem
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            icon={<Package className="w-4 h-4" />}
            label="Productos"
          />
          <NavItem
            active={activeTab === 'sales'}
            onClick={() => setActiveTab('sales')}
            icon={<Receipt className="w-4 h-4" />}
            label="Ventas"
          />
          <NavItem
            active={activeTab === 'clients'}
            onClick={() => setActiveTab('clients')}
            icon={<Users className="w-4 h-4" />}
            label="Clientes"
          />
          <NavItem
            active={activeTab === 'suppliers'}
            onClick={() => setActiveTab('suppliers')}
            icon={<Truck className="w-4 h-4" />}
            label="Proveedores"
          />
        </nav>

        {/* Footer: User & Exit */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="px-3 py-1 flex flex-col">
            <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.email?.split('@')[0]}
            </span>
            <span className="text-[10px] opacity-60" style={{ color: 'var(--text-tertiary)' }}>
              Administrador
            </span>
          </div>

          <button
            onClick={onExit}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al POS
          </button>
        </div>
      </aside>

      {/* Main Content View Area */}
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="max-w-7xl mx-auto p-8">
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'sales' && <SalesHistory />}
          {activeTab === 'clients' && <ClientManager />}
          {activeTab === 'suppliers' && <SupplierManager />}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-[var(--accent)] text-white shadow-md font-semibold' 
          : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
