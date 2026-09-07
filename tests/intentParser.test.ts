import { parseSpanishVoiceInput } from '../lib/voice/intentParser';

const testDoctors = [
  { id: '1', name: 'Dra. Sofía Morales', specialty: 'Medicina General' },
  { id: '2', name: 'Dr. Alejandro Mendoza', specialty: 'Cardiología' },
];

console.log('--- Testing Spanish Voice NLP Parser ---');

// 1. Intent: Greeting + Name
const res1 = parseSpanishVoiceInput('Hola, me llamo Juan Carlos Pérez', testDoctors);
console.log('Test 1:', res1.intent, res1.entities);
if (res1.entities.name !== 'Juan Carlos Pérez') throw new Error(`Name extraction failed: ${res1.entities.name}`);

// 2. Doctor matching by last name
const res2 = parseSpanishVoiceInput('Quiero atenderme con el doctor Mendoza', testDoctors);
console.log('Test 2:', res2.intent, res2.entities);
if (res2.entities.doctorName !== 'Dr. Alejandro Mendoza') throw new Error('Doctor matching failed');

// 3. Specialty matching
const res3 = parseSpanishVoiceInput('Necesito una consulta de cardiología', testDoctors);
console.log('Test 3:', res3.intent, res3.entities);
if (res3.entities.specialty !== 'Cardiología') throw new Error('Specialty matching failed');

// 4. Relative date: "mañana"
const res4 = parseSpanishVoiceInput('Quisiera ir mañana por favor', testDoctors);
console.log('Test 4:', res4.intent, res4.entities);
if (!res4.entities.dateStr) throw new Error('Date extraction for "mañana" failed');

// 5. Confirmation
const res5 = parseSpanishVoiceInput('Sí, por favor confirmo los datos');
console.log('Test 5:', res5.intent);
if (res5.intent !== 'CONFIRM') throw new Error('Confirmation intent failed');

// 6. Time extraction: "a las 10 de la mañana"
const res6 = parseSpanishVoiceInput('Prefiero a las 10 de la mañana');
console.log('Test 6:', res6.intent, res6.entities);
if (res6.entities.time !== '10:00') throw new Error(`Expected 10:00, got ${res6.entities.time}`);

console.log('--- ALL NLP INTENT PARSER TESTS PASSED! ---');
