# 🏪 POS & Inventario - Sistema de Punto de Venta

> Sistema all-in-one de Punto de Venta e Inventario para pequeños comercios en Argentina.
> Optimizado para hardware legacy (4GB RAM), funciona 100% offline excepto para facturación AFIP.

---

## 📋 Tabla de Contenidos

- [Requisitos](#-requisitos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación Rápida](#-instalación-rápida)
- [Certificados AFIP](#-certificados-afip)
- [Compilación (Build)](#-compilación-build)
- [Ejecución](#-ejecución)
- [Crear Instalador con Inno Setup](#-crear-instalador-con-inno-setup)
- [Configuración](#-configuración)
- [Uso del Sistema](#-uso-del-sistema)
- [Solución de Problemas](#-solución-de-problemas)
- [Arquitectura Técnica](#-arquitectura-técnica)

---

## 📌 Requisitos

### Software Necesario (para desarrollo)

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **Git** (opcional, para clonar el repositorio)

### Para el equipo del cliente (producción)

- **Windows 7/10/11** (32 o 64 bits)
- **4GB RAM** mínimo
- **NO requiere instalación de Node.js** si se usa la estrategia portátil (ver abajo)

### Estrategia Node.js Portátil

Para no instalar Node.js en el equipo del cliente:

1. Descargar la versión **portable** de Node.js desde: https://nodejs.org/en/download
2. Elegir la versión **"Windows Binary (.zip)"** (no el instalador .msi)
3. Extraer el contenido en la carpeta `node/` dentro del proyecto:
   ```
   inventorEx/
   ├── node/
   │   ├── node.exe     ← Aquí debe estar
   │   ├── npm.cmd
   │   └── ...
   ├── backend/
   ├── frontend/
   └── start.bat
   ```

---

## 📂 Estructura del Proyecto

```
inventorEx/
├── backend/                    # API NestJS + Prisma
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── seed.ts            # Datos de ejemplo
│   ├── src/
│   │   ├── main.ts            # Entry point del servidor
│   │   ├── app.module.ts      # Módulo raíz (sirve frontend estático)
│   │   ├── prisma/            # Servicio de base de datos
│   │   ├── products/          # CRUD de productos
│   │   ├── sales/             # Lógica de ventas (core)
│   │   └── afip/              # Integración con AFIP
│   └── package.json
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/        # Componentes UI (StatusBar, ProductPanel, etc.)
│   │   ├── App.tsx            # Layout principal
│   │   ├── api/client.ts      # Cliente API
│   │   └── types/index.ts     # TypeScript types
│   └── package.json
├── certs/                      # Certificados AFIP (NO commitear)
│   ├── certificado.crt
│   └── clave_privada.key
├── .env                        # Variables de entorno
├── start.bat                   # Script de inicio para Windows
└── README.md                   # Esta documentación
```

---

## 🚀 Instalación Rápida

### 1. Clonar o copiar el proyecto

```bash
git clone <url-del-repositorio>
cd inventorEx
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno

```bash
cd ..
copy .env.example .env
```

Editar `.env` con los datos correctos (CUIT, rutas de certificados, etc.)

### 5. Inicializar la base de datos

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Verificar que todo funciona (desarrollo)

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Abrir el navegador en `http://localhost:5173`

---

## 🔐 Certificados AFIP

### ¿Qué son?

Para emitir facturas electrónicas, AFIP requiere un par de certificado digital (.crt) y clave privada (.key) vinculados a tu CUIT.

### Pasos para generar los certificados

#### 1. Generar la clave privada

```bash
openssl genrsa -out clave_privada.key 2048
```

#### 2. Generar el CSR (Certificate Signing Request)

```bash
openssl req -new -key clave_privada.key -out solicitud.csr -subj "/C=AR/O=TuEmpresa/CN=TuNombre/serialNumber=CUIT 20XXXXXXXXX"
```

> ⚠️ Reemplazar `20XXXXXXXXX` con tu CUIT real

#### 3. Subir el CSR a AFIP

1. Ingresar a [AFIP con clave fiscal](https://auth.afip.gob.ar/contribuyente_/login.xhtml)
2. Ir a **"Administración de Certificados Digitales"**
3. Crear un nuevo certificado de tipo **"Computador"**
4. Subir el archivo `solicitud.csr`
5. Descargar el certificado generado (archivo `.crt`)

#### 4. Colocar los archivos

```
inventorEx/
├── certs/
│   ├── certificado.crt    ← El .crt descargado de AFIP
│   └── clave_privada.key  ← Tu clave privada generada
```

#### 5. Configurar en .env

```env
AFIP_CERT_PATH=./certs/certificado.crt
AFIP_KEY_PATH=./certs/clave_privada.key
AFIP_CUIT=20XXXXXXXXX
AFIP_PRODUCTION=false  # Cambiar a true cuando pase a producción
```

### Modo Homologación vs Producción

- **Homologación** (`AFIP_PRODUCTION=false`): Para pruebas. Las facturas no tienen validez fiscal.
- **Producción** (`AFIP_PRODUCTION=true`): Facturas reales con validez fiscal.

> 🔒 **IMPORTANTE**: Nunca commitear los certificados al repositorio. Ya están en `.gitignore`.

---

## 🔨 Compilación (Build)

### Build completo para producción

```bash
# 1. Compilar el Frontend (genera archivos estáticos)
cd frontend
npm run build

# 2. Compilar el Backend (transpila TypeScript a JavaScript)
cd ../backend
npm run build
```

Esto genera:

- `frontend/dist/` → Archivos HTML/CSS/JS estáticos
- `backend/dist/` → Código JavaScript compilado

### Build en un solo comando (opcional)

Desde la raíz del proyecto:

```bash
cd frontend && npm run build && cd ../backend && npm run build
```

---

## ▶️ Ejecución

### Modo Desarrollo

```bash
# Backend (con hot-reload)
cd backend && npm run start:dev

# Frontend (con hot-reload, en otro terminal)
cd frontend && npm run dev
```

### Modo Producción

Simplemente hacer doble clic en `start.bat` o ejecutar:

```bash
start.bat
```

El script:

1. ✅ Detecta Node.js (portátil o instalado)
2. ✅ Verifica que el proyecto esté compilado
3. ✅ Inicia el servidor en el puerto 3000
4. ✅ Abre el navegador automáticamente

---

## 🧪 Testing

El proyecto cuenta con tests unitarios para el frontend utilizando **Vitest**.

### Ejecutar tests

```bash
cd frontend
npm test
```

Esto verificará:

- Renderizado correcto de componentes (StatusBar, Paneles, Modales)
- Lógica de cálculo del carrito
- Interacciones básicas (agregar, quitar, buscar)
- Manejo de estados de error/éxito

---

## 🛡️ Panel de Administración

Para acceder a funciones de gestión avanzada:

1. Haga clic en el **logo de la aplicación** en la barra superior.
2. Ingrese el PIN de seguridad (Default: `1234`).
3. Accederá al panel para **Gestionar Productos** (Crear, Editar, Eliminar).

---

## 📦 Crear Instalador con Inno Setup

[Inno Setup](https://jrsoftware.org/isinfo.php) permite empaquetar todo en un instalador `.exe` profesional.

### 1. Descargar Inno Setup

- Descargar desde: https://jrsoftware.org/isdl.php
- Instalar con las opciones por defecto

### 2. Preparar la carpeta de distribución

Crear una carpeta `dist-package/` con la siguiente estructura:

```
dist-package/
├── node/              ← Node.js portátil
│   └── node.exe
├── backend/
│   ├── dist/          ← Backend compilado
│   ├── node_modules/  ← Dependencias (solo producción)
│   └── prisma/
├── frontend/
│   └── dist/          ← Frontend compilado
├── certs/             ← Carpeta vacía (el usuario pone sus certs)
├── .env               ← Configuración
└── start.bat          ← Script de inicio
```

> **Tip**: Para reducir el tamaño de `node_modules`, reinstalar solo dependencias de producción:
>
> ```bash
> cd backend
> npm ci --omit=dev
> ```

### 3. Crear el script de Inno Setup

Crear un archivo `installer.iss`:

```iss
[Setup]
AppName=POS & Inventario
AppVersion=1.0.0
AppPublisher=Tu Empresa
DefaultDirName={autopf}\POS-Inventario
DefaultGroupName=POS & Inventario
OutputDir=output
OutputBaseFilename=POS-Inventario-Setup
Compression=lzma2
SolidCompression=yes
SetupIconFile=icon.ico

[Files]
Source: "dist-package\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\POS & Inventario"; Filename: "{app}\start.bat"; IconFilename: "{app}\icon.ico"
Name: "{commondesktop}\POS & Inventario"; Filename: "{app}\start.bat"; IconFilename: "{app}\icon.ico"

[Run]
Filename: "{app}\start.bat"; Description: "Iniciar POS & Inventario"; Flags: nowait postinstall skipifsilent
```

### 4. Compilar el instalador

1. Abrir Inno Setup Compiler
2. Abrir el archivo `installer.iss`
3. Menú → Build → Compile
4. El instalador se generará en la carpeta `output/`

---

## ⚙️ Configuración

### Variables de entorno (.env)

| Variable          | Descripción                         | Valor por defecto           |
| ----------------- | ----------------------------------- | --------------------------- |
| `PORT`            | Puerto del servidor                 | `3000`                      |
| `NODE_ENV`        | Entorno de ejecución                | `production`                |
| `DATABASE_URL`    | Ruta a la base de datos SQLite      | `file:./pos.db`             |
| `AFIP_CERT_PATH`  | Ruta al certificado AFIP (.crt)     | `./certs/certificado.crt`   |
| `AFIP_KEY_PATH`   | Ruta a la clave privada AFIP (.key) | `./certs/clave_privada.key` |
| `AFIP_CUIT`       | CUIT del contribuyente              | -                           |
| `AFIP_PRODUCTION` | Modo producción AFIP                | `false`                     |

---

## 💻 Uso del Sistema

### Terminal POS

1. **Barra de Búsqueda** (arriba a la izquierda): Se auto-enfoca al cargar la página. Compatible con lectores de código de barras.
2. **Grilla de Productos**: Click en un producto para agregarlo al carrito. Los productos con stock bajo se marcan con ⚠️.
3. **Ticket** (panel derecho): Muestra los productos en el carrito con controles de cantidad (+/-).
4. **Botones de Checkout**:
   - 🔵 **FACTURAR (AFIP)**: Crea venta + factura electrónica. Requiere conexión a AFIP.
   - 🟢 **SOLO GUARDAR (Interno)**: Crea venta interna (solo descuenta stock). Funciona offline.

### Indicador de AFIP

- 🟢 **En Línea**: AFIP está disponible para facturación.
- 🔴 **Sin Conexión**: AFIP no alcanzable. Solo se pueden hacer ventas internas.

### Flujo de una Venta Fiscal

1. Escanear/buscar productos
2. Verificar cantidades en el ticket
3. Presionar "FACTURAR (AFIP)"
4. El sistema:
   - Valida stock
   - Descuenta inventario
   - Genera factura en AFIP
   - Si AFIP falla → Revierte todo (stock restaurado)
5. Se muestra el CAE y número de factura

---

## 🔧 Solución de Problemas

### El puerto 3000 ya está ocupado

```bash
# Encontrar qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplazar XXXX con el PID)
taskkill /PID XXXX /F
```

O cambiar el puerto en `.env`:

```env
PORT=3001
```

### Error: "No se encontró node.exe"

- Verificar que `node.exe` esté en la carpeta `node/` del proyecto
- O instalar Node.js en el sistema: https://nodejs.org/

### Error de AFIP: "Servicio no disponible"

1. Verificar conexión a internet
2. AFIP puede estar en mantenimiento ([ver estado](https://www.afip.gob.ar/ws/estadoServicios/))
3. Verificar que los certificados no estén vencidos
4. Mientras tanto, usar el botón **"SOLO GUARDAR"** para no perder ventas

### Error: "Certificate has expired"

Los certificados de AFIP tienen una vigencia limitada (generalmente 2 años).
Generar nuevos certificados siguiendo la sección [Certificados AFIP](#-certificados-afip).

### La base de datos no existe

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### El frontend no carga (pantalla en blanco)

1. Verificar que el frontend esté compilado: `frontend/dist/index.html` debe existir
2. Recompilar: `cd frontend && npm run build`

---

## 🏗️ Arquitectura Técnica

### Proceso Único

```
┌──────────────────────────────────────────────┐
│                NestJS Server                  │
│   ┌─────────────────┐  ┌─────────────────┐  │
│   │  Static Files   │  │    API Routes    │  │
│   │  (React Build)  │  │   (/api/...)     │  │
│   │   GET /          │  │                 │  │
│   └─────────────────┘  └─────────────────┘  │
│                    │                          │
│           ┌────────┴────────┐                │
│           │  SQLite (Prisma) │                │
│           │    pos.db        │                │
│           └─────────────────┘                │
└──────────────────────────────────────────────┘
```

### Stack Tecnológico

- **Backend**: NestJS 10 + TypeScript
- **ORM**: Prisma 5 con SQLite
- **Frontend**: React 18 + Vite 6 + Tailwind CSS 3
- **Facturación**: afip.js (SDK para WSFE)
- **Iconos**: Lucide React (tree-shakeable)
- **Deployment**: Windows nativo (sin Docker)

### Flujo de Datos (Venta Fiscal)

```
Frontend                Backend                   AFIP
   │                       │                        │
   ├── POST /api/sales ──→ │                        │
   │                       ├── Validate stock       │
   │                       ├── BEGIN Transaction     │
   │                       ├── Decrement stock       │
   │                       ├── Create Sale           │
   │                       ├── createInvoice() ────→ │
   │                       │                    ←── CAE
   │                       ├── Update Sale w/ CAE    │
   │                       ├── COMMIT Transaction    │
   │   ←── Sale Result ── │                        │
   │                       │                        │
   │   (Si AFIP falla)     │                        │
   │                       ├── ROLLBACK Transaction  │
   │                       ├── (Stock restaurado)    │
   │   ←── Error ──────── │                        │
```

---

## 📄 Licencia

Este software es de uso interno. Todos los derechos reservados.
