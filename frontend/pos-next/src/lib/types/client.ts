export interface Client {
  id: string;
  name: string;
  docType: 'DNI' | 'CUIT' | 'CUIL';
  docNumber: string;
  email?: string;
  address?: string;
  phone?: string;
  createdAt?: string;
}

export type NewClient = Omit<Client, 'id' | 'createdAt'>;
