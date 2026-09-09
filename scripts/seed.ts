import { getDb } from '../lib/db/client';
import { hashPassword } from '../lib/auth/password';
import { createTenant } from '../lib/db/queries/tenants';
import { createDoctor } from '../lib/db/queries/doctors';
import { createPatient, addMedicalRecord } from '../lib/db/queries/patients';
import { createAppointment } from '../lib/db/queries/appointments';

async function seed() {
  console.log('🌱 Starting database seed for MediSchedule SaaS...');

  const db = getDb();

  // Clean all existing data to ensure a pristine database state
  console.log('Resetting and cleaning all tables...');
  db.exec(`
    DELETE FROM medical_records;
    DELETE FROM appointments;
    DELETE FROM time_slots;
    DELETE FROM patients;
    DELETE FROM doctors;
    DELETE FROM users;
    DELETE FROM tenants;
    VACUUM;
  `);

  // 1. Create Default Demo Clinic Tenant
  const passwordHash = hashPassword('admin1234');
  const { tenant } = createTenant({
    name: 'Clínica San Rafael',
    slug: 'demo',
    plan: 'pro',
    adminEmail: 'admin@sanrafael.com',
    adminPasswordHash: passwordHash,
    adminName: 'Dra. Sofía Morales (Directora Médica)',
  });
  console.log(`✔ Created Tenant: ${tenant.name} (${tenant.slug})`);

  // Also create "san-rafael" alias tenant for testing subdomain resolution
  const existingSanRafael = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('san-rafael') as { id: string } | undefined;
  if (!existingSanRafael) {
    createTenant({
      name: 'Centro Médico San Rafael',
      slug: 'san-rafael',
      plan: 'pro',
      adminEmail: 'contacto@sanrafael.com',
      adminPasswordHash: passwordHash,
      adminName: 'Administración San Rafael',
    });
  }

  // 2. Create Doctors
  const doc1 = createDoctor(tenant.id, {
    name: 'Dra. Sofía Morales',
    specialty: 'Medicina General',
    license_num: 'COL-MED-84920',
    bio: 'Especialista en medicina preventiva, control de enfermedades crónicas y chequeos integrales con más de 12 años de experiencia clínica.',
  });

  const doc2 = createDoctor(tenant.id, {
    name: 'Dr. Alejandro Mendoza',
    specialty: 'Cardiología',
    license_num: 'COL-MED-62118',
    bio: 'Cardiólogo clínico intervencionista, experto en hipertensión arterial, ecocardiografía y arritmias.',
  });

  const doc3 = createDoctor(tenant.id, {
    name: 'Dra. Elena Vargas',
    specialty: 'Pediatría',
    license_num: 'COL-MED-93451',
    bio: 'Atención pediátrica integral, control del niño sano y urgencias respiratorias infantiles.',
  });

  console.log(`✔ Created Doctors: ${doc1.name}, ${doc2.name}, ${doc3.name}`);

  // 3. Create Patients
  const pat1 = createPatient(tenant.id, {
    name: 'María Fernanda López',
    mrn: 'EXP-100234',
    dob: '1989-04-12',
    gender: 'femenino',
    phone: '+34 612 345 678',
    email: 'maria.lopez@example.com',
    blood_type: 'O+',
    allergies: ['Penicilina', 'Ibuprofeno'],
    medications: ['Loratadina 10mg'],
    notes: 'Paciente con rinitis alérgica estacional. Prefiere citas a primera hora.',
  });

  const pat2 = createPatient(tenant.id, {
    name: 'Carlos Eduardo Ruiz',
    mrn: 'EXP-100582',
    dob: '1975-11-23',
    gender: 'masculino',
    phone: '+34 655 987 321',
    email: 'carlos.ruiz@example.com',
    blood_type: 'A+',
    allergies: [],
    medications: ['Losartán 50mg', 'Aspirina 100mg'],
    notes: 'Hipertensión arterial grado 1 en control. Requiere monitoreo de presión.',
  });

  const pat3 = createPatient(tenant.id, {
    name: 'Lucía Méndez Gómez',
    mrn: 'EXP-100911',
    dob: '2018-06-15',
    gender: 'femenino',
    phone: '+34 688 443 219',
    email: 'madre.lucia@example.com',
    blood_type: 'B+',
    allergies: ['Frutos secos'],
    medications: ['Salbutamol aerosol si crisis'],
    notes: 'Control de crecimiento pediátrico al día.',
  });

  const pat4 = createPatient(tenant.id, {
    name: 'Javier Ramos Delgado',
    mrn: 'EXP-101402',
    dob: '1995-08-30',
    gender: 'masculino',
    phone: '+34 633 778 899',
    email: 'javier.ramos@example.com',
    blood_type: 'O-',
    allergies: [],
    medications: [],
    notes: 'Chequeo de medicina general y aptitud física deportiva.',
  });

  console.log(`✔ Created 4 realistic medical patient records`);

  // 4. Add Clinical History / Medical Records
  addMedicalRecord(tenant.id, {
    patient_id: pat2.id,
    doctor_id: doc2.id,
    diagnosis: 'Hipertensión arterial primaria controlada. Sin compromiso cardiovascular agudo.',
    treatment: 'Continuar régimen farmacológico con Losartán 50mg cada 24h. Dieta hiposódica y caminata diaria 30min.',
    prescriptions: ['Losartán 50mg - 30 comprimidos', 'Enalapril 10mg condicional'],
    vital_signs: { ta: '128/82', fc: '72 lpm', sat: '98%', peso: '78 kg' },
  });

  addMedicalRecord(tenant.id, {
    patient_id: pat1.id,
    doctor_id: doc1.id,
    diagnosis: 'Cefalea tensional recurrente secundaria a estrés postural.',
    treatment: 'Paracetamol 650mg cada 8h por 3 días si dolor. Terapia de relajación y pausas activas.',
    prescriptions: ['Paracetamol 650mg - 20 comprimidos'],
    vital_signs: { ta: '115/75', fc: '68 lpm', sat: '99%', peso: '62 kg' },
  });

  console.log(`✔ Created Electronic Health Records (EHR)`);

  // 5. Create Initial Appointments
  // Helper for dates in next few days
  const today = new Date();
  const formatIsoDate = (d: Date, time: string) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}T${time}:00`;
  };

  const d0 = new Date(today);
  const d1 = new Date(today);
  d1.setDate(d1.getDate() + 1);
  const d2 = new Date(today);
  d2.setDate(d2.getDate() + 2);

  createAppointment(tenant.id, {
    patient_id: pat1.id,
    doctor_id: doc1.id,
    datetime: formatIsoDate(d0, '10:00'),
    reason: 'Control de cefalea y fatiga general',
    status: 'confirmed',
    booked_via: 'voice_agent',
    notes: 'Agendado mediante el Agente de Voz IA de la clínica',
  });

  createAppointment(tenant.id, {
    patient_id: pat2.id,
    doctor_id: doc2.id,
    datetime: formatIsoDate(d0, '11:30'),
    reason: 'Seguimiento de presión arterial y electrocardiograma',
    status: 'confirmed',
    booked_via: 'manual',
  });

  createAppointment(tenant.id, {
    patient_id: pat3.id,
    doctor_id: doc3.id,
    datetime: formatIsoDate(d1, '09:30'),
    reason: 'Revisión pediátrica semestral de desarrollo',
    status: 'pending',
    booked_via: 'online',
  });

  createAppointment(tenant.id, {
    patient_id: pat4.id,
    doctor_id: doc1.id,
    datetime: formatIsoDate(d2, '14:00'),
    reason: 'Certificado de aptitud médica deportiva',
    status: 'confirmed',
    booked_via: 'voice_agent',
    notes: 'Agendado por voz',
  });

  console.log(`✔ Created initial appointments with diverse booking sources`);
  console.log('🎉 Seed completed successfully! Demo ready at slug: "demo" / user: admin@sanrafael.com');
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
