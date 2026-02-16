'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Package, Infinity as InfinityIcon } from 'lucide-react';
import type { ProductView } from '@/lib/types';
import { searchProducts } from '@/lib/api/client';

interface ProductPanelProps {
  onAddToCart: (product: ProductView) => void;
  disableFocus?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ProductPanel({ onAddToCart, disableFocus = false }: ProductPanelProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Auto-focus search input on mount (optimized for barcode scanners)
  useEffect(() => {
    if (disableFocus) return;

    inputRef.current?.focus();

    const handleClick = () => {
      setTimeout(() => inputRef.current?.focus(), 100);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [disableFocus]);

  // Load all products initially
  useEffect(() => {
    searchProducts('').then(setProducts).catch(console.error);
  }, []);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchProducts(value);
        setProducts(results);

        // Auto-add if barcode scanner returns exactly one result
        if (value.length >= 8 && results.length === 1) {
          onAddToCart(results[0]);
          setQuery('');
          const allProducts = await searchProducts('');
          setProducts(allProducts);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, value.length >= 8 ? 100 : 300);
  }, [onAddToCart]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Escanear código de barras o buscar producto..."
            className="input-field !pl-12 text-base"
            id="product-search"
            autoComplete="off"
          />
          {loading && (
            <Loader2
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin"
              style={{ color: 'var(--accent)' }}
            />
          )}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {products.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: 'var(--text-muted)' }}
          >
            <Package className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-medium">No se encontraron productos</p>
            <p className="text-sm mt-1 opacity-60">Intentá con otro término de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-24 lg:pb-0">
            {products.map((product, index) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;

              return (
                <button
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock}
                  className={`product-card ${isOutOfStock ? 'product-card--disabled' : ''}`}
                  style={{ animationDelay: `${index * 0.04}s` }}
                  id={`product-${product.id}`}
                >
                  {/* Low stock pulse indicator */}
                  {isLowStock && <div className="product-card__low-badge" />}

                  <span className="product-card__barcode">{product.barcode}</span>
                  <span className="product-card__name">{product.name}</span>

                  <div className="mt-auto flex items-end justify-between pt-3">
                    <span className="product-card__price">
                      {formatCurrency(Number(product.price))}
                    </span>
                    <span
                      className={`product-card__stock ${isLowStock ? 'product-card__stock--low' : ''}`}
                    >
                      {isOutOfStock ? 'Sin stock' : product.alwaysInStock ? <InfinityIcon className="w-3 h-3" /> : `${product.stock} u.`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
