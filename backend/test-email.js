const { sendEmail } = require('./config/emailService');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function test() {
  console.log('--- TEST DE EMAIL (RESEND / SMTP) ---');
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Presente' : 'Ausente'}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log('------------------------------------');

  try {
    // Crear un token de ejemplo
    const testToken = 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontendUrl}/verify-email?token=${testToken}`;

    // Email mejorado con el nuevo template
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #4f46e5; margin: 0;">✓ Rutas Seguras UTM</h2>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px;">
          <p style="font-size: 16px; color: #333; margin-top: 0;">Hola <strong>Usuario Test</strong>,</p>
          
          <h3 style="color: #4f46e5; font-size: 18px;">¡Listo ya estás registrado! </h3>
          <p style="font-size: 14px; color: #555; line-height: 1.6;">
            Tu cuenta ha sido creada exitosamente. Ahora debes verificar tu correo electrónico para poder acceder al sistema.
          </p>
          
          <p style="font-size: 14px; color: #555; line-height: 1.6;">
            Dale click al botón de abajo para verificar tu correo y acceder al sistema:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #4f46e5; color: white; padding: 14px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Ir al Sistema</a>
          </div>
          
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            Si el botón no funciona, copia este enlace en tu navegador:<br>
            <span style="word-break: break-all; color: #4f46e5;">${verifyLink}</span>
          </p>
          
          <p style="font-size: 11px; color: #999; text-align: center; margin-top: 15px;">
            Este enlace expira en 24 horas.
          </p>
        </div>
      </div>
    `;

    console.log('Intentando enviar email...');
    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: '¡Verifica tu cuenta - Rutas Seguras!',
      html
    });
    console.log('Resultado:', result);
    console.log('✅ Email enviado exitosamente');
  } catch (error) {
    console.error('Error en el test:', error);
  }
}

test();
