'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { CartItem, SaleResult, ProductView, SaleType, AfipStatus, DailySummary, Client } from '@/lib/types';
import { createSale, getAfipStatus, getSalesSummary } from '@/lib/api/client';
import { StatusBar } from '@/components/StatusBar';
import { ProductPanel } from '@/components/ProductPanel';
import { CartPanel } from '@/components/CartPanel';
import { ResultModal } from '@/components/ResultModal';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function POSPage() {
  // --- State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saleResult, setSaleResult] = useState<SaleResult | null>(null);
  const [saleError, setSaleError] = useState<string | null>(null);
  const [afipStatus, setAfipStatus] = useState<AfipStatus | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // --- Effects ---
  useEffect(() => {
    // Load AFIP status & daily summary on mount
    getAfipStatus().then(setAfipStatus).catch(console.error);
    getSalesSummary(selectedPeriod).then(setDailySummary).catch(console.error);

    // Refresh summary every 5 minutes
    const interval = setInterval(() => {
      getSalesSummary(selectedPeriod).then(setDailySummary).catch(console.error);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  // --- Cart Operations ---
  const handleAddToCart = useCallback((product: ProductView) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQty = useCallback((productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stock) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[],
    );
  }, []);

  const handleRemove = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  // --- Checkout ---
  const handleCheckout = useCallback(
    async (type: SaleType) => {
      if (cart.length === 0 || isProcessing) return;
      setIsProcessing(true);
      setSaleResult(null);
      setSaleError(null);

      try {
        const result = await createSale({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          type,
        });

        setSaleResult(result);
        setCart([]);
        setIsMobileCartOpen(false);

        // Refresh daily summary after successful sale
        getSalesSummary(selectedPeriod).then(setDailySummary).catch(console.error);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error desconocido al procesar la venta';
        setSaleError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [cart, isProcessing, selectedPeriod],
  );

  const handleCloseModal = useCallback(() => {
    setSaleResult(null);
    setSaleError(null);
  }, []);

  // --- Admin Mode ---
  if (showAdmin) {
    return <AdminDashboard onExit={() => setShowAdmin(false)} />;
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Status Bar */}
      <StatusBar
        status={afipStatus}
        summary={dailySummary}
        period={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onAdminClick={() => setShowAdmin(true)}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Product Panel (Left) */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <ProductPanel onAddToCart={handleAddToCart} />
        </div>

        {/* Cart Panel (Right - Desktop) */}
        <div className={`
          fixed inset-0 z-40 flex flex-col lg:static lg:flex lg:flex-col lg:min-w-[340px] lg:max-w-[420px] transition-transform duration-300 ease-in-out
          ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `} style={{ backgroundColor: 'var(--cart-bg)' }}>
          {/* Mobile Cart Header (Close Button) */}
          <div className="lg:hidden flex items-center justify-between p-4 shrink-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
             <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Ticket Actual</h2>
             <button 
               onClick={() => setIsMobileCartOpen(false)}
               className="p-2" style={{ color: 'var(--text-tertiary)' }}
             >
               Cerrar
             </button>
          </div>

          <div className="flex-1 min-h-0">
            <CartPanel
              items={cart}
              onUpdateQty={handleUpdateQty}
              onRemove={handleRemove}
              onCheckout={handleCheckout}
              isProcessing={isProcessing}
              selectedClient={selectedClient}
              onSelectClient={setSelectedClient}
            />
          </div>
        </div>
      </div>

      {/* Mobile Cart FAB */}
      {!isMobileCartOpen && (
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-30 w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--text-inverse)' }}
          id="mobile-cart-fab"
        >
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--danger)' }}>
              {totalItems}
            </span>
          )}
        </button>
      )}

      {/* Result Modal */}
      <ResultModal
        result={saleResult}
        error={saleError}
        onClose={handleCloseModal}
      />
    </div>
  );
}
