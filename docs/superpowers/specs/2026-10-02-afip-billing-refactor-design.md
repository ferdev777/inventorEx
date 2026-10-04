# AFIP Billing Refactor Design

## Objective
Make the AFIP billing integration resilient and traceable, supporting Factura A, B, and C based on the company's tax condition and the client's information.

## Current State
The current implementation only emits Factura C (code 11) for all fiscal sales. It lacks transactionality (if the DB update fails, the CAE is lost), and there's no tracking of fiscal status or voucher type in the `sales` table. It does not dynamically adjust to the company's tax condition (Monotributista vs Responsable Inscripto).

## Proposed Architecture

### 1. Data Model Changes (`sales` table)
Add the following columns to the `sales` table to track fiscal status and details:
- `fiscal_status` (TEXT): 'PENDING', 'COMPLETED', 'ERROR'. (Null for INTERNAL sales).
- `cbte_tipo` (INTEGER): AFIP voucher type code (1=A, 6=B, 11=C).
- `pto_vta` (INTEGER): Point of sale used for the transaction.
- `doc_tipo` (INTEGER): Client document type (80=CUIT, 96=DNI, 99=Consumidor Final).
- `doc_nro` (TEXT): Client document number.
- `afip_error` (TEXT): Error message from AFIP if `fiscal_status` is 'ERROR'.

Update `Database` interfaces in `pos-next/src/lib/supabase/database.types.ts` and `SaleResult` in `pos-next/src/lib/types/index.ts` to include these fields.

### 2. Invoice Type Resolution (`pos-next/src/lib/afip/invoice-resolver.ts`)
A new module to determine the correct invoice type based on:
- **Issuer Tax Condition**: Configured via `AFIP_TAX_CONDITION` env var ('RI' or 'MONO').
- **Client Data**: Document type and number from the DB (or anonymous/Consumidor Final if no client ID is provided).

Logic:
- If Issuer is 'MONO': Always Factura C (11).
- If Issuer is 'RI' and Client has a CUIT (doc_type 'CUIT'): Factura A (1).
- If Issuer is 'RI' and Client is Final Consumer or Monotributista (doc_type 'DNI' or 'CUIL' or anonymous): Factura B (6).

### 3. Voucher Payload Builder (`pos-next/src/lib/afip/voucher-builder.ts`)
Encapsulate the payload generation for `createVoucher`:
- **Factura A**: Discriminate VAT (21% by default). `ImpNeto` = Total / 1.21, `ImpIVA` = Total - `ImpNeto`. Add the `Iva` array with `Id: 5` (21%).
- **Factura B and C**: `ImpNeto` = Total, `ImpTotConc` = 0, `ImpOpEx` = 0, `ImpTrib` = 0, `ImpIVA` = 0. No `Iva` array.
- Set `DocTipo` and `DocNro` based on the client. For anonymous clients under AFIP limits, use `99` (Consumidor Final) and `0`.

### 4. AFIP Module Restructuring
Move the AFIP logic into a structured directory `pos-next/src/lib/afip/`:
- `index.ts`: Re-export all members.
- `client.ts`: The existing singleton logic from `pos-next/src/lib/afip.ts`.
- `invoice-resolver.ts`: Logic described in Section 2.
- `voucher-builder.ts`: Logic described in Section 3.

### 5. Transactional Flow in `sales.service.ts`
Refactor the error handling in `createSale` when interacting with AFIP:
1. Insert the sale with `fiscal_status = 'PENDING'`, plus `cbte_tipo`, `pto_vta`, `doc_tipo`, `doc_nro`.
2. Call AFIP to get the CAE via the new builder.
3. If AFIP is successful: Update the sale with CAE data and `fiscal_status = 'COMPLETED'`. If this specific DB update fails, log the CAE loudly for manual recovery, but do not throw an error that discards the sale.
4. If AFIP fails: Update the sale with `fiscal_status = 'ERROR'` and `afip_error`. The sale remains in the DB, stock is discounted, and it is marked for manual review or future retry.

## Global Constraints
- Do not modify frontend UI components (e.g., CartPanel or ResultModal) in this phase.
- Use `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side DB operations.

## Review Focus
- Database update failure after CAE retrieval: The sale must not be lost; the CAE is logged.
- Anonymous client purchases: The system must default to Factura B or C with Consumidor Final (99/0) depending on the tax condition.
- Tax condition configuration missing: The system should default to 'MONO' or throw a clear initialization error.
- AFIP connection timeout: The sale must be stored with `fiscal_status = 'ERROR'` and stock discounted.
