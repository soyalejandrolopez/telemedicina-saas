# MediSchedule SaaS — Design Specification

**Date:** 2026-09-07  
**Version:** 1.0  
**Status:** Approved

---

## 1. Resumen Ejecutivo

**MediSchedule** es una plataforma SaaS multi-tenant para la gestión de citas médicas en consultorios y clínicas. Permite a cada clínica operar en su propio subdominio (`clinica.medischedule.com`), gestionar pacientes, médicos, agendas y citas; e incluye un **agente de voz IA** basado en Web Speech API para que los pacientes agenden citas por voz directamente desde el navegador, sin costo de API externa.

**Stack:**
- Frontend/Backend: Next.js 14 App Router (TypeScript)
- Estilos: Tailwind CSS v3 + shadcn/ui + Radix UI + Framer Motion
- Estado servidor: TanStack Query (React Query)
- Auth: Auth.js v5 (NextAuth)
- Base de datos: Cloudflare D1 (SQL, SQLite-compatible) + Cloudflare KV (cache/sesiones)
- Almacenamiento: Cloudflare R2 (documentos)
- Despliegue: Cloudflare Pages + Pages Functions (SSR/API)
- Idioma: Español exclusivamente

---

## 2. Arquitectura del Sistema

### 2.1 Estructura de Carpetas

```
medischedule/
├── app/
│   ├── (auth)/                    # Rutas públicas: login, registro
│   ├── (tenant)/                  # Rutas protegidas por tenant
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── schedule/
│   │   └── agent/                 # Agente de voz IA
│   ├── (admin)/                   # Super-admin plataforma
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── appointments/
│       ├── patients/
│       ├── doctors/
│       ├── slots/
│       └── reminders/
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── voice/
│   │   ├── VoiceAgent.tsx
│   │   ├── useVoiceDialog.ts
│   │   ├── useSpeechRecognition.ts
│   │   ├── useSpeechSynthesis.ts
│   │   └── intentParser.ts
│   ├── appointments/
│   ├── patients/
│   ├── layout/
│   └── shared/
├── lib/
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── queries/
│   ├── auth/config.ts
│   ├── tenant/resolver.ts
│   └── utils/
├── middleware.ts
├── migrations/
├── wrangler.toml
└── next.config.js
```

### 2.2 Flujo Multi-Tenant

```
Request: https://clinicagarcia.medischedule.com/dashboard
         │
middleware.ts
  ├── Extrae subdominio: "clinicagarcia"
  ├── Busca tenantId en KV (TTL 1h)
  ├── Inyecta header X-Tenant-Id
  ├── Verifica sesión Auth.js JWT
  └── Redirige a /login si no autenticado
         │
Page / API Route
  └── Todas las queries incluyen WHERE tenant_id = ?
```

---

## 3. Base de Datos — Esquema D1/SQLite

```sql
CREATE TABLE tenants (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  subdomain  TEXT NOT NULL UNIQUE,
  plan       TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
  config     TEXT NOT NULL DEFAULT '{}',
  active     INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','doctor','receptionist','patient')),
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, email)
);

CREATE TABLE doctors (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialty   TEXT NOT NULL,
  license_num TEXT,
  bio         TEXT,
  photo_url   TEXT,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE time_slots (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  doctor_id     TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30,
  active        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE patients (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  mrn         TEXT NOT NULL,
  name        TEXT NOT NULL,
  dob         TEXT,
  gender      TEXT CHECK (gender IN ('masculino','femenino','otro')),
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  blood_type  TEXT,
  allergies   TEXT,
  medications TEXT,
  notes       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(tenant_id, mrn)
);

CREATE TABLE appointments (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  tenant_id     TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id    TEXT NOT NULL REFERENCES patients(id),
  doctor_id     TEXT NOT NULL REFERENCES doctors(id),
  datetime      TEXT NOT NULL,
  duration      INTEGER NOT NULL DEFAULT 30,
  reason        TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  notes         TEXT,
  booked_via    TEXT DEFAULT 'manual'
                CHECK (booked_via IN ('manual','voice_agent','online')),
  reminder_sent INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE medical_records (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  appointment_id TEXT NOT NULL REFERENCES appointments(id),
  patient_id     TEXT NOT NULL REFERENCES patients(id),
  tenant_id      TEXT NOT NULL REFERENCES tenants(id),
  diagnosis      TEXT,
  treatment      TEXT,
  prescriptions  TEXT,
  attachments    TEXT,
  created_by     TEXT NOT NULL REFERENCES users(id),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_appointments_tenant_datetime ON appointments(tenant_id, datetime);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, datetime);
CREATE INDEX idx_patients_tenant ON patients(tenant_id);
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
```

---

## 4. API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/tenants` | Registro nueva clínica |
| GET | `/api/appointments` | Lista citas (filtros: fecha, doctor, status) |
| POST | `/api/appointments` | Crear cita |
| PATCH | `/api/appointments/[id]` | Actualizar estado/notas |
| DELETE | `/api/appointments/[id]` | Cancelar cita |
| GET | `/api/slots` | Slots disponibles por doctor + fecha |
| GET | `/api/patients` | Lista pacientes con búsqueda/paginación |
| POST | `/api/patients` | Crear paciente |
| GET | `/api/patients/[id]` | Historia clínica completa |
| PATCH | `/api/patients/[id]` | Actualizar datos |
| GET | `/api/doctors` | Lista médicos del tenant |
| POST | `/api/doctors` | Crear médico |
| PUT | `/api/doctors/[id]/schedule` | Configurar horarios |
| GET | `/api/reminders` | Cron: enviar recordatorios |

---

## 5. Agente de Voz IA

### 5.1 Estados del Diálogo

```
IDLE → GREETING → COLLECT_REASON → COLLECT_DOCTOR
     → COLLECT_DATE → COLLECT_TIME → CONFIRM
     → BOOKING → SUCCESS | ERROR | FALLBACK
```

### 5.2 Motor NLP Local (español)

Patrones de detección en `intentParser.ts`:
- Agendar: `/quiero|necesito|agendar|cita|consulta|turno/i`
- Días: `/lunes|martes|miércoles|jueves|viernes|mañana|hoy|próximo/i`
- Horas: `/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|mañana|tarde)?\b/i`
- Confirmación: `/sí|si|correcto|exacto|confirmo|adelante/i`
- Negación: `/no|incorrecto|cambiar|otro/i`

### 5.3 Flujo Conversacional

```
Agente: "Hola, soy el asistente de la clínica. ¿Con quién tengo el gusto?"
Paciente: "Soy María López"
Agente: "Mucho gusto, María. ¿Cuál es el motivo de su consulta?"
Paciente: "Tengo dolor de cabeza frecuente"
Agente: "¿Tiene preferencia de médico o especialidad?"
Paciente: "Con el Dr. García, neurología"
Agente: "¿Qué fecha prefiere?"
Paciente: "El próximo martes"
Agente: "Tengo disponible las 10:00 AM y 3:00 PM. ¿Cuál prefiere?"
Paciente: "Las 10"
Agente: "Confirmo: cita Dr. García, martes 10 de sep, 10:00 AM. ¿Correcto?"
Paciente: "Sí"
Agente: "¡Listo! Cita agendada. ¡Hasta pronto!"
```

---

## 6. Autenticación y Roles

### Auth.js v5 — JWT strategy con campos:
- `token.tenantId` — UUID del tenant
- `token.role` — admin | doctor | receptionist

### Permisos por rol:
| Rol | Acceso |
|-----|--------|
| `admin` | CRUD completo: médicos, pacientes, citas, configuración |
| `doctor` | Sus citas + historias clínicas |
| `receptionist` | Citas + ver pacientes (sin historia clínica) |

---

## 7. Diseño Visual

- **Paleta**: Azul profundo `#0F2D6B` + Verde sanitario `#00A896` + Blanco + Grises cálidos
- **Tipografía**: `Inter` (UI) + `Outfit` (headings)
- **Componentes**: shadcn/ui sobre Radix UI (WCAG 2.1 AA)
- **Animaciones**: Framer Motion (transiciones página, modales, burbuja de voz)
- **Modo**: Light (Dark en v2)

---

## 8. Cloudflare wrangler.toml

```toml
name = "medischedule"
compatibility_date = "2024-09-23"
pages_build_output_dir = ".next"

[[d1_databases]]
binding = "DB"
database_name = "medischedule-db"
database_id = "PLACEHOLDER"

[[kv_namespaces]]
binding = "CACHE"
id = "PLACEHOLDER"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "medischedule-files"

[triggers]
crons = ["0 8 * * *"]
```

---

## 9. Fases de Implementación

| Fase | Duración | Contenido |
|------|----------|-----------|
| 1 — Fundación | Semanas 1-2 | Setup Next.js + Cloudflare + Auth + Middleware multi-tenant + Landing + Login |
| 2 — Core SaaS | Semanas 3-4 | Dashboard + Calendario citas + CRUD pacientes + CRUD médicos + horarios |
| 3 — Agente Voz | Semana 5 | Speech hooks + NLP local + Máquina de estados + UI del agente |
| 4 — Pulido | Semana 6 | Recordatorios Cron + Animaciones + Tests E2E + Despliegue Cloudflare Pages |
