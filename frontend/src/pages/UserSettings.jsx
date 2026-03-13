// frontend/src/pages/UserSettings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Components.css'

import { userSettingsAPI, API_URL } from '../services/api'

const UserSettings = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const data = await userSettingsAPI.getProfile()
      setUserData(data)
      setNewName(data.name)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleUpdateName = async () => {
    if (!newName.trim() || newName.trim().length < 3) {
      alert('El nombre debe tener al menos 3 caracteres')
      return
    }

    setLoading(true)
    try {
      await userSettingsAPI.updateName(newName)

      // Actualizar localStorage
      const updatedUser = { ...user, name: newName }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      alert('Nombre actualizado correctamente')
      loadUserData()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar nombre')
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteAccount = async () => {
    const confirmText = window.prompt(
      'ADVERTENCIA: Esta acción eliminará permanentemente tu cuenta y todos tus datos.\n\n' +
      'Escribe "ELIMINAR" para confirmar:'
    )

    if (confirmText !== 'ELIMINAR') {
      alert('Cancelado')
      return
    }

    setLoading(true)
    try {
      await userSettingsAPI.deleteAccount()

      alert('Tu cuenta ha sido eliminada')
      onLogout()
      navigate('/')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar cuenta')
    } finally {
      setLoading(false)
    }
  }

  if (!userData) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px' }}>⏳</div>
          <h2>Cargando...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 0' }} className='userconfiggh1'>⚙️ Configuración <br />
          <span style={{ color: '#64748B', fontSize: '14px' }}>Gestiona los detalles de tu cuenta y preferencias.</span>
        </h1>

        {/* EDITAR NOMBRE */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '15px' }}>Información Personal</h3>

          <div className='userconfiggh1_email' >
            <label>
              Nombre
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)} />
              <button
                onClick={handleUpdateName}
                disabled={loading || newName === userData.name}
                style={{
                  padding: '12px 24px',
                  background: newName === userData.name ? '#6366F1' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: newName === userData.name ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Guardar
              </button>
            </div>
          </div>

          <div className='userconfiggh1_email' >
            <label>
              Email
            </label>
            <input
              type="text"
              value={userData.email}
              disabled />
            <small>
              El email no se puede cambiar
            </small>
          </div>

          <div className='userconfiggh1_email'>
            <label>
              Fecha de Registro
            </label>
            <input
              type="text"
              value={new Date(userData.created_at).toLocaleDateString('es-ES')}
              disabled />
          </div>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className='zonapelicgrocuenta'>
          <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>⚠️ Zona de Peligro</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, está seguro.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '15px'
            }}
          >
            🗑️ Eliminar mi Cuenta
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserSettings