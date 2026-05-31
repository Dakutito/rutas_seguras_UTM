const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

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

// LOGIN MEJORADO CON CÓDIGO DE ACCESO ADMIN
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

        // LOG DE SEGURIDAD
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