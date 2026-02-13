CREATE DATABASE rutas_seguras_utm
WITH
OWNER = postgres
ENCODING = 'UTF8'
LC_COLLATE = 'es_ES.UTF-8'
LC_CTYPE = 'es_ES.UTF-8'
TABLESPACE = pg_default
CONNECTION LIMIT = -1;

COMMENT ON DATABASE rutas_seguras_utm IS 'Base de datos para sistema de rutas seguras';

\c rutas_seguras_utm;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- LIMPIEZA
-- =========================
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS risk_zones CASCADE;
DROP TABLE IF EXISTS emotion_reports CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_photo VARCHAR(255)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email_verified ON users(email_verified);

COMMENT ON COLUMN users.status IS 'pending = sin verificar | active = activo | suspended = suspendido';

-- =========================
-- INCIDENT REPORTS (Reportes de Incidentes)
-- =========================

CREATE TABLE incident_reports (
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

CREATE INDEX idx_incidents_type ON incident_reports(incident_type);
CREATE INDEX idx_incidents_location ON incident_reports(latitude, longitude);
CREATE INDEX idx_incidents_status ON incident_reports(status);
CREATE INDEX idx_incidents_user ON incident_reports(user_id);
CREATE INDEX idx_incidents_created ON incident_reports(created_at);

COMMENT ON TABLE incident_reports IS 'Reportes de incidentes específicos (robos, asaltos, etc.)';
COMMENT ON COLUMN incident_reports.incident_type IS 'Tipo de incidente reportado';
COMMENT ON COLUMN incident_reports.status IS 'activo = pendiente | resuelto = atendido | eliminado = borrado por admin';

//
-- 2. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS incident_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(20) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insertar categorías por defecto
INSERT INTO incident_categories (name, icon, color, display_order) VALUES
('Robo', '🚨', '#ef4444', 1),
('Asalto', '⚠️', '#dc2626', 2),
('Acoso', '🚫', '#f59e0b', 3),
('Vandalismo', '🔨', '#8b5cf6', 4),
('Iluminación', '💡', '#fbbf24', 5),
('Infraestructura', '🏗️', '#6b7280', 6),
('Sospechoso', '👁️', '#f97316', 7),
('Otro', '📋', '#10b981', 8)
ON CONFLICT (name) DO NOTHING;


-- =========================
-- EMAIL VERIFICATION
-- =========================
CREATE TABLE email_verifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    verification_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_user ON email_verifications(user_id);
CREATE INDEX idx_verification_token ON email_verifications(verification_token);

-- =========================
-- EMOTION REPORTS
-- =========================
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

CREATE INDEX idx_reports_user ON emotion_reports(user_id);
CREATE INDEX idx_reports_location ON emotion_reports(latitude, longitude);
CREATE INDEX idx_reports_expires ON emotion_reports(expires_at);

-- =========================
-- RISK ZONES
-- =========================
CREATE TABLE risk_zones (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    danger_level VARCHAR(20) DEFAULT 'bajo' CHECK (danger_level IN ('bajo','medio','alto')),
    report_count INTEGER DEFAULT 0,
    last_emotion VARCHAR(10),
    last_emotion_color VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(latitude, longitude)
);

CREATE INDEX idx_zones_danger ON risk_zones(danger_level);

-- =========================
-- USER SESSIONS
-- =========================
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
);

CREATE INDEX idx_sessions_token ON user_sessions(token);

-- =========================
-- ACTIVITY LOGS
-- =========================
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- FUNCTIONS
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    emotion TEXT,
    comment TEXT,
    lat DECIMAL,
    lng DECIMAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CLEAN EXPIRED TOKENS
-- =========================
CREATE OR REPLACE FUNCTION delete_expired_verification_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verifications
    WHERE expires_at < NOW() AND verified = FALSE;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- ADMIN USER
-- =========================
INSERT INTO users (name, email, password, role, status, email_verified)
VALUES (
    'Administrador',
    'admin@rutas.com',
    crypt('admin123', gen_salt('bf')),
    'admin',
    'active',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- =========================
-- TEST USER
-- =========================
INSERT INTO users (name, email, password, role, status, email_verified)
VALUES (
    'Usuario Prueba',
    'test@rutas.com',
    crypt('admin123', gen_salt('bf')),
    'user',
    'active',
    TRUE
) ON CONFLICT (email) DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

