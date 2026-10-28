## PLAN MAESTRO: ARQUITECTURA UNIFICADA & MULTI-TENANCY

Proyecto: ferdev777/inventorex (Rama: v2-go-unified) • Stack: Go + React/Vite + Cloudflare + Supabase/SQLite

ESPECIFICACIÓN V2.0

## 1. Decisiones Estratégicas y de Arquitectura Dual

El sistema unifica los repositorios inventorEx (SaaS) e inventorExLocal (Desktop) en una única base de código compilada en Go junto a una SPA en React + Vite, operando bajo dos modos mediante la variable APP_MODE:

- Modelo Multi-Tenant (1 Usuario = 1 Organización): Esquema compartido con columna org_id en todas las tablas operativas. En APP_MODE=cloud opera sobre PostgreSQL (Supabase) con doble barrera de seguridad (Middleware en Go + RLS). En APP_MODE=local opera sobre SQLite (driver puro Go modernc.org/sqlite sin CGO) inyectando automáticamente una organización local por defecto.

- Seguridad Criptográfica ARCA: Certificados .crt y claves privadas .key cifrados server-side con AES-256- GCM nativo en Go (crypto/aes y crypto/cipher) usando la variable ARCA_ENCRYPTION_KEY, evitando reutilización de IVs mediante payload unificado y auth_tag.

- Motor Fiscal SOAP Nativo en Go: Eliminación de dependencias externas de Node (afipsdk). Firma criptográfica CMS/PKCS#7 del TRA en memoria y comunicación directa con WSAA y WSFEv1 (Facturas A, B y C según condición RI o MONO). El CUIT 23399135109 queda restringido exclusivamente al entorno de pruebas / mock mode.

- Roles Estrictos: owner (acceso total a dashboard administrativo, inventario, proveedores, reportes, equipo y wizard ARCA) y cashier (acceso restringido exclusivamente a la terminal POS y creación de ventas).

## Core Architecture

## 2. Presupuesto Operativo e Infraestructura Cloud (\$5 USD/mes) FinOps & Cloud

| Componente Servicio Seleccionado Costo Regla Técnica de Optimización y Blindaje Mensual |
| --- |
| Frontend Web & Cloudflare Pages $0.00 USD Hosting Edge de la SPA (Landing pública, Panel Admin y POS POS) con ancho de banda ilimitado. |
| Backend API (Go) Cloudflare Workers Paid + $5.00 USD Incluye 25 GiB-h RAM y 375 vCPU-min. Instancia Lite (256 |
| Containers (Lite) MiB) con scale-to-zero e Hyperdrive para pooling SQL. Base de Datos Supabase Free Tier $0.00 USD Conexión vía Transaction Pooler (puerto 6543). Cron diario SaaS (PostgreSQL) en Worker (SELECT 1) para evitar pausa de 7 días. Backups & Cloudflare R2 (10 GB $0.00 USD Job nocturno de backup SQL comprimido hacia R2 y |
| Binarios Free) distribución del ejecutable inventorex.exe local. |
| Emails Cloudflare Email Routing ~$0.00 Despacho de invitaciones de cajeros Transaccionales / Workers USD (/invite/{token}) y alertas de stock bajo hacia el email del owner. |

## 3. Estrategia de Cobros y Suscripciones en Argentina

## B2B & POS Payments

## Esquema de Comisiones Mínimas (Alternativas Superadoras a Mercado Pago)

- Cobro de Suscripciones del SaaS (Recurrente B2B): Implementación prioritaria de Débito Directo en CBU / DEBIN Recurrente y Transferencias 3.0 (QR Interoperable) mediante integradores mayoristas (Decidir / Payway / APIs bancarias), reduciendo comisiones del ~5.5% de tarjetas en MP a 0.5% – 1.2% y evitando retenciones SIRCREB innecesarias.

- Cobros Operativos en el POS del Comercio: Soporte multi-medio en caja integrando generación de QR


Se consolida todo el desarrollo sobre el repositorio ferdev777/inventorex en la rama v2-go-unified, combinando la base Vite de inventorExLocal con los componentes avanzados de pos-next y un nuevo backend en Go:

## Sprint 0: Onboarding del Repositorio, Backend Go Base & Web Comercial

Objetivo: Unificar el frontend React en Vite, levantar el servidor HTTP stateless en Go y publicar la Landing Page comercial con planes y registro self-service.

- 0.1 Reestructuración del Monorepo: Crear directorios /frontend, /backend y /deploy en ferdev777/inventorex. Eliminar configuraciones obsoletas de Next.js SSR y limpiar los certificados físicos expuestos en pos-next/afip_certs/.

- 0.2 Trasplante de Componentes UI: Migrar a /frontend/src todos los componentes de pos- next/src/components/ (AdminDashboard, ProductManager, ClientManager, SupplierManager, SalesCharts, SalesHistory, CartPanel, StatusBar, ThemeProvider) conectándolos a un único cliente HTTP en src/api/client.ts.

- 0.3 Web Comercial Pública (Landing Page): Crear módulo src/public-site/ con páginas de inicio, comparativa de planes (SaaS Cloud vs. Licencia Local para equipos modestos), integración de cobro de suscripción (CBU / Transferencia 3.0) y CTA hacia /register.

- 0.4 Esqueleto Backend en Go: Inicializar backend/go.mod con router HTTP estándar, soporte de configuración por entorno (APP_MODE=cloud|local) y pool de base de datos dual (pgx/v5 en modo simple para Supabase Transaction Pooler y modernc.org/sqlite para modo local).

Base de Datos

Objetivo: Crear las tablas de tenancy, corregir el esquema criptográfico para AES-256-GCM y aislar todas las entidades por org_id.

-- 1.1 Organizaciones | 1.2 Miembros (1 usuario = 1 org) | 1.3 Credenciales ARCA con

AuthTag GCM CREATE TABLE organizations ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, cuit TEXT, tax_condition TEXT CHECK (tax_condition IN ('RI', 'MONO')), pto_vta INTEGER, arca_configured BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() ); CREATE TABLE org_members ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'cashier')), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id) ); CREATE TABLE arca_credentials ( id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE, encrypted_payload BYTEA NOT NULL, iv BYTEA NOT NULL, auth_tag BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() );

- 1.4 Adaptación de tablas operativas: Agregar columna org_id UUID NOT NULL REFERENCES organizations(id) a products, sales, clients, suppliers y afip_tokens. Crear índices compuestos

idx<table>orgid

Fundación

## Sprint 1: Database Foundation & Aislamiento Multi-Tenant


## Sprint 2: Autenticación, Onboarding Self-Service & Context Middleware

Objetivo: Cubrir el flujo completo de registro de comercios, creación atómica de organización y resolución de contexto en Go.

- 2.1 Middleware de Contexto en Go (internal/auth/middleware.go): En APP_MODE=cloud, validar firma del JWT de Supabase, consultar org_id y role (con caché en memoria de corto plazo) e inyectarlos en r.Context(). En APP_MODE=local, inyectar automáticamente la organización local por defecto.

- 2.2 Flujo de Onboarding Self-Service (POST /api/onboarding/organization): Endpoint para que el usuario recién registrado cree su registro en organizations (generando slug único) y se asigne automáticamente en org_members con rol owner dentro de una única transacción SQL.

- 2.3 Guardias de Autorización por Rol (RequireRole("owner")): Middleware en Go que bloquea con 403 Forbidden cualquier intento de un perfil cashier de invocar endpoints de administración (ABM de productos, proveedores, actualización masiva de precios, reportes o configuración ARCA).

- 2.4 Contexto de Sesión en React (auth-context.tsx): Exponer en el frontend user, organization (nombre, CUIT, arca_configured) y role (owner | cashier), redirigiendo a /onboarding si el usuario autenticado aún no posee organización asociada.

Backend

Objetivo: Permitir que cada organización suba, cifre, valide y almacene sus certificados ARCA operando 100% en memoria desde Go.

- 3.1 Módulo de Cifrado (internal/crypto/aes.go): Funciones EncryptCredentials(cert, key []byte) y DecryptCredentials() usando AES-256-GCM con clave de 32 bytes desde ARCA_ENCRYPTION_KEY, generando un IV aleatorio de 12 bytes por escritura y verificando el auth_tag de 16 bytes.

- 3.2 Cliente Nativo WSAA/WSFE en Go (internal/arca/client.go): Reemplazo de afipsdk por firma CMS/PKCS#7 en memoria del Ticket de Requerimiento de Acceso (TRA) y llamadas SOAP a WSAA y WSFEv1. Función GetArcaClient(ctx, orgID) con caché en memoria (TTL 5 min).

- 3.3 Validación en Vivo (ValidateArcaCredentials): Instancia temporal en memoria que verifica la pareja .crt / .key contra WSAA y consulta FEDummy (getServerStatus) antes de persistir; si falla, devuelve el error exacto de ARCA sin guardar en base de datos.

Auth & Roles

## Sprint 3: Gestión de Credenciales ARCA & Motor SOAP Nativo (Backend ARCA Go)

## 3.4 Endpoints de Configuración ARCA:

- venta; valida contra ARCA, cifra en arca_credentials y marca arca_configured = true en POST /api/arca/credentials (solo owner): recibe crt, key, CUIT, condición (RI/MONO) y punto de organizations.

- GET /api/arca/status (unificando el antiguo /api/afip/status): retorna estado de conexión, CUIT, condición IVA y POS sin exponer claves.

- marca arca_configured = false. DELETE /api/arca/credentials (solo owner): elimina credenciales cifradas, limpia tokens cacheados y

Wizard UI

Objetivo: Interfaz guiada paso a paso para que el owner configure la facturación electrónica de su comercio sin asistencia técnica.

- 4.1 Página /settings/arca y Componente ArcaWizard.tsx:

- Step 1 (Datos Fiscales): Carga de CUIT, selector de condición impositiva (Responsable Inscripto RI / Monotributo MONO) y Punto de Venta (POS), incluyendo botón opcional para generar en el navegador la clave privada .key y descargar el pedido .csr para subir al portal de ARCA.

- Step 2 y Step 3 (Certificados): Dropzone para carga de archivo .crt emitido por ARCA y clave privada .key.

## Sprint 4: ARCA Configuration Wizard & Generador CSR (Frontend)


## Sprint 6: Sistema de Invitaciones & Alertas vía Cloudflare Email

Objetivo: Permitir que el owner invite cajeros por correo electrónico y reciba alertas de stock bajo usando la infraestructura de Cloudflare.

- 6.1 Tabla org_invitations: Crear tabla con id UUID, org_id UUID, email TEXT, role TEXT, token TEXT UNIQUE, status TEXT CHECK (status IN ('pending','accepted','expired')) y expires_at TIMESTAMPTZ.

Team & Email

## 6.2 APIs de Invitación en Go:

- POST /api/invitations (solo owner): genera token criptográfico seguro, persiste en DB y despacha el correo con link /invite/{token} mediante el servicio de envío de emails de Cloudflare.

- GET /api/invitations/{token} (pública): valida vigencia del token y retorna nombre de la organización e email invitado.

- en org_members con rol cashier y marca la invitación como accepted. POST /api/invitations/{token}/accept (autenticada): verifica coincidencia de email, inserta al usuario

- 6.3 Vistas Frontend de Equipo y Alertas: Crear página pública /invite/[token] (aceptación/registro), panel /settings/team para listar miembros o revocar accesos, y actualizar /api/alert para enviar alertas de bajo stock al email del owner de esa organización.

UI & Desktop

Objetivo: Adaptar toda la interfaz al contexto de organización/rol y generar el binario único para PCs modestas sin dependencias externas.

- 7.1 Adaptación de Layout y Protección de Vistas: Mostrar el nombre de la organización y estado ARCA en StatusBar.tsx. Si role === 'cashier', ocultar el acceso a AdminDashboard y bloquear rutas /settings/* mostrando únicamente la terminal POS.

- 7.2 Hub de Configuración (/settings): Panel centralizado para el owner con acceso a Datos del Comercio, Configuración ARCA (/settings/arca), Equipo de Cajeros (/settings/team) y Estado de Suscripción.

- 7.3 Empaquetado Local Single-Binary (//go:embed): Incrustar el build estático de frontend/dist dentro del binario de Go para el target local. Al ejecutar inventorex.exe en Windows, levanta SQLite local, aplica migraciones automáticas y abre el navegador en http://localhost:8080 consumiendo ~25 MB de RAM (eliminando Node, NestJS, Prisma, start.bat y launcher.vbs).

QA & Deploy

Objetivo: Garantizar aislamiento cero-fugas entre comercios, automatizar resguardos en Cloudflare R2 y pasar a producción.

- 8.1 Migración SQL Idempotente: Consolidar script de migración que crea una organización inicial para absorber registros existentes en desarrollo antes de aplicar NOT NULL en las columnas org_id.

## Sprint 7: Adaptación UI por Rol & Empaquetado Ejecutable Local (.exe)

## Sprint 8: Testing, Migración Idempotente, Backups & Lanzamiento

## 8.2 Suite de Tests Automatizados en Go:

- Tests de aislamiento Multi-Tenant (verificar que Org A jamás pueda leer ni modificar productos, clientes, ventas ni credenciales de Org B).

- Tests de cifrado AES-256-GCM (roundtrip exitoso, rechazo por alteración de auth_tag y manejo de IVs únicos).

- Tests de resolución fiscal (casos RI emitiendo Factura A/B y MONO emitiendo Factura C) e integración de ventas (INTERNAL, FISCAL bloqueada sin ARCA y FISCAL mockeada con CUIT 23399135109).

- 8.3 Automatización Cloud (Keep-Alive & Backups en R2): Configurar Cron Trigger en Cloudflare para mantener activa la instancia de Supabase Free y ejecutar el dump nocturno cifrado hacia Cloudflare R2.

- 8.4 Smoke Test End-to-End: Prueba completa desde la Landing Page comercial → Registro de Owner → Creación de Org → Configuración en ArcaWizard → Venta Fiscal con descarga de PDF → Invitación y cobro desde cuenta de Cajero.
