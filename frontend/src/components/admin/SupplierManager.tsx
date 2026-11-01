import { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  TrendingUp, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  Save 
} from 'lucide-react';
import { 
  getAllSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier, 
  bulkUpdateSupplierPrices 
} from '@/lib/api/client';
import type { Supplier, CreateSupplierDto } from '@/lib/types';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceUpdateSupplier, setPriceUpdateSupplier] = useState<Supplier | null>(null);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'default';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'default',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch {
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(query.toLowerCase()) || 
    s.contactName?.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setConfirmation({
      isOpen: true,
      title: 'Eliminar Proveedor',
      description: '¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteSupplier(id);
          toast.success('Proveedor eliminado correctamente');
          fetchSuppliers();
        } catch {
          toast.error('Error al eliminar el proveedor');
        }
        setConfirmation(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-[var(--accent)]" />
            Gestión de Proveedores
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {filteredSuppliers.length} proveedores registrados
          </p>
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setIsModalOpen(true); }}
          className="btn btn-internal flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por nombre o contacto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field !pl-12 w-full"
        />
      </div>

      {/* Grid or Empty/Loading Container */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]" />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)] glass-panel">
            No se encontraron proveedores.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="glass-panel p-5 flex flex-col justify-between group hover:border-[var(--accent)]/50 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base text-[var(--text-primary)]">{supplier.name}</h3>
                      {supplier.contactName && (
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mt-0.5">
                          <User className="w-3 h-3 text-[var(--accent)]" />
                          <span>{supplier.contactName}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setPriceUpdateSupplier(supplier); setIsPriceModalOpen(true); }}
                        className="p-1.5 rounded-md hover:bg-[var(--accent-bg)] text-[var(--accent)] transition-colors"
                        title="Aumento masivo de precios"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingSupplier(supplier); setIsModalOpen(true); }}
                        className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-secondary)] text-xs text-[var(--text-secondary)]">
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <SupplierFormModal
          supplier={editingSupplier}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchSuppliers(); }}
        />
      )}

      {isPriceModalOpen && priceUpdateSupplier && (
        <PriceUpdateModal
          supplier={priceUpdateSupplier}
          onClose={() => setIsPriceModalOpen(false)}
          onSuccess={() => { setIsPriceModalOpen(false); fetchSuppliers(); }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        description={confirmation.description}
        variant={confirmation.variant}
        onConfirm={confirmation.onConfirm}
        onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// ===== Modals =====

function SupplierFormModal({ supplier, onClose, onSuccess }: { supplier: Supplier | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<CreateSupplierDto>({
    name: supplier?.name || '',
    contactName: supplier?.contactName || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      if (supplier) {
        await updateSupplier(supplier.id, formData);
        toast.success('Proveedor actualizado correctamente');
      } else {
        await createSupplier(formData);
        toast.success('Proveedor creado correctamente');
      }
      onSuccess();
    } catch {
      toast.error('Error al guardar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-tertiary)]/50">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <button onClick={onClose} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nombre del Proveedor *</label>
            <input
              type="text"
              required
              autoFocus
              className="input-field"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Distribuidora del Norte"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nombre de Contacto</label>
            <input
              type="text"
              className="input-field"
              value={formData.contactName}
              onChange={e => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Teléfono</label>
              <input
                type="text"
                className="input-field"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Ej. 11 4433 2211"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@prov.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Dirección</label>
            <input
              type="text"
              className="input-field"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ej. Av. Corrientes 1234"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {supplier ? 'Guardar Cambios' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PriceUpdateModal({ supplier, onClose, onSuccess }: { supplier: Supplier; onClose: () => void; onSuccess: () => void }) {
  const [percentage, setPercentage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(percentage);
    if (isNaN(val) || val === 0) {
      toast.error('Ingrese un porcentaje válido distinto de cero');
      return;
    }

    try {
      setLoading(true);
      await bulkUpdateSupplierPrices(supplier.id, val);
      toast.success(`Precios actualizados en un ${val > 0 ? '+' : ''}${val}%`);
      onSuccess();
    } catch {
      toast.error('Error al actualizar los precios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-tertiary)]/50">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Aumento Masivo de Precios
          </h3>
          <button onClick={onClose} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[var(--text-tertiary)]">
            Se actualizarán los precios de todos los productos asociados a <strong className="text-[var(--text-primary)]">{supplier.name}</strong>.
          </p>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Porcentaje de Variación (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                required
                autoFocus
                className="input-field !pr-8"
                value={percentage}
                onChange={e => setPercentage(e.target.value)}
                placeholder="Ej. 15 (aumento) o -5 (descuento)"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-tertiary)] font-bold">%</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent)]/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
