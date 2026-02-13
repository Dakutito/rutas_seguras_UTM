// frontend/src/pages/AdminCategories.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', icon: '', color: '#3b82f6' })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/incident-categories')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.icon || !formData.color) {
      alert('Todos los campos son obligatorios`)
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token`)
      const response = await fetch(`${API_URL}/incident-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json`,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Categoría creada')
        setFormData({ name: '', icon: '', color: '#3b82f6' })
        setShowNewForm(false)
        loadCategories()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al crear categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id, updates) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token`)
      const response = await fetch(`${API_URL}/incident-categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json`,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        alert('Categoría actualizada')
        setEditingCategory(null)
        loadCategories()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"?`)) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token`)
      const response = await fetch(`${API_URL}/incident-categories/${id}`, {
        method: 'DELETE`,
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('Categoría eliminada')
        loadCategories()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  if (loading && categories.length === 0) {
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
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#8b5cf6', marginBottom: '8px' }}>
              Gestión de Categorías
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Administra las categorías de incidentes del sistema
            </p>
          </div>
          <Link to="/admin" className="btn" style={{ background: '#6b7280', color: 'white' }}>
            ← Volver al Panel
          </Link>
        </div>

        {/* Botón Nueva Categoría */}
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          style={{
            padding: '14px 24px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '15px',
            marginBottom: '24px'
          }}
        >
          {showNewForm ? '✕ Cancelar' : '➕ Nueva Categoría'}
        </button>

        {/* Formulario Nueva Categoría */}
        {showNewForm && (
          <form onSubmit={handleCreate} style={{
            background: '#f0fdf4',
            border: '2px solid #10b981',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginTop: 0, color: '#047857' }}>Nueva Categoría</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ color:'#393939',display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Me siguen"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ color:'#393939',display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                  Ícono (Emoji)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ej: 🏃"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  maxLength={2}
                  required
                />
              </div>

              <div>
                <label style={{ color:'#393939',display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>
                  Color 
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    border: '2px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '700'
              }}
            >
              {loading ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </form>
        )}

        {/* Lista de Categorías */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px` }}>
          {categories.map(cat => (
            <div className='categoriaadinmodooscuro'
              key={cat.id}
              style={{
                border: `2px solid ${cat.color}30`,
                borderLeft: `6px solid ${cat.color}`,
              }}
            >
              {editingCategory === cat.id ? (
                // MODO EDICIÓN
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px` }}>
                    <input
                      type="text"
                      defaultValue={cat.name}
                      id={`name-${cat.id}`}
                      style={{
                        padding: '10px',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px`
                      }}
                    />
                    <input
                      type="text"
                      defaultValue={cat.icon}
                      id={`icon-${cat.id}`}
                      maxLength={2}
                      style={{
                        padding: '10px',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px`
                      }}
                    />
                    <input
                      type="color"
                      defaultValue={cat.color}
                      id={`color-${cat.id}`}
                      style={{
                        height: '42px',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px` }}>
                    <button
                      onClick={() => {
                        const name = document.getElementById(`name-${cat.id}`).value
                        const icon = document.getElementById(`icon-${cat.id}`).value
                        const color = document.getElementById(`color-${cat.id}`).value
                        handleUpdate(cat.id, { name, icon, color })
                      }}
                      style={{
                        padding: '10px 20px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      style={{
                        padding: '10px 20px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // MODO VISTA
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '32px' }}>{cat.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                        {cat.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        Color: {cat.color}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setEditingCategory(cat.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '12px' }}>
            <h3 style={{ color: '#6b7280' }}>No hay categorías creadas</h3>
            <p style={{ color: '#9ca3af', fontSize: '14px` }}>
              Crea tu primera categoría usando el botón "Nueva Categoría"
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminCategories