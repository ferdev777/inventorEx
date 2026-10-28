// ==========================================================
// Frontend API Client
// Lightweight HTTP client for calling Next.js API routes.
// No external dependencies needed.
// ==========================================================
import type {
  ProductView,
  CreateSaleDto,
  SaleResult,
  AfipStatus,
  DailySummary,
  CreateProductDto,
  UpdateProductDto,
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@/lib/types';

const BASE_URL = '/api';

/**
 * Lightweight API client. Handles JSON serialization and error extraction.
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorBody.message || `Error ${response.status}`);
  }

  return response.json();
}

// ===== Products API =====

export async function searchProducts(query: string): Promise<ProductView[]> {
  return request<ProductView[]>(`/products/search?q=${encodeURIComponent(query)}`);
}

export async function getAllProducts(): Promise<ProductView[]> {
  return request<ProductView[]>('/products');
}

export async function createProduct(data: CreateProductDto): Promise<ProductView> {
  return request<ProductView>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: number, data: UpdateProductDto): Promise<ProductView> {
  return request<ProductView>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getLowStockProducts(): Promise<ProductView[]> {
  return request<ProductView[]>('/products/low-stock');
}

export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/products/${id}`, {
    method: 'DELETE',
  });
}

// ===== Sales API =====

export async function createSale(data: CreateSaleDto): Promise<SaleResult> {
  return request<SaleResult>('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getRecentSales(limit: number = 20): Promise<SaleResult[]> {
  return request<SaleResult[]>(`/sales/recent?limit=${limit}`);
}

export async function getSalesSummary(period: 'day' | 'week' | 'month' | 'year' = 'day'): Promise<DailySummary> {
  return request<DailySummary>(`/sales/summary?period=${period}`);
}


// ===== AFIP API =====

export async function getAfipStatus(): Promise<AfipStatus> {
  return request<AfipStatus>('/afip/status');
}

// ===== Clients API =====

import type { Client, NewClient } from '@/lib/types';

export async function getAllClients(): Promise<Client[]> {
  return request<Client[]>('/clients');
}

export async function searchClients(query: string): Promise<Client[]> {
  return request<Client[]>(`/clients?q=${encodeURIComponent(query)}`);
}

export async function createClient(data: NewClient): Promise<Client> {
  return request<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: string, data: Partial<NewClient>): Promise<Client> {
  return request<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}


export async function deleteClient(id: string): Promise<void> {
  return request<void>(`/clients/${id}`, {
    method: 'DELETE',
  });
}

// ===== Suppliers API =====

export async function getAllSuppliers(): Promise<Supplier[]> {
  return request<Supplier[]>('/suppliers');
}

export async function createSupplier(data: CreateSupplierDto): Promise<Supplier> {
  return request<Supplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSupplier(id: number, data: UpdateSupplierDto): Promise<Supplier> {
  return request<Supplier>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSupplier(id: number): Promise<void> {
  return request<void>(`/suppliers/${id}`, {
    method: 'DELETE',
  });
}

export async function bulkUpdateSupplierPrices(id: number, percentage: number): Promise<void> {
  return request<void>(`/suppliers/${id}/update-prices`, {
    method: 'POST',
    body: JSON.stringify({ percentage }),
  });
}
