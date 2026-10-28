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

  // Focus AND select the number on mount so the user can type directly or press Enter
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    el.select();
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
    if (!isNaN(val) && val >= 1 && val <= 999) {
      setQuantity(val);
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
          {/* Wrap row + label in a column so the label doesn't affect vertical alignment */}
          <div className="flex flex-col items-center gap-2">
            {/* Quantity Row — pure items-center with equal-height elements */}
            <div className="flex items-center gap-4">
              {/* Decrement */}
              <button
                onClick={decrement}
                disabled={quantity <= 1}
                className="w-16 h-16 rounded-xl flex items-center justify-center bg-[var(--bg-element)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-[var(--border-primary)]"
              >
                <Minus className="w-7 h-7" />
              </button>

              {/* Input — same height as buttons, wider for readability */}
              <div className="h-16 w-36 flex items-center justify-center rounded-xl border-2 border-[var(--input-focus-border)] bg-[var(--bg-elevated)] shadow-[0_0_0_3px_var(--input-focus-ring)]">
                <input
                  ref={inputRef}
                  type="number"
                  value={quantity}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => e.target.select()}
                  className="w-full h-full text-5xl font-bold text-center bg-transparent text-[var(--text-primary)] border-none focus:outline-none appearance-none p-0 font-tabular"
                  min="1"
                  max="999"
                />
              </div>

              {/* Increment */}
              <button
                onClick={increment}
                disabled={quantity >= product.stock}
                className="w-16 h-16 rounded-xl flex items-center justify-center bg-[var(--bg-element)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-[var(--border-primary)]"
              >
                <Plus className="w-7 h-7" />
              </button>
            </div>

            {/* Label below the entire row — doesn't affect flex alignment */}
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
              Cantidad
            </span>
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
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Check className="w-5 h-5" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
