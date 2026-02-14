const Afip = require('@afipsdk/afip.js');
const path = require('path');
const fs = require('fs');

// Simple .env parser to avoid installing dotenv
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function checkAfip() {
  console.log('--- Verificando conexión con AFIP ---');
  
  const CUIT = 23399135109;
  // Use absolute paths resolved from script location
  const certPath = path.resolve(__dirname, '..', 'afip_certs', 'certificado.crt');
  const keyPath = path.resolve(__dirname, '..', 'afip_certs', 'private.key');

  console.log(`CUIT: ${CUIT}`);
  console.log(`Cert: ${certPath}`);
  console.log(`Key: ${keyPath}`);

  try {
    const afip = new Afip({
        CUIT: CUIT,
        cert: certPath,
        key: keyPath,
        production: false, // Testing
        res_folder: path.join(__dirname, '..', 'afip_certs'),
        ta_folder: path.join(__dirname, '..', 'afip_certs'),
    });

    console.log('Conectando al servidor de AFIP...');
    const serverStatus = await afip.ElectronicBilling.getServerStatus();
    
    console.log('Estado del Servidor:', JSON.stringify(serverStatus, null, 2));
    console.log('¡Conexión EXITOSA!');
    
    // Check last voucher for POS 1 (assuming 1 is set up)
    try {
        const lastVoucher = await afip.ElectronicBilling.getLastVoucher(1, 11); // POS 1, Factura C
        console.log(`Última Factura C en Punto de Venta 1: ${lastVoucher}`);
        console.log('Todo parece estar configurado correctamente.');
    } catch (e) {
        console.warn('Advertencia: No se pudo obtener el último comprobante del Punto de Venta 1.');
        console.warn('¿Existe el Punto de Venta 1 en AFIP para Web Services?');
        console.warn('Error detalle:', e.message);
    }

  } catch (error) {
    const fs = require('fs');
    const logPath = path.join(__dirname, 'afip_error.log');
    const errorLog = {
        message: error.message,
        code: error.code,
        stack: error.stack,
        response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
        } : 'No response object'
    };
    fs.writeFileSync(logPath, JSON.stringify(errorLog, null, 2));
    console.log('Error detallado guardado en:', logPath);
    console.log('Revisa que el certificado sea correcto y que el servicio WSASS tenga permiso.');
  }
}

checkAfip();
