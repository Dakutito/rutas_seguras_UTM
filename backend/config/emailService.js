const nodemailer = require('nodemailer');
const path = require('path');

// Carga el .env usando una ruta absoluta para evitar errores de "undefined"
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error configurando servicio de email:', error.message);
    console.log('💡 Tip: Revisa que EMAIL_USER y EMAIL_PASSWORD estén bien en el .env');
  } else {
    console.log('✅ Servicio de email configurado correctamente');
  }
});

/**
 * Envía email con el enlace de verificación
 */
const sendVerificationEmail = async (email, name, verificationUrl) => {
  try {
    const mailOptions = {
      from: `"Rutas Seguras UTM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifica tu cuenta - Rutas Seguras UTM',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #4f46e5;">🛡️ Rutas Seguras UTM</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar mi correo</a>
          </div>
          <p style="font-size: 12px; color: #666;">Si el botón no funciona, copia este enlace: ${verificationUrl}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 11px; color: #999;">Este enlace expira en 24 horas.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

/**
 * Envía email de bienvenida tras verificar la cuenta
 */
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"Rutas Seguras UTM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Bienvenido a Rutas Seguras UTM!',
      html: `<h1>🎉 ¡Cuenta activada!</h1><p>Hola ${name}, tu cuenta ha sido verificada con éxito. Ya puedes iniciar sesión.</p>`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error enviando bienvenida:', error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};