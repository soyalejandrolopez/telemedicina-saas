export interface ParsedVoiceResult {
  rawText: string;
  intent:
    | 'CONFIRM'
    | 'DENY'
    | 'GREET'
    | 'FAREWELL'
    | 'BOOK_APPOINTMENT'
    | 'PROVIDE_NAME'
    | 'PROVIDE_DOCTOR'
    | 'PROVIDE_DATE'
    | 'PROVIDE_TIME'
    | 'PROVIDE_REASON'
    | 'UNKNOWN';
  entities: {
    name?: string;
    doctorName?: string;
    specialty?: string;
    dateStr?: string; // "YYYY-MM-DD"
    dateDisplay?: string;
    time?: string; // "10:00"
    reason?: string;
  };
}

export function parseSpanishVoiceInput(
  rawText: string,
  knownDoctors: { id: string; name: string; specialty: string }[] = []
): ParsedVoiceResult {
  const text = rawText.trim().toLowerCase();
  const result: ParsedVoiceResult = {
    rawText,
    intent: 'UNKNOWN',
    entities: {},
  };

  if (!text) return result;

  // 1. Farewells (adiós, hasta luego, chao, etc.) - suspend conversation
  if (
    /(hasta luego|hasta pronto|adiós|adios|chao|chau|nos vemos|eso es todo|muchas gracias adiós|muchas gracias adios|terminar|finalizar|suspender|cancelar todo)/iu.test(text)
  ) {
    result.intent = 'FAREWELL';
    return result;
  }

  // 2. Confirmations (Handle Unicode accents like sí)
  if (/^(sí|si|claro|correcto|afirmativo|confirmo|confirmar|está bien|exacto|dale|perfecto|por favor|de acuerdo)($|[\s,.:])/iu.test(text) ||
      /\b(confirmo|confirmar|está bien|de acuerdo)\b/iu.test(text)) {
    result.intent = 'CONFIRM';
    return result;
  }

  // 2. Denials
  if (/^(no|cancelar|rechazar|ninguno|otro|cambiar|incorrecto|negativo)($|[\s,.:])/iu.test(text) ||
      /\b(cancelar|no quiero|ninguno|otro horario)\b/iu.test(text)) {
    result.intent = 'DENY';
    return result;
  }

  // 3. Greetings
  if (/^(hola|buenos días|buenas tardes|buenas noches|saludos|qué tal)/iu.test(text)) {
    result.intent = 'GREET';
  }

  // 4. Intent to book appointment
  if (/(quiero|necesito|agendar|sacar|pedir|solicitar|programar)\s+(una\s+)?(cita|consulta|turno|hora|visita)/iu.test(text)) {
    result.intent = 'BOOK_APPOINTMENT';
  }

  // 5. Name extraction ("me llamo ...", "soy ...", "mi nombre es ...")
  const nameMatch = text.match(/(?:me llamo|soy|mi nombre es|habla)\s+([a-záéíóúñ\s]+)/iu);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    // Capitalize words
    result.entities.name = rawName
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    result.intent = 'PROVIDE_NAME';
  }

  // 6. Doctor or Specialty matching
  for (const doc of knownDoctors) {
    const lastName = doc.name.split(' ').pop()?.toLowerCase();
    const firstName = doc.name.split(' ')[1]?.toLowerCase();
    const specialtyLower = doc.specialty.toLowerCase();

    if (
      (lastName && text.includes(lastName)) ||
      (firstName && text.includes(firstName)) ||
      text.includes(doc.name.toLowerCase())
    ) {
      result.entities.doctorName = doc.name;
      result.entities.specialty = doc.specialty;
      result.intent = 'PROVIDE_DOCTOR';
      break;
    } else if (text.includes(specialtyLower)) {
      result.entities.doctorName = doc.name;
      result.entities.specialty = doc.specialty;
      result.intent = 'PROVIDE_DOCTOR';
      break;
    }
  }

  // Generic specialty fallback
  if (!result.entities.specialty) {
    if (/cardio|corazón/iu.test(text)) result.entities.specialty = 'Cardiología';
    else if (/pediat|niño|niña/iu.test(text)) result.entities.specialty = 'Pediatría';
    else if (/general|médico general|chequeo/iu.test(text)) result.entities.specialty = 'Medicina General';
  }

  // 7. Date extraction ("hoy", "mañana", "pasado mañana", "lunes", "martes", etc.)
  const now = new Date();
  const getIso = (d: Date) => {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (/hoy/iu.test(text)) {
    result.entities.dateStr = getIso(now);
    result.entities.dateDisplay = 'hoy';
    result.intent = 'PROVIDE_DATE';
  } else if (/pasado mañana/iu.test(text)) {
    const target = new Date(now);
    target.setDate(target.getDate() + 2);
    result.entities.dateStr = getIso(target);
    result.entities.dateDisplay = 'pasado mañana';
    result.intent = 'PROVIDE_DATE';
  } else if (/mañana/iu.test(text) && !/de la mañana/iu.test(text)) {
    const target = new Date(now);
    target.setDate(target.getDate() + 1);
    result.entities.dateStr = getIso(target);
    result.entities.dateDisplay = 'mañana';
    result.intent = 'PROVIDE_DATE';
  } else {
    // Days of week
    const daysMap: Record<string, number> = {
      domingo: 0,
      lunes: 1,
      martes: 2,
      miércoles: 3,
      miercoles: 3,
      jueves: 4,
      viernes: 5,
      sábado: 6,
      sabado: 6,
    };

    for (const [dayName, targetDayNum] of Object.entries(daysMap)) {
      if (new RegExp(`(?:^|[\\s,.:])${dayName}(?:$|[\\s,.:])`, 'iu').test(text)) {
        const currentDayNum = now.getDay();
        let daysAhead = (targetDayNum - currentDayNum + 7) % 7;
        if (daysAhead === 0) daysAhead = 7; // Next week if same day

        const target = new Date(now);
        target.setDate(target.getDate() + daysAhead);
        result.entities.dateStr = getIso(target);
        result.entities.dateDisplay = `el próximo ${dayName}`;
        result.intent = 'PROVIDE_DATE';
        break;
      }
    }
  }

  // 8. Time extraction ("a las 10", "10:30", "3 de la tarde", "11 y media")
  const timeRegex = /\b(1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm|de la mañana|de la tarde)?\b/iu;
  const timeMatch = text.match(timeRegex);

  if (timeMatch && (text.includes('las') || text.includes('hora') || timeMatch[3])) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : text.includes('media') ? 30 : 0;
    const period = timeMatch[3]?.toLowerCase();

    if ((period?.includes('pm') || period?.includes('tarde')) && hour < 12) {
      hour += 12;
    } else if (period?.includes('am') && hour === 12) {
      hour = 0;
    } else if (!period && hour >= 1 && hour <= 6) {
      hour += 12;
    }

    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    result.entities.time = formattedTime;
    result.intent = 'PROVIDE_TIME';
  }

  // 9. Reason extraction
  if (/dolor|molestia|control|revisión|chequeo|gripe|fiebre|tos|receta|presión|estrés|estres|consulta/iu.test(text)) {
    result.entities.reason = rawText.replace(/^(tengo|siento|quiero una consulta por|es por|vengo por)\s+/iu, '').trim();
    if (result.intent === 'UNKNOWN') {
      result.intent = 'PROVIDE_REASON';
    }
  }

  return result;
}
