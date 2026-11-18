<div align="center">
  <img src="helpdesk-frontend/public/soportix-logo.png" alt="Soportix Logo" width="130" />

  <h1>Soportix</h1>
  <p><strong>Plataforma centralizada de soporte técnico y gestión de incidencias</strong></p>

  <p>
    <a href="https://soportix-1.onrender.com/" target="_blank">
      <img src="https://img.shields.io/badge/Demo_en_vivo-Probar_Soportix-FF6F61?style=for-the-badge&logo=render&logoColor=white" alt="Demo en vivo" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Angular-22-FF6F61?logo=angular&logoColor=white" alt="Angular 22" />
    <img src="https://img.shields.io/badge/Django-5.2-4D2FB2?logo=django&logoColor=white" alt="Django 5.2" />
    <img src="https://img.shields.io/badge/Django_REST-Framework-081454?logo=django&logoColor=white" alt="DRF" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-0E21A0?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/TypeScript-5-9B8EC7?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Licencia-MIT-green" alt="Licencia MIT" />
  </p>
</div>

---

## 📌 ¿Qué es Soportix?

**Soportix** es una plataforma web tipo *Helpdesk* (mesa de ayuda) diseñada para ordenar y agilizar la atención de problemas técnicos dentro de una empresa o equipo de trabajo.

### El problema que resuelve
En muchas organizaciones, las solicitudes de ayuda se envían por canales dispersos: mensajes de WhatsApp, correos electrónicos informales o llamadas. Esto provoca:
- Solicitudes olvidadas o duplicadas.
- Falta de claridad en quién está atendiendo cada caso.
- Cero visibilidad sobre los tiempos de respuesta o la satisfacción del usuario.

### La solución
Soportix centraliza cada solicitud en un **ticket único**, asignando automáticamente un responsable, una prioridad y un seguimiento en tiempo real desde que se reporta hasta que queda resuelto.

---

## 🚀 Probar la plataforma en 30 segundos (Sin instalar nada)

Puedes explorar Soportix inmediatamente en su versión desplegada:

