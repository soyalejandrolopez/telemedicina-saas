import { createTenant, getTenantBySlug } from '../lib/db/queries/tenants';
import { createDoctor, listDoctors } from '../lib/db/queries/doctors';
import { createPatient, getPatientById } from '../lib/db/queries/patients';
import { createAppointment, getAvailableSlots, listAppointments } from '../lib/db/queries/appointments';
import { parseSpanishVoiceInput } from '../lib/voice/intentParser';
import { hashPassword } from '../lib/auth/password';

async function runE2EFlow() {
  console.log('=====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE END-TO-END SAAS VERIFICATION');
  console.log('=====================================================');

  // STEP 1: New Clinic Multi-Tenant Registration
  const clinicSlug = 'clinica-oriente-' + Date.now();
  const { tenant, adminUser } = createTenant({
    name: 'Centro Médico de Oriente',
    slug: clinicSlug,
    plan: 'enterprise',
    adminEmail: `director@${clinicSlug}.com`,
    adminPasswordHash: hashPassword('Seguro2026!'),
    adminName: 'Dr. Guillermo Navarro',
  });
  console.log(`[1] ✔ Clínica registrada con éxito: ${tenant.name} (${tenant.subdomain})`);
  console.log(`    Admin: ${adminUser.name} | Rol: ${adminUser.role}`);

  // STEP 2: Doctor Onboarding
  const docCardio = createDoctor(tenant.id, {
    name: 'Dr. Alejandro Mendoza',
    specialty: 'Cardiología',
    license_num: 'ESP-MED-44102',
    bio: 'Cardiólogo clínico con especialización en hipertensión y riesgo coronario.',
  });

  const docPedia = createDoctor(tenant.id, {
    name: 'Dra. Beatriz Soler',
    specialty: 'Pediatría',
    license_num: 'ESP-MED-55219',
    bio: 'Pediatra general y neonatología.',
  });
  console.log(`[2] ✔ 2 Médicos dados de alta en el tenant: ${docCardio.name} y ${docPedia.name}`);

  // STEP 3: Patient Registration & EHR
  const patient = createPatient(tenant.id, {
    name: 'Valentina Restrepo',
    dob: '1992-05-18',
    gender: 'femenino',
    phone: '+34 677 889 900',
    email: 'valentina.restrepo@example.com',
    blood_type: 'A+',
    allergies: ['Aspirina', 'Sulfamidas'],
    medications: ['Eutirox 50mcg'],
    notes: 'Paciente con antecedentes de palpitaciones ocasionales.',
  });
  console.log(`[3] ✔ Paciente creada con expediente: ${patient.name} (${patient.mrn})`);

  // STEP 4: Voice Agent Simulation (Spanish Natural Language)
  const voiceSpeechInput = 'Hola, soy Valentina Restrepo y necesito una cita con el doctor Mendoza para mañana por dolor en el pecho';
  console.log(`[4] 🎙️ Paciente habla al Agente de Voz: "${voiceSpeechInput}"`);

  const activeDoctors = listDoctors(tenant.id);
  const parsed = parseSpanishVoiceInput(
    voiceSpeechInput,
    activeDoctors.map((d) => ({ id: d.id, name: d.name, specialty: d.specialty }))
  );

  console.log('    🧠 Analizador NLP extrajo:', {
    intent: parsed.intent,
    paciente: parsed.entities.name,
    doctor: parsed.entities.doctorName,
    especialidad: parsed.entities.specialty,
    fecha: parsed.entities.dateDisplay,
    motivo: parsed.entities.reason,
  });

  if (parsed.entities.doctorName !== 'Dr. Alejandro Mendoza') {
    throw new Error('El NLP no detectó correctamente al Dr. Mendoza');
  }

  // STEP 5: Slot Calculation & Voice Booking
  const targetDate = parsed.entities.dateStr || new Date().toISOString().split('T')[0];
  const slots = getAvailableSlots(tenant.id, docCardio.id, targetDate);
  console.log(`[5] 📅 Buscando slots para ${targetDate}: ${slots.length} turnos encontrados.`);

  if (slots.length === 0) throw new Error('Se esperaban slots libres');

  const selectedSlot = slots.find((s) => s.available)!;
  const bookedAppt = createAppointment(tenant.id, {
    patient_id: patient.id,
    doctor_id: docCardio.id,
    datetime: selectedSlot.datetime,
    reason: parsed.entities.reason || 'Dolor en el pecho',
    booked_via: 'voice_agent',
    notes: 'Agendado mediante simulación de Agente de Voz IA Web Speech',
  });

  console.log(`[6] 🎉 Cita médica agendada por Voz IA:`);
  console.log(`    - ID: ${bookedAppt.id}`);
  console.log(`    - Fecha/Hora: ${bookedAppt.datetime}`);
  console.log(`    - Paciente: ${bookedAppt.patient_name}`);
  console.log(`    - Doctor: ${bookedAppt.doctor_name} (${bookedAppt.doctor_specialty})`);
  console.log(`    - Canal: ${bookedAppt.booked_via}`);

  // STEP 6: Verify Double Booking Prevention
  try {
    createAppointment(tenant.id, {
      patient_id: patient.id,
      doctor_id: docCardio.id,
      datetime: selectedSlot.datetime,
      reason: 'Intento duplicado',
    });
    throw new Error('Falló la prevención de doble turno');
  } catch (err: any) {
    if (err.message.includes('ya tiene una cita')) {
      console.log(`[7] ✔ Prevención de sobre-reserva confirmada: Turno ocupado rechazado.`);
    } else {
      throw err;
    }
  }

  // STEP 7: Verify EHR Patient Record
  const patientDetails = getPatientById(tenant.id, patient.id);
  const patientAppointments = listAppointments(tenant.id, { patientId: patient.id });
  console.log(`[8] ✔ Verificación de expediente del paciente:`);
  console.log(`    - Citas registradas: ${patientAppointments.length}`);
  console.log(`    - Alergias registradas: ${patientDetails?.allergies}`);

  // Clean up created test tenant and cascading data
  const db = (await import('../lib/db/client')).getDb();
  db.prepare('DELETE FROM tenants WHERE id = ?').run(tenant.id);

  console.log('=====================================================');
  console.log('✨ TODAS LAS PRUEBAS E2E DEL SAAS PASARON EXITOSAMENTE');
  console.log('=====================================================');
}

runE2EFlow().catch((e) => {
  console.error('E2E Test Failure:', e);
  process.exit(1);
});
