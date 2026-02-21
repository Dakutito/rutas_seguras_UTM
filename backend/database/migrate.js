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



    // TABLA DE CATEGORÍAS DE INCIDENTES
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50) NOT NULL,
        color VARCHAR(20) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla incident_categories creada');

    // TABLA DE DE REPORTE DE LOS INCIDENTES
    await client.query(`
      CREATE TABLE IF NOT EXISTS incident_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES incident_categories(id) ON DELETE SET NULL,
        incident_type VARCHAR(50) NOT NULL, -- Mantenido por compatibilidad
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
      CREATE INDEX IF NOT EXISTS idx_incidents_category_id ON incident_reports(category_id);
      CREATE INDEX IF NOT EXISTS idx_incidents_location ON incident_reports(latitude, longitude);
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incident_reports(status);
    `);

    // ... (rest of the code for emotion_reports, risk_zones, etc. remains similar but update_risk_zones changes)

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

    // TABLA DE ZONAS DE RIESGO
    await client.query(`
      CREATE TABLE IF NOT EXISTS risk_zones (
        id SERIAL PRIMARY KEY,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        danger_level VARCHAR(20) DEFAULT 'bajo' CHECK (danger_level IN ('bajo', 'medio', 'alto')),
        report_count INTEGER DEFAULT 0,
        last_event_type VARCHAR(50), -- 'emotion' o 'incident'
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(latitude, longitude)
      );
    `);

    // CREAR FUNCIÓN PARA ACTUALIZAR ZONAS DE RIESGO (Integrando Incidentes)
    await client.query(`
      CREATE OR REPLACE FUNCTION update_risk_zones()
      RETURNS void AS $$
      BEGIN
        TRUNCATE risk_zones;
        
        INSERT INTO risk_zones (latitude, longitude, danger_level, report_count, last_event_type, updated_at)
        SELECT 
          lat as latitude,
          lng as longitude,
          CASE 
            WHEN score >= 10 THEN 'alto'
            WHEN score >= 5 THEN 'medio'
            ELSE 'bajo'
          END as danger_level,
          total_count as report_count,
          'mixed' as last_event_type,
          NOW() as updated_at
        FROM (
          SELECT 
            ROUND(latitude::numeric, 3) as lat,
            ROUND(longitude::numeric, 3) as lng,
            SUM(weight) as score,
            COUNT(*) as total_count
          FROM (
            -- Pesos para emociones
            SELECT latitude, longitude, 
              CASE 
                WHEN emotion IN ('😢', '😡') THEN 3 
                WHEN emotion IN ('😰', '😨') THEN 2 
                ELSE 1 
              END as weight
            FROM emotion_reports
            WHERE expires_at > NOW()
            
            UNION ALL
            
            -- Pesos para incidentes (valen más que emociones)
            SELECT latitude, longitude, 5 as weight
            FROM incident_reports
            WHERE status = 'activo'
          ) combined
          GROUP BY ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3)
        ) final_scores;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('Función update_risk_zones actualizada con incidentes');

    // INSERTAR CATEGORÍAS POR DEFECTO
    await client.query(`
      INSERT INTO incident_categories (name, icon, color, display_order)
      VALUES 
        ('Robo', 'FiAlertTriangle', '#EF4444', 1),
        ('Asalto', 'FiShieldOff', '#B91C1C', 2),
        ('Acoso', 'FiUserX', '#EC4899', 3),
        ('Vandalismo', 'FiZap', '#F59E0B', 4),
        ('Iluminación Deficiente', 'FiSun', '#6366F1', 5),
        ('Infraestructura Peligrosa', 'FiTool', '#8B5CF6', 6),
        ('Persona Sospechosa', 'FiEye', '#10B981', 7),
        ('Otro', 'FiMoreHorizontal', '#6B7280', 8)
      ON CONFLICT (name) DO NOTHING;
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