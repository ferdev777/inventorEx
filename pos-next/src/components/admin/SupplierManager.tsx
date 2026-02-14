'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, TrendingUp, Loader2 } from 'lucide-react';
import { 
  getAllSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier, 
  bulkUpdateSupplierPrices 
} from '@/lib/api/client';
import type { Supplier, CreateSupplierDto } from '@/lib/types';

export function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceUpdateSupplier, setPriceUpdateSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.contactName?.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await deleteSupplier(id);
      fetchSuppliers();
    } catch {
      alert('Error eliminando proveedor');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:brightness-110 transition-all font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-tertiary)]">
            No se encontraron proveedores.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="p-4 rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-secondary)] hover:border-[var(--accent)]/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{supplier.name}</h3>
                    {supplier.contactName && (
                      <p className="text-sm text-[var(--text-muted)]">{supplier.contactName}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                      onClick={() => { setPriceUpdateSupplier(supplier); setIsPriceModalOpen(true); }}
                      className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded"
                      title="Actualizar Precios"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}
                      className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm text-[var(--text-muted)]">
                  {supplier.email && <div className="truncate">{supplier.email}</div>}
                  {supplier.phone && <div>{supplier.phone}</div>}
                  {supplier.address && <div className="truncate">{supplier.address}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={(refresh) => {
            setIsModalOpen(false);
            if (refresh) fetchSuppliers();
          }}
        />
      )}

      {isPriceModalOpen && priceUpdateSupplier && (
        <PriceUpdateModal
          supplier={priceUpdateSupplier}
          onClose={() => setIsPriceModalOpen(false)}
        />
      )}
    </div>
  );
}

function SupplierFormModal({ supplier, onClose }: { supplier: Supplier | null, onClose: (r: boolean) => void }) {
  const [formData, setFormData] = useState<CreateSupplierDto>({
    name: '', contactName: '', email: '', phone: '', address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contactName: supplier.contactName || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || ''
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (supplier) {
        await updateSupplier(supplier.id, formData);
      } else {
        await createSupplier(formData);
      }
      onClose(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-xl shadow-2xl overflow-hidden border border-[var(--border-primary)]">
        <div className="px-6 py-4 border-b border-[var(--border-secondary)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Nombre *</label>
            <input
              required
              className="input-field w-full"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Contacto</label>
              <input
                className="input-field w-full"
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Teléfono</label>
              <input
                className="input-field w-full"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Email</label>
            <input
              type="email"
              className="input-field w-full"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">Dirección</label>
            <input
              className="input-field w-full"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[var(--accent)] text-white hover:brightness-110 flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PriceUpdateModal({ supplier, onClose }: { supplier: Supplier, onClose: () => void }) {
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(percentage);
    if (isNaN(pct)) return;

    if (!confirm(`¿Estás seguro de aumentar los precios de ${supplier.name} en un ${pct}%?`)) return;

    setLoading(true);
    try {
      await bulkUpdateSupplierPrices(supplier.id, pct);
      alert('Precios actualizados correctamente');
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-xl shadow-2xl border border-[var(--border-primary)] p-6">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Actualizar Precios - {supplier.name}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Ingresa el porcentaje de aumento. Por ejemplo, 10 para aumentar un 10%.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="number"
              required
              step="0.01"
              autoFocus
              className="input-field w-full !pr-10"
              value={percentage}
              onChange={e => setPercentage(e.target.value)}
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">%</span>
          </div>
          
          <div className="flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[var(--accent)] text-white"
            >
              {loading ? 'Actualizando...' : 'Aplicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
