import { getDb, generateId } from '../client';
import { Appointment, AppointmentStatus, BookedVia } from '../schema';

export interface AppointmentWithDetails extends Appointment {
  patient_name: string;
  patient_phone?: string;
  patient_email?: string;
  patient_mrn: string;
  doctor_name: string;
  doctor_specialty: string;
}

export function listAppointments(
  tenantId: string,
  filters?: {
    date?: string; // "YYYY-MM-DD"
    doctorId?: string;
    patientId?: string;
    status?: string;
  }
): AppointmentWithDetails[] {
  const db = getDb();
  let query = `
    SELECT 
      a.*,
      p.name as patient_name,
      p.phone as patient_phone,
      p.email as patient_email,
      p.mrn as patient_mrn,
      d.name as doctor_name,
      d.specialty as doctor_specialty
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.tenant_id = ?
  `;

  const params: any[] = [tenantId];

  if (filters?.date) {
    query += ` AND a.datetime LIKE ?`;
    params.push(`${filters.date}%`);
  }

  if (filters?.doctorId) {
    query += ` AND a.doctor_id = ?`;
    params.push(filters.doctorId);
  }

  if (filters?.patientId) {
    query += ` AND a.patient_id = ?`;
    params.push(filters.patientId);
  }

  if (filters?.status && filters.status !== 'all') {
    query += ` AND a.status = ?`;
    params.push(filters.status);
  }

  query += ` ORDER BY a.datetime ASC`;

  const stmt = db.prepare(query);
  return stmt.all(...params) as AppointmentWithDetails[];
}

export function getAppointmentById(tenantId: string, id: string): AppointmentWithDetails | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      a.*,
      p.name as patient_name,
      p.phone as patient_phone,
      p.email as patient_email,
      p.mrn as patient_mrn,
      d.name as doctor_name,
      d.specialty as doctor_specialty
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.tenant_id = ? AND a.id = ?
  `);
  return (stmt.get(tenantId, id) as AppointmentWithDetails) || null;
}

export function createAppointment(tenantId: string, data: {
  patient_id: string;
  doctor_id: string;
  datetime: string;
  duration?: number;
  reason?: string;
  status?: AppointmentStatus;
  notes?: string;
  booked_via?: BookedVia;
}): AppointmentWithDetails {
  const db = getDb();

  // Double booking check: Ensure doctor doesn't already have an active appointment at this exact time
  const conflictStmt = db.prepare(`
    SELECT id FROM appointments
    WHERE tenant_id = ? AND doctor_id = ? AND datetime = ? AND status != 'cancelled'
  `);
  const conflict = conflictStmt.get(tenantId, data.doctor_id, data.datetime);
  if (conflict) {
    throw new Error('El médico ya tiene una cita programada en ese horario.');
  }

  const id = 'apt_' + generateId();
  const stmt = db.prepare(`
    INSERT INTO appointments (
      id, tenant_id, patient_id, doctor_id, datetime, duration,
      reason, status, notes, booked_via, reminder_sent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  stmt.run(
    id,
    tenantId,
    data.patient_id,
    data.doctor_id,
    data.datetime,
    data.duration || 30,
    data.reason || null,
    data.status || 'confirmed',
    data.notes || null,
    data.booked_via || 'manual'
  );

  return getAppointmentById(tenantId, id)!;
}

export function updateAppointmentStatus(
  tenantId: string,
  id: string,
  status: AppointmentStatus,
  notes?: string
): AppointmentWithDetails | null {
  const db = getDb();
  if (notes !== undefined) {
    db.prepare('UPDATE appointments SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?')
      .run(status, notes, tenantId, id);
  } else {
    db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?')
      .run(status, tenantId, id);
  }
  return getAppointmentById(tenantId, id);
}

export function getAvailableSlots(
  tenantId: string,
  doctorId: string,
  dateStr: string // "YYYY-MM-DD"
): { time: string; datetime: string; available: boolean }[] {
  const db = getDb();

  // Calculate day of week (0=Sunday ... 6=Saturday)
  const targetDate = new Date(`${dateStr}T12:00:00Z`);
  const dayOfWeek = targetDate.getUTCDay();

  // Get doctor's config for that day
  const slotConfigStmt = db.prepare(`
    SELECT * FROM time_slots 
    WHERE doctor_id = ? AND day_of_week = ? AND active = 1
  `);
  const config = slotConfigStmt.get(doctorId, dayOfWeek) as any;

  if (!config) {
    // Doctor does not work on this day
    return [];
  }

  // Generate slots every duration minutes between start_time and end_time
  const [startHour, startMin] = config.start_time.split(':').map(Number);
  const [endHour, endMin] = config.end_time.split(':').map(Number);
  const duration = config.slot_duration || 30;

  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  // Get already booked appointments for this doctor on this day
  const bookedStmt = db.prepare(`
    SELECT datetime FROM appointments
    WHERE tenant_id = ? AND doctor_id = ? AND datetime LIKE ? AND status != 'cancelled'
  `);
  const bookedRows = bookedStmt.all(tenantId, doctorId, `${dateStr}%`) as { datetime: string }[];
  const bookedSet = new Set(bookedRows.map((r) => r.datetime));

  const slots: { time: string; datetime: string; available: boolean }[] = [];

  for (let mins = startTotalMins; mins < endTotalMins; mins += duration) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const dtStr = `${dateStr}T${timeStr}:00`;

    slots.push({
      time: timeStr,
      datetime: dtStr,
      available: !bookedSet.has(dtStr),
    });
  }

  return slots;
}
