'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  User, 
  MapPin, 
  Mail, 
  Phone,
  FileText
} from 'lucide-react';
import { getAllClients, createClient, updateClient, deleteClient } from '@/lib/api/client';
import type { Client, NewClient } from '@/lib/types';

export function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<NewClient>({
    name: '',
    docType: 'DNI',
    docNumber: '',
    email: '',
    address: '',
    phone: ''
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        docType: client.docType,
        docNumber: client.docNumber,
        email: client.email || '',
        address: client.address || '',
        phone: client.phone || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        docType: 'DNI',
        docNumber: '',
        email: '',
        address: '',
        phone: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
      } else {
        await createClient(formData);
      }
      setIsModalOpen(false);
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar el cliente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
    try {
      await deleteClient(id);
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.docNumber.includes(searchTerm)
  );

  return (
    <div className="bg-white dark:bg-[#1a1c23] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-accent" />
          Gestión de Clientes
        </h2>
        <button onClick={() => handleOpenModal()} className="primary-btn flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field !pl-10 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
        ) : (
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Contacto</th>
                <th>Dirección</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="font-medium">
                    <div className="flex flex-col">
                      <span>{client.name}</span>
                      <span className="text-xs text-gray-400">ID: {client.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <FileText className="w-3 h-3 text-gray-400" />
                       <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-bold">{client.docType}</span>
                       <span className="font-mono text-sm">{client.docNumber}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1 text-sm">
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <Mail className="w-3 h-3" /> {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-sm text-gray-500 max-w-[200px] truncate">
                    {client.address && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> {client.address}
                        </div>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(client)} className="icon-btn text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="icon-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                        No se encontraron clientes
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1f2937] rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
              <h3 className="font-bold text-lg">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo / Razón Social *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="input-field w-full"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Tipo Doc</label>
                    <select
                        value={formData.docType}
                        onChange={e => setFormData({...formData, docType: e.target.value as 'DNI' | 'CUIT' | 'CUIL'})}
                        className="input-field w-full"
                    >
                        <option value="DNI">DNI</option>
                        <option value="CUIT">CUIT</option>
                        <option value="CUIL">CUIL</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Número *</label>
                    <input
                        required
                        type="text"
                        value={formData.docNumber}
                        onChange={e => setFormData({...formData, docNumber: e.target.value})}
                        className="input-field w-full"
                        placeholder="Sin puntos ni guiones"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="input-field w-full"
                        placeholder="cliente@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="input-field w-full"
                        placeholder="+54 11 ..."
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="input-field w-full"
                  placeholder="Calle 123, Ciudad"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="secondary-btn">
                  Cancelar
                </button>
                <button type="submit" className="primary-btn flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
