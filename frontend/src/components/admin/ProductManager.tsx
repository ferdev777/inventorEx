import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Package, Loader2 } from 'lucide-react';
import { getAllProducts, deleteProduct } from '@/lib/api/client';
import type { ProductView } from '@/lib/types';
import { ProductFormModal } from './ProductFormModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { toast } from 'sonner';

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
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductView | undefined>();
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; product?: ProductView }>({
    isOpen: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
    } catch (err) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.barcode.includes(query);
    
    if (!matchesQuery) return false;
    if (filter === 'low') return p.stock <= p.minStock && p.stock > 0;
    if (filter === 'out') return p.stock <= 0;
    return true;
  });

  const handleCreate = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (product: ProductView) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: ProductView) => {
    setConfirmation({ isOpen: true, product });
  };

  const handleConfirmDelete = async () => {
    if (!confirmation.product) return;
    try {
      await deleteProduct(confirmation.product.id);
      toast.success('Producto eliminado con éxito');
      loadProducts();
    } catch (err) {
      toast.error('Error al eliminar el producto');
    } finally {
      setConfirmation({ isOpen: false });
    }
  };

  const handleCloseModal = (shouldRefresh: boolean) => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
    if (shouldRefresh) loadProducts();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-[var(--accent)]" />
            Gestión de Productos
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {filteredProducts.length} productos {filter !== 'all' ? 'filtrados' : 'registrados'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-internal flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {/* Filters and Search Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 w-fit">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f 
                  ? 'bg-[var(--accent)] text-white shadow-sm' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'low' ? 'Bajo Stock' : 'Sin Stock'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field !pl-12 w-full"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto glass-panel">
        <table className="admin-table w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="!text-center !py-12" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
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
              filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock <= product.minStock;

                return (
                  <tr key={product.id} className="group">
                    <td>
                      <span className="font-mono text-xs opacity-60">{product.barcode}</span>
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        {product.supplierName && (
                          <span className="text-[10px] uppercase tracking-wider opacity-40">
                            Prov: {product.supplierName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-tabular font-bold text-[var(--accent)]">
                        {formatCurrency(Number(product.price))}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            isOutOfStock
                              ? 'bg-red-500/10 text-red-500 border-red-500/20'
                              : isLowStock
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          }`}
                        >
                          {product.stock} un.
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-md hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title="Eliminar Producto"
        description={`¿Estás seguro de que quieres eliminar "${confirmation.product?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmation({ isOpen: false })}
        variant="danger"
      />
    </div>
  );
}
