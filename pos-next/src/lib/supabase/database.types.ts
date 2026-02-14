// ==========================================================
// Supabase Database Types (manual definition)
// In production, generate with: npx supabase gen types typescript
// ==========================================================

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          barcode: string;
          name: string;
          description: string;
          price: number;
          stock: number;
          min_stock: number;
          always_in_stock: boolean;
          supplier_id: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      sales: {
        Row: {
          id: number;
          total: number;
          type: 'FISCAL' | 'INTERNAL';
          cae: string | null;
          vto_cae: string | null;
          invoice_number: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      sale_items: {
        Row: {
          id: number;
          sale_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: Omit<Database['public']['Tables']['sale_items']['Row'], 'id'> & {
          id?: number;
        };
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>;
      };
      afip_tokens: {
        Row: {
          id: number;
          token: string;
          sign: string;
          expiration: string;
          service: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['afip_tokens']['Row'], 'id' | 'created_at'> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['afip_tokens']['Insert']>;
      };
      suppliers: {
        Row: {
          id: number;
          name: string;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>;
      };
    };
  };
}

// Convenience aliases
export type Product = Database['public']['Tables']['products']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
