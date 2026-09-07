import { getDb, generateId } from '../client';
import { Doctor, TimeSlotConfig } from '../schema';

export function listDoctors(tenantId: string): Doctor[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM doctors WHERE tenant_id = ? AND active = 1 ORDER BY name ASC');
  return stmt.all(tenantId) as Doctor[];
}

export function getDoctorById(tenantId: string, id: string): Doctor | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM doctors WHERE tenant_id = ? AND id = ? AND active = 1');
  return (stmt.get(tenantId, id) as Doctor) || null;
}

export function createDoctor(tenantId: string, data: {
  name: string;
  specialty: string;
  license_num?: string;
  bio?: string;
  photo_url?: string;
}): Doctor {
  const db = getDb();
  const id = 'doc_' + generateId();
  const stmt = db.prepare(`
    INSERT INTO doctors (id, tenant_id, name, specialty, license_num, bio, photo_url, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);
  stmt.run(id, tenantId, data.name, data.specialty, data.license_num || null, data.bio || null, data.photo_url || null);

  // Setup standard business week schedules (Mon-Fri 09:00 - 17:00)
  const slotStmt = db.prepare(`
    INSERT INTO time_slots (id, doctor_id, day_of_week, start_time, end_time, slot_duration, active)
    VALUES (?, ?, ?, '09:00', '17:00', 30, 1)
  `);

  for (let day = 1; day <= 5; day++) {
    slotStmt.run('ts_' + generateId(), id, day);
  }

  return getDoctorById(tenantId, id)!;
}

export function getDoctorSlotsConfig(doctorId: string): TimeSlotConfig[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM time_slots WHERE doctor_id = ? AND active = 1 ORDER BY day_of_week ASC');
  return stmt.all(doctorId) as TimeSlotConfig[];
}
