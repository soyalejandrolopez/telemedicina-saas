CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subdomain TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'pro',
  config TEXT NOT NULL DEFAULT '{}',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO tenants VALUES('t_zzsbs1s5mtukub35','Clínica San Rafael','demo','demo.medischedule.com','pro','{}',1,'2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO tenants VALUES('t_7j2bqpt9mtukub35','Centro Médico San Rafael','san-rafael','san-rafael.medischedule.com','pro','{}',1,'2026-09-09 20:54:49','2026-09-09 20:54:49');
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'receptionist', 'patient')),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, email)
);
INSERT INTO users VALUES('u_bn60vj3lmtukub35','t_zzsbs1s5mtukub35','admin@sanrafael.com','31a9fc0aff06435abd97fd6484736f3d:0fa5ffeb3d1646ebbf39d4186088fcab528afea016866d8dc0a27dbbb74ee24e9d3061437f2dd8d475e42ce4b91214006d8a793f5119bd8e51a9c67f44f1313a','Dra. Sofía Morales (Directora Médica)','admin',1,'2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO users VALUES('u_k4yq2zfymtukub35','t_7j2bqpt9mtukub35','contacto@sanrafael.com','31a9fc0aff06435abd97fd6484736f3d:0fa5ffeb3d1646ebbf39d4186088fcab528afea016866d8dc0a27dbbb74ee24e9d3061437f2dd8d475e42ce4b91214006d8a793f5119bd8e51a9c67f44f1313a','Administración San Rafael','admin',1,'2026-09-09 20:54:49','2026-09-09 20:54:49');
CREATE TABLE doctors (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  license_num TEXT,
  bio TEXT,
  photo_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO doctors VALUES('doc_9um6jsq7mtukub35','t_zzsbs1s5mtukub35',NULL,'Dra. Sofía Morales','Medicina General','COL-MED-84920','Especialista en medicina preventiva, control de enfermedades crónicas y chequeos integrales con más de 12 años de experiencia clínica.',NULL,1,'2026-09-09 20:54:49');
INSERT INTO doctors VALUES('doc_047jgbd1mtukub35','t_zzsbs1s5mtukub35',NULL,'Dr. Alejandro Mendoza','Cardiología','COL-MED-62118','Cardiólogo clínico intervencionista, experto en hipertensión arterial, ecocardiografía y arritmias.',NULL,1,'2026-09-09 20:54:49');
INSERT INTO doctors VALUES('doc_h7hj069rmtukub36','t_zzsbs1s5mtukub35',NULL,'Dra. Elena Vargas','Pediatría','COL-MED-93451','Atención pediátrica integral, control del niño sano y urgencias respiratorias infantiles.',NULL,1,'2026-09-09 20:54:49');
CREATE TABLE time_slots (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration INTEGER NOT NULL DEFAULT 30,
  active INTEGER NOT NULL DEFAULT 1
);
INSERT INTO time_slots VALUES('ts_8we6bkajmtukub35','doc_9um6jsq7mtukub35',1,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_m7g7k2y1mtukub35','doc_9um6jsq7mtukub35',2,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_556pzwtxmtukub35','doc_9um6jsq7mtukub35',3,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_djm84th8mtukub35','doc_9um6jsq7mtukub35',4,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_vlfvyiiumtukub35','doc_9um6jsq7mtukub35',5,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_ohf4ghlxmtukub35','doc_047jgbd1mtukub35',1,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_goul8xlwmtukub35','doc_047jgbd1mtukub35',2,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_igqf4rfbmtukub35','doc_047jgbd1mtukub35',3,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_j4zc7ad4mtukub35','doc_047jgbd1mtukub35',4,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_lho2epezmtukub36','doc_047jgbd1mtukub35',5,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_biad46zhmtukub36','doc_h7hj069rmtukub36',1,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_o5nnpatnmtukub36','doc_h7hj069rmtukub36',2,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_kk1lmij9mtukub36','doc_h7hj069rmtukub36',3,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_t7j8g76emtukub36','doc_h7hj069rmtukub36',4,'09:00','17:00',30,1);
INSERT INTO time_slots VALUES('ts_91g14w7mmtukub36','doc_h7hj069rmtukub36',5,'09:00','17:00',30,1);
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  mrn TEXT NOT NULL,
  name TEXT NOT NULL,
  dob TEXT,
  gender TEXT CHECK (gender IN ('masculino', 'femenino', 'otro')),
  phone TEXT,
  email TEXT,
  address TEXT,
  blood_type TEXT,
  allergies TEXT DEFAULT '[]',
  medications TEXT DEFAULT '[]',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, mrn)
);
INSERT INTO patients VALUES('pat_bclrfygqmtukub36','t_zzsbs1s5mtukub35','EXP-100234','María Fernanda López','1989-04-12','femenino','+34 612 345 678','maria.lopez@example.com',NULL,'O+','["Penicilina","Ibuprofeno"]','["Loratadina 10mg"]','Paciente con rinitis alérgica estacional. Prefiere citas a primera hora.','2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO patients VALUES('pat_bymsx96dmtukub36','t_zzsbs1s5mtukub35','EXP-100582','Carlos Eduardo Ruiz','1975-11-23','masculino','+34 655 987 321','carlos.ruiz@example.com',NULL,'A+','[]','["Losartán 50mg","Aspirina 100mg"]','Hipertensión arterial grado 1 en control. Requiere monitoreo de presión.','2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO patients VALUES('pat_9jnikz15mtukub36','t_zzsbs1s5mtukub35','EXP-100911','Lucía Méndez Gómez','2018-06-15','femenino','+34 688 443 219','madre.lucia@example.com',NULL,'B+','["Frutos secos"]','["Salbutamol aerosol si crisis"]','Control de crecimiento pediátrico al día.','2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO patients VALUES('pat_fqt9tkjjmtukub36','t_zzsbs1s5mtukub35','EXP-101402','Javier Ramos Delgado','1995-08-30','masculino','+34 633 778 899','javier.ramos@example.com',NULL,'O-','[]','[]','Chequeo de medicina general y aptitud física deportiva.','2026-09-09 20:54:49','2026-09-09 20:54:49');
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  doctor_id TEXT NOT NULL REFERENCES doctors(id),
  datetime TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  booked_via TEXT DEFAULT 'manual' CHECK (booked_via IN ('manual', 'voice_agent', 'online')),
  reminder_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO appointments VALUES('apt_93d57qcnmtukub37','t_zzsbs1s5mtukub35','pat_bclrfygqmtukub36','doc_9um6jsq7mtukub35','2026-09-09T10:00:00',30,'Control de cefalea y fatiga general','confirmed','Agendado mediante el Agente de Voz IA de la clínica','voice_agent',0,'2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO appointments VALUES('apt_2e7dmi5vmtukub37','t_zzsbs1s5mtukub35','pat_bymsx96dmtukub36','doc_047jgbd1mtukub35','2026-09-09T11:30:00',30,'Seguimiento de presión arterial y electrocardiograma','confirmed',NULL,'manual',0,'2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO appointments VALUES('apt_ducxi85pmtukub37','t_zzsbs1s5mtukub35','pat_9jnikz15mtukub36','doc_h7hj069rmtukub36','2026-09-10T09:30:00',30,'Revisión pediátrica semestral de desarrollo','pending',NULL,'online',0,'2026-09-09 20:54:49','2026-09-09 20:54:49');
INSERT INTO appointments VALUES('apt_zzsztpnimtukub37','t_zzsbs1s5mtukub35','pat_fqt9tkjjmtukub36','doc_9um6jsq7mtukub35','2026-09-11T14:00:00',30,'Certificado de aptitud médica deportiva','confirmed','Agendado por voz','voice_agent',0,'2026-09-09 20:54:49','2026-09-09 20:54:49');
CREATE TABLE medical_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  doctor_id TEXT REFERENCES doctors(id),
  appointment_id TEXT REFERENCES appointments(id),
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  prescriptions TEXT DEFAULT '[]',
  vital_signs TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO medical_records VALUES('rec_hqrjkcnkmtukub36','t_zzsbs1s5mtukub35','pat_bymsx96dmtukub36','doc_047jgbd1mtukub35',NULL,'Hipertensión arterial primaria controlada. Sin compromiso cardiovascular agudo.','Continuar régimen farmacológico con Losartán 50mg cada 24h. Dieta hiposódica y caminata diaria 30min.','["Losartán 50mg - 30 comprimidos","Enalapril 10mg condicional"]','{"ta":"128/82","fc":"72 lpm","sat":"98%","peso":"78 kg"}','2026-09-09 20:54:49');
INSERT INTO medical_records VALUES('rec_9l9ykfwsmtukub36','t_zzsbs1s5mtukub35','pat_bclrfygqmtukub36','doc_9um6jsq7mtukub35',NULL,'Cefalea tensional recurrente secundaria a estrés postural.','Paracetamol 650mg cada 8h por 3 días si dolor. Terapia de relajación y pausas activas.','["Paracetamol 650mg - 20 comprimidos"]','{"ta":"115/75","fc":"68 lpm","sat":"99%","peso":"62 kg"}','2026-09-09 20:54:49');
CREATE INDEX idx_appointments_tenant_dt ON appointments(tenant_id, datetime);
CREATE INDEX idx_appointments_doc_dt ON appointments(doctor_id, datetime);
CREATE INDEX idx_patients_tenant ON patients(tenant_id);
CREATE INDEX idx_doctors_tenant ON doctors(tenant_id);
