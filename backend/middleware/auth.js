const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar el Token JWT.
 *
 * Diferencia entre dos tipos de error:
 *  - 401 TOKEN_EXPIRED: El token expiró → el frontend debe intentar renovarlo con /refresh
 *  - 403 TOKEN_INVALID: El token es inválido/manipulado → logout inmediato
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

    // Verificar si el usuario está suspendido
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
    // DIFERENCIACIÓN CLAVE:
    // TokenExpiredError - el token venció - el frontend puede renovarlo con refreshToken
    // JsonWebTokenError - el token es inválido/manipulado - cerrar sesión inmediatamente
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Error al verificar token:', error);
    return res.status(403).json({
      error: 'Token inválido o expirado',
      code: 'TOKEN_INVALID'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de administrador' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};
