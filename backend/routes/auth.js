const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// IMPORTACIÓN DEL SERVICIO DE EMAIL
const { sendVerificationEmail, sendWelcomeEmail } = require('../config/emailService');

// CONTADOR DE INTENTOS FALLIDOS (protección contra fuerza bruta)
const loginAttempts = new Map();

// FUNCIÓN PARA VERIFICAR RATE LIMITING
const checkRateLimit = (email) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, firstAttempt: now };

  // Resetear contador después de 15 minutos
  if (now - attempts.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(email);
    return { allowed: true, remaining: 5 };
  }

  // Máximo 5 intentos en 15 minutos
  if (attempts.count >= 5) {
    const timeLeft = Math.ceil((15 * 60 * 1000 - (now - attempts.firstAttempt)) / 60000);
    return {
      allowed: false,
      remaining: 0,
      message: `Demasiados intentos. Intenta de nuevo en ${timeLeft} minutos.`
    };
  }

  return { allowed: true, remaining: 5 - attempts.count };
};

// FUNCIÓN PARA REGISTRAR INTENTO FALLIDO
const recordFailedAttempt = (email) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, firstAttempt: now };
  attempts.count++;
  if (!attempts.firstAttempt) attempts.firstAttempt = now;
  loginAttempts.set(email, attempts);
};

// FUNCIÓN PARA LIMPIAR INTENTOS EXITOSOS
const clearAttempts = (email) => {
  loginAttempts.delete(email);
};

// REGISTRO
router.get('/register', (req, res) => {
  res.status(405).json({ error: 'Método no permitido. Usa POST para registrar.' });
});

router.post('/register', [
  body('name').trim().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  console.log('Intento de registro:', req.body.email); // Debug log
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    const exists = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'El correo ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = normalizedEmail === 'admin@rutas.com' ? 'admin' : 'user';

    // Insertar usuario
    const userResult = await query(
      `INSERT INTO users (name, email, password, role, email_verified, status)
        VALUES ($1, $2, $3, $4, false, 'pending') RETURNING id`,
      [name, normalizedEmail, hashedPassword, role]
    );
    const newUser = userResult.rows[0];

    // Crear token con CRYPTO
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await query(
      `INSERT INTO email_verifications (user_id, verification_token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [newUser.id, verificationToken]
    );

    // URL que el usuario clickeará en su correo
    const verifyLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

    // --- ENVÍO DE EMAIL ---
    try {
      await sendVerificationEmail(normalizedEmail, name, verifyLink);
      console.log(`Correo enviado a: ${normalizedEmail}`);
    } catch (mailError) {
      console.error("Error al enviar correo, pero el usuario fue creado:", mailError);
    }

    res.status(201).json({
      message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.',
      token: verificationToken
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// VERIFICACIÓN DE EMAIL
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await query(
      `SELECT ev.*, u.name, u.email
        FROM email_verifications ev
        JOIN users u ON ev.user_id = u.id
        WHERE ev.verification_token = $1
        AND ev.expires_at > NOW()
        AND ev.verified = FALSE`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const verification = result.rows[0];

    // Actualizar usuario y marcar token como usado
    await query(`UPDATE users SET email_verified = TRUE, status = 'active' WHERE id = $1`, [verification.user_id]);
    await query(`UPDATE email_verifications SET verified = TRUE WHERE id = $1`, [verification.id]);

    // --- ENVIAR EMAIL DE BIENVENIDA ---
    try {
      await sendWelcomeEmail(verification.email, verification.name);
    } catch (welcomeError) {
      console.error("Error al enviar email de bienvenida:", welcomeError);
    }

    res.json({ message: 'Email verificado correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar correo' });
  }
});

// LOGIN MEJORADO CON CÓDIGO DE ACCESO ADMIN
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { email, password, adminCode } = req.body; // adminCode
    const normalizedEmail = email.toLowerCase();

    // VERIFICAR RATE LIMITING
    const rateCheck = checkRateLimit(normalizedEmail);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: rateCheck.message,
        remainingAttempts: 0
      });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

    if (result.rows.length === 0) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        remainingAttempts: rateCheck.remaining - 1
      });
    }

    const user = result.rows[0];

    // Verificar email
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Debes verificar tu correo antes de entrar' });
    }

    // Verificar estado de cuenta
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      recordFailedAttempt(normalizedEmail);
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        remainingAttempts: rateCheck.remaining - 1
      });
    }

    // VERIFICACIÓN DE CÓDIGO ADMIN
    if (user.role === 'admin') {
      const validAdminCode = process.env.ADMIN_ACCESS_CODE;

      // Si es admin, DEBE proporcionar el código
      if (!adminCode) {
        recordFailedAttempt(normalizedEmail);
        return res.status(403).json({
          error: 'Se requiere código de acceso de administrador',
          requiresAdminCode: true
        });
      }

      // Verificar que el código sea correcto
      if (adminCode !== validAdminCode) {
        recordFailedAttempt(normalizedEmail);

        // LOG DE SEGURIDAD - Registrar intento de acceso no autorizado
        console.warn(`INTENTO DE ACCESO ADMIN FALLIDO:
          Email: ${normalizedEmail}
          IP: ${req.ip}
          Fecha: ${new Date().toISOString()}
          Código incorrecto proporcionado
        `);

        return res.status(403).json({
          error: 'Código de acceso de administrador incorrecto',
          remainingAttempts: rateCheck.remaining - 1
        });
      }

      // LOG DE SEGURIDAD - Acceso admin exitoso
      console.log(`ACCESO ADMIN EXITOSO:
        Email: ${normalizedEmail}
        IP: ${req.ip}
        Fecha: ${new Date().toISOString()}
      `);
    }

    // LIMPIAR INTENTOS FALLIDOS
    clearAttempts(normalizedEmail);

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

module.exports = router;