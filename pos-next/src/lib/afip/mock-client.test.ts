/**
 * Smoke test for the AFIP Mock Client.
 *
 * Run with: npx tsx src/lib/afip/mock-client.test.ts
 *
 * Verifies the mock returns properly shaped data
 * that the sales.service.ts flow expects.
 */
import { createMockAfip } from './mock-client';

async function runMockTests() {
  console.log('=== AFIP Mock Client Tests ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ ${name}`);
      failed++;
    }
  }

  const mock = createMockAfip();

  // Test 1: getLastVoucher returns a number
  console.log('\n📋 getLastVoucher');
  const lastVoucher = await mock.ElectronicBilling.getLastVoucher(1, 11);
  assert(typeof lastVoucher === 'number', 'Returns a number');
  assert(lastVoucher > 0, 'Voucher number is positive');

  // Test 2: Subsequent calls increment
  const secondVoucher = await mock.ElectronicBilling.getLastVoucher(1, 11);
  assert(secondVoucher > lastVoucher, 'Counter increments between calls');

  // Test 3: createVoucher returns CAE and CAEFchVto
  console.log('\n📋 createVoucher');
  const payload = {
    CantReg: 1,
    PtoVta: 1,
    CbteTipo: 11,
    Concepto: 1,
    DocTipo: 99,
    DocNro: 0,
    CbteDesde: lastVoucher + 1,
    CbteHasta: lastVoucher + 1,
    CbteFch: 20261003,
    ImpTotal: 1500.50,
    ImpTotConc: 0,
    ImpOpEx: 0,
    ImpTrib: 0,
    ImpIVA: 0,
    ImpNeto: 1500.50,
    MonId: 'PES',
    MonCotiz: 1,
  };

  const res = await mock.ElectronicBilling.createVoucher(payload);
  assert('CAE' in res, 'Response contains CAE');
  assert('CAEFchVto' in res, 'Response contains CAEFchVto');
  assert(typeof res.CAE === 'string', 'CAE is a string');
  assert(res.CAE.length === 14, `CAE has 14 digits (got ${res.CAE.length})`);
  assert(typeof res.CAEFchVto === 'string', 'CAEFchVto is a string');
  assert(res.CAEFchVto.length === 8, `CAEFchVto has 8 chars (yyyyMMdd, got ${res.CAEFchVto.length})`);

  // Test 4: Multiple vouchers get different CAEs
  console.log('\n📋 Uniqueness');
  const res2 = await mock.ElectronicBilling.createVoucher(payload);
  assert(res.CAE !== res2.CAE, 'Different calls produce different CAEs');

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(40));

  process.exit(failed > 0 ? 1 : 0);
}

runMockTests();
