import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../services/api'

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([])
  const [filter, setFilter] = useState('activo')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadIncidents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/incidents/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setIncidents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidents()
    const interval = setInterval(loadIncidents, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleResolve = async (id) => {
    if (!window.confirm('¿Marcar este incidente como resuelto?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/incidents/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        loadIncidents()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este incidente permanentemente?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/incidents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        loadIncidents()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getIncidentColor = (incident) => incident.category_color || '#6b7280'
  const getIncidentIcon = (incident) => incident.category_icon || '📍'

  const filteredIncidents = incidents
    .filter(i => i.status === filter || filter === 'todos')
    .filter(i => {
      if (!search) return true
      const s = search.toLowerCase()
      return (
        (i.user_name || '').toLowerCase().includes(s) ||
        (i.user_email || '').toLowerCase().includes(s) ||
        (i.description || '').toLowerCase().includes(s) ||
        i.incident_type.toLowerCase().includes(s)
      )
    })

  const stats = {
    activos: incidents.filter(i => i.status === 'activo').length,
    resueltos: incidents.filter(i => i.status === 'resuelto').length,
    total: incidents.length
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: '#ef4444', marginBottom: '8px' }}>
              Gestión de Incidentes
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Panel de administración de reportes de incidentes
            </p>
          </div>
          <Link to="/admin" className="btn" style={{ background: '#6b7280', color: 'white' }}>
            ← Volver al Panel
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fef2f2', padding: '18px', borderRadius: '10px', border: '2px solid #fee2e2' }}>
            <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>Activos</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>{stats.activos}</div>
          </div>
          <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '10px', border: '2px solid #dcfce7' }}>
            <div style={{ fontSize: '12px', color: '#14532d', marginBottom: '4px' }}>Resueltos</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>{stats.resueltos}</div>
          </div>
          <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '10px', border: '2px solid #dbeafe' }}>
            <div style={{ fontSize: '12px', color: '#1e3a8a', marginBottom: '4px' }}>Total</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2563eb' }}>{stats.total}</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <option value="activo">Activos</option>
            <option value="resuelto">Resueltos</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredIncidents.map(incident => (
            <div
              key={incident.id}
              style={{
                background: 'white',
                borderLeft: `6px solid ${getIncidentColor(incident)}`,
                padding: '18px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{getIncidentIcon(incident)}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                        {incident.incident_type}
                      </h3>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        {new Date(incident.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <span style={{
                      background: incident.status === 'resuelto' ? '#dcfce7' : '#fef2f2',
                      color: incident.status === 'resuelto' ? '#15803d' : '#b91c1c',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {incident.status === 'resuelto' ? '✓ Resuelto' : ' Activo'}
                    </span>
                  </div>

                  {incident.description && (
                    <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                      <p style={{ margin: 0, fontSize: '14px' }}> "{incident.description}"</p>
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <span> usuario: {incident.user_name} ({incident.user_email})</span>
                    <span> ubicacion: {parseFloat(incident.latitude).toFixed(4)}, {parseFloat(incident.longitude).toFixed(4)}</span>
                    {incident.resolved_by_name && (
                      <span>✓ Resuelto por: {incident.resolved_by_name}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {incident.status === 'activo' && (
                    <button
                      onClick={() => handleResolve(incident.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      Resolver
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(incident.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIncidents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '12px' }}>
            <div style={{ fontSize: '64px' }}>📭</div>
            <h3 style={{ color: '#6b7280' }}>No hay incidentes {filter !== 'todos' && `${filter}s`}</h3>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminIncidents