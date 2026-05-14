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

// HELPERS DE TOKENS

/**
 * Genera un Access Token JWT de corta duración (15 minutos).
 * Solo contiene el mínimo de información necesaria (id, email, role).
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Genera y persiste un Refresh Token de larga duración (7 días).
 * Se guarda en la tabla refresh_tokens para poder invalidarlo al hacer logout.
 * Usa crypto.randomBytes para que sea imposible de predecir.
 */
const generateAndSaveRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );

  return token;
};


// REGISTRO

router.post('/register', [
  body('name').trim().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  console.log('Intento de registro:', req.body.email);
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
        VALUES ($1, $2, $3, $4, false, 'active') RETURNING id`,
      [name, normalizedEmail, hashedPassword, role]
    );
    const newUser = userResult.rows[0];

    // Crear token de verificación de email con CRYPTO
    const verificationToken = crypto.randomBytes(32).toString('hex');

    await query(
      `INSERT INTO email_verifications (user_id, verification_token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [newUser.id, verificationToken]
    );

    // URL que el usuario clickeará en su correo
    const frontendUrl = process.env.FRONTEND_URL || 'https://rutas-seguras-utm.vercel.app';
    const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    // --- ENVÍO DE EMAIL (No bloqueante) ---
    sendVerificationEmail(normalizedEmail, name, verifyLink)
      .then(() => console.log(`Correo enviado a: ${normalizedEmail}`))
      .catch(mailError => console.error("Error al enviar correo (en segundo plano):", mailError.message));

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

// LOGIN — Genera Access Token (15min) + Refresh Token (7 días)
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;
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

      if (!adminCode) {
        recordFailedAttempt(normalizedEmail);
        return res.status(403).json({
          error: 'Se requiere código de acceso de administrador',
          requiresAdminCode: true
        });
      }

      if (adminCode !== validAdminCode) {
        recordFailedAttempt(normalizedEmail);

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

      console.log(`ACCESO ADMIN EXITOSO:
        Email: ${normalizedEmail}
        IP: ${req.ip}
        Fecha: ${new Date().toISOString()}
      `);
    }

    // LIMPIAR INTENTOS FALLIDOS
    clearAttempts(normalizedEmail);

    // Generar Access Token (corta duración: 15 minutos)
    const accessToken = generateAccessToken(user);

    // Generar y guardar Refresh Token (larga duración: 7 días) en BD
    const refreshToken = await generateAndSaveRefreshToken(user.id);

    res.json({
      message: 'Login exitoso',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: accessToken,           // Access Token → corta duración
      refreshToken: refreshToken    // Refresh Token → larga duración
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

/*REFRESH — Renueva el Access Token usando el Refresh Token
 El frontend llama a esta ruta automáticamente cuando recibe un 401.
  No requiere contraseña, solo el refreshToken guardado en localStorage.
*/
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No se proporcionó refresh token' });
    }

    // Buscar el refresh token en la BD y verificar que no haya expirado
    const result = await query(
      `SELECT rt.*, u.id as user_id, u.email, u.role, u.status
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      // El refresh token no existe o expiró → el usuario debe hacer login de nuevo
      return res.status(401).json({
        error: 'Sesión expirada. Por favor inicia sesión nuevamente.',
        code: 'REFRESH_EXPIRED'
      });
    }

    const session = result.rows[0];

    // Verificar que el usuario sigue activo
    if (session.status === 'suspended') {
      // Limpiar todos sus tokens si está suspendido
      await query('DELETE FROM refresh_tokens WHERE user_id = $1', [session.user_id]);
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida. Contacta al administrador.' });
    }

    // Generar nuevo Access Token
    const newAccessToken = generateAccessToken({
      id: session.user_id,
      email: session.email,
      role: session.role
    });

    res.json({
      token: newAccessToken,
      message: 'Token renovado exitosamente'
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(500).json({ error: 'Error al renovar la sesión' });
  }
});

// ---------------------------------------------------------------------------
// LOGOUT — Elimina el Refresh Token de la BD para invalidar la sesión
// ---------------------------------------------------------------------------
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Eliminar el refresh token de la BD (invalida la sesión del dispositivo actual)
    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    // Aunque falle en BD, responder OK para que el frontend limpie su estado
    res.json({ message: 'Sesión cerrada' });
  }
});

// ---------------------------------------------------------------------------
// VERIFY TOKEN (mantiene compatibilidad)
// ---------------------------------------------------------------------------
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Token inválido o expirado' });
  }
});

// ---------------------------------------------------------------------------
// RUTAS DE DEBUGGING
// ---------------------------------------------------------------------------
router.get('/test-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Indica un email: /test-email?email=tu@correo.com' });

    console.log('--- TEST DE EMAIL INICIADO ---');
    await sendVerificationEmail(email, 'Usuario de Prueba', 'http://localhost:3000/test');
    res.json({ message: 'Email de prueba enviado (revisa la consola de Render para confirmación)' });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el test de email',
      message: error.message,
      code: error.code,
      details: 'Revisa que EMAIL_USER y EMAIL_PASSWORD sean correctos en Render'
    });
  }
});

// Manejo de GET en rutas que solo deben ser POST (para evitar confusiones)
router.get('/login', (req, res) => {
  res.status(405).json({ error: 'El login solo acepta peticiones POST' });
});

router.get('/register', (req, res) => {
  res.status(405).json({ error: 'El registro solo acepta peticiones POST' });
});

module.exports = router;