/**
 * MediSchedule API Client
 * Centralized, typed API connector linking frontend components to Next.js & Cloudflare Edge APIs
 */

export interface ApiDoctor {
  id: string;
  name: string;
  specialty: string;
  license_num?: string | null;
  bio?: string | null;
  active?: number;
}

export interface ApiPatient {
  id: string;
  mrn: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  dob?: string | null;
  blood_type?: string | null;
  allergies?: string | null;
  medications?: string | null;
  notes?: string | null;
}

export interface ApiSlot {
  time: string;
  datetime: string;
  available: boolean;
}

export interface ApiAppointment {
  id: string;
  tenant_id?: string;
  patient_id?: string;
  doctor_id: string;
  datetime: string;
  duration?: number;
  reason?: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string | null;
  booked_via: 'manual' | 'voice_agent' | 'online';
  patient_name?: string;
  patient_phone?: string;
  patient_email?: string;
  patient_mrn?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  created_at?: string;
}

export interface CreateAppointmentPayload {
  patient_name?: string;
  patient_id?: string;
  doctor_id: string;
  datetime: string;
  duration?: number;
  reason?: string;
  notes?: string;
  booked_via?: 'manual' | 'voice_agent' | 'online';
}

function getTenantSlugHeader(): string {
  if (typeof window === 'undefined') return 'demo';

  // 1. Check cookie
  const match = document.cookie.match(/(?:^|; )tenant_slug=([^;]*)/);
  if (match) return decodeURIComponent(match[1]);

  // 2. Check hostname subdomain
  const host = window.location.hostname.split(':')[0];
  if (host === 'localhost' || host === '127.0.0.1') return 'demo';
  const parts = host.split('.');
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'app' && parts[0] !== 'api') {
    return parts[0];
  }

  return 'demo';
}

async function safeFetchJson<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has('x-tenant-slug')) {
      headers.set('x-tenant-slug', getTenantSlugHeader());
    }

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      console.warn(`[API] ${options.method || 'GET'} ${url} returned ${res.status}`);
    }

    const text = await res.text();
    if (!text || (!text.trim().startsWith('{') && !text.trim().startsWith('['))) {
      return null;
    }
    return JSON.parse(text) as T;
  } catch (err) {
    console.warn(`[API] Network or parsing error for ${url}:`, err);
    return null;
  }
}

// 1. DOCTORS
export async function apiGetDoctors(): Promise<ApiDoctor[]> {
  const data = await safeFetchJson<{ doctors: ApiDoctor[] }>('/api/doctors');
  if (data?.doctors && data.doctors.length > 0) {
    return data.doctors;
  }

  // Resilient fallback for static demo
  return [
    {
      id: 'doc_yc83uckgmttqbj11',
      name: 'Dr. Alejandro Mendoza',
      specialty: 'Cardiología',
      license_num: 'COL-MED-62118',
      bio: 'Cardiólogo clínico intervencionista, experto en hipertensión arterial, ecocardiografía y arritmias.',
      active: 1,
    },
    {
      id: 'doc_ojolu4lpmttqbj12',
      name: 'Dra. Elena Vargas',
      specialty: 'Pediatría',
      license_num: 'COL-MED-93451',
      bio: 'Atención pediátrica integral, control del niño sano y urgencias respiratorias infantiles.',
      active: 1,
    },
    {
      id: 'doc_39ebgkzzmttqbj11',
      name: 'Dra. Sofía Morales',
      specialty: 'Medicina General',
      license_num: 'COL-MED-84920',
      bio: 'Especialista en medicina preventiva, control de enfermedades crónicas y chequeos integrales con más de 12 años de experiencia clínica.',
      active: 1,
    },
  ];
}

// 2. PATIENTS
export async function apiGetPatients(): Promise<ApiPatient[]> {
  const data = await safeFetchJson<{ patients: ApiPatient[] }>('/api/patients');
  if (data?.patients && data.patients.length > 0) {
    return data.patients;
  }

  return [
    {
      id: 'pat_anvm4atcmttqbj12',
      mrn: 'EXP-100234',
      name: 'María Fernanda López',
      phone: '+34 612 345 678',
      email: 'maria.lopez@example.com',
      blood_type: 'O+',
      notes: 'Paciente con rinitis alérgica estacional. Prefiere citas a primera hora.',
    },
    {
      id: 'pat_ltcghry1mttqbj12',
      mrn: 'EXP-100582',
      name: 'Carlos Eduardo Ruiz',
      phone: '+34 655 987 321',
      email: 'carlos.ruiz@example.com',
      blood_type: 'A+',
      notes: 'Hipertensión arterial grado 1 en control.',
    },
    {
      id: 'pat_h25o9ic0mttqbj12',
      mrn: 'EXP-100911',
      name: 'Lucía Méndez Gómez',
      phone: '+34 688 443 219',
      email: 'madre.lucia@example.com',
      blood_type: 'B+',
      notes: 'Control de crecimiento pediátrico al día.',
    },
  ];
}

// 3. SLOTS
export async function apiGetSlots(doctorId: string, date: string): Promise<ApiSlot[]> {
  const data = await safeFetchJson<{ slots: ApiSlot[] }>(
    `/api/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`
  );
  if (data?.slots && data.slots.length > 0) {
    return data.slots;
  }

  // Fallback slots
  const defaultTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  ];
  return defaultTimes.map((time) => ({
    time,
    datetime: `${date}T${time}:00`,
    available: true,
  }));
}

// 4. APPOINTMENTS
export async function apiGetAppointments(): Promise<ApiAppointment[]> {
  const data = await safeFetchJson<{ appointments: ApiAppointment[] }>('/api/appointments');
  if (data?.appointments && data.appointments.length > 0) {
    return data.appointments;
  }

  return [
    {
      id: 'apt_8gt61arlmttqbj13',
      patient_id: 'pat_anvm4atcmttqbj12',
      doctor_id: 'doc_39ebgkzzmttqbj11',
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
      id: 'apt_vwi5qpwimttqbj13',
      patient_id: 'pat_ltcghry1mttqbj12',
      doctor_id: 'doc_yc83uckgmttqbj11',
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
  ];
}

// 5. CREATE APPOINTMENT
export async function apiCreateAppointment(payload: CreateAppointmentPayload): Promise<ApiAppointment> {
  const res = await safeFetchJson<{ success: boolean; appointment: ApiAppointment }>('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res?.appointment) {
    return res.appointment;
  }

  // Graceful return for demo
  return {
    id: 'apt_' + Date.now().toString(36),
    doctor_id: payload.doctor_id,
    datetime: payload.datetime,
    duration: payload.duration || 30,
    reason: payload.reason || 'Consulta médica general',
    status: 'confirmed',
    booked_via: payload.booked_via || 'online',
    patient_name: payload.patient_name || 'Paciente',
    notes: payload.notes || 'Agendado desde la plataforma MediSchedule',
  };
}

// 6. UPDATE APPOINTMENT STATUS
export async function apiUpdateAppointmentStatus(id: string, status: string): Promise<boolean> {
  const res = await safeFetchJson<{ success: boolean }>(`/api/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return !!res?.success;
}

// 7. CREATE PATIENT
export async function apiCreatePatient(payload: {
  name: string;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
  blood_type?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
}): Promise<ApiPatient | null> {
  const res = await safeFetchJson<{ success: boolean; patient: ApiPatient }>('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res?.patient || null;
}
