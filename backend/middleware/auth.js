const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar el Token JWT
 */
const authenticateToken = async (req, res, next) => {
  // Obtener el token del header (formato: Bearer TOKEN)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: No se proporcionó un token' });
  }

  try {
    // Verificar el token usando la clave secreta del .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario (id, email, role) en el request

    // --- NUEVO: Verificar si el usuario está suspendido ---
    const { query } = require('../config/database');
    const userResult = await query('SELECT status FROM users WHERE id = $1', [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (userResult.rows[0].status === 'suspended') {
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida. Contacta al administrador.' });
    }

    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware para restringir acceso solo a Administradores
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de administrador' });
  }
  next();
};

// --- IMPORTANTE: Exportar como objeto para que users.js los reciba bien ---
module.exports = {
  authenticateToken,
  requireAdmin
};