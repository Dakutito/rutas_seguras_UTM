const { pool } = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Creando tablas...');

    // TABLA DE USUARIOS
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        profile_photo VARCHAR(255)
      );
    `);
    console.log('Tabla users creada');

    // ÍNDICES para users
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    `);

    

    // TABLA DE DE REPORTE DE LOS INCIDENTES
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('Robo', 'Asalto', 'Acoso', 'Vandalismo', 'Iluminación', 'Infraestructura', 'Sospechoso', 'Otro')),
        description TEXT,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'resuelto', 'eliminado')),
        resolved_by INTEGER REFERENCES users(id),
        resolved_at TIMESTAMP
        );
    `);
    console.log('Tabla incident_reports creada');

    // INDICES para incident_reports
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incident_reports(user_id);
      CREATE INDEX IF NOT EXISTS idx_incidents_type ON incident_reports(incident_type);
      CREATE INDEX IF NOT EXISTS idx_incidents_location ON incident_reports(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incident_reports(status);
      CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incident_reports(created_at);
    `);
    // COMMENT
    await client.query(`
      COMMENT ON COLUMN users.status IS 'pending = sin verificar | active = activo | suspended = suspendido';
      COMMENT ON TABLE incident_reports IS 'Reportes de incidentes específicos (robos, asaltos, etc.)';
      COMMENT ON COLUMN incident_reports.incident_type IS 'Tipo de incidente reportado';
      COMMENT ON COLUMN incident_reports.status IS 'activo = pendiente | resuelto = atendido | eliminado = borrado por admin';
      `);

    // TABLA DE REPORTES DE EMOCIONES
    await client.query(`
      CREATE TABLE IF NOT EXISTS emotion_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        emotion VARCHAR(10) NOT NULL,
        emotion_label VARCHAR(50) NOT NULL,
        emotion_color VARCHAR(20) NOT NULL,
        comment TEXT,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours'
      );
    `);
    console.log('Tabla emotion_reports creada');

    // ÍNDICES para emotion_reports
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_user_id ON emotion_reports(user_id);
      CREATE INDEX IF NOT EXISTS idx_reports_emotion ON emotion_reports(emotion);
      CREATE INDEX IF NOT EXISTS idx_reports_location ON emotion_reports(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON emotion_reports(created_at);
      CREATE INDEX IF NOT EXISTS idx_reports_expires_at ON emotion_reports(expires_at);
    `);

    // TABLA DE ZONAS DE RIESGO (agregación de reportes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS risk_zones (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        danger_level VARCHAR(20) DEFAULT 'bajo' CHECK (danger_level IN ('bajo', 'medio', 'alto')),
        report_count INTEGER DEFAULT 0,
        last_emotion VARCHAR(10),
        last_emotion_color VARCHAR(20),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(latitude, longitude)
      );
    `);
    console.log('Tabla risk_zones creada');

    // ÍNDICES para risk_zones
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_zones_location ON risk_zones(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_zones_danger_level ON risk_zones(danger_level);
    `);

    // TABLA DE SESIONES (opcional, para mantener sesiones activas)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
      );
    `);
    console.log('Tabla user_sessions creada');

    // ÍNDICES para user_sessions
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);
    `);

    // TABLA DE LOGS DE ACTIVIDAD
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla activity_logs creada');

    // ÍNDICES para activity_logs
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action);
      CREATE INDEX IF NOT EXISTS idx_logs_created_at ON activity_logs(created_at);
    `);

    // CREAR FUNCIÓN PARA LIMPIAR REPORTES EXPIRADOS
    await client.query(`
      CREATE OR REPLACE FUNCTION delete_expired_reports()
      RETURNS void AS $$
      BEGIN
        DELETE FROM emotion_reports WHERE expires_at < NOW();
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Función delete_expired_reports creada');

    // CREAR FUNCIÓN PARA ACTUALIZAR ZONAS DE RIESGO
    await client.query(`
      CREATE OR REPLACE FUNCTION update_risk_zones()
      RETURNS void AS $$
      BEGIN
        -- Limpiar zonas antiguas
        TRUNCATE risk_zones;
        
        -- Insertar zonas agrupadas por ubicación
        INSERT INTO risk_zones (latitude, longitude, danger_level, report_count, last_emotion, last_emotion_color, updated_at)
        SELECT 
          ROUND(latitude::numeric, 3)::decimal(10,8) as latitude,
          ROUND(longitude::numeric, 3)::decimal(11,8) as longitude,
          CASE 
            WHEN COUNT(CASE WHEN emotion IN ('😢', '😡') THEN 1 END) > 0 THEN 'alto'
            WHEN COUNT(CASE WHEN emotion IN ('😰', '😨') THEN 1 END) > 0 THEN 'medio'
            ELSE 'bajo'
          END as danger_level,
          COUNT(*) as report_count,
          (ARRAY_AGG(emotion ORDER BY created_at DESC))[1] as last_emotion,
          (ARRAY_AGG(emotion_color ORDER BY created_at DESC))[1] as last_emotion_color,
          NOW() as updated_at
        FROM emotion_reports
        WHERE expires_at > NOW()
        GROUP BY ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3);
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Función update_risk_zones creada');

    // INSERTAR USUARIO ADMIN POR DEFECTO
    await client.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Administrador', 'admin@rutas.com', '$2a$10$YourHashedPasswordHere', 'admin', 'active')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('Usuario admin creado (email: admin@rutas.com)');

    await client.query('COMMIT');
    console.log('\n¡Base de datos configurada exitosamente!\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando tablas:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Ejecutar migraciones
createTables()
  .then(() => {
    console.log('Migraciones completadas');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en migraciones:', error);
    process.exit(1);
  });