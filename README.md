# MediSchedule — SaaS Médico Multi-Tenant con Agente de Voz IA

Plataforma SaaS integral para la gestión de consultorios y centros médicos, agendamiento inteligente de citas de pacientes y atención automatizada mediante **Agentes de Voz en Tiempo Real en Español**.

Desarrollada con **Next.js 14 (App Router)**, **Tailwind CSS**, **Cloudflare D1/KV** y **Web Speech API**.

---

## 🌟 Características Principales

1. **Agente de Voz IA Sanitario en Español**:
   - Reconocimiento de voz en tiempo real (`SpeechRecognition`) y síntesis de voz natural (`SpeechSynthesis`) en el navegador.
   - **Sin costes de APIs externas**: Opera al 100% en el cliente con Web Speech API nativa.
   - Motor NLP en español: comprensión de síntomas, especialidades médicas, fechas relativas ("hoy", "mañana", "el próximo jueves") y confirmaciones.
   - Máquina de estados finitos que guía al paciente paso a paso hasta agendar la consulta.
   - Visualizador reactivo de ondas sonoras médicas y canal alternativo de chat de texto.

2. **Arquitectura SaaS Multi-Tenant Aislada**:
   - Cada clínica cuenta con su propio subdominio (`clinica.medischedule.com`).
   - Resolución automática de tenant mediante middleware.
   - Aislamiento estricto de datos en SQLite / Cloudflare D1 mediante filtrado por `tenant_id`.

3. **Agendamiento y Prevención de Conflictos**:
   - Algoritmo de cálculo dinámico de franjas horarias disponibles según el horario del médico.
   - Bloqueo instantáneo de sobre-reserva (doble turno).
   - Calendario con filtros por médico, fecha y estado (`Confirmada`, `Pendiente`, `Atendida`, `Cancelada`).
   - Diferenciación visual de origen: `Voz IA`, `Portal Web`, `Recepción`.

4. **Directorio de Pacientes e Historia Clínica (EHR)**:
   - Registro de pacientes con código de expediente único (MRN).
   - Ficha de signos vitales (presión arterial, frecuencia cardíaca, saturación O2, peso).
   - Alertas visibles de alergias y tratamientos farmacológicos activos.
   - Línea de tiempo de evoluciones clínicas, diagnósticos y prescripciones.

5. **Cloudflare Ready**:
   - Configuración lista en `wrangler.toml` para Cloudflare Pages, base de datos D1, KV y R2.

---

## 🛠️ Stack Tecnológico

- **Frontend / Full-Stack**: Next.js 14 App Router, React 18, TypeScript.
- **Diseño y Estilos**: Tailwind CSS v3, Radix UI primitives, Lucide Icons, Framer Motion.
- **Estado y Caché**: TanStack Query (React Query v5).
- **Voz y Audio**: Web Speech API (`SpeechRecognition`, `SpeechSynthesis`), Web Audio API.
- **Autenticación**: Auth.js v5 con contraseñas seguras bajo `scrypt`.
- **Base de Datos**: Cloudflare D1 (SQLite compatible) + `better-sqlite3` en desarrollo local.

---

## 🚀 Inicio Rápido en Local

### 1. Requisitos
- Node.js 18+ (probado en Node.js v24).
- npm 9+.

### 2. Instalación de dependencias
```bash
npm install
```

### 3. Poblar base de datos con datos de demostración
Crea la clínica demo ("Clínica San Rafael"), médicos especialistas, pacientes con historias clínicas y citas de ejemplo:
```bash
npm run seed
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Credenciales de Demostración

- **URL de acceso**: `/login` o botón "Acceso Rápido con Clínica Demo"
- **Subdominio / Slug**: `demo` (o `san-rafael`)
- **Correo**: `admin@sanrafael.com`
- **Contraseña**: `admin1234`

---

## 🧪 Pruebas Automatizadas

El proyecto incluye 5 suites de tests automatizados que cubren la base de datos, aislamiento multi-tenant, middleware, NLP de voz y flujo E2E completo:

```bash
npm test
```

Suites individuales:
- `npx tsx tests/db.test.ts` — Aislamiento de datos multi-tenant y consultas.
- `npx tsx tests/middleware.test.ts` — Extracción de subdominios y hashing seguro.
- `npx tsx tests/intentParser.test.ts` — Analizador de lenguaje natural en español.
- `npx tsx tests/api.test.ts` — Endpoints de disponibilidad y citas.
- `npx tsx tests/e2e-flow.test.ts` — Flujo completo de registro, diálogo de voz y agendamiento.

---

## ☁️ Despliegue en Cloudflare Pages

1. **Autenticación en Cloudflare**:
   ```bash
   npx wrangler login
   ```

2. **Crear base de datos D1**:
   ```bash
   npx wrangler d1 create medischedule-db
   ```
   Actualiza el `database_id` en `wrangler.toml` con el ID generado.

3. **Ejecutar migraciones en Cloudflare D1**:
   ```bash
   npx wrangler d1 execute medischedule-db --file=./migrations/0001_initial_schema.sql
   ```

4. **Compilar y Desplegar**:
   ```bash
   npm run build
   npx wrangler pages deploy .next
   ```
