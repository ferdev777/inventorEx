# AFIP Billing Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the AFIP billing integration to support Factura A, B, and C dynamically, and ensure transactional consistency with the database.

**Architecture:** Create a dedicated AFIP module with specific responsibilities for determining the invoice type and building the payload. Expand the database schema to track fiscal status and voucher details, allowing for safe error handling without data loss.

**Tech Stack:** TypeScript, Next.js, Supabase, @afipsdk/afip.js

**Spec:** docs/superpowers/specs/2026-10-02-afip-billing-refactor-design.md

## Global Constraints
- Do not modify frontend UI components (e.g., CartPanel or ResultModal) in this phase.
- Use `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side DB operations.

## Review Focus
- Database update failure after CAE retrieval: The sale must not be lost; the CAE is logged. (Covered in Task 5)
- Anonymous client purchases: The system must default to Factura B or C with Consumidor Final (99/0) depending on the tax condition. (Covered in Task 2)
- Tax condition configuration missing: The system should default to 'MONO'. (Covered in Task 2)
- AFIP connection timeout: The sale must be stored with `fiscal_status = 'ERROR'` and stock discounted. (Covered in Task 5)

---

### Task 1: Update Shared Types and Database Schema

**Files:**
- Modify: `pos-next/src/lib/types/index.ts`
- Modify: `pos-next/src/lib/supabase/database.types.ts`
- Create: `pos-next/supabase/migrations/20261002_afip_sales_columns.sql` (if using local supabase migrations, or just a generic sql script)

**Interfaces:**
- Produces: Updated `Database` type with new columns.
- Produces: Updated `SaleResult` interface.

- [ ] **Step 1: Write the SQL migration script**
Create `pos-next/supabase/migrations/20261002_afip_sales_columns.sql` to add columns to the `sales` table:
```sql
ALTER TABLE sales ADD COLUMN fiscal_status TEXT CHECK (fiscal_status IN ('PENDING', 'COMPLETED', 'ERROR'));
ALTER TABLE sales ADD COLUMN cbte_tipo INTEGER;
ALTER TABLE sales ADD COLUMN pto_vta INTEGER;
ALTER TABLE sales ADD COLUMN doc_tipo INTEGER;
ALTER TABLE sales ADD COLUMN doc_nro TEXT;
ALTER TABLE sales ADD COLUMN afip_error TEXT;
```

- [ ] **Step 2: Update `database.types.ts`**
Update `Database['public']['Tables']['sales']['Row']` and `Insert` to include:
```typescript
fiscal_status: 'PENDING' | 'COMPLETED' | 'ERROR' | null;
cbte_tipo: number | null;
pto_vta: number | null;
doc_tipo: number | null;
doc_nro: string | null;
afip_error: string | null;
```

- [ ] **Step 3: Update `SaleResult` in `types/index.ts`**
Add the new fields to the `SaleResult` interface:
```typescript
fiscalStatus: 'PENDING' | 'COMPLETED' | 'ERROR' | null;
cbteTipo: number | null;
ptoVta: number | null;
```

---

### Task 2: Implement AFIP Invoice Resolver

**Files:**
- Create: `pos-next/src/lib/afip/invoice-resolver.ts`

**Interfaces:**
- Consumes: `Client` from `pos-next/src/lib/types/client.ts`
- Produces: `resolveInvoiceType(client: Client | null, taxCondition: 'RI' | 'MONO'): { cbteTipo: number, docTipo: number, docNro: string }`

- [ ] **Step 1: Implement `resolveInvoiceType` function**
Write the logic based on the spec:
- If `taxCondition` is 'MONO', return cbteTipo 11 (Factura C). If client is null, use docTipo 99, docNro '0'. If client exists, map their docType (CUIT=80, DNI=96, CUIL=86).
- If `taxCondition` is 'RI':
  - If client has `docType === 'CUIT'`, return cbteTipo 1 (Factura A), docTipo 80.
  - If client has DNI/CUIL or is null, return cbteTipo 6 (Factura B).

---

### Task 3: Implement AFIP Voucher Builder

**Files:**
- Create: `pos-next/src/lib/afip/voucher-builder.ts`

**Interfaces:**
- Consumes: `resolveInvoiceType` outputs.
- Produces: `buildVoucherPayload(params: VoucherParams): any`

- [ ] **Step 1: Implement `buildVoucherPayload` function**
```typescript
export interface VoucherParams {
  pos: number;
  cbteTipo: number;
  docTipo: number;
  docNro: string;
  nextVoucher: number;
  total: number;
}
```
If `cbteTipo === 1` (Factura A): Discriminate VAT. `ImpNeto` = total / 1.21. Add `Iva` array.
If `cbteTipo === 6` or `11`: `ImpNeto` = total. No `Iva` array.

---

### Task 4: Refactor AFIP Module Structure

**Files:**
- Move/Rename: `pos-next/src/lib/afip.ts` -> `pos-next/src/lib/afip/client.ts`
- Create: `pos-next/src/lib/afip/index.ts`

**Interfaces:**
- Produces: A unified module export for AFIP logic.

- [ ] **Step 1: Move `getAfip()` to `client.ts`**
Relocate the existing singleton logic. Ensure imports for `Afip` and `path` are correct.

- [ ] **Step 2: Create `index.ts`**
```typescript
export * from './client';
export * from './invoice-resolver';
export * from './voucher-builder';
```

---

### Task 5: Refactor Sales Service Transactional Flow

**Files:**
- Modify: `pos-next/src/lib/services/sales.service.ts`

**Interfaces:**
- Consumes: `resolveInvoiceType`, `buildVoucherPayload`, `getAfip` from `pos-next/src/lib/afip`.

- [ ] **Step 1: Update Insert Sale Logic**
In `createSale`, when inserting the sale, set `fiscal_status: type === 'FISCAL' ? 'PENDING' : null`.

- [ ] **Step 2: Update AFIP Integration Logic**
If `type === 'FISCAL'`:
- Resolve tax condition from `process.env.AFIP_TAX_CONDITION || 'MONO'`.
- Fetch `client` if `clientId` exists.
- Call `resolveInvoiceType`. Update DB `sales` table with `cbte_tipo`, `pto_vta`, `doc_tipo`, `doc_nro`.
- Call `buildVoucherPayload`.
- Wrap `afip.ElectronicBilling.createVoucher` in a try/catch.
  - If success: Update sale with `cae`, `vto_cae`, `invoice_number`, `fiscal_status = 'COMPLETED'`. If update fails, `console.error` the CAE to prevent loss.
  - If catch: Update sale with `fiscal_status = 'ERROR'`, `afip_error = error.message`. Log error. DO NOT rethrow (allow sale to be returned as ERROR so stock deduction is preserved).

- [ ] **Step 3: Update Return Object and Find Methods**
Map the new DB columns (`fiscal_status`, `cbte_tipo`, `pto_vta`) into the `SaleResult` returns in `createSale`, `findSaleById`, and `getRecentSales`.
