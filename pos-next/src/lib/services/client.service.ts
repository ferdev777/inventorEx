import { createServerClient } from '@/lib/supabase/client';
import { CreateClientInput, UpdateClientInput } from '@/lib/dto/schemas';
import type { Client } from '@/lib/types';

export async function getAllClients(): Promise<Client[]> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(mapClient);
}

export async function searchClients(query: string): Promise<Client[]> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`name.ilike.%${query}%,doc_number.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(mapClient);
}

export async function createClient(data: CreateClientInput): Promise<Client> {
  const supabase = createServerClient();
  
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert([{
      name: data.name,
      doc_type: data.docType,
      doc_number: data.docNumber,
      email: data.email || null,
      address: data.address || null,
      phone: data.phone || null
    }])
    .select()
    .single();

  if (error) throw error;
  return mapClient(newClient);
}

export async function updateClient(id: string, data: UpdateClientInput): Promise<Client> {
  const supabase = createServerClient();

  // Filter undefined fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.docType !== undefined) updates.doc_type = data.docType;
  if (data.docNumber !== undefined) updates.doc_number = data.docNumber;
  if (data.email !== undefined) updates.email = data.email || null;
  if (data.address !== undefined) updates.address = data.address || null;
  if (data.phone !== undefined) updates.phone = data.phone || null;
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapClient(updated);
}

export async function deleteClient(id: string): Promise<void> {
  const supabase = createServerClient();
  
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClient(data: any): Client {
  return {
    id: data.id,
    name: data.name,
    docType: data.doc_type,
    docNumber: data.doc_number,
    email: data.email,
    address: data.address,
    phone: data.phone,
    createdAt: data.created_at
  };
}
