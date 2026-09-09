import { createTenant, getTenantBySlug } from '../lib/db/queries/tenants';
import { createDoctor, listDoctors } from '../lib/db/queries/doctors';
import { createPatient, listPatients } from '../lib/db/queries/patients';
import { createAppointment, listAppointments, getAvailableSlots } from '../lib/db/queries/appointments';

async function runDbTest() {
  console.log('--- Running DB & Tenant Isolation Tests ---');

  // 1. Create Tenant A
  const slugA = 'clinica-a-' + Date.now();
  const { tenant: tenantA } = createTenant({
    name: 'Clínica Santa María',
    slug: slugA,
    adminEmail: `admin@${slugA}.com`,
    adminPasswordHash: 'hash123',
    adminName: 'Dra. María Fernández',
  });
  console.log('✔ Tenant A created:', tenantA.slug);

  // 2. Create Tenant B
  const slugB = 'clinica-b-' + Date.now();
  const { tenant: tenantB } = createTenant({
    name: 'Centro Médico Del Sol',
    slug: slugB,
    adminEmail: `admin@${slugB}.com`,
    adminPasswordHash: 'hash456',
    adminName: 'Dr. Carlos Solano',
  });
  console.log('✔ Tenant B created:', tenantB.slug);

  // 3. Add Doctor to Tenant A
  const docA = createDoctor(tenantA.id, {
    name: 'Dr. Roberto Gómez',
    specialty: 'Cardiología',
  });
  console.log('✔ Doctor created in Tenant A:', docA.name);

  // 4. Add Patient to Tenant A
  const patA = createPatient(tenantA.id, {
    name: 'Juan Pérez',
    phone: '+34 600 123 456',
    email: 'juan.perez@example.com',
  });
  console.log('✔ Patient created in Tenant A:', patA.name, patA.mrn);

  // 5. Check slots for a future Monday
  const nextMonday = '2026-09-14'; // Valid Monday
  const slots = getAvailableSlots(tenantA.id, docA.id, nextMonday);
  console.log(`✔ Available slots on ${nextMonday}:`, slots.length, 'slots');
  if (slots.length === 0) throw new Error('Expected available slots for doctor');

  // 6. Book an appointment
  const chosenSlot = slots[0];
  const appt = createAppointment(tenantA.id, {
    patient_id: patA.id,
    doctor_id: docA.id,
    datetime: chosenSlot.datetime,
    reason: 'Control anual de hipertensión',
    booked_via: 'voice_agent',
  });
  console.log('✔ Appointment booked via voice agent:', appt.datetime, appt.patient_name);

  // 7. Verify slot is now unavailable
  const slotsAfter = getAvailableSlots(tenantA.id, docA.id, nextMonday);
  const slotStillThere = slotsAfter.find((s) => s.datetime === chosenSlot.datetime);
  if (slotStillThere && slotStillThere.available) {
    throw new Error('Slot should be marked as not available after booking!');
  }
  console.log('✔ Slot successfully occupied and marked unavailable.');

  // 8. Isolation check: Tenant B must see 0 patients and 0 appointments
  const patInB = listPatients(tenantB.id);
  const apptInB = listAppointments(tenantB.id);
  if (patInB.length !== 0 || apptInB.length !== 0) {
    throw new Error('Tenant isolation violated! Tenant B saw Tenant A data.');
  }
  console.log('✔ Multi-tenant isolation verified: Tenant B cannot access Tenant A data.');

  // Clean up test tenants so the database remains clean
  const db = (await import('../lib/db/client')).getDb();
  db.prepare('DELETE FROM tenants WHERE id IN (?, ?)').run(tenantA.id, tenantB.id);

  console.log('--- ALL DB TESTS PASSED SUCCESSFULLY! ---');
}

runDbTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
