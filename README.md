<div align="center">
  <img src="helpdesk-frontend/public/soportix-logo.png" alt="Soportix" width="110" />

  <h1>Soportix</h1>
  <p><strong>Helpdesk / Mesa de Ayuda</strong> — gestión de tickets de soporte técnico con control de acceso por roles.</p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white" alt="Django" />
    <img src="https://img.shields.io/badge/Django%20REST%20Framework-3.17-A30000?logo=django&logoColor=white" alt="Django REST Framework" />
    <img src="https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white" alt="Angular" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-316192?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" />
  </p>
</div>

## Índice

- [Stack técnico](#stack-técnico)
- [Roles del sistema](#roles-del-sistema)
- [Cuentas de prueba](#cuentas-de-prueba)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Levantar el proyecto](#levantar-el-proyecto)
- [Variables de entorno](#variables-de-entorno-backend)
- [Estructura del proyecto](#estructura-del-proyecto)

## Stack técnico

**Backend**
- Django 5.2 + Django REST Framework
- Autenticación JWT (`djangorestframework-simplejwt`) con refresco automático de token
- PostgreSQL (producción, vía Neon) o SQLite (desarrollo local, por defecto)
- `django-filter`, `django-cors-headers`

**Frontend**
- Angular 22 (componentes standalone, signals, zoneless)
- Angular Material + Angular CDK
- Chart.js para las gráficas del dashboard
- Tipografía Geist + Material Symbols Outlined

## Roles del sistema

| Rol | Puede hacer |
|---|---|
| **Usuario final** | Crear tickets y darles seguimiento a los propios |
| **Agente de soporte** | Ver y gestionar todos los tickets, cambiar estado, comentar, asignarse tickets |
| **Administrador** | Todo lo del agente, más gestión de usuarios (roles/estado), categorías y reportes |

El rol se asigna desde el panel de administración (`/admin/usuarios`) o desde el admin nativo de Django — el registro público siempre crea usuarios con rol `user`.

## Cuentas de prueba

| Rol | Usuario | Email | Contraseña |
|---|---|---|---|
| Administrador | `admin` | admin@soportix.com | `Admin123456` |
| Agente de soporte | `agente` | agente@soportix.com | `Agente123456` |
| Usuario final | `usertest` | usertest@soportix.com | `Usertest123456` |

> Son credenciales de demo para desarrollo/pruebas. Cámbialas antes de usar esta base de datos en un entorno real.

## Requisitos previos

- Python 3.12+
- Node.js 20+ y npm
- PostgreSQL (opcional — sin configurar, usa SQLite automáticamente)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/bleidys16/Soportix.git
cd Soportix
```

### 2. Backend (Django)

```bash
cd helpdesk-backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Crea un archivo `.env` dentro de `helpdesk-backend/` (no se versiona) con al menos:

```env
SECRET_KEY=una-clave-secreta-cualquiera
DEBUG=True
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:4200
```

Para usar PostgreSQL en vez de SQLite, agrega además:

```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=tu_bd
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host
DB_PORT=5432
```

Aplica las migraciones y crea un superusuario:

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 3. Frontend (Angular)

```bash
cd helpdesk-frontend
npm install
```

## Levantar el proyecto

Con dos terminales abiertas en paralelo:

```bash
# Terminal 1 — backend (http://localhost:8000)
cd helpdesk-backend
.venv\Scripts\python.exe manage.py runserver

# Terminal 2 — frontend (http://localhost:4200)
cd helpdesk-frontend
npm start
```

Abre **http://localhost:4200** en el navegador. El superusuario que creaste con `createsuperuser` tiene rol de administrador automáticamente.

## Variables de entorno (backend)

| Variable | Requerida | Descripción |
|---|---|---|
| `SECRET_KEY` | Sí | Clave secreta de Django |
| `DEBUG` | No (default `True`) | Modo debug |
| `ALLOWED_HOSTS` | No (default `*`) | Hosts permitidos, separados por coma |
| `CORS_ALLOWED_ORIGINS` | No (default `http://localhost:4200`) | Orígenes permitidos para CORS |
| `DB_ENGINE` | No (default SQLite) | `django.db.backends.postgresql` para usar Postgres |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` | Solo si usas Postgres | Credenciales de conexión |

## Estructura del proyecto

```
Soportix/
├── helpdesk-backend/     # API REST en Django
│   └── apps/
│       ├── users/        # Autenticación, perfiles y roles
│       ├── tickets/      # Tickets, categorías, comentarios
│       └── dashboard/    # Endpoints de métricas y reportes
└── helpdesk-frontend/    # SPA en Angular
    └── src/app/
        ├── auth/         # Login y registro
        ├── core/         # Servicios, guards, modelos, componentes compartidos
        ├── features/     # Dashboard, tickets, admin
        └── layout/       # Navbar superior compartido
```
