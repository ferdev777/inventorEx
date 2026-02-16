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
import { QuantitySelector } from '@/components/QuantitySelector';
import { toast } from 'sonner';

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

  // --- Quantity Selector State ---
  const [selectedProductForQty, setSelectedProductForQty] = useState<ProductView | null>(null);
  const [qtyInModal, setQtyInModal] = useState(1);

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
  
  const confirmAddToCart = useCallback((product: ProductView, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
           toast.error('No hay suficiente stock disponible');
           return prev;
        }
        // Calcular nueva cantidad total
        const newTotal = existing.quantity + quantity;
        if (newTotal > product.stock) {
            toast.warning(`Solo se agregaron ${product.stock - existing.quantity} unidades (Stock máximo alcanzado)`);
            return prev.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: product.stock }
                  : item
              );
        }
        
        toast.success(`Se agregaron ${quantity} unidades de ${product.name}`);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      toast.success(`Agregado: ${product.name} (x${quantity})`);
      return [...prev, { product, quantity }];
    });
    // Cerrar modal y resetear
    setSelectedProductForQty(null);
    setQtyInModal(1);
    // Enfocar input de búsqueda de nuevo si es posible (opcional)
    document.getElementById('product-search')?.focus();
  }, []);

  const handleAddToCart = useCallback((product: ProductView) => {
    if (selectedProductForQty && selectedProductForQty.id === product.id) {
        // Mismo producto escaneado -> incrementar cantidad
        setQtyInModal(prev => {
            const newQty = prev + 1;
            if (newQty > product.stock) {
                toast.error('Stock máximo alcanzado en selección');
                return prev;
            }
            return newQty;
        });
    } else {
        // Otro producto escaneado mientras había uno abierto
        if (selectedProductForQty) {
            // Confirmar y agregar el anterior antes de cambiar (comportamiento de "cola")
            // O, para simplificar y evitar errores, simplemente cambiamos al nuevo
            // Si el usuario escanea A, luego B, asumimos que A se canceló o se confirma? 
            // La regla "si se pasa 2 veces... se añada un 2" implica flujo rápido.
            // Vamos a confirmar el anterior con la cantidad actual y abrir el nuevo.
            confirmAddToCart(selectedProductForQty, qtyInModal);
        }
        // Abrir modal para el nuevo
        setSelectedProductForQty(product);
        setQtyInModal(1);
    }
  }, [selectedProductForQty, qtyInModal, confirmAddToCart]);

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
          <ProductPanel 
            onAddToCart={handleAddToCart} 
            disableFocus={!!selectedProductForQty || !!saleResult || isMobileCartOpen}
          />
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

      {/* Quantity Selector Modal */}
      {selectedProductForQty && (
        <QuantitySelector
          product={selectedProductForQty}
          initialQty={qtyInModal}
          onConfirm={(qty) => confirmAddToCart(selectedProductForQty, qty)}
          onCancel={() => {
              setSelectedProductForQty(null);
              setQtyInModal(1);
              document.getElementById('product-search')?.focus();
          }}
        />
      )}
    </div>
  );
}
