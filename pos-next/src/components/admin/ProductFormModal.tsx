'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { ProductView, Supplier } from '@/lib/types';
import { createProduct, updateProduct, getAllSuppliers } from '@/lib/api/client';

interface ProductFormModalProps {
  product?: ProductView;
  onClose: (shouldRefresh: boolean) => void;
}

export function ProductFormModal({ product, onClose }: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    minStock: 5,
    alwaysInStock: false,
    supplierId: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    // Load suppliers
    getAllSuppliers().then(setSuppliers).catch(console.error);

    if (product) {
      setFormData({
        barcode: product.barcode,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        stock: product.stock,
        minStock: product.minStock || 5,
        alwaysInStock: product.alwaysInStock || false,
        supplierId: product.supplierId || 0
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const dataToSubmit = {
        ...formData,
        supplierId: formData.supplierId || undefined
      };

      if (product) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { barcode, ...updateData } = dataToSubmit;
        await updateProduct(product.id, updateData);
      } else {
        await createProduct(dataToSubmit);
      }
      onClose(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar el producto';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{ backgroundColor: 'var(--modal-overlay)' }}
    >
      <div className="glass-panel-solid w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Código de Barras</label>
            <input
              type="text"
              required
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              className="input-field w-full"
              disabled={!!product}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
            />
          </div>
          
           <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Proveedor</label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
              className="input-field w-full"
            >
              <option value={0}>-- Seleccionar Proveedor --</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Precio</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="input-field w-full !pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center pt-6">
               <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={formData.alwaysInStock}
                  onChange={(e) => setFormData({...formData, alwaysInStock: e.target.checked})}
                  className="w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Siempre con Stock</span>
              </label>
            </div>
          </div>
          
          {!formData.alwaysInStock && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Stock Actual</label>
                <input
                  type="number"
                  required={!formData.alwaysInStock}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Stock Mínimo</label>
                <input
                  type="number"
                  required={!formData.alwaysInStock}
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  className="input-field w-full"
                />
              </div>
            </div>
          )}

          <div>
           <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Descripción (Opcional)</label>
           <textarea
             value={formData.description}
             onChange={(e) => setFormData({...formData, description: e.target.value})}
             className="input-field w-full h-20 resize-none"
           />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="btn flex-1 py-2.5"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-tertiary)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-fiscal flex-1 py-2.5 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
