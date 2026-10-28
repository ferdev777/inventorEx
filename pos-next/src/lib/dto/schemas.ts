// ==========================================================
// Validation Schemas - Zod 3 (replaces class-validator DTOs)
// NestJS-like rigidity with compile-time + runtime validation
// ==========================================================
import { z } from 'zod';

// --- Product Schemas ---

export const CreateProductSchema = z.object({
  barcode: z.string().min(1, 'El código de barras es obligatorio'),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  minStock: z.number().int().min(0).optional().default(5),
  alwaysInStock: z.boolean().optional().default(false),
  supplierId: z.number().int().positive().optional(),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  alwaysInStock: z.boolean().optional(),
  supplierId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// --- Sale Schemas ---

export const SaleItemSchema = z.object({
  productId: z.number().int().positive('El ID de producto es inválido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
});

export const CreateSaleSchema = z.object({
  items: z.array(SaleItemSchema).min(1, 'La venta debe tener al menos un producto'),
  type: z.enum(['FISCAL', 'INTERNAL'], {
    errorMap: () => ({ message: 'Tipo de venta inválido. Use FISCAL o INTERNAL' }),
  }),
  taxId: z.number().optional().default(0),
  clientId: z.string().optional(),
});

// Type inference from schemas
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;

// --- Client Schemas ---

export const CreateClientSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  docType: z.enum(['DNI', 'CUIT', 'CUIL']),
  docNumber: z.string().min(1, 'El número de documento es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.string().optional(),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;


// --- Supplier Schemas ---

export const CreateSupplierSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  contactName: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();
export const BulkUpdatePriceSchema = z.object({
  percentage: z.number().min(-100).max(1000, 'Porcentaje inválido'),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;
