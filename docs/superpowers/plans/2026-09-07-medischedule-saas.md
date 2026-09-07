# MediSchedule SaaS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir e implementar una plataforma SaaS multi-tenant para agendamiento de citas médicas y gestión clínica en salud con agente de voz IA nativo en español, operando sobre Next.js 14, Tailwind CSS, Cloudflare D1/KV y Auth.js v5.

**Architecture:** Aplicación Next.js (App Router) multi-tenant resuelta mediante middleware basado en subdominio (`tenant.medischedule.com` o localhost multi-tenant header). Capa de datos con Cloudflare D1 (SQLite compatible) parametrizada, autenticación con Auth.js v5 (JWT stateless multi-tenant), y un subsistema cliente de Agente de Voz Médica usando Web Speech API (SpeechRecognition + SpeechSynthesis) acoplado a una máquina de estados finitos y analizador de intenciones en español.

**Tech Stack:** Next.js 14/15, React 19/18, TypeScript, Tailwind CSS v3, Radix UI primitives / Lucide Icons, Framer Motion, TanStack Query v5, Auth.js v5 (next-auth@beta), Better-sqlite3 / Cloudflare D1 client, Zod.

**Spec:** [docs/superpowers/specs/2026-09-07-medischedule-saas-design.md](file:///Users/admin/Documents/telemedicina/docs/superpowers/specs/2026-09-07-medischedule-saas-design.md)

## Global Constraints
- Idioma exclusivo de UI y respuestas de voz: Español (`es-ES` / `es-419`).
- Toda consulta a base de datos de pacientes, citas o médicos DEBE filtrar estrictamente por `tenant_id`.
- El agente de voz opera sin costes de API externa usando Web Speech API nativa del navegador con fallback visual/textual.
- Estilo visual de grado médico premium: paleta Azul Clínico Profundo (`#0F2D6B`), Verde Sanitario (`#00A896`), neutros limpios y tipografía Inter.

---

### Task 1: Scaffolding y Configuración Base del Proyecto

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: Node.js runtime, npm packages
- Produces: Base ejecutable de Next.js con Tailwind CSS, TypeScript y dependencias esenciales

- [ ] **Step 1: Inicializar package.json con dependencias requeridas**
Configurar dependencias: `next`, `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `framer-motion`, `@tanstack/react-query`, `zod`, `better-sqlite3`, `@types/better-sqlite3`.

- [ ] **Step 2: Configurar tsconfig.json, next.config.js y Tailwind CSS**
Configurar aliases `@/*` hacia `./*` y temas de color médico (`primary: #0F2D6B`, `accent: #00A896`).

- [ ] **Step 3: Instalar dependencias con npm install**
Ejecutar instalación limpia sin conflictos.

- [ ] **Step 4: Verificar compilación inicial**
Ejecutar `npx next build` o test unitario inicial para validar que TypeScript y CSS compilan sin errores.

- [ ] **Step 5: Commit del scaffolding base**
`git add . && git commit -m "chore: scaffold Next.js SaaS project with Tailwind and core dependencies"`

---

### Task 2: Capa de Base de Datos y Migraciones D1 / SQLite

**Files:**
- Create: `migrations/0001_initial_schema.sql`
- Create: `lib/db/client.ts`
- Create: `lib/db/schema.ts`
- Create: `lib/db/queries/tenants.ts`
- Create: `lib/db/queries/appointments.ts`
- Create: `lib/db/queries/patients.ts`
- Create: `lib/db/queries/doctors.ts`
- Test: `tests/db.test.ts`

**Interfaces:**
- Consumes: `better-sqlite3` (desarrollo local / CI) y Cloudflare D1 binding (producción)
- Produces: Clientes tipados de DB y funciones helper para queries con aislamiento estricto por `tenant_id`

- [ ] **Step 1: Escribir migración SQL completa (0001_initial_schema.sql)**
Crear tablas: `tenants`, `users`, `doctors`, `time_slots`, `patients`, `appointments`, `medical_records` e índices de búsqueda rápida.

- [ ] **Step 2: Crear abstracción de conexión D1 / SQLite local (lib/db/client.ts)**
Permitir instanciar SQLite local `data/medischedule.db` en modo local/pruebas o `process.env.DB` en Cloudflare Pages Functions.

- [ ] **Step 3: Implementar queries seguras aisladas por tenant (lib/db/queries/*.ts)**
Funciones para:
  - `getTenantBySlug(slug)`
  - `listAppointments(tenantId, filters)`
  - `createAppointment(tenantId, data)`
  - `listPatients(tenantId, search)`
  - `createPatient(tenantId, data)`
  - `getDoctorAvailableSlots(tenantId, doctorId, date)`

- [ ] **Step 4: Escribir y ejecutar test de base de datos**
Verificar que la inserción de registros en un tenant no sea visible desde consultas de otro tenant.

- [ ] **Step 5: Commit de la capa de base de datos**
`git add migrations lib/db tests/db.test.ts && git commit -m "feat(db): add D1 sqlite schema and tenant-scoped query functions"`

---

### Task 3: Multi-Tenancy Middleware y Autenticación con Auth.js

**Files:**
- Create: `lib/auth/config.ts`
- Create: `lib/auth/password.ts`
- Create: `middleware.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Test: `tests/middleware.test.ts`

**Interfaces:**
- Consumes: `next-auth`, JWT tokens, cookies HTTP
- Produces: Inyección de cabecera `X-Tenant-Id`, protección de rutas y sesión con `{ user: { id, email, role, tenantId } }`

- [ ] **Step 1: Implementar resolución de subdominios y tenant (middleware.ts)**
Extraer subdominio del host (`clinica-san-jose.medischedule.com` o header `x-tenant-slug` en dev), validar existencia del tenant y asignar `x-tenant-id` a los headers de la solicitud.

- [ ] **Step 2: Configurar Auth.js v5 con Credentials Provider (lib/auth/config.ts)**
Validación de credenciales cotejando `tenant_id`, hashing seguro con SHA-256 / scrypt, y persistencia de `tenantId` y `role` en el JWT.

- [ ] **Step 3: Crear Route Handler para NextAuth**
Exponer `GET` y `POST` en `app/api/auth/[...nextauth]/route.ts`.

- [ ] **Step 4: Verificar test de resolución de tenant y protección de rutas**
Probar que un request a `/dashboard` sin sesión redirige a `/login`, y con tenant válido inyecta el `tenantId`.

- [ ] **Step 5: Commit de autenticación y middleware**
`git add lib/auth middleware.ts app/api/auth && git commit -m "feat(auth): configure Auth.js v5 and multi-tenant subdomain middleware"`

---

### Task 4: API Endpoints Core y Seeder de Datos Clínicos

**Files:**
- Create: `app/api/tenants/route.ts`
- Create: `app/api/appointments/route.ts`
- Create: `app/api/appointments/[id]/route.ts`
- Create: `app/api/patients/route.ts`
- Create: `app/api/patients/[id]/route.ts`
- Create: `app/api/doctors/route.ts`
- Create: `app/api/slots/route.ts`
- Create: `scripts/seed.ts`
- Test: `tests/api.test.ts`

**Interfaces:**
- Consumes: `lib/db/queries/*`, Zod schemas
- Produces: Endpoints RESTful con validación y respuestas JSON semánticas

- [ ] **Step 1: Implementar endpoints de citas y verificación de slots (/api/slots, /api/appointments)**
Calcular slots libres evaluando el horario del médico (`time_slots`) menos las citas ya reservadas (`appointments`).
Controlar conflicto de sobre-reserva (doble turno).

- [ ] **Step 2: Implementar endpoints de pacientes e historias médicas (/api/patients)**
CRUD de pacientes con expediente (MRN), alergias, antecedentes y notas clínicas.

- [ ] **Step 3: Implementar endpoint de médicos y creación de tenant (/api/doctors, /api/tenants)**
Permitir el auto-registro de clínicas creando tenant, admin inicial y médico por defecto.

- [ ] **Step 4: Crear seeder para pruebas de demostración (scripts/seed.ts)**
Poblar clínica demo ("Clínica San Rafael", slug: `san-rafael`), 2 médicos (Medicina General y Cardiología), catálogo de horarios y citas de ejemplo.

- [ ] **Step 5: Ejecutar test de integración de API**
Verificar endpoint `/api/slots` devolviendo horarios libres y `/api/appointments` creando cita con éxito.

- [ ] **Step 6: Commit de API core y seeder**
`git add app/api scripts/seed.ts && git commit -m "feat(api): implement clinical appointments, patients, and slots REST endpoints"`

---

### Task 5: Motor del Agente de Voz IA (Web Speech + NLP en Español)

**Files:**
- Create: `lib/voice/dialogStates.ts`
- Create: `lib/voice/intentParser.ts`
- Create: `components/voice/useSpeechRecognition.ts`
- Create: `components/voice/useSpeechSynthesis.ts`
- Create: `components/voice/useVoiceDialog.ts`
- Test: `tests/intentParser.test.ts`

**Interfaces:**
- Consumes: Web Speech API del navegador (`SpeechRecognition`, `speechSynthesis`)
- Produces: Hook de orquestación conversacional `useVoiceDialog()` para agendamiento por voz en tiempo real

- [ ] **Step 1: Definir estados y tipos del diálogo médico (lib/voice/dialogStates.ts)**
Estados: `IDLE`, `GREETING`, `COLLECT_PATIENT_NAME`, `COLLECT_REASON`, `COLLECT_DOCTOR`, `COLLECT_DATE`, `SELECT_SLOT`, `CONFIRMATION`, `BOOKING`, `SUCCESS`, `ERROR`.

- [ ] **Step 2: Implementar analizador de intenciones médicas en español (lib/voice/intentParser.ts)**
Extracción de entidades en lenguaje natural:
  - Intenciones: `AGENDAR_CITA`, `CONSULTAR_HORARIOS`, `CONFIRMAR`, `CANCELAR`, `REPETIR`.
  - Extracción de fechas relativas ("hoy", "mañana", "el próximo martes", "15 de octubre").
  - Extracción de horas y momentos del día ("en la mañana", "10 y media", "3 de la tarde").
  - Extracción de síntomas o especialidades ("dolor de cabeza", "cardiología", "medicina general").

- [ ] **Step 3: Implementar hooks de audio (useSpeechRecognition y useSpeechSynthesis)**
Manejo de transcripción continua, eventos `onresult`, gestión de permisos del micrófono y síntesis de voz con dicción médica en español.

- [ ] **Step 4: Implementar máquina de estados del diálogo (useVoiceDialog.ts)**
Coordinar la conversación: solicitar slots disponibles vía fetch, verbalizar opciones al paciente, solicitar confirmación y ejecutar el POST a `/api/appointments`.

- [ ] **Step 5: Escribir tests unitarios para intentParser**
Validar frases típicas de pacientes latinoamericanos y españoles.

- [ ] **Step 6: Commit del motor de voz IA**
`git add lib/voice components/voice tests/intentParser.test.ts && git commit -m "feat(voice): implement Web Speech recognition, synthesis and NLP medical dialogue state machine"`

---

### Task 6: Sistema de Diseño UI y Layout SaaS Multi-Tenant

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Badge.tsx`, `components/ui/Card.tsx`, `components/ui/Input.tsx`, `components/ui/Modal.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/TenantProvider.tsx`
- Create: `app/(tenant)/layout.tsx`

**Interfaces:**
- Consumes: Tailwind CSS, Lucide icons, Framer Motion
- Produces: Layout administrativo y clínico responsive con navegación, información de la clínica y branding

- [ ] **Step 1: Crear componentes primitivos de UI accesibles (components/ui/*)**
Botones con estados de carga, tarjetas con sombras suaves, badges de estado de cita (`confirmada`, `pendiente`, `completada`, `cancelada`), modales accesibles.

- [ ] **Step 2: Crear componente Sidebar interactivo y responsive**
Navegación: Dashboard, Citas / Calendario, Pacientes, Médicos, Agente de Voz IA, Configuración de Clínica.

- [ ] **Step 3: Crear Header del consultorio con selector de tenant y perfil**
Muestra del subdominio actual, médico en turno y accesos rápidos a agendar.

- [ ] **Step 4: Integrar Layout y TenantProvider**
Proveer contexto global del tenant (`name`, `slug`, `role`) a todos los componentes hijos.

- [ ] **Step 5: Commit de componentes de diseño y layout**
`git add components/ui components/layout app/\(tenant\)/layout.tsx && git commit -m "feat(ui): implement healthcare design system, sidebar and tenant layout"`

---

### Task 7: Interfaz de Agendamiento y Calendario de Citas

**Files:**
- Create: `components/appointments/AppointmentCalendar.tsx`
- Create: `components/appointments/AppointmentBookingModal.tsx`
- Create: `components/appointments/TimeSlotPicker.tsx`
- Create: `app/(tenant)/appointments/page.tsx`
- Create: `app/(tenant)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `/api/appointments`, `/api/slots`, `/api/doctors`, `/api/patients`
- Produces: Dashboard ejecutivo de la clínica y vista de calendario con filtros y reserva rápida

- [ ] **Step 1: Crear Dashboard con métricas clave de salud (app/(tenant)/dashboard/page.tsx)**
Tarjetas KPI: Citas de Hoy, Pacientes Atendidos, Tasa de Asistencia, Citas Agendadas por el Agente de Voz. Gráfico visual de ocupación semanal.

- [ ] **Step 2: Construir vista de calendario semanal y lista de citas**
Visualización interactiva por franjas horarias y médicos, badges coloreados por estado y cambio de estado en un clic (`confirmar`, `atender`, `cancelar`).

- [ ] **Step 3: Construir modal de reserva manual de citas**
Selector de paciente existente o creación rápida al vuelo, selector de médico, selector de fecha y franja horaria disponible.

- [ ] **Step 4: Commit de pantallas de dashboard y citas**
`git add components/appointments app/\(tenant\)/appointments app/\(tenant\)/dashboard && git commit -m "feat(appointments): build clinical dashboard, interactive calendar and booking modal"`

---

### Task 8: Directorio de Pacientes e Historia Clínica

**Files:**
- Create: `components/patients/PatientList.tsx`
- Create: `components/patients/PatientFormModal.tsx`
- Create: `components/patients/MedicalHistoryView.tsx`
- Create: `app/(tenant)/patients/page.tsx`
- Create: `app/(tenant)/patients/[id]/page.tsx`

**Interfaces:**
- Consumes: `/api/patients`, `/api/patients/[id]`
- Produces: Directorio de pacientes, búsqueda instantánea, ficha clínica con historial de visitas y diagnósticos

- [ ] **Step 1: Implementar tabla de pacientes con búsqueda y paginación**
Búsqueda por nombre, documento de identidad o expediente (MRN), filtrado por género y fecha de registro.

- [ ] **Step 2: Construir formulario modal para alta/edición de paciente**
Validación de datos de contacto, tipo de sangre, alergias registradas y notas de antecedentes.

- [ ] **Step 3: Construir vista detallada de Historia Clínica (app/(tenant)/patients/[id]/page.tsx)**
Línea de tiempo de citas anteriores, diagnósticos médicos emitidos, recetas/tratamientos indicados y notas confidenciales.

- [ ] **Step 4: Commit del módulo de pacientes**
`git add components/patients app/\(tenant\)/patients && git commit -m "feat(patients): add patient directory and medical history timeline view"`

---

### Task 9: Experiencia Visual Interactiva del Agente de Voz IA

**Files:**
- Create: `components/voice/VoiceAgentModal.tsx`
- Create: `components/voice/VoiceWaveVisualizer.tsx`
- Create: `components/voice/VoiceTranscriptFeed.tsx`
- Create: `app/(tenant)/agent/page.tsx`

**Interfaces:**
- Consumes: `useVoiceDialog`, Web Audio API / CSS Canvas animation
- Produces: Sala de atención por voz con asistente virtual que escucha, habla y agenda citas automáticamente

- [ ] **Step 1: Diseñar visualizador de ondas sonoras médicas (VoiceWaveVisualizer.tsx)**
Ondas reactivas con Framer Motion que pulsan al ritmo de la voz del asistente o cuando el micrófono del paciente está activo.

- [ ] **Step 2: Construir feed de transcripción conversacional en tiempo real**
Burbujas de chat estilo mensajería médica mostrando el diálogo en vivo: respuestas del agente y transcripción de voz del paciente.

- [ ] **Step 3: Desarrollar pantalla completa del Agente (/agent/page.tsx)**
Selector de médico asignado al agente, botón grande interactivo de activación por voz (micrófono), tarjeta flotante con la cita sugerida lista para confirmar y panel de depuración de intenciones.

- [ ] **Step 4: Commit de la interfaz del agente de voz**
`git add components/voice app/\(tenant\)/agent && git commit -m "feat(voice-ui): build live voice agent room with audio wave visualizer and real-time dialogue"`

---

### Task 10: Configuración Cloudflare, Verificación Integral y Despliegue

**Files:**
- Create: `wrangler.toml`
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `README.md`
- Test: `tests/e2e-flow.test.ts`

**Interfaces:**
- Consumes: Cloudflare Pages / D1 bindings, Next.js build
- Produces: Plataforma lista para ejecutar localmente o desplegar en Cloudflare Pages con documentación operativa

- [ ] **Step 1: Construir páginas públicas de Login y Registro de Clínicas**
Formularios pulidos para iniciar sesión y para registrar una nueva clínica (generando subdominio de inmediato).

- [ ] **Step 2: Configurar wrangler.toml para Cloudflare Pages y D1**
Definir bindings de `DB`, `CACHE` (KV) y triggers de tareas programadas (recordatorios de citas diarias).

- [ ] **Step 3: Escribir suite de pruebas de flujo extremo a extremo**
Simular: Registro de clínica -> Creación de médico -> Consulta de slots -> Creación de cita manual y por voz.

- [ ] **Step 4: Ejecutar verificación completa de build y pruebas**
Ejecutar linter, tests automatizados y `npm run build` para validar cero errores de compilación TypeScript.

- [ ] **Step 5: Documentar en README.md las instrucciones de ejecución y despliegue**
Paso a paso para correr en local, ejecutar el seeder de demostración y desplegar en Cloudflare Pages.

- [ ] **Step 6: Commit final de integración y despliegue**
`git add wrangler.toml app/\(auth\) README.md tests/e2e-flow.test.ts && git commit -m "feat(deploy): complete auth pages, cloudflare configuration, tests and documentation"`
