import { buildVoucherPayload } from './voucher-builder';

function assertEqual(actual: any, expected: any, msg: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`FAIL: ${msg}\nExpected: ${JSON.stringify(expected, null, 2)}\nActual: ${JSON.stringify(actual, null, 2)}`);
  }
}

async function runTests() {
  console.log('Running voucher-builder tests...');
  
  const baseParams = {
    pos: 1,
    docTipo: 99,
    docNro: '0',
    nextVoucher: 100,
    total: 121,
  };

  // Test 1: Factura C (or B) should NOT discriminate VAT
  const resultC = buildVoucherPayload({ ...baseParams, cbteTipo: 11 });
  assertEqual(resultC.ImpTotal, 121, 'Factura C total should be 121');
  assertEqual(resultC.ImpNeto, 121, 'Factura C net should equal total');
  assertEqual(resultC.ImpIVA, 0, 'Factura C IVA should be 0');
  if (resultC.Iva) throw new Error('Factura C should not have Iva array');

  // Test 2: Factura A should discriminate VAT (21%)
  const resultA = buildVoucherPayload({ ...baseParams, cbteTipo: 1 });
  assertEqual(resultA.ImpTotal, 121, 'Factura A total should be 121');
  assertEqual(resultA.ImpNeto, 100, 'Factura A net should be total / 1.21');
  assertEqual(resultA.ImpIVA, 21, 'Factura A IVA should be 21');
  assertEqual(resultA.Iva?.length, 1, 'Factura A should have Iva array');
  assertEqual(resultA.Iva[0].Id, 5, 'Factura A IVA should be 21% (Id: 5)');
  assertEqual(resultA.Iva[0].BaseImp, 100, 'Factura A IVA BaseImp should be 100');
  assertEqual(resultA.Iva[0].Importe, 21, 'Factura A IVA Importe should be 21');

  console.log('All tests passed!');
}

runTests().catch(e => {
  console.error(e.message);
  process.exit(1);
});
