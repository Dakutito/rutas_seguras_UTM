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

// RECURSOS EDUCATIVOS MÓDULOS
import GuiaSeguridadUrbana from './pages/Recursos educativos/GuiaSeguridadUrbana'
import ComoReportarIncidentes from './pages/Recursos educativos/ComoReportarIncidentes'
import NumerosEmergencia from './pages/Recursos educativos/NumerosEmergencia'
import RutasSegurasPortoviejo from './pages/Recursos educativos/RutasSegurasPortoviejo'
import ManejoEstresAcademico from './pages/Recursos educativos/ManejoEstresAcademico'
import PrimerosAuxiliosEmocionales from './pages/Recursos educativos/PrimerosAuxiliosEmocionales'
import LineasApoyoPsicologico from './pages/Recursos educativos/LineasApoyoPsicologico'
import BienestarDigital from './pages/Recursos educativos/BienestarDigital'
import CiudadaniaDigital from './pages/Recursos educativos/CiudadaniaDigital'
import PrevencionEstafas from './pages/Recursos educativos/PrevencionEstafas'
import ProteccionDatos from './pages/Recursos educativos/ProteccionDatos'
import IntroduccionRutasSeguras from './pages/Recursos educativos/IntroduccionRutasSeguras'

import Login from './components/Login'
import Register from './components/Register'

import VerifyEmail from './pages/VerifyEmail'

// MÓDULO DE REPORTES DE INCIDENTES
import IncidentReports from './pages/IncidentReports'
import MapaReporte from './pages/MapaReporte'
import AdminIncidents from './pages/AdminIncidents'

import UserSettings from './pages/UserSettings'
import AdminCategories from './pages/AdminCategories'
import { userSettingsAPI } from './services/api'

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
    if (!user || user.role === 'admin') return;

    const checkStatus = async () => {
      try {
        const profile = await userSettingsAPI.getProfile();
        if (profile.status === 'suspended') {
          alert('Tu cuenta ha sido suspendida por el administrador. Serás desconectado.');
          handleLogout();
        } else {
          // Actualizar datos locales si hubo cambios
          const updatedUser = { ...user, ...profile };
          if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        if (error.data?.error?.includes('suspendida')) {
          alert('Tu cuenta ha sido suspendida. Contacta al administrador.');
          handleLogout();
        } else if (error.message.includes('401') || error.message.includes('403')) {
          // Token inválido o expirado, cerrar sesión silenciosamente
          handleLogout();
        }
      }
    };

    // Verificar cada 5 segundos
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [user]);

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
          {/* RUTAS PÚBLICAS DE RECURSOS EDUCATIVOS*/}
          <Route path="/" element={user && isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
          <Route path="/recursos" element={<RecursosEducativos />} />
          <Route path="/recursos/seguridad-urbana" element={<GuiaSeguridadUrbana />} />
          <Route path="/recursos/reportar-incidentes" element={<ComoReportarIncidentes />} />
          <Route path="/recursos/numeros-emergencia" element={<NumerosEmergencia />} />
          <Route path="/recursos/rutas-portoviejo" element={<RutasSegurasPortoviejo />} />
          <Route path="/recursos/manejo-estres" element={<ManejoEstresAcademico />} />
          <Route path="/recursos/primeros-auxilios" element={<PrimerosAuxiliosEmocionales />} />
          <Route path="/recursos/apoyo-psicologico" element={<LineasApoyoPsicologico />} />
          <Route path="/recursos/bienestar-digital" element={<BienestarDigital />} />
          <Route path="/recursos/ciudadania-digital" element={<CiudadaniaDigital />} />
          <Route path="/recursos/prevencion-estafas" element={<PrevencionEstafas />} />
          <Route path="/recursos/proteccion-datos" element={<ProteccionDatos />} />
          <Route path="/recursos/introduccion" element={<IntroduccionRutasSeguras />} />
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
                <AdminPanel user={user} />
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