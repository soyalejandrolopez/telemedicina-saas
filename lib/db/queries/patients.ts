import { getDb, generateId } from '../client';
import { Patient, MedicalRecord } from '../schema';

export function listPatients(tenantId: string, search?: string): Patient[] {
  const db = getDb();
  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    const stmt = db.prepare(`
      SELECT * FROM patients 
      WHERE tenant_id = ? AND (name LIKE ? OR mrn LIKE ? OR phone LIKE ? OR email LIKE ?)
      ORDER BY name ASC
    `);
    return stmt.all(tenantId, q, q, q, q) as Patient[];
  }

  const stmt = db.prepare('SELECT * FROM patients WHERE tenant_id = ? ORDER BY created_at DESC');
  return stmt.all(tenantId) as Patient[];
}

export function getPatientById(tenantId: string, id: string): (Patient & { records?: MedicalRecord[] }) | null {
  const db = getDb();
  const patientStmt = db.prepare('SELECT * FROM patients WHERE tenant_id = ? AND id = ?');
  const patient = patientStmt.get(tenantId, id) as Patient | undefined;
  if (!patient) return null;

  const recordsStmt = db.prepare('SELECT * FROM medical_records WHERE tenant_id = ? AND patient_id = ? ORDER BY created_at DESC');
  const records = recordsStmt.all(tenantId, id) as MedicalRecord[];

  return { ...patient, records };
}

export function createPatient(tenantId: string, data: {
  name: string;
  mrn?: string;
  dob?: string;
  gender?: 'masculino' | 'femenino' | 'otro';
  phone?: string;
  email?: string;
  address?: string;
  blood_type?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
}): Patient {
  const db = getDb();
  const id = 'pat_' + generateId();
  const mrn = data.mrn || 'EXP-' + Math.floor(100000 + Math.random() * 900000);

  const stmt = db.prepare(`
    INSERT INTO patients (
      id, tenant_id, mrn, name, dob, gender, phone, email, address,
      blood_type, allergies, medications, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    tenantId,
    mrn,
    data.name,
    data.dob || null,
    data.gender || null,
    data.phone || null,
    data.email || null,
    data.address || null,
    data.blood_type || null,
    JSON.stringify(data.allergies || []),
    JSON.stringify(data.medications || []),
    data.notes || null
  );

  return getPatientById(tenantId, id)!;
}

export function addMedicalRecord(tenantId: string, data: {
  patient_id: string;
  doctor_id?: string;
  appointment_id?: string;
  diagnosis: string;
  treatment?: string;
  prescriptions?: string[];
  vital_signs?: Record<string, any>;
}): MedicalRecord {
  const db = getDb();
  const id = 'rec_' + generateId();

  const stmt = db.prepare(`
    INSERT INTO medical_records (
      id, tenant_id, patient_id, doctor_id, appointment_id,
      diagnosis, treatment, prescriptions, vital_signs
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    tenantId,
    data.patient_id,
    data.doctor_id || null,
    data.appointment_id || null,
    data.diagnosis,
    data.treatment || null,
    JSON.stringify(data.prescriptions || []),
    JSON.stringify(data.vital_signs || {})
  );

  return db.prepare('SELECT * FROM medical_records WHERE id = ?').get(id) as MedicalRecord;
}
