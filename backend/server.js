const express = require('express');
const dns = require('dns');

// Forzar resolución IPv4 globalmente
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const compression = require('compression');


const app = express();

const PORT = process.env.PORT || 8000;



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

app.use(compression());
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

// Ruta de Salud para Koyeb
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});


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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nServidor corriendo en puerto ${PORT}`);
  console.log(`Host configurado en: 0.0.0.0`);
  console.log(`Puerto asignado: ${PORT}`);
  console.log(`Health check (Koyeb): http://localhost:${PORT}/health`);
  console.log(`Health check (API): http://localhost:${PORT}/api/health\n`);
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
