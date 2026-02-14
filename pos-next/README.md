# POS & Inventario — Next.js + Supabase

Sistema de Punto de Venta e Inventario migrado a Next.js con backend serverless en Supabase y despliegue en Vercel.

## 🏗️ Arquitectura

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── page.tsx                  # POS page (main client component)
│   ├── globals.css               # Tailwind v4 + custom styles
│   └── api/                      # API Route Handlers (≈ NestJS Controllers)
│       ├── products/
│       │   ├── route.ts          # GET (list) / POST (create)
│       │   ├── search/route.ts   # GET ?q=...
│       │   ├── low-stock/route.ts
│       │   └── [id]/route.ts     # GET / PUT / DELETE
│       ├── sales/
│       │   ├── route.ts          # POST (create sale)
│       │   ├── recent/route.ts   # GET ?limit=
│       │   └── summary/route.ts  # GET daily summary
│       └── afip/
│           └── status/route.ts   # GET AFIP config status
├── lib/                          # Backend logic (≈ NestJS Services layer)
│   ├── supabase/
│   │   ├── client.ts             # Server/Browser Supabase clients
│   │   └── database.types.ts     # DB types (generate with Supabase CLI)
│   ├── services/
│   │   ├── products.service.ts   # Product CRUD + search
│   │   └── sales.service.ts      # Sale creation + stock management
│   ├── dto/
│   │   └── schemas.ts            # Zod validation (≈ NestJS DTOs)
│   ├── api/
│   │   ├── client.ts             # Frontend API client (fetch wrapper)
│   │   └── helpers.ts            # Error handling middleware
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── components/                   # React client components
│   ├── StatusBar.tsx
│   ├── ProductPanel.tsx
│   ├── CartPanel.tsx
│   ├── ResultModal.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── ProductManager.tsx
│       ├── ProductFormModal.tsx
│       └── SalesHistory.tsx
└── supabase/
    └── schema.sql                # Database schema (run in Supabase SQL Editor)
```

## 🚀 Setup

### 1. Supabase

1. Crear un proyecto en [supabase.com](https://supabase.com)
2. Ir al **SQL Editor** y ejecutar `supabase/schema.sql`
3. Copiar las credenciales desde **Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Variables de Entorno

Copiar `.env.example` a `.env.local` y completar con las credenciales de Supabase:

```bash
cp .env.example .env.local
```

### 3. Desarrollo Local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### 4. Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Configurar las **Environment Variables** con las mismas de `.env.local`
3. Deploy automático en cada push

## 🛠️ Stack Tecnológico

| Capa              | Tecnología                           |
| ----------------- | ------------------------------------ |
| **Frontend**      | Next.js 16, React 19, TailwindCSS v4 |
| **API**           | Next.js Route Handlers (serverless)  |
| **Validación**    | Zod (runtime + compile-time)         |
| **Base de datos** | PostgreSQL (Supabase)                |
| **Auth**          | Supabase Auth (preparado)            |
| **Hosting**       | Vercel                               |
| **Icons**         | Lucide React                         |

## 📋 Migración desde NestJS

| Antes (NestJS)          | Ahora (Next.js)                  |
| ----------------------- | -------------------------------- |
| `@Controller`           | `app/api/.../route.ts`           |
| `@Injectable` Service   | `lib/services/*.service.ts`      |
| `class-validator` DTOs  | `lib/dto/schemas.ts` (Zod)       |
| Prisma + SQLite         | Supabase SDK + PostgreSQL        |
| `ServeStaticModule`     | Next.js SSR + `public/`          |
| `start.bat` / installer | `npm run dev` / Vercel           |
| CORS configuration      | Same-origin (Next.js handles it) |

## 🔐 AFIP Integration

La integración con AFIP está preparada pero pendiente de configuración.
Para activarla, configurar las variables de entorno `AFIP_*` en Vercel.
