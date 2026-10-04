import { resolveInvoiceType } from './invoice-resolver';

function assertEqual(actual: any, expected: any, msg: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`FAIL: ${msg} - expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}

async function runTests() {
  console.log('Running invoice-resolver tests...');
  
  // Test 1: MONO issuer always returns Factura C (11)
  const result1 = resolveInvoiceType(null, 'MONO');
  assertEqual(result1.cbteTipo, 11, 'MONO without client should return Factura C');
  assertEqual(result1.docTipo, 99, 'MONO without client should use Consumidor Final');

  // Test 2: RI issuer + CUIT client returns Factura A (1)
  const clientCuit = { id: 1, name: 'Empresa', docType: 'CUIT', docNumber: '30111111118' } as any;
  const result2 = resolveInvoiceType(clientCuit, 'RI');
  assertEqual(result2.cbteTipo, 1, 'RI + CUIT client should return Factura A');
  assertEqual(result2.docTipo, 80, 'RI + CUIT should map to docTipo 80');
  
  // Test 3: RI issuer + DNI client returns Factura B (6)
  const clientDni = { id: 2, name: 'Persona', docType: 'DNI', docNumber: '35111222' } as any;
  const result3 = resolveInvoiceType(clientDni, 'RI');
  assertEqual(result3.cbteTipo, 6, 'RI + DNI client should return Factura B');

  console.log('All tests passed!');
}

runTests().catch(e => {
  console.error(e.message);
  process.exit(1);
});
