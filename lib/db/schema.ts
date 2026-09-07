export type TenantPlan = 'free' | 'pro' | 'enterprise';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  plan: TenantPlan;
  config: string; // JSON string
  active: number;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'patient';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  tenant_id: string;
  user_id?: string | null;
  name: string;
  specialty: string;
  license_num?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  active: number;
  created_at: string;
}

export interface TimeSlotConfig {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string; // "09:00"
  end_time: string; // "17:00"
  slot_duration: number; // minutes, default 30
  active: number;
}

export type Gender = 'masculino' | 'femenino' | 'otro';

export interface Patient {
  id: string;
  tenant_id: string;
  mrn: string; // Medical Record Number
  name: string;
  dob?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  blood_type?: string | null;
  allergies?: string | null; // JSON array
  medications?: string | null; // JSON array
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type BookedVia = 'manual' | 'voice_agent' | 'online';

export interface Appointment {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id: string;
  datetime: string; // ISO 8601: "YYYY-MM-DDTHH:mm:ss"
  duration: number;
  reason?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
  booked_via: BookedVia;
  reminder_sent: number;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_id?: string | null;
  appointment_id?: string | null;
  diagnosis: string;
  treatment?: string | null;
  prescriptions?: string | null; // JSON array
  vital_signs?: string | null; // JSON string
  created_at: string;
}
