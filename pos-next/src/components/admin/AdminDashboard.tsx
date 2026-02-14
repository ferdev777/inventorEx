'use client';

import { useState } from 'react';
import { Package, X, Receipt, Store, Users, LogOut, Truck } from 'lucide-react';
import { ProductManager } from './ProductManager';
import { ClientManager } from './ClientManager';
import { SalesHistory } from './SalesHistory';
import { SupplierManager } from './SupplierManager';
import { useAuth } from '@/lib/auth-context';

interface AdminDashboardProps {
  onExit: () => void;
}

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'sales' | 'clients' | 'suppliers'>('products');
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Admin Header */}
      <header
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{
          background: 'var(--statusbar-bg)',
          borderBottom: '1px solid var(--statusbar-border)',
        }}
      >
        <div className="flex items-center gap-5">
          {/* Logo + Title */}
          <div className="flex items-center gap-2.5">
            <div
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--accent-bg)' }}
            >
              <Store className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: 'var(--statusbar-text)' }}>
                Administración
              </h1>
              <p className="text-[11px] leading-tight" style={{ color: 'var(--statusbar-text-muted)' }}>
                POS & Inventario
              </p>
            </div>
          </div>

          {/* Tabs */}
          <nav
            className="flex items-center gap-0.5 p-1 rounded-lg"
            style={{ backgroundColor: 'var(--statusbar-btn-bg)' }}
          >
            <button
              onClick={() => setActiveTab('products')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'products' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'products' ? '#ffffff' : 'var(--statusbar-text-muted)',
                boxShadow: activeTab === 'products' ? '0 2px 8px var(--accent-glow)' : 'none',
              }}
            >
              <Package className="w-4 h-4" />
              Productos
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'sales' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'sales' ? '#ffffff' : 'var(--statusbar-text-muted)',
                boxShadow: activeTab === 'sales' ? '0 2px 8px var(--accent-glow)' : 'none',
              }}
            >
              <Receipt className="w-4 h-4" />
              Ventas
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'clients' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'clients' ? '#ffffff' : 'var(--statusbar-text-muted)',
                boxShadow: activeTab === 'clients' ? '0 2px 8px var(--accent-glow)' : 'none',
              }}
            >
              <Users className="w-4 h-4" />
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'suppliers' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'suppliers' ? '#ffffff' : 'var(--statusbar-text-muted)',
                boxShadow: activeTab === 'suppliers' ? '0 2px 8px var(--accent-glow)' : 'none',
              }}
            >
              <Truck className="w-4 h-4" />
              Proveedores
            </button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* User Profile Info */}
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-bold" style={{ color: 'var(--statusbar-text)' }}>
              {user?.email?.split('@')[0]}
            </span>
            <span className="text-[10px] uppercase tracking-tighter opacity-50 font-bold" style={{ color: 'var(--statusbar-text-muted)' }}>
              Administrador
            </span>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
            }}
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: 'var(--statusbar-btn-bg)',
              color: 'var(--statusbar-text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--statusbar-btn-bg)';
              e.currentTarget.style.color = 'var(--statusbar-text-muted)';
            }}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'products' ? <ProductManager /> : 
         activeTab === 'clients' ? <ClientManager /> : 
         activeTab === 'suppliers' ? <SupplierManager /> :
         <SalesHistory />}
      </div>
    </div>
  );
}