👉 **[Acceder a la Demo Pública en Vivo (soportix-1.onrender.com)](https://soportix-1.onrender.com/)**

> **Tip para evaluadores:** En la página principal, haz clic en el botón **"Probar demo"**. El sistema iniciará sesión instantáneamente con una cuenta de prueba guiada, permitiéndote recorrer la interfaz, ver el listado de tickets y el panel de control sin necesidad de registrarte ni ingresar contraseñas.

---

## 👥 ¿Quién utiliza Soportix y cómo funciona?

La plataforma adapta su interfaz y permisos según el tipo de persona que ingresa:

| Tipo de Usuario | ¿Para qué lo utiliza? | Principales Beneficios |
|---|---|---|
| **🙋 Solicitante (Empleado / Cliente)** | Crea tickets para reportar fallas, adjunta imágenes de su problema y recibe notificaciones cuando su caso avanza. | Sabe exactamente en qué estado está su solicitud y puede calificar la atención recibida (CSAT). |
| **🎧 Agente de Soporte** | Bandeja de entrada con todos los casos por resolver, filtros por prioridad, respuestas predefinidas y cambio de estados. | Atiende más rápido, asigna casos a compañeros y evita duplicar esfuerzos. |
| **📊 Administrador / Coordinador** | Panel de control con gráficas en vivo, tiempos promedio de resolución, satisfacción global y gestión de usuarios. | Toma decisiones basadas en datos y detecta cuellos de botella en la atención. |

---

## ✨ Funcionalidades Clave

- **Gestión visual de tickets:** Estados claros (*Nuevo*, *En progreso*, *Esperando respuesta*, *Resuelto*, *Cerrado*).
- **Onboarding interactivo:** Guía paso a paso para usuarios nuevos que los orienta en su primer reporte.
- **Respuestas rápidas (Canned responses):** Plantillas de respuesta para agilizar dudas comunes.
- **Encuesta de satisfacción (CSAT):** Calificación con estrellas y comentarios al cerrar cada caso.
- **Adjuntos seguros:** Subida de capturas y documentos de soporte en la nube.
- **Diseño 100% responsivo:** Adaptado para computadoras, tablets y teléfonos móviles.

---

<br />

# 🛠️ Guía Técnica y de Desarrollo *(Exclusivo para Desarrolladores)*

Esta sección contiene toda la información necesaria para clonar, configurar y ejecutar el proyecto en tu entorno local.

---

### 🏛️ Arquitectura del Sistema

Soportix está construido bajo una arquitectura desacoplada (*Frontend SPA + Backend API REST*):

```
Soportix/
├── helpdesk-frontend/     # SPA moderna en Angular 22 (Signals, Zoneless, Material)
│   └── src/app/
│       ├── auth/          # Login, registro y flujo de onboarding
│       ├── core/          # Servicios HTTP, interceptores JWT, guards y estados
│       ├── features/      # Módulos de Landing, Dashboard, Tickets y Panel Admin
│       └── layout/        # Navegación y componentes comunes
│
└── helpdesk-backend/      # API REST en Python / Django 5.2
    └── apps/
        ├── users/         # Control de acceso por roles (RBAC) y perfiles
        ├── tickets/       # Ciclo de vida de incidencias, adjuntos y comentarios
        └── dashboard/     # Endpoints agregados para reportes y métricas
```

### 💻 Stack Tecnológico

- **Frontend:** Angular 22 (Standalone components, Zoneless change detection, Signals reactivos), Angular Material, Chart.js, Tipografía Switzer/Geist.
- **Backend:** Python 3.12, Django 5.2, Django REST Framework (DRF), `django-cors-headers`, `django-filter`.
- **Autenticación:** JWT (`djangorestframework-simplejwt`) con rotación y refresco transparente en frontend.
- **Base de Datos:** PostgreSQL en la nube (Neon) en producción; SQLite por defecto para desarrollo local rápido.
- **Almacenamiento de archivos:** Cloudinary (en producción para persistencia de adjuntos) o almacenamiento local.

---

### 📋 Requisitos Previos

- **Node.js** v20 o superior y **npm**
- **Python** 3.12 o superior
- **Git**

---

### ⚙️ Instalación Paso a Paso

#### 1. Clonar el repositorio
```bash
git clone https://github.com/bleidys16/Soportix.git
cd Soportix
```

#### 2. Configurar el Backend (Django)
```bash
cd helpdesk-backend

# Crear y activar entorno virtual
python -m venv .venv

# En Windows:
.venv\Scripts\activate
# En Linux / macOS:
# source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

Crea un archivo `.env` en la raíz de `helpdesk-backend/`:
```env
SECRET_KEY=soportix-dev-secret-key-12345
DEBUG=True
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=http://localhost:4200
```
*(Opcional: Si deseas conectar a PostgreSQL, define `DB_ENGINE=django.db.backends.postgresql`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`).*

Ejecuta las migraciones y crea tu usuario administrador:
```bash
python manage.py migrate
python manage.py createsuperuser
```

*(Opcional) Cargar el usuario para pruebas automáticas de demo:*
```bash
python manage.py seed_demo_user
```

#### 3. Configurar el Frontend (Angular)
En una nueva terminal:
```bash
cd helpdesk-frontend
npm install
```

---

### ▶️ Ejecución en Desarrollo

Con ambas terminales activas:

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd helpdesk-backend
.venv\Scripts\python.exe manage.py runserver

# Terminal 2 — Frontend (http://localhost:4200)
cd helpdesk-frontend
npm start
```

Abre tu navegador en **[http://localhost:4200](http://localhost:4200)**.

---

### 🔑 Cuentas de Prueba Preconfiguradas

Para agilizar pruebas locales sin tener que registrar cuentas manuales:

| Rol | Usuario | Email | Contraseña | Permisos |
|---|---|---|---|---|
| **Administrador** | `admin` | admin@soportix.com | `Admin123456` | Acceso total a reportes, roles y configuración |
| **Agente de Soporte** | `agente` | agente@soportix.com | `Agente123456` | Gestión, asignación y resolución de tickets |
| **Usuario Final** | `usertest` | usertest@soportix.com | `Usertest123456` | Creación y seguimiento de tickets propios |
| **Cuenta Demo** | `demo` | demo@soportix.com | `Demo123456` | Modo solo lectura para la landing page |

> ⚠️ **Nota de seguridad:** Estas credenciales son exclusivas para entornos de prueba y desarrollo. En producción deben cambiarse o deshabilitarse.

---

### 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
