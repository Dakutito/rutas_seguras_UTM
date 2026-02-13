const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('--- DIAGNÓSTICO DE EMAIL ---');
console.log(`HOST: ${process.env.EMAIL_HOST}`);
console.log(`PORT: ${process.env.EMAIL_PORT}`);
console.log(`USER: ${process.env.EMAIL_USER}`);
console.log(`SECURE: ${process.env.EMAIL_SECURE}`);
console.log('----------------------------');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Show debug output
  logger: true // Log to console
});

async function test() {
  try {
    console.log('Intentando verificar conexión...');
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa');

    console.log('Intentando enviar email de prueba...');
    const info = await transporter.sendMail({
      from: `"Test Script" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test de Email - Rutas Seguras',
      text: 'Si ves esto, el envío de correos funciona correctamente.',
      html: '<b>Si ves esto, el envío de correos funciona correctamente.</b>'
    });

    console.log('✅ Email enviado:', info.messageId);
    console.log('Respuesta del servidor:', info.response);
  } catch (error) {
    console.error('❌ ERROR FATAL:', error);
  }
}

test();
