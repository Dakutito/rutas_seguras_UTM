const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// ========================================
// FORZAR IPv4 GLOBALMENTE (MUY IMPORTANTE)
// ========================================

// Método 1: DNS resolver order
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Método 2: Sobrescribir lookup para forzar IPv4
const originalLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  // Si options es la función callback (2 argumentos)
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  // Forzar family: 4 (IPv4)
  options = options || {};
  options.family = 4;
  
  return originalLookup(hostname, options, callback);
};

console.log('🔧 Forzando IPv4 en todas las conexiones DNS');

// ========================================
// CONFIGURACIÓN DE POSTGRESQL
// ========================================

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL no está configurado');
  process.exit(1);
}

console.log('📊 Configurando conexión a PostgreSQL...');
console.log('   URL:', connectionString.replace(/:[^:@]+@/, ':****@')); // Ocultar password

// Parsear URL manualmente
const match = connectionString.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:\/]+):(\d+)\/(.+)/);

if (!match) {
  console.error('❌ ERROR: DATABASE_URL tiene formato inválido');
  console.error('   Formato esperado: postgresql://user:pass@host:port/database');
  process.exit(1);
}

const config = {
  user: match[1],
  password: match[2],
  host: match[3],
  port: parseInt(match[4]),
  database: match[5].split('?')[0], // Remover query params
  
  // ========================================
  // CONFIGURACIÓN IPv4 FORZADA
  // ========================================
  family: 4, // IPv4 ONLY
  
  // ========================================
  // CONFIGURACIÓN SSL (SUPABASE)
  // ========================================
  ssl: {
    rejectUnauthorized: false,
    // Supabase requiere SSL
  },
  
  // ========================================
  // TIMEOUTS Y POOL
  // ========================================
  connectionTimeoutMillis: 10000, // 10 segundos
  idleTimeoutMillis: 30000,
  max: 10, // Reducido para Render free tier
  
  // ========================================
  // KEEP ALIVE (IMPORTANTE PARA SUPABASE)
  // ========================================
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

console.log('📊 Configuración de Pool:');
console.log('   Host:', config.host);
console.log('   Port:', config.port);
console.log('   Database:', config.database);
console.log('   User:', config.user);
console.log('   SSL:', config.ssl ? 'Habilitado' : 'Deshabilitado');
console.log('   IPv4 forzado:', config.family === 4 ? '✅' : '❌');

// ========================================
// CREAR POOL
// ========================================

const pool = new Pool(config);

// ========================================
// EVENT HANDLERS
// ========================================

pool.on('connect', (client) => {
  console.log('✅ Cliente conectado a PostgreSQL');
});

pool.on('acquire', (client) => {
  console.log('🔄 Cliente adquirido del pool');
});

pool.on('remove', (client) => {
  console.log('🗑️  Cliente removido del pool');
});

pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
  console.error('   Code:', err.code);
  console.error('   Address:', err.address);
});

// ========================================
// FUNCIÓN QUERY CON RETRY
// ========================================

const query = async (text, params, retries = 3) => {
  const start = Date.now();
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      
      console.log(`✅ Query ejecutada (${duration}ms, ${res.rowCount} rows)`);
      
      return res;
    } catch (error) {
      console.error(`❌ Error en query (intento ${attempt}/${retries}):`, error.message);
      console.error('   Code:', error.code);
      
      // Si es error de red y quedan intentos, reintentar
      if ((error.code === 'ENETUNREACH' || error.code === 'ETIMEDOUT') && attempt < retries) {
        console.log(`🔄 Reintentando en 1 segundo...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Si no, lanzar el error
      throw error;
    }
  }
};

// ========================================
// TEST DE CONEXIÓN INICIAL
// ========================================

const testConnection = async () => {
  try {
    console.log('🧪 Probando conexión a PostgreSQL...');
    const result = await query('SELECT NOW() as now, version() as version');
    console.log('✅ Conexión exitosa!');
    console.log('   Timestamp:', result.rows[0].now);
    console.log('   PostgreSQL:', result.rows[0].version.split(' ')[1]);
  } catch (error) {
    console.error('❌ Error en test de conexión:', error.message);
    console.error('   Code:', error.code);
    console.error('   Address:', error.address);
    
    if (error.code === 'ENETUNREACH') {
      console.error('');
      console.error('💡 SOLUCIÓN para ENETUNREACH:');
      console.error('   1. Verifica que DATABASE_URL sea la de Connection Pooling (puerto 6543)');
      console.error('   2. En Supabase: Settings → Database → Connection Pooling');
      console.error('   3. Copia la URL que dice "Connection string" con puerto 6543');
      console.error('   4. Actualiza DATABASE_URL en Render con esa URL');
    }
  }
};

// Ejecutar test solo en producción
if (process.env.NODE_ENV === 'production') {
  testConnection();
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recibido, cerrando pool...');
  await pool.end();
  console.log('✅ Pool cerrado');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recibido, cerrando pool...');
  await pool.end();
  console.log('✅ Pool cerrado');
  process.exit(0);
});

// ========================================
// EXPORTS
// ========================================

module.exports = {
  pool,
  query
};