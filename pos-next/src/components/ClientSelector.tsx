'use client';

import { useState } from 'react';
import { User, Search, X, Check, Plus } from 'lucide-react';
import { searchClients } from '@/lib/api/client';
import type { Client } from '@/lib/types';

interface ClientSelectorProps {
  selectedClient: Client | null;
  onSelect: (client: Client | null) => void;
}

export function ClientSelector({ selectedClient, onSelect }: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchClients(term);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (client: Client) => {
    onSelect(client);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (selectedClient) {
    return (
      <div className="bg-white dark:bg-white/5 border border-green-500/30 rounded-lg p-3 flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white">{selectedClient.name}</p>
            <p className="text-xs text-gray-500 font-mono">{selectedClient.docType}: {selectedClient.docNumber}</p>
          </div>
        </div>
        <button 
          onClick={() => onSelect(null)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full mb-3 flex items-center justify-center gap-2 p-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:border-accent hover:text-accent transition-all bg-gray-50/50 dark:bg-white/5"
      >
        <Plus className="w-4 h-4" />
        Asignar Cliente al Ticket
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1f2937] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                autoFocus
                type="text"
                placeholder="Buscar cliente (Nombre o DNI)..."
                className="flex-1 bg-transparent border-none outline-none text-base"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {loading && <div className="p-4 text-center text-gray-400">Buscando...</div>}
              
              {!loading && results.length === 0 && searchTerm.length >= 2 && (
                <div className="p-4 text-center text-gray-400">No se encontraron clientes</div>
              )}

              {results.map(client => (
                <button
                  key={client.id}
                  onClick={() => handleSelect(client)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.docType} {client.docNumber}</p>
                  </div>
                  <Check className="w-4 h-4 text-transparent" /> 
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
