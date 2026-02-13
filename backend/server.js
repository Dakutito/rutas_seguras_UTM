const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;


// IMPORTANTE: Servir archivos estáticos (fotos de perfil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Registrar todas las rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');
const zoneRoutes = require('./routes/zones');
const statsRoutes = require('./routes/stats');
const userSettingsRoutes = require('./routes/userSettings');
const incidentCategoriesRoutes = require('./routes/incidentCategories');
const incidentsRoutes = require('./routes/incidents');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/incident-categories', incidentCategoriesRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API de Rutas Seguras funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🗺️ API de Rutas Seguras UTM',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      reports: '/api/reports',
      zones: '/api/zones',
      stats: '/api/stats'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\nServidor corriendo en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health\n`);
});

// Manejo de shutdown graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

module.exports = app;

// =======================================================
// ==   NUEVO: API Endpoints para ADMIN (Gestión)      ==
// =======================================================

// 1. OBTENER TODOS LOS USUARIOS (Para el panel de Admin)
app.get('/api/users', async (req, res) => {
  try {
    // Esta consulta trae los datos y cuenta cuántos reportes tiene cada uno
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.email as name, -- Usamos email como nombre si no tienes campo name
        u.created_at, 
        u.status,
        (SELECT COUNT(*) FROM expenses WHERE user_id = u.id) as reports_count
      FROM users u
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener usuarios de la base de datos' });
  }
});

// 2. CAMBIAR ESTADO DE USUARIO (Suspender/Activar)
app.patch('/api/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // recibe 'active' o 'suspended'
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Estado actualizado correctamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

// 3. ELIMINAR USUARIO
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});