# 🏪 POS & Inventario - Sistema Moderno

> Sistema de Punto de Venta e Inventario desarrollado con **Next.js 14+** y **Supabase**.
> Diseñado para ser rápido, escalable y fácil de desplegar en **Vercel**.

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Desarrollo Local](#-desarrollo-local)
- [Integración con AFIP](#-integración-con-afip)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Despliegue](#-despliegue)
- [Licencia](#-licencia)

---

## ✨ Características Principales

- **Punto de Venta (POS)**: Interfaz ágil para cobrar productos.
- **Gestión de Inventario**: Control de stock en tiempo real.
- **Facturación Electrónica**: Integración nativa con AFIP (Argentina).
- **Autenticación**: Gestión de usuarios segura con Supabase Auth.
- **Base de Datos en la Nube**: PostgreSQL gestionado por Supabase.
- **Diseño Responsivo**: Funciona en PC, tablets y móviles.
- **Modo Oscuro/Claro**: Adaptable a la preferencia del usuario.

---

## 🛠 Stack Tecnológico

El proyecto ha sido migrado de una arquitectura legacy a un stack moderno serverless:

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/).
- **Backend**: [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) (API Serverless).
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL).
- **Autenticación**: Supabase Auth.
- **Validación**: [Zod](https://zod.dev/).
- **Gráficos**: [Recharts](https://recharts.org/).
- **Iconos**: [Lucide React](https://lucide.dev/).
- **Facturación**: [@afipsdk/afip.js](https://github.com/AfipSDK/afip.js).
- **Despliegue**: [Vercel](https://vercel.com/).

---

## 📌 Requisitos Previos

Para ejecutar este proyecto necesitas:

1.  **Node.js**: Versión 18 o superior.
2.  **Cuenta en Supabase**: Para la base de datos y autenticación.
3.  **Cuenta en Vercel** (Opcional): Para despliegue en producción.
4.  **Certificados AFIP** (Opcional): Solo si necesitas facturación fiscal real.

---

## 🚀 Instalación y Configuración

El código fuente de la aplicación se encuentra en la carpeta `pos-next`.

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd inventorEx/pos-next
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1.  Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2.  Ve al **SQL Editor** de tu proyecto en Supabase.
3.  Ejecuta el contenido del archivo `pos-next/supabase/schema.sql` para crear las tablas necesarias.
4.  Obtén las credenciales de tu proyecto desde **Project Settings > API**.

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la carpeta `pos-next` basándote en `.env.example`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# AFIP (Opcional para desarrollo)
AFIP_CUIT=20xxxxxxxx
AFIP_CERT_PATH=./afip_certs/certificado.crt
AFIP_KEY_PATH=./afip_certs/clave.key
AFIP_PRODUCTION=false
```

---

## 💻 Desarrollo Local

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🧾 Integración con AFIP

El sistema permite emitir facturas electrónicas válidas en Argentina.

1.  **Certificados**: Coloca tu certificado (`.crt`) y clave privada (`.key`) en una carpeta segura (ej: `pos-next/afip_certs`). **NO subas estos archivos al repositorio**.
2.  **Configuración**: Asegúrate de que las rutas en `.env.local` apunten a tus archivos.
3.  **Modo**:
    - `AFIP_PRODUCTION=false`: Modo homologación (pruebas).
    - `AFIP_PRODUCTION=true`: Modo producción (validez fiscal).

---

## 📂 Estructura del Proyecto

```
pos-next/
├── src/
│   ├── app/              # Next.js App Router (Páginas y API)
│   │   ├── api/          # Endpoints de API (Backend)
│   │   └── ...           # Páginas del Frontend
│   ├── components/       # Componentes de React (UI)
│   ├── lib/              # Lógica de negocio y utilidades
│   │   ├── services/     # Servicios (interacción con DB/AFIP)
│   │   ├── supabase/     # Cliente de Supabase
│   │   └── ...
│   └── ...
├── supabase/             # Scripts SQL para la base de datos
├── public/               # Archivos estáticos
└── ...
```

---

## ☁️ Despliegue

La forma más sencilla de desplegar es usando **Vercel**:

1.  Sube tu código a GitHub/GitLab/Bitbucket.
2.  Importa el proyecto en Vercel seleccionando la carpeta `pos-next` como raíz.
3.  Configura las **Environment Variables** en Vercel con los valores de tu `.env.local`.
    - _Nota_: Para los archivos de certificados de AFIP en Vercel, puede ser necesario usar variables de entorno con el contenido base64 del archivo o montarlos de otra manera segura, ya que el sistema de archivos es de solo lectura en tiempo de ejecución.

---

## 📄 Licencia

Este software es de uso privado. Todos los derechos reservados.
