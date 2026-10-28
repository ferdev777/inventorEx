// ==========================================================
// Shared types used across frontend and backend
// ==========================================================

export * from './client';

export type Role = 'admin' | 'cashier';

export type SaleType = 'FISCAL' | 'INTERNAL';

export interface CartItem {
  product: ProductView;
  quantity: number;
}

export interface ProductView {
  id: number;
  barcode: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  isActive: boolean;
  alwaysInStock: boolean;
  supplierId?: number;
  supplierName?: string;
  createdAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface SaleItemDto {
  productId: number;
  quantity: number;
}

export interface CreateSaleDto {
  items: SaleItemDto[];
  type: SaleType;
  taxId?: number;
}

export interface SaleResult {
  id: number;
  total: number;
  type: SaleType;
  cae: string | null;
  vtoCae: string | null;
  invoiceNumber: number | null;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  createdAt: string;
}

export interface AfipStatus {
  configured: boolean;
  serverStatus: 'ONLINE' | 'OFFLINE' | 'NOT_CONFIGURED';
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalRevenue: number;
  fiscalSales: number;
  internalSales: number;
}

export interface CreateProductDto {
  barcode: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  minStock?: number;
  alwaysInStock?: boolean;
  supplierId?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  minStock?: number;
  alwaysInStock?: boolean;
  supplierId?: number;
  isActive?: boolean;
}

export interface CreateSupplierDto {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}
