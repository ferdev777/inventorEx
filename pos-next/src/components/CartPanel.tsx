'use client';

import { ShoppingCart, Minus, Plus, Trash2, Receipt, ArrowRight, Loader2 } from 'lucide-react';
import type { CartItem, SaleType, Client } from '@/lib/types';
import { ClientSelector } from '@/components/ClientSelector';

interface CartPanelProps {
  items: CartItem[];
  onUpdateQty: (productId: number, delta: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: (type: SaleType) => void;
  isProcessing: boolean;
  selectedClient: Client | null;
  onSelectClient: (client: Client | null) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function CartPanel({ items, onUpdateQty, onRemove, onCheckout, isProcessing, selectedClient, onSelectClient }: CartPanelProps) {
  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: 'var(--cart-bg)',
        borderLeft: '1px solid var(--border-primary)',
      }}
    >
      {/* Cart Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-secondary)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-bg)' }}
          >
            <ShoppingCart className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Ticket</h2>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: 'var(--accent-bg)',
            color: 'var(--accent-text)',
          }}
        >
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <ClientSelector selectedClient={selectedClient} onSelect={onSelectClient} />
        
        {items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: 'var(--text-muted)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <Receipt className="w-7 h-7 opacity-30" />
            </div>
            <p className="text-sm font-medium">Carrito vacío</p>
            <p className="text-xs mt-1.5 opacity-60">
              Escanee un producto para comenzar
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="cart-item">
              <div className="flex-1 min-w-0 mr-3">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.product.name}
                </p>
                <p
                  className="text-xs font-tabular mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatCurrency(Number(item.product.price))} c/u
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQty(item.product.id, -1)}
                  className="qty-btn"
                  id={`qty-minus-${item.product.id}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  className="w-8 text-center text-sm font-bold font-tabular"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQty(item.product.id, 1)}
                  disabled={item.quantity >= item.product.stock}
                  className="qty-btn"
                  id={`qty-plus-${item.product.id}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Subtotal + Remove */}
              <div className="flex items-center gap-2 ml-3">
                <span
                  className="text-sm font-bold font-tabular w-24 text-right"
                  style={{ color: 'var(--accent)' }}
                >
                  {formatCurrency(Number(item.product.price) * item.quantity)}
                </span>
                <button
                  onClick={() => onRemove(item.product.id)}
                  className="qty-btn"
                  style={{ border: 'none', background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  id={`remove-${item.product.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total & Checkout */}
      <div
        className="p-5 space-y-4"
        style={{ borderTop: '1px solid var(--border-primary)' }}
      >
        {/* Total Display */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Total
          </span>
          <span
            className="text-3xl font-extrabold font-tabular tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatCurrency(total)}
          </span>
        </div>

        {/* Checkout Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => onCheckout('FISCAL')}
            disabled={items.length === 0 || isProcessing}
            className="btn btn-fiscal py-3.5 text-base"
            id="btn-fiscal"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Receipt className="w-5 h-5" />
            )}
            FACTURAR (AFIP)
            {!isProcessing && <ArrowRight className="w-4 h-4 ml-1" />}
          </button>

          <button
            onClick={() => onCheckout('INTERNAL')}
            disabled={items.length === 0 || isProcessing}
            className="btn btn-internal py-3.5 text-base"
            id="btn-internal"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Receipt className="w-5 h-5 opacity-70" />
            )}
            TICKET NO FISCAL (Interno)
          </button>
        </div>
      </div>
    </div>
  );
}
