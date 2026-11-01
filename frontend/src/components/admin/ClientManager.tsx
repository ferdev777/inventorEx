import { useState, useEffect } from 'react';
import { 
  User, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Loader2, 
  FileText, 
  Mail, 
  Phone, 
  MapPin,
  X,
  Save
} from 'lucide-react';
import { getAllClients, createClient, updateClient, deleteClient } from '@/lib/api/client';
import type { Client, NewClient } from '@/lib/types';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

export function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [confirmation, setConfirmation] = useState<{ isOpen: boolean; title: string; description: string; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients();
      setClients(data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (client: Client) => {
    setConfirmation({
      isOpen: true,
      title: 'Eliminar Cliente',
      description: `¿Estás seguro de que quieres eliminar a ${client.name}? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await deleteClient(client.id);
          toast.success('Cliente eliminado');
          fetchClients();
        } catch (error) {
          toast.error('Error al eliminar cliente');
        }
        setConfirmation(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.docNumber.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--accent)]" />
            Gestión de Clientes
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {filteredClients.length} clientes registrados
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn btn-internal flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, documento o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field !pl-12 w-full"
        />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto glass-panel">
        <table className="admin-table w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Contacto</th>
              <th>Dirección</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="!text-center !py-12" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
                    <span>Cargando clientes...</span>
                  </div>
                </td>
              </tr>
            ) : filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="!text-center !py-12" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="group">
                  <td className="font-medium">
                    <div className="flex flex-col">
                      <span>{client.name}</span>
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-tighter">ID: {client.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <span className="bg-[var(--accent-bg)] text-[var(--accent)] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[var(--accent)]/10">
                         {client.docType}
                       </span>
                       <span className="font-tabular text-sm opacity-80">{client.docNumber}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1 text-xs">
                      {client.email && (
                        <div className="flex items-center gap-1.5 opacity-80">
                          <Mail className="w-3 h-3 text-[var(--accent)]" /> {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5 opacity-80">
                          <Phone className="w-3 h-3 text-[var(--accent)]" /> {client.phone}
                        </div>
                      )}
                      {!client.email && !client.phone && <span className="opacity-40 italic">Sin datos</span>}
                    </div>
                  </td>
                  <td className="text-xs opacity-70 max-w-[200px] truncate">
                    {client.address ? (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 shrink-0" /> {client.address}
                        </div>
                    ) : <span className="opacity-40 italic">N/A</span>}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(client)}
                        className="p-1.5 rounded-md hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash className="w-4 h-4" />
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
        <ClientFormModal 
          client={editingClient} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchClients();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        description={confirmation.description}
        onConfirm={confirmation.onConfirm}
        onCancel={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        variant="danger"
      />
    </div>
  );
}

interface ModalProps {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ClientFormModal({ client, onClose, onSuccess }: ModalProps) {
  const [formData, setFormData] = useState<NewClient>({
    name: client?.name || '',
    docType: client?.docType || 'DNI',
    docNumber: client?.docNumber || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.docNumber) {
      toast.error('Nombre y documento son requeridos');
      return;
    }

    try {
      setLoading(true);
      if (client) {
        await updateClient(client.id, formData);
        toast.success('Cliente actualizado');
      } else {
        await createClient(formData);
        toast.success('Cliente creado');
      }
      onSuccess();
    } catch (error) {
      toast.error('Error al guardar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-secondary)] flex justify-between items-center bg-[var(--bg-tertiary)]/50">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button onClick={onClose} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nombre Completo</label>
            <input
              autoFocus
              className="input-field"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Tipo</label>
              <select
                className="input-field"
                value={formData.docType}
                onChange={e => setFormData({...formData, docType: e.target.value as any})}
              >
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Número</label>
              <input
                className="input-field"
                value={formData.docNumber}
                onChange={e => setFormData({...formData, docNumber: e.target.value})}
                placeholder="Sin puntos ni guiones"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Teléfono</label>
              <input
                className="input-field"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="Ej: 11 1234 5678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Dirección</label>
            <input
              className="input-field"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Calle, Número, Ciudad"
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
              {client ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
