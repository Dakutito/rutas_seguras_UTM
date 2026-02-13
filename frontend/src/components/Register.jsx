import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!acceptedTerms) {
      setError('Debes aceptar los Términos y Condiciones.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      })
      setSuccess('Registro exitoso. Verifica tu correo.')
      alert('Registro exitoso. Revisa tu correo.')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario.')
    }
  }

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a' }}>
      
      {/* Contenedor Principal en Grid para dividir Izquierda y Derecha */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '20px', 
        maxWidth: '1100px', 
        width: '100%' 
      }}>

        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="card" style={{ padding: '2.5rem', background: '#1e293b', color: 'white', border: 'none' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Crea tu cuenta</h2>
          <p style={{ color: '#94a3b8', marginBottom: '25px', fontSize: '14px' }}>
            Únete a la comunidad de seguridad colaborativa.
          </p>

          {error && <div style={{ background: '#450a0a', color: '#f87171', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', border: '1px solid #7f1d1d' }}>{error}</div>}
          {success && <div style={{ background: '#064e3b', color: '#34d399', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form-styled">
            <label style={{ color: '#cbd5e1', fontSize: '14px' }}>Nombre Completo</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ background: '#334155', border: '1px solid #475569', color: 'white', marginBottom: '15px' }} />

            <label style={{ color: '#cbd5e1', fontSize: '14px' }}>Correo Electrónico</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={{ background: '#334155', border: '1px solid #475569', color: 'white', marginBottom: '15px' }} />

            <label style={{ color: '#cbd5e1', fontSize: '14px' }}>Contraseña</label>
            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required style={{ background: '#334155', border: '1px solid #475569', color: 'white', marginBottom: '15px' }} />

            <label style={{ color: '#cbd5e1', fontSize: '14px' }}>Confirmar Contraseña</label>
            <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required style={{ background: '#334155', border: '1px solid #475569', color: 'white', marginBottom: '20px' }} />

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', background: '#3b82f6', fontWeight: '600', border:'none', borderRadius: '8px', cursor:'pointer' }}>
              Crear Cuenta →
            </button>
          </form>
          <p style={{ marginTop: '20px', fontSize: '13px', textAlign: 'center', color: '#94a3b8' }}>
            ¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>Inicia sesión aquí</Link>
          </p>
        </div>

        {/* COLUMNA DERECHA: TÉRMINOS CON ICONOS */}
        <div className="card" style={{ padding: '2.5rem', background: '#1e293b', color: 'white', border: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
            Términos y Privacidad
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Item 1 */}
            <div style={{ display: 'flex', gap: '15px', background: '#334155', padding: '15px', borderRadius: '12px' }}>

              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Acceso a Ubicación</strong>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Se utiliza exclusivamente para mapear reportes de seguridad en tiempo real.</p>
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ display: 'flex', gap: '15px', background: '#334155', padding: '15px', borderRadius: '12px' }}>

              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Anonimato Total</strong>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>El usuario no podrá ver los sentimientos en el mapa de otros usuarios.</p>
              </div>
            </div>

            {/* Item 3 */}
            <div style={{ display: 'flex', gap: '15px', background: '#334155', padding: '15px', borderRadius: '12px' }}>

              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Datos Seguros</strong>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Tus datos están protegidos y solo son visibles para administradores del sistema.</p>
              </div>
            </div>

            {/* Item 4*/}
            <div style={{ display: 'flex', gap: '15px', background: '#334155', padding: '15px', borderRadius: '12px' }}>

              <div>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>Datos Seguros Reportes</strong>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Tu nombre aparecera en los reportes de incidentes que crees.</p>
              </div>
            </div>

          </div>

          <div style={{ marginTop: 'auto', padding: '15px', borderTop: '1px solid #334155' }}>
            <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', fontSize: '13px', alignItems: 'center' }}>
              <input 
                type="checkbox" 
                checked={acceptedTerms} 
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer` }}
              />
              <span>
                He leído y acepto los <strong>Términos y Condiciones</strong> y la <strong>Política de Privacidad</strong>.
              </span>
            </label>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Register