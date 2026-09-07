import { getTenantBySlug } from '../lib/db/queries/tenants';
import { listDoctors } from '../lib/db/queries/doctors';
import { listPatients } from '../lib/db/queries/patients';
import { listAppointments, getAvailableSlots, createAppointment } from '../lib/db/queries/appointments';

async function testApiLogic() {
  console.log('--- Running API Logic & Core Endpoints Tests ---');

  const tenant = getTenantBySlug('demo');
  if (!tenant) throw new Error('Demo tenant not found');
  console.log('✔ Tenant found:', tenant.name);

  // 1. Check doctors
  const doctors = listDoctors(tenant.id);
  if (doctors.length < 3) throw new Error(`Expected at least 3 doctors, got ${doctors.length}`);
  console.log(`✔ Found ${doctors.length} active doctors.`);

  // 2. Check patients search
  const allPatients = listPatients(tenant.id);
  const searchResults = listPatients(tenant.id, 'María');
  if (searchResults.length === 0) throw new Error('Expected patient search to match "María"');
  console.log(`✔ Patient search verified: found ${searchResults.length} matching "María".`);

  // 3. Test slot generation for next Wednesday
  const doc = doctors[0];
  const testDate = '2026-09-16'; // Wednesday
  const slots = getAvailableSlots(tenant.id, doc.id, testDate);
  if (slots.length === 0) throw new Error('Expected available slots for doctor on Wednesday');
  console.log(`✔ Generated ${slots.length} time slots for ${doc.name} on ${testDate}`);

  // 4. Test appointment booking via API logic
  const slotToBook = slots.find(s => s.available)!;
  const newAppt = createAppointment(tenant.id, {
    patient_id: allPatients[0].id,
    doctor_id: doc.id,
    datetime: slotToBook.datetime,
    reason: 'Prueba de agendamiento API',
    booked_via: 'voice_agent',
  });
  if (!newAppt.id) throw new Error('Failed to create appointment');
  console.log(`✔ Successfully booked appointment at ${newAppt.datetime} via voice_agent`);

  // 5. Test conflict prevention (double booking)
  try {
    createAppointment(tenant.id, {
      patient_id: allPatients[1].id,
      doctor_id: doc.id,
      datetime: slotToBook.datetime,
      reason: 'Intento de doble turno',
    });
    throw new Error('Double booking should have thrown an error!');
  } catch (err: any) {
    if (err.message.includes('ya tiene una cita')) {
      console.log('✔ Conflict prevention verified: rejected double-booking on same slot.');
    } else {
      throw err;
    }
  }

  console.log('--- ALL API LOGIC TESTS PASSED! ---');
}

testApiLogic().catch((e) => {
  console.error(e);
  process.exit(1);
});
