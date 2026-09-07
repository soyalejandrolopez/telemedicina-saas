export type DialogStep =
  | 'IDLE'                  // Esperando inicio
  | 'GREETING'              // Saludo inicial y solicitud de nombre
  | 'COLLECT_REASON'        // ¿Cuál es el motivo de su consulta?
  | 'COLLECT_DOCTOR'        // ¿Con qué médico o especialidad desea agendar?
  | 'COLLECT_DATE'          // ¿Qué día prefiere para su cita?
  | 'SELECT_SLOT'           // Opciones de horarios disponibles
  | 'CONFIRMATION'          // Confirmación verbal de los datos
  | 'BOOKING'               // Guardando cita en base de datos
  | 'SUCCESS'               // Cita agendada con éxito
  | 'ERROR';                // Error o excepción

export interface DialogContext {
  patientName?: string;
  patientPhone?: string;
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  dateStr?: string; // YYYY-MM-DD
  dateDisplay?: string; // e.g. "miércoles 16 de septiembre"
  slotTime?: string; // "10:00"
  slotDatetime?: string; // "YYYY-MM-DDTHH:mm:00"
  availableSlots?: { time: string; datetime: string; available: boolean }[];
  reason?: string;
  appointmentId?: string;
  lastTranscript?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'agent' | 'user' | 'system';
  text: string;
  timestamp: Date;
  step?: DialogStep;
}
