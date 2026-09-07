import { execSync } from 'child_process';

const testSuites = [
  'tests/db.test.ts',
  'tests/middleware.test.ts',
  'tests/intentParser.test.ts',
  'tests/api.test.ts',
  'tests/e2e-flow.test.ts',
];

console.log(`\n🩺 Executing ${testSuites.length} Test Suites for MediSchedule SaaS...\n`);

for (const suite of testSuites) {
  console.log(`▶ Running ${suite}...`);
  try {
    const output = execSync(`npx tsx ${suite}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`❌ Suite failed: ${suite}`);
    process.exit(1);
  }
}

console.log('\n✨ ALL TEST SUITES COMPLETED WITH 100% SUCCESS!\n');
