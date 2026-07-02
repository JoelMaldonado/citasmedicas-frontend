# CitasMedicas — Frontend

Sistema de citas médicas: pacientes agendan citas con médicos, los médicos las confirman o rechazan, y ambos se enteran **en tiempo real** (WebSockets) sin recargar la página.

Este repo es el cliente web (Vue 3 + TypeScript). Consume la API REST y el gateway de WebSockets del backend en [`citasmedicas-backend`](../citasmedicas-backend) (NestJS + PostgreSQL).

## Stack

- **Vue 3** (`<script setup>`, Composition API) + **TypeScript**
- **Vite** — dev server y build
- **Pinia** — estado global
- **Vue Router 4** — rutas y guards de autenticación/rol
- **PrimeVue** — componentes de UI (DataTable, Dialog, Toast, etc.)
- **Axios** — cliente HTTP
- **socket.io-client** — notificaciones en tiempo real

## Qué hace cada rol

| Rol | Puede hacer |
|---|---|
| **Paciente** | Registrarse, crear una cita (elige médico → horario disponible → motivo), ver el estado de sus citas, cancelarlas |
| **Médico** | Ver su agenda semanal, confirmar/rechazar citas pendientes, reagendar o cancelar citas confirmadas |
| **Admin** | Dar de alta médicos, ver el listado de médicos registrados |

Todo el ciclo de vida de una cita (`pending → confirmed/rejected → completed` automático al pasar la hora, o `cancelled` en cualquier momento antes de eso) ocurre sin recargar: cuando un paciente agenda, el médico recibe un toast al instante; cuando el médico decide, el paciente también.

## Arquitectura de carpetas

El patrón general: **una vista por ruta, delegando su lógica hacia abajo.**

```
Vista (views/) → composable (composables/) → store (stores/) → service (services/) → API
```

| Carpeta | Responsabilidad |
|---|---|
| `types/` | Interfaces TypeScript que describen la forma de los datos (`Appointment`, `Doctor`, `User`...). El "vocabulario" compartido por toda la app. |
| `services/` | Única capa que habla HTTP con el backend (axios). Funciones `async` puras, sin Vue. Incluye `api.ts` (instancia de axios + interceptor de JWT y manejo de 401) y `realtime.ts` (conexión de sockets). |
| `stores/` (Pinia) | Estado global reactivo: listas de citas, médicos, sesión del usuario. Llaman a los services y guardan el resultado. |
| `composables/` | Lógica de negocio reutilizable (`use*`). Envuelven un store y le agregan efectos secundarios: toasts, navegación, datos derivados. |
| `components/` | UI reutilizable y "tonta" (recibe props, emite eventos). `common/` es genérico de cualquier dominio; el resto está organizado por dominio (`appointments/`, `layout/`). |
| `layouts/` | El marco que envuelve las vistas: `AuthLayout` (login/registro) y `DashboardLayout` (sidebar + topbar + contenido, para cualquier pantalla autenticada). |
| `views/` | Una por ruta. Orquesta: pide datos vía composables, renderiza componentes. Sin lógica de negocio pesada. |
| `router/` | `index.ts` define rutas, layout y rol requerido por ruta (`meta.roles`). `guards.ts` corre antes de cada navegación y redirige según sesión/rol. |
| `utils/` | Funciones puras sin dependencias de Vue/stores (ej. calcular si una cita ya debería verse como completada). |

## Requisitos

- Docker — para correr todo sin instalar nada más, **o bien**:
- Node.js 20+ y pnpm
- El backend (`citasmedicas-backend`) corriendo — ver su propio README para levantar la base de datos y la API.

## Configuración

```bash
cp .env.example .env
```

Variable requerida:

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del backend (REST + WebSocket), ej. `http://localhost:3005` |

## Ejecución con Docker (recomendado, no requiere Node ni pnpm instalados)

```bash
docker compose up --build
```

Compila la app y la sirve con nginx en `http://localhost:5173`. `VITE_API_URL` se toma de `.env` en el momento del build (Vite lo inlinea en el bundle, no es una variable de entorno en tiempo de ejecución).

## Instalación y ejecución manual (sin Docker)

```bash
pnpm install
pnpm dev       # servidor de desarrollo (http://localhost:5173)
pnpm build     # type-check + build de producción
pnpm preview   # sirve el build de producción localmente
```

## Cómo probar los 3 roles

- **Paciente**: registrate desde `/register` — el registro público siempre crea un paciente.
- **Admin**: se siembra automáticamente al levantar el backend, usando `ADMIN_EMAIL` / `ADMIN_PASSWORD` de su `.env` (ver README del backend).
- **Médico**: no hay registro público para médicos — entrá como admin y creá uno desde "Nuevo médico". Con ese correo/contraseña iniciás sesión como médico.
