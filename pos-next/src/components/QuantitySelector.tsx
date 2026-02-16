'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Check, X } from 'lucide-react';
import type { ProductView } from '@/lib/types';

interface QuantitySelectorProps {
  product: ProductView;
  initialQty?: number;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

export function QuantitySelector({ product, initialQty = 1, onConfirm, onCancel }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQty);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update quantity if initialQty changes (e.g. from barcode scanner)
  useEffect(() => {
    setQuantity(initialQty);
  }, [initialQty]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onConfirm(quantity);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const increment = () => {
      // Optional: Check stock limits here if needed, though product panel handles disabled state usually
      if (quantity < product.stock) {
          setQuantity(prev => prev + 1);
      }
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      // Allow up to 999 regardless of stock (validation happens on confirm/checkout if strict logic needed)
      // Or if we want to visually warn. For now user accepted "max 999".
      if (!isNaN(val) && val >= 1 && val <= 999) {
          setQuantity(val);
      } else if (e.target.value === '') {
          // Handle empty input gracefully if needed, or just don't update
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div 
        className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--border-primary)] transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[var(--bg-tertiary)] border-b border-[var(--border-secondary)]">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {product.name}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Stock disponible: {product.stock}
          </p>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={decrement}
              disabled={quantity <= 1}
              className="w-16 h-16 rounded-xl flex items-center justify-center bg-[var(--bg-element)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[var(--border-primary)]"
            >
              <Minus className="w-8 h-8" />
            </button>

            <div className="flex flex-col items-center">
              <input
                ref={inputRef}
                type="number"
                value={quantity}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-48 h-20 text-5xl font-bold text-center bg-transparent text-[var(--text-primary)] border-none focus:ring-0 appearance-none placeholder-transparent p-0"
                min="1"
                max="999"
              />
              <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mt-1">
                Cantidad
              </span>
            </div>

            <button
              onClick={increment}
              disabled={quantity >= product.stock}
              className="w-16 h-16 rounded-xl flex items-center justify-center bg-[var(--bg-element)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[var(--border-primary)]"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--bg-tertiary)] border-t border-[var(--border-secondary)] flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(quantity)}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent)/90] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)/20]"
          >
            <Check className="w-5 h-5" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
