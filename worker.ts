/**
 * Cloudflare Worker Entrypoint with Static Assets & Dynamic API
 * MediSchedule SaaS
 */

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB?: any; // Cloudflare D1 Database binding if attached
}

const DEFAULT_DOCTORS = [
  {
    id: 'doc_9um6jsq7mtukub35',
    name: 'Dra. Sofía Morales',
    specialty: 'Medicina General',
    license_num: 'COL-MED-84920',
    bio: 'Especialista en medicina preventiva, control de enfermedades crónicas y chequeos integrales.',
    active: 1,
  },
  {
    id: 'doc_047jgbd1mtukub35',
    name: 'Dr. Alejandro Mendoza',
    specialty: 'Cardiología',
    license_num: 'COL-MED-62118',
    bio: 'Cardiólogo clínico intervencionista, experto en hipertensión arterial y arritmias.',
    active: 1,
  },
  {
    id: 'doc_h7hj069rmtukub36',
    name: 'Dra. Elena Vargas',
    specialty: 'Pediatría',
    license_num: 'COL-MED-93451',
    bio: 'Atención pediátrica integral, control del niño sano y urgencias respiratorias infantiles.',
    active: 1,
  },
];

const DEFAULT_PATIENTS = [
  {
    id: 'pat_bclrfygqmtukub36',
    mrn: 'EXP-100234',
    name: 'María Fernanda López',
    phone: '+34 612 345 678',
    email: 'maria.lopez@example.com',
    blood_type: 'O+',
    allergies: '["Penicilina","Ibuprofeno"]',
    medications: '["Loratadina 10mg"]',
    notes: 'Paciente con rinitis alérgica estacional. Prefiere citas a primera hora.',
  },
  {
    id: 'pat_bymsx96dmtukub36',
    mrn: 'EXP-100582',
    name: 'Carlos Eduardo Ruiz',
    phone: '+34 655 987 321',
    email: 'carlos.ruiz@example.com',
    blood_type: 'A+',
    allergies: '[]',
    medications: '["Losartán 50mg","Aspirina 100mg"]',
    notes: 'Hipertensión arterial grado 1 en control.',
  },
  {
    id: 'pat_9jnikz15mtukub36',
    mrn: 'EXP-100911',
    name: 'Lucía Méndez Gómez',
    phone: '+34 688 443 219',
    email: 'madre.lucia@example.com',
    blood_type: 'B+',
    allergies: '["Frutos secos"]',
    medications: '["Salbutamol aerosol si crisis"]',
    notes: 'Control de crecimiento pediátrico al día.',
  },
  {
    id: 'pat_fqt9tkjjmtukub36',
    mrn: 'EXP-101402',
    name: 'Javier Ramos Delgado',
    phone: '+34 633 778 899',
    email: 'javier.ramos@example.com',
    blood_type: 'O-',
    allergies: '[]',
    medications: '[]',
    notes: 'Chequeo de medicina general y aptitud física deportiva.',
  },
];

const DEFAULT_APPOINTMENTS = [
  {
    id: 'apt_93d57qcnmtukub37',
    patient_id: 'pat_bclrfygqmtukub36',
    doctor_id: 'doc_9um6jsq7mtukub35',
    datetime: '2026-09-09T10:00:00',
    duration: 30,
    reason: 'Control de cefalea y fatiga general',
    status: 'confirmed',
    notes: 'Agendado mediante el Agente de Voz IA de la clínica',
    booked_via: 'voice_agent',
    patient_name: 'María Fernanda López',
    patient_phone: '+34 612 345 678',
    doctor_name: 'Dra. Sofía Morales',
    doctor_specialty: 'Medicina General',
  },
  {
    id: 'apt_2e7dmi5vmtukub37',
    patient_id: 'pat_bymsx96dmtukub36',
    doctor_id: 'doc_047jgbd1mtukub35',
    datetime: '2026-09-09T11:30:00',
    duration: 30,
    reason: 'Seguimiento de presión arterial y electrocardiograma',
    status: 'confirmed',
    notes: 'Control periódico',
    booked_via: 'manual',
    patient_name: 'Carlos Eduardo Ruiz',
    patient_phone: '+34 655 987 321',
    doctor_name: 'Dr. Alejandro Mendoza',
    doctor_specialty: 'Cardiología',
  },
  {
    id: 'apt_ducxi85pmtukub37',
    patient_id: 'pat_9jnikz15mtukub36',
    doctor_id: 'doc_h7hj069rmtukub36',
    datetime: '2026-09-10T09:30:00',
    duration: 30,
    reason: 'Revisión pediátrica semestral de desarrollo',
    status: 'pending',
    notes: 'Primera consulta infantil',
    booked_via: 'online',
    patient_name: 'Lucía Méndez Gómez',
    patient_phone: '+34 688 443 219',
    doctor_name: 'Dra. Elena Vargas',
    doctor_specialty: 'Pediatría',
  },
  {
    id: 'apt_zzsztpnimtukub37',
    patient_id: 'pat_fqt9tkjjmtukub36',
    doctor_id: 'doc_9um6jsq7mtukub35',
    datetime: '2026-09-11T14:00:00',
    duration: 30,
    reason: 'Certificado de aptitud médica deportiva',
    status: 'confirmed',
    notes: 'Agendado por voz',
    booked_via: 'voice_agent',
    patient_name: 'Javier Ramos Delgado',
    patient_phone: '+34 633 778 899',
    doctor_name: 'Dra. Sofía Morales',
    doctor_specialty: 'Medicina General',
  },
];

// In-memory runtime cache for edge sessions
let runtimeAppointments = [...DEFAULT_APPOINTMENTS];
let runtimePatients = [...DEFAULT_PATIENTS];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-slug',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 1. /api/doctors
    if (pathname === '/api/doctors') {
      return jsonResponse({ doctors: DEFAULT_DOCTORS, count: DEFAULT_DOCTORS.length });
    }

    // 2. /api/patients
    if (pathname === '/api/patients') {
      if (request.method === 'GET') {
        return jsonResponse({ patients: runtimePatients, count: runtimePatients.length });
      }
      if (request.method === 'POST') {
        try {
          const body: any = await request.json().catch(() => ({}));
          const newPatient = {
            id: 'pat_' + Math.random().toString(36).substring(2, 11),
            mrn: 'EXP-' + Math.floor(100000 + Math.random() * 900000),
            name: body.name || 'Nuevo Paciente',
            phone: body.phone || '+34 600 000 000',
            email: body.email || 'paciente@example.com',
            dob: body.dob || '1990-01-01',
            blood_type: body.blood_type || 'O+',
            allergies: JSON.stringify(body.allergies || []),
            medications: JSON.stringify(body.medications || []),
            notes: body.notes || 'Registrado desde portal',
          };
          runtimePatients.unshift(newPatient);
          return jsonResponse({ success: true, patient: newPatient }, 201);
        } catch (err: any) {
          return jsonResponse({ error: err.message }, 500);
        }
      }
    }

    // 3. /api/slots
    if (pathname === '/api/slots') {
      const doctorId = searchParams.get('doctorId') || DEFAULT_DOCTORS[0].id;
      const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

      const defaultTimes = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      ];

      // Exclude slots already taken in runtimeAppointments
      const takenDatetimes = new Set(
        runtimeAppointments
          .filter((a) => a.doctor_id === doctorId && a.datetime.startsWith(dateStr) && a.status !== 'cancelled')
          .map((a) => a.datetime)
      );

      const slots = defaultTimes.map((time) => {
        const datetime = `${dateStr}T${time}:00`;
        return {
          time,
          datetime,
          available: !takenDatetimes.has(datetime),
        };
      });

      const availableCount = slots.filter((s) => s.available).length;
      return jsonResponse({ slots, count: slots.length, availableCount, doctorId, date: dateStr });
    }

    // 4. /api/appointments
    if (pathname === '/api/appointments') {
      if (request.method === 'GET') {
        return jsonResponse({ appointments: runtimeAppointments, count: runtimeAppointments.length });
      }
      if (request.method === 'POST') {
        try {
          const body: any = await request.json().catch(() => ({}));
          const doctor = DEFAULT_DOCTORS.find((d) => d.id === body.doctor_id) || DEFAULT_DOCTORS[0];

          const newAppt = {
            id: 'apt_' + Math.random().toString(36).substring(2, 11),
            patient_id: body.patient_id || 'pat_demo',
            doctor_id: doctor.id,
            datetime: body.datetime || new Date().toISOString(),
            duration: body.duration || 30,
            reason: body.reason || 'Consulta médica',
            status: 'confirmed',
            notes: body.notes || 'Agendado mediante MediSchedule',
            booked_via: body.booked_via || 'voice_agent',
            patient_name: body.patient_name || 'Paciente',
            patient_phone: body.patient_phone || '+34 600 000 000',
            doctor_name: doctor.name,
            doctor_specialty: doctor.specialty,
            created_at: new Date().toISOString(),
          };

          runtimeAppointments.unshift(newAppt);
          return jsonResponse({ success: true, appointment: newAppt }, 201);
        } catch (err: any) {
          return jsonResponse({ error: err.message }, 500);
        }
      }
    }

    // 5. /api/appointments/:id (PATCH)
    if (pathname.startsWith('/api/appointments/')) {
      const id = pathname.replace('/api/appointments/', '');
      if (request.method === 'PATCH') {
        const body: any = await request.json().catch(() => ({}));
        const appt = runtimeAppointments.find((a) => a.id === id);
        if (appt && body.status) {
          appt.status = body.status;
        }
        return jsonResponse({ success: true, appointment: appt });
      }
    }

    // 6. /api/tenants
    if (pathname === '/api/tenants') {
      const body: any = await request.json().catch(() => ({}));
      return jsonResponse({
        success: true,
        tenant: {
          id: 't_' + Math.random().toString(36).substring(2, 11),
          name: body.name || 'Clínica Demo',
          slug: (body.slug || 'clinica-demo').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        },
      }, 201);
    }

    // Default: Serve Static Assets from out/ directory
    try {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) {
        return assetRes;
      }

      // If route is a known SPA clean route, try fetching index.html of that route
      const cleanPaths = ['/dashboard', '/appointments', '/patients', '/agent', '/doctors'];
      if (cleanPaths.some((cp) => pathname.startsWith(cp))) {
        const fallbackReq = new Request(new URL('/login.html', request.url), request);
        return env.ASSETS.fetch(fallbackReq);
      }

      return assetRes;
    } catch {
      return new Response('Asset not found', { status: 404 });
    }
  },
};
