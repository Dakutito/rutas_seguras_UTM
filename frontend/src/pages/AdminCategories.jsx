import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../services/api'

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
      const response = await fetch(`${API_URL}/api/incident-categories`)
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
      alert('Todos los campos son obligatorios')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/incident-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/incident-categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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
      alert('Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"?`)) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/incident-categories/${id}`, {
        method: 'DELETE',
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
        <div className="admin-categories-header">
          <div>
            <h1>Gestión de Categorías</h1>
            <p className="admin-desc-text">
              Administra las categorías de incidentes del sistema
            </p>
          </div>
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
          {showNewForm ? '✕ Cancelar' : 'Nueva Categoría'}
        </button>

        {/* Formulario Nueva Categoría */}
        {showNewForm && (
          <form onSubmit={handleCreate} className="new-category-form">
            <h3>Nueva Categoría</h3>

            <div className="form-grid-three">
              <div>
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Me siguen"
                  className="cat-input"
                  required
                />
              </div>

              <div>
                <label>Ícono (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ej: 🏃"
                  className="cat-input"
                  maxLength={2}
                  required
                />
              </div>

              <div>
                <label>Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="cat-color-picker"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="cat-submit-btn">
              {loading ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </form>
        )}

        {/* Lista de Categorías */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  <div className="form-grid-three" style={{ marginBottom: '12px' }}>
                    <input
                      type="text"
                      defaultValue={cat.name}
                      id={`name-${cat.id}`}
                      className="cat-input"
                    />
                    <input
                      type="text"
                      defaultValue={cat.icon}
                      id={`icon-${cat.id}`}
                      maxLength={2}
                      className="cat-input"
                    />
                    <input
                      type="color"
                      defaultValue={cat.color}
                      id={`color-${cat.id}`}
                      className="cat-color-picker"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
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
                  <div className="cat-item-info">
                    <span className="cat-icon-display">{cat.icon}</span>
                    <div>
                      <h3 className="cat-name-display">{cat.name}</h3>
                      <p className="admin-desc-text">Color: {cat.color}</p>
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
          <div className="empty-state-card">
            <h3>No hay categorías creadas</h3>
            <p>Crea tu primera categoría usando el botón "Nueva Categoría"</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminCategories