const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const path = require('path');

// Carga el .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
let resend;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  console.log('Servicio de email: Usando RESEND API');
} else {
  console.log('Servicio de email: Usando SMTP (Nodemailer)');
}

// Configuración SMTP (Fallback / Local)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: process.env.EMAIL_SECURE !== 'false',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000
});

// Verificar conexión SMTP al iniciar (solo si no hay API Key)
if (!RESEND_API_KEY) {
  transporter.verify((error) => {
    if (error) {
      console.error(' Error SMTP:', error.message);
    } else {
      console.log(`SMTP configurado (${process.env.EMAIL_USER})`);
    }
  });
}

/**
 * Envía email usando Resend o SMTP
 */
const sendEmail = async ({ to, subject, html }) => {
  if (RESEND_API_KEY) {
    try {
      // Resend requiere 'onboarding@resend.dev' si el dominio no está verificado
      const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const { data, error } = await resend.emails.send({
        from: `Rutas Seguras <${from}>`,
        to,
        subject,
        html
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error Resend API:', error);
      throw error;
    }
  } else {
    // Fallback a SMTP
    const from = `"Rutas Seguras UTM" <${process.env.EMAIL_USER}>`;
    return await transporter.sendMail({ from, to, subject, html });
  }
};

const sendVerificationEmail = async (email, name, verificationUrl) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #f9f9f9;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #4f46e5; margin: 0;">✓ Rutas Seguras UTM</h2>
      </div>
      
      <div style="background-color: white; padding: 20px; border-radius: 8px;">
        <p style="font-size: 16px; color: #333; margin-top: 0;">Hola <strong>${name}</strong>,</p>
        
        <h3 style="color: #4f46e5; font-size: 18px;">¡Listo ya estás registrado! 🎉</h3>
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Tu cuenta ha sido creada exitosamente. Ahora debes verificar tu correo electrónico para poder acceder al sistema.
        </p>
        
        <p style="font-size: 14px; color: #555; line-height: 1.6;">
          Dale click al botón de abajo para verificar tu correo y acceder al sistema:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Ir al Sistema</a>
        </div>
        
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          Si el botón no funciona, copia este enlace en tu navegador:<br>
          <span style="word-break: break-all; color: #4f46e5;">${verificationUrl}</span>
        </p>
        
        <p style="font-size: 11px; color: #999; text-align: center; margin-top: 15px;">
          Este enlace expira en 24 horas.
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: '¡Verifica tu cuenta - Rutas Seguras!', html });
};

const sendWelcomeEmail = async (email, name) => {
  const html = `<h1>🎉 ¡Cuenta activada!</h1><p>Hola ${name}, tu cuenta ha sido verificada con éxito.</p>`;
  return sendEmail({ to: email, subject: '¡Bienvenido a Rutas Seguras!', html });
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  transporter,
  sendEmail
};