import { extractTenantSlug } from '../lib/tenant/resolver';
import { hashPassword, verifyPassword } from '../lib/auth/password';

async function testAuthAndResolver() {
  console.log('--- Running Auth & Tenant Resolver Tests ---');

  // Test slug extractor
  const slug1 = extractTenantSlug('clinica-norte.medischedule.com:3000');
  if (slug1 !== 'clinica-norte') throw new Error(`Expected clinica-norte, got ${slug1}`);
  console.log('✔ Subdomain extracted correctly:', slug1);

  const slug2 = extractTenantSlug('localhost:3000');
  if (slug2 !== 'demo') throw new Error(`Expected demo, got ${slug2}`);
  console.log('✔ Localhost fallback to demo verified:', slug2);

  // Test password hashing and verification
  const pass = 'ClinicaSecret2026!';
  const hashed = hashPassword(pass);
  if (!verifyPassword(pass, hashed)) throw new Error('Password verification failed for correct password');
  if (verifyPassword('WrongPass', hashed)) throw new Error('Password verification should fail for wrong password');
  console.log('✔ Password scrypt hashing and timing-safe verification verified.');

  console.log('--- ALL AUTH & RESOLVER TESTS PASSED! ---');
}

testAuthAndResolver().catch((e) => {
  console.error(e);
  process.exit(1);
});
