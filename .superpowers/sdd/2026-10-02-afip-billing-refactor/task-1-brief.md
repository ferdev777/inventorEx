### Task 1: Update Shared Types and Database Schema

**Files:**
- Modify: `pos-next/src/lib/types/index.ts`
- Modify: `pos-next/src/lib/supabase/database.types.ts`
- Create: `pos-next/supabase/migrations/20261002_afip_sales_columns.sql`

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
