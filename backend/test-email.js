const { sendEmail } = require('./config/emailService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function test() {
  console.log('--- TEST DE EMAIL (RESEND / SMTP) ---');
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Presente' : 'Ausente'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log('------------------------------------');

  try {
    console.log('Intentando enviar email...');
    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: 'Test de Email - Rutas Seguras',
      html: '<h1>✅ Funciona!</h1><p>Si recibes esto, el sistema de correos está listo.</p>'
    });
    console.log('✅ Resultado:', result);
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

test();
