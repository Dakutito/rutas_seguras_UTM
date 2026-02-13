// frontend/src/pages/UserSettings.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const UserSettings = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/user-settings/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
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
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/user-settings/update-name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      })

      if (response.ok) {
        const data = await response.json()
        // Actualizar localStorage
        const updatedUser = { ...user, name: newName }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        alert('Nombre actualizado correctamente')
        loadUserData()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar nombre')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/user-settings/upload-photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        alert('Foto actualizada correctamente')
        loadUserData()
        setShowPhotoMenu(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al subir foto')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!window.confirm('¿Eliminar foto de perfil?')) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/user-settings/delete-photo`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('Foto eliminada')
        loadUserData()
        setShowPhotoMenu(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar foto')
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
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/user-settings/delete-account`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('Tu cuenta ha sido eliminada')
        onLogout()
        navigate('/')
      }
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
        <h1 style={{borderBottom: '1px solid #e5e7eb', padding: '20px 0'}} className='userconfiggh1'>⚙️ Configuración <br />
          <span style={{color:'#64748B', fontSize:'14px'}}>Gestiona los detalles de tu cuenta y preferencias.</span>
        </h1>
        {/* FOTO DE PERFIL */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
              onClick={() => setShowPhotoMenu(!showPhotoMenu)}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: userData.profile_photo 
                  ? `url(${API_URL.replace('/api', '')}${userData.profile_photo})` 
                  : '#e5e7eb',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '72px',
                cursor: 'pointer',
                border: '4px solid #3b82f6',
                margin: '0 auto'
              }}
            >
              {!userData.profile_photo && '👤'}
            </div>

            {showPhotoMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '10px',
                background: 'white',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '10px',
                zIndex: 100,
                minWidth: '180px'
              }}>
                {userData.profile_photo && (
                  <button
                    onClick={() => window.open(`${API_URL.replace('/api', '')}${userData.profile_photo}`, '_blank')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: 'none',
                      background: '#eff6ff',
                      color: '#1e40af',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}
                  >
                    Ver Foto
                  </button>
                )}
                
                <label style={{
                  width: '100%',
                  padding: '10px',
                  border: 'none',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  display: 'block',
                  textAlign: 'center',
                  fontSize: '14px'
                }}>
                  {userData.profile_photo ? 'Cambiar Foto' : 'Subir Foto'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {userData.profile_photo && (
                  <button
                    onClick={handleDeletePhoto}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: 'none',
                      background: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Eliminar Foto
                  </button>
                )}
              </div>
            )}
          </div>
          <h3 style={{ marginBottom: '20px' }}>Foto de Perfil <br />
            <span style={{color:'#64748B', fontSize:'14px'}}>PNG, JPG hasta 10MB</span>
          </h3>
        </div>

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
                onChange={(e) => setNewName(e.target.value)}/>
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
              disabled/>
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
              disabled/>
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