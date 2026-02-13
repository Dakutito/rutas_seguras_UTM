const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// Forzar resolución IPv4 para evitar errores ENETUNREACH
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Configuración de conexión a PostgreSQL
// Configuración de conexión con parseo manual para asegurar IPv4
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

const config = {
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
  // 🚨 CRÍTICO: Forzar IPv4
  family: 4,
};

if (connectionString) {
  // Parsear URL manualmente si existe (Producción/Render)
  const match = connectionString.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (match) {
    config.user = match[1];
    config.password = match[2];
    config.host = match[3];
    config.port = match[4];
    config.database = match[5];

    // Configuración SSL para Supabase
    config.ssl = { rejectUnauthorized: false };
  } else {
    // Fallback si el regex falla (no debería)
    config.connectionString = connectionString;
    config.ssl = { rejectUnauthorized: false };
  }
} else {
  // Desarrollo
  config.host = process.env.DB_HOST;
  config.port = process.env.DB_PORT;
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
  config.database = process.env.DB_NAME;
}

const pool = new Pool(config);

// Probar conexión
pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error inesperado en la conexión a PostgreSQL:', err);
});

// Función helper para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Ejecutada query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query
};