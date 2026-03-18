-- 1. LIMPIEZA (Opcional, cuidado en producción)
-- Si ya tienes usuarios creados y no quieres borrarlos, NO ejecutes la línea de 'users'
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS risk_zones CASCADE;
DROP TABLE IF EXISTS emotion_reports CASCADE;
DROP TABLE IF EXISTS incident_reports CASCADE;
DROP TABLE IF EXISTS incident_categories CASCADE;
-- DROP TABLE IF EXISTS users CASCADE; -- Descomenta solo si quieres borrar todas las cuentas

-- TABLA DE USUARIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- TABLA DE CATEGORÍAS DE INCIDENTES
CREATE TABLE incident_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA DE REPORTES DE INCIDENTES
CREATE TABLE incident_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES incident_categories(id) ON DELETE SET NULL,
    incident_type VARCHAR(50) NOT NULL, -- Compatibilidad con versiones previas
    description TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'resuelto', 'eliminado')),
    resolved_by INTEGER REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_category ON incident_reports(category_id);
CREATE INDEX idx_incidents_location ON incident_reports(latitude, longitude);
CREATE INDEX idx_incidents_status ON incident_reports(status);

-- TABLA DE REPORTES DE EMOCIONES
CREATE TABLE emotion_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emotion VARCHAR(10) NOT NULL,
    emotion_label VARCHAR(50) NOT NULL,
    emotion_color VARCHAR(20) NOT NULL,
    comment TEXT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours'
);

CREATE INDEX idx_emotions_location ON emotion_reports(latitude, longitude);
CREATE INDEX idx_emotions_expires ON emotion_reports(expires_at);

-- ABLA DE ZONAS DE RIESGO
CREATE TABLE risk_zones (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    danger_level VARCHAR(20) DEFAULT 'bajo' CHECK (danger_level IN ('bajo', 'medio', 'alto')),
    report_count INTEGER DEFAULT 0,
    last_event_type VARCHAR(50), -- 'emotion', 'incident' o 'mixed'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(latitude, longitude)
);

-- FUNCIÓN PARA CALCULAR ZONAS DE RIESGO (INTEGRADA)
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
            -- Pesos para emociones (Ej: Tristeza/Enojo = 3, Ansiedad = 2)
            SELECT latitude, longitude, 
                CASE 
                    WHEN emotion IN ('😢', '😡') THEN 3 
                    WHEN emotion IN ('😰', '😨') THEN 2 
                    ELSE 1 
                END as weight
            FROM emotion_reports
            WHERE expires_at > NOW()
            
            UNION ALL
            
            -- Pesos para incidentes reales (Valen más: 5 puntos)
            SELECT latitude, longitude, 5 as weight
            FROM incident_reports
            WHERE status = 'activo'
        ) combined
        GROUP BY ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3)
    ) final_scores;
END;
$$ LANGUAGE plpgsql;

-- INSERTAR CATEGORÍAS POR DEFECTO
INSERT INTO incident_categories (name, icon, color, display_order) VALUES
('Robo', '🚨', '#ef4444', 1),
('Asalto', '⚠️', '#dc2626', 2),
('Acoso', '🚫', '#ff0000', 3),
('Vandalismo', '🔨', '#8b5cf6', 4),
('Iluminación Deficiente', '💡', '#fbbf24', 5),
('Infraestructura Peligrosa', '🏗️', '#3b82f6', 6),
('Persona Sospechosa', '👁️', '#f97316', 7),
('Otro', '📋', '#10b981', 8)
ON CONFLICT (name) DO UPDATE SET 
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

-- USUARIO ADMINISTRADOR (Contraseña: admin123)
INSERT INTO users (name, email, password, role, status)
VALUES ('Administrador', 'admin@rutas.com', '$2a$10$YourHashedPasswordHere', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;
