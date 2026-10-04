import { getAfip } from './index';
import { resolveInvoiceType } from './index';
import { buildVoucherPayload } from './index';

function assertTruthy(actual: any, msg: string) {
  if (!actual) throw new Error(`FAIL: ${msg}`);
}

async function runTests() {
  console.log('Running afip module tests...');
  
  assertTruthy(typeof getAfip === 'function', 'getAfip should be exported');
  assertTruthy(typeof resolveInvoiceType === 'function', 'resolveInvoiceType should be exported');
  assertTruthy(typeof buildVoucherPayload === 'function', 'buildVoucherPayload should be exported');

  console.log('All tests passed!');
}

runTests().catch(e => {
  console.error(e.message);
  process.exit(1);
});
