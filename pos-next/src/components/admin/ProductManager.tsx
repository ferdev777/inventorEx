'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, Infinity as InfinityIcon } from 'lucide-react';
import type { ProductView } from '@/lib/types';
import { getAllProducts, deleteProduct, searchProducts } from '@/lib/api/client';
import { ProductFormModal } from './ProductFormModal';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ProductManager() {
  const [products, setProducts] = useState<ProductView[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductView | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = query ? await searchProducts(query) : await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'low') return p.stock > 0 && p.stock <= p.minStock;
    if (filter === 'out') return p.stock <= 0;
    return true;
  });

  useEffect(() => {
    const timeout = setTimeout(loadProducts, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch {
      alert('Error al eliminar producto');
    }
  };

  const handleEdit = (product: ProductView) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh: boolean) => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
    if (shouldRefresh) loadProducts();
  };

  return (
    <div className="flex flex-col h-full p-6" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold">Gestión de Productos</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {filteredProducts.length} productos {filter !== 'all' ? 'filtrados' : 'registrados'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-internal"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'low', 'out'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-accent text-white shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={filter === f ? { backgroundColor: 'var(--accent)' } : { color: 'var(--text-secondary)' }}
          >
            {f === 'all' && 'Todos'}
            {f === 'low' && 'Bajo Stock'}
            {f === 'out' && 'Sin Stock'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field !pl-12 w-full"
        />
      </div>

      {/* Table Container */}
      <div
        className="flex-1 overflow-auto glass-panel"
      >
        <table className="admin-table">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th style={{ textAlign: 'center' }}>Stock</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="!text-center !py-12" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
                    <span>Cargando productos...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="!text-center !py-12" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.barcode}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{product.name}</td>
                  <td>
                    <span className="font-tabular font-semibold" style={{ color: 'var(--accent)' }}>
                      {formatCurrency(Number(product.price))}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        background: product.alwaysInStock
                          ? 'rgba(59, 130, 246, 0.1)'
                          : product.stock <= product.minStock
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(16, 185, 129, 0.1)',
                        color: product.alwaysInStock
                          ? 'var(--fiscal)'
                          : product.stock <= product.minStock
                          ? 'var(--warning)'
                          : 'var(--success)',
                      }}
                    >
                      {product.alwaysInStock ? <InfinityIcon className="w-3.5 h-3.5" /> : product.stock}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEdit(product)}
                        className="qty-btn"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="qty-btn"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-primary)'; }}
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
