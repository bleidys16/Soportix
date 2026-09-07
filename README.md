<div align="center">
  <img src="helpdesk-frontend/public/soportix-logo.png" alt="Soportix" width="160" />

  <h1>Soportix</h1>
  <p><strong>Helpdesk / Mesa de Ayuda</strong> — Gestión inteligente de tickets de soporte técnico con control de acceso por roles.</p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white" alt="Django" />
    <img src="https://img.shields.io/badge/Django%20REST%20Framework-3.17-A30000?logo=django&logoColor=white" alt="Django REST Framework" />
    <img src="https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white" alt="Angular" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-316192?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" />
    <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## ÍNDICE

- [Stack técnico](#stack-técnico)
- [Paleta de colores](#paleta-de-colores)
- [Roles del sistema](#roles-del-sistema)
- [Cuentas de prueba](#cuentas-de-prueba)
- [Requisitos previos](#requisitos-previos)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Despliegue en Vercel (Frontend)](#despliegue-en-vercel-frontend)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## STACK TÉCNICO

**Backend**
- **Django 5.2** + **Django REST Framework**
- Autenticación JWT (`djangorestframework-simplejwt`) con soporte para ingreso por usuario o correo
- PostgreSQL (producción vía Neon) o SQLite (desarrollo local)
- `django-filter`, `django-cors-headers`

**Frontend**
- **Angular 22** (componentes standalone, signals, zoneless routing)
- Angular Material + Angular CDK
- Chart.js para métricas en tiempo real del Dashboard
- Tipografía Switzer / Geist + Material Symbols Outlined

---

## PALETA DE COLORES

| Color | Hex | Uso |
|---|---|---|
| **Indigo Principal** | `#0e21a0` | Navbar, encabezados primarios y elementos de marca |
| **Coral Accent** | `#ff6f61` | Botones de acción principal (CTA, Demo, guardar) |
| **Violeta Profundo** | `#4d2fb2` | Gráficas, badges de estado y acentos secundarios |
| **Púrpura Vibrante** | `#b153d7` | Iluminaciones y degradados dinámicos |

---

## ROLES DEL SISTEMA

| Rol | Alcance y Permisos |
|---|---|
| **Usuario final** | Crea tickets, realiza comentarios en sus propios casos y evalúa la atención con calificación CSAT al resolverse. |
| **Agente de soporte** | Visualiza todos los tickets del sistema, cambia estados, aplica respuestas predefinidas y responde solicitudes. |
| **Administrador** | Control total del sistema: gestión de usuarios, asignación de roles, configuración de categorías y reportes. |

---

## CUENTAS DE PRUEBA

| Rol | Usuario | Email | Contraseña |
|---|---|---|---|
| **Administrador** | `admin` | `admin@soportix.com` | `Admin123456` |
| **Agente de soporte** | `agente` | `agente@soportix.com` | `Agente123456` |
| **Usuario final** | `usertest` | `usertest@soportix.com` | `Usertest123456` |
| **Cuenta Demo** | `demo` | `demo@soportix.com` | `Demo123456` |

> El botón **"Probar demo"** en la Landing Page ingresa automáticamente con la cuenta `demo` de solo lectura. Para instalar o resetear las cuentas de prueba ejecuta:
```bash
python manage.py seed_demo_user
```

---

## INSTALACIÓN Y EJECUCIÓN LOCAL

### 1. Clonar el repositorio

```bash
git clone https://github.com/bleidys16/Soportix.git
cd Soportix
```

### 2. Levantar el Backend (Django)

```bash
cd helpdesk-backend
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # macOS/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_user
python manage.py runserver
```

### 3. Levantar el Frontend (Angular)

```bash
cd helpdesk-frontend
npm install
npm start
```

Abre **`http://localhost:4200`** en tu navegador.

---

## DESPLIEGUE EN VERCEL (FRONTEND)

El frontend de Angular está listo para desplegarse en **Vercel** con reescrituras de Single Page Application (SPA).

### Pasos para desplegar desde el Dashboard de Vercel:

1. Ingresa a [Vercel Dashboard](https://vercel.com/dashboard) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** ➔ **"Project"**.
3. Importa el repositorio **`bleidys16/Soportix`**.
4. Configura el proyecto con los siguientes valores:
   - **Root Directory**: `helpdesk-frontend` *(¡Importante!)*
   - **Framework Preset**: `Angular`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/helpdesk-frontend/browser`
5. En la sección **Environment Variables**, añade:
   - `NG_APP_API_URL`: La URL pública de tu API Backend (ejemplo: `https://tu-backend.onrender.com/api`)
6. Haz clic en **Deploy**.

### Pasos para desplegar desde la Terminal (Vercel CLI):

```bash
npm install -g vercel
cd helpdesk-frontend
vercel
```

*(El archivo `vercel.json` incluido redirige automáticamente las rutas deep-link `/login`, `/dashboard`, `/tickets` a `index.html` para evitar errores 404).*

---

## ESTRUCTURA DEL PROYECTO

```
Soportix/
├── helpdesk-backend/     # API REST en Django + JWT
│   └── apps/
│       ├── users/        # Autenticación, perfiles y gestión de roles
│       ├── tickets/      # Tickets, categorías, comentarios y adjuntos
│       └── dashboard/    # Endpoints de estadísticas y reportes
└── helpdesk-frontend/    # SPA en Angular 22
    ├── vercel.json       # Configuración de despliegue para Vercel
    └── src/app/
        ├── auth/         # Login y registro
        ├── core/         # Guardias, interceptores JWT y servicios
        ├── features/     # Landing, Dashboard, Tickets y Administración
        └── layout/       # Layout responsive principal
```
