import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import './styles/darkMode.css'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import MapView from './pages/MapView'
import AdminPanel from './pages/AdminPanel'
import AdminStats from './pages/AdminStats'
import AdminUsers from './pages/Adminusers'
import Adminreports from './pages/Adminreports'
import RecursosEducativos from './pages/RecursosEducativos'

import Login from './components/Login'
import Register from './components/Register'

import VerifyEmail from './pages/VerifyEmail'

// MÓDULO DE REPORTES DE INCIDENTES
import IncidentReports from './pages/IncidentReports'
import MapaReporte from './pages/MapaReporte'
import AdminIncidents from './pages/AdminIncidents'

import UserSettings from './pages/UserSettings'
import AdminCategories from './pages/AdminCategories'


function App() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true) // Estado de carga
  const [darkMode, setDarkMode] = useState(() => {
    // Inicializar con preferencia guardada o por defecto
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return saved === 'true'
    }
    // Si no hay preferencia guardada, usar preferencia del sistema
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Aplicar/quitar dark mode en el HTML root
  useEffect(() => {
    const htmlElement = document.documentElement
    if (darkMode) {
      htmlElement.setAttribute('data-theme', 'dark')
      document.body.style.background = 'var(--bg-primary)'
    } else {
      htmlElement.removeAttribute('data-theme')
      document.body.style.background = 'var(--bg-primary)'
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // Aplicar tema al montar el componente
  useEffect(() => {
    const htmlElement = document.documentElement
    if (darkMode) {
      htmlElement.setAttribute('data-theme', 'dark')
    } else {
      htmlElement.removeAttribute('data-theme')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setIsAdmin(parsed.role === 'admin' || parsed.email === 'admin@rutas.com')
      }
    } catch (e) {
      console.error('Error al cargar usuario:', e)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false) // Marcar como cargado
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsAdmin(userData.role === 'admin' || userData.email === 'admin@rutas.com')
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Mostrar loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <p style={{ color: '#6b7280' }}>Cargando Rutas Seguras...</p>
      </div>
    )
  }

  const redirectLoggedIn = () => {
    if (isAdmin) return '/admin'
    return '/dashboard'
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} isAdmin={isAdmin} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/recursos" element={<RecursosEducativos />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/*RUTAS DE AUTENTICACIÓN */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={redirectLoggedIn()} replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={redirectLoggedIn()} replace />
              ) : (
                <Register onLogin={handleLogin} />
              )
            }
          />

          {/* ELIMINADO: Ruta /login-admin */}
          {/* La autenticación de admin ahora se hace desde /login con código */}

          {/* CONFIGURACIÓN DE USUARIO */}
          <Route
            path="/settings"
            element={
              user ? (
                <UserSettings user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* RUTAS DE USUARIO NORMAL */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          <Route
            path="/map"
            element={
              user ? (
                <MapView isAdmin={isAdmin} user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* MÓDULO DE REPORTES DE INCIDENTES  */}
          <Route
            path="/reportes"
            element={
              user ? (
                <IncidentReports />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/map-reporte"
            element={
              user ? (
                <MapaReporte user={user} viewOnly={false} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/mapa-reportes"
            element={
              user ? (
                <MapaReporte user={user} viewOnly={true} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/*  RUTAS DE ADMINISTRADOR*/}
          <Route
            path="/admin"
            element={
              user && isAdmin ? (
                <AdminPanel />
              ) : user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/users"
            element={
              user && isAdmin ? (
                <AdminUsers />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/stats"
            element={
              user && isAdmin ? (
                <AdminStats />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/danger"
            element={
              user && isAdmin ? (
                <Adminreports type="danger" />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/today"
            element={
              user && isAdmin ? (
                <Adminreports type="today" />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/all-reports"
            element={
              user && isAdmin ? (
                <Adminreports type="all-reports" />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/incidentes"
            element={
              user && isAdmin ? (
                <AdminIncidents />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/categorias"
            element={
              user && isAdmin ? (
                <AdminCategories />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin/mapa-reportes"
            element={
              user && isAdmin ? (
                <MapaReporte user={user} viewOnly={true} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/*RUTA 404  */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App