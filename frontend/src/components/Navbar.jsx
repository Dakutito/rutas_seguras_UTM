// frontend/src/components/Navbar.jsx (ACTUALIZADO)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Components.css'

const Navbar = ({ user, onLogout, isAdmin, darkMode, onToggleDarkMode }) => {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    onLogout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="logo-container">
          {isAdmin ? (
            <span className="nav-logo" style={{ cursor: 'default' }}>
              Rutas Seguras UTM
            </span>
          ) : (
            <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
              Rutas Seguras UTM
            </Link>
          )}
        </div>

        {/* Menú desktop */}
        <div className="nav-links desktop-menu">
          {user ? (
            <>
              {/* Si es admin NO mostrar Dashboard, solo Mapa + Reportes + Admin */}
              {!isAdmin && <Link to="/dashboard" className="nav-link">Dashboard</Link>}

              <Link to="/map" className="nav-link">Mapa Emocional</Link>

              {/* NUEVO: Link a Reportes de Incidentes */}
              <Link to="/reportes" className="nav-link" style={{ fontWeight: '600' }}>
                Reportes
              </Link>

              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">
                  Administrador
                </Link>
              )}

              <button onClick={handleLogout} className="nav-btn nav-btn-logout">
                Cerrar Sesión
              </button>

              <button
                onClick={onToggleDarkMode}
                className="dark-mode-toggle"
                aria-label="Toggle dark mode"
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                <span className="dark-mode-icon">{darkMode ? '☀️' : '🌙'}</span>
              </button>

              <span className="nav-user">{user.name}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Iniciar Sesión</Link>
              <Link to="/register" style={{ textDecoration: 'none' }} className="nav-btn nav-btn-register">
                Registrarse
              </Link>
              <button
                onClick={onToggleDarkMode}
                className="dark-mode-toggle"
                aria-label="Toggle dark mode"
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                <span className="dark-mode-icon">{darkMode ? '☀️' : '🌙'}</span>
              </button>
            </>
          )}
        </div>

        {/* Botón hamburguesa para móvil */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <span className="close-icon">✕</span>
          ) : (
            <span className="hamburger-icon">☰</span>
          )}
        </button>

        {/* Menú móvil */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-header">
            <span className="mobile-logo">Rutas Seguras UTM</span>
            {user && <span className="mobile-user">{user.name}</span>}
          </div>

          <div className="mobile-menu-content">
            {user ? (
              <>
                {/* Si es admin NO mostrar Dashboard */}
                {!isAdmin && (
                  <Link
                    to="/dashboard"
                    className="mobile-link"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                )}

                <Link
                  to="/map"
                  className="mobile-link"
                  onClick={closeMobileMenu}
                >
                  Mapa Emocional
                </Link>

                {/* NUEVO: Link móvil a Reportes */}
                <Link
                  to="/reportes"
                  className="mobile-link"
                  onClick={closeMobileMenu}
                  style={{ fontWeight: '600' }}
                >
                  Reportes de Incidentes
                </Link>

                {/* Configuracion usuario*/}
                <Link
                  to="/settings"
                  className="mobile-link"
                  onClick={closeMobileMenu}>
                  Configuración
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="mobile-link admin-mobile"
                    onClick={closeMobileMenu}
                  >
                    Panel Admin
                  </Link>
                )}

                <button
                  onClick={onToggleDarkMode}
                  className="dark-mode-toggle-mobile"
                >
                  <span className="dark-mode-icon">{darkMode ? '☀️' : '🌙'}</span>
                  {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                </button>

                <button
                  onClick={handleLogout}
                  className="nav-btn nav-btn-logout-mobile"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="mobile-link"
                  onClick={closeMobileMenu}
                >
                  Iniciar Sesión
                </Link>

                <Link
                  to="/register"
                  className="nav-btn nav-btn-register-mobile"
                  onClick={closeMobileMenu}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Overlay para cerrar menú */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    </nav>
  )
}

export default Navbar