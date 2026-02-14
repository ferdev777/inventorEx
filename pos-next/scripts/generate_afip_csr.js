/* eslint-disable */
const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Configuration
const CUIT = '23399135109'; 
const CN = `AFIP_WS_TEST_${CUIT}`; // Common Name for the certificate

console.log('Generando par de claves RSA (2048 bits)... esto puede tardar unos segundos.');

// 1. Generate Key Pair
const keys = forge.pki.rsa.generateKeyPair(2048);
const privateKey = keys.privateKey;
const publicKey = keys.publicKey;

console.log('Claves generadas.');

// 2. Create CSR
const csr = forge.pki.createCertificationRequest();
csr.publicKey = publicKey;

csr.setSubject([
  {
    name: 'commonName',
    value: CN
  },
  {
    name: 'organizationName',
    value: 'Inventory System'
  },
  {
    name: 'countryName',
    value: 'AR'
  }
]);

// Sign the CSR with the private key
csr.sign(privateKey);

// 3. Convert to PEM format
const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
const csrPem = forge.pki.certificationRequestToPem(csr);

// 4. Save files
const outDir = path.join(__dirname, '..', 'afip_certs');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}

const keyPath = path.join(outDir, 'private.key');
const csrPath = path.join(outDir, 'pedido.csr');

fs.writeFileSync(keyPath, privateKeyPem);
fs.writeFileSync(csrPath, csrPem);

console.log('================================================');
console.log('¡Archivos generados con éxito!');
console.log(`Directorio: ${outDir}`);
console.log('1. private.key (TU CLAVE PRIVADA - NO COMPARTIR)');
console.log('2. pedido.csr (SUBIR ESTE ARCHIVO A AFIP)');
console.log('================================================');
