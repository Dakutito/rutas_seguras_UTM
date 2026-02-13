import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/Login.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Login = ({ onLogin }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminCode: '' // Campo para código admin
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdminCode, setShowAdminCode] = useState(false) // Mostrar campo código
  const [requiresAdminCode, setRequiresAdminCode] = useState(false) // Backend requiere código

  // Detectar si el email es de admin
  useEffect(() => {
    const isAdminEmail = formData.email.toLowerCase() === 'admin@rutas.com'
    setShowAdminCode(isAdminEmail)
  }, [formData.email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loginData = {
        email: formData.email.toLowerCase(),
        password: formData.password
      }

      // Solo enviar adminCode si es necesario
      if (showAdminCode && formData.adminCode) {
        loginData.adminCode = formData.adminCode
      }

      const response = await axios.post(
        `${API_URL}/auth/login`,
        loginData
      )

      const { user, token } = response.data

      // Guardar token y usuario
      localStorage.setItem('token', token)
      onLogin(user)

      // Redirección por rol
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard`)
      }

    } catch (err) {
      const errorData = err.response?.data
      const message = errorData?.error || 'Error al conectar con el servidor'
      
      // Si el backend requiere código admin, mostrarlo
      if (errorData?.requiresAdminCode) {
        setRequiresAdminCode(true)
        setShowAdminCode(true)
      }
      
      // Mostrar intentos restantes
      if (errorData?.remainingAttempts !== undefined) {
        setError(`${message} (Intentos restantes: ${errorData.remainingAttempts})`)
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div style={{background:'rgb(30, 41, 59)'}} className="logininicio auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>

        {/* Indicador de modo admin */}
        {showAdminCode && (
          <div style={{
            background: '#dbeafe',
            border: '2px solid #3b82f6',
            color: '#1e40af',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '18px',
            fontSize: '13px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Modo Administrador - Se requiere código de acceso
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '18px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '6px',
            color: 'white'
          }}>
            Correo Electrónico
          </label>
          <input
            type="email"
            placeholder="ejemplo@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '18px',
              borderRadius: '8px',
              background:'rgb(51, 65, 85)',
              border:'1px solid rgb(71, 85, 105)',
              color:'white'
            }}
          />

          {/* Contraseña */}
          <label style={{
            display: 'block',
            fontWeight: '600',
            marginBottom: '6px',
            color: 'white'
          }}>
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: showAdminCode ? '18px' : '24px',
              borderRadius: '8px',
              background:'rgb(51, 65, 85)',
              border:'1px solid rgb(71, 85, 105)',
              color:'white' 
            }}
          />

          {/* CÓDIGO ADMIN (solo visible si detecta admin@rutas.com) */}
          {showAdminCode && (
            <>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#fbbf24',
                alignItems: 'center',
                gap: '8px'
              }}>
                Código de Acceso Administrativo
              </label>
              <input
                type="text"
                placeholder="Ingresa el código de acceso admin"
                value={formData.adminCode}
                onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                required={requiresAdminCode}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '24px',
                  borderRadius: '8px',
                  background:'rgb(51, 65, 85)',
                  border:'2px solid #fbbf24',
                  color:'#fbbf24',
                  fontWeight: '600',
                  letterSpacing: '2px'
                }}
                autoComplete="off"
              />
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginTop: '-18px',
                marginBottom: '20px'
              }}>
                Este código es confidencial y solo debe ser conocido por administradores autorizados
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#94a3b8' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '15px'
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{
          marginTop: '22px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#9ca3af'
        }}>
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            style={{
              color: '#4f46e5',
              fontWeight: '600',
              textDecoration: 'none`
            }}
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login