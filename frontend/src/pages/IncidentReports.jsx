import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdmin } from '../services/authService'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const IncidentReports = () => {
  const navigate = useNavigate()
  const [incidents, setIncidents] = useState([])
  const [filter, setFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [incidentTypes, setIncidentTypes] = useState([])
  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const isUserAdmin = isAdmin()

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/incident-categories`)
        const data = await response.json()
        setIncidentTypes(['Todos', ...data.map(cat => cat.name)])
      } catch (error) {
        console.error('Error:', error)
      }
    }
    loadCategories()
  }, [])

  const loadIncidents = async () => {
    try {
      const url = filter === 'Todos'
        ? `${API_URL}/incidents`
        : `${API_URL}/incidents?type=${filter}`

      const response = await fetch(url)
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
  }, [filter])

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este incidente?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/incidents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('Incidente eliminado')
        loadIncidents()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar')
    }
  }

  // Función para abrir ubicación
  const handleViewLocation = (lat, lng, type) => {
    setSelectedLocation({ lat, lng, type })
    setShowMapModal(true)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = (now - date) / 1000 / 60

    if (diff < 60) return `Hace ${Math.floor(diff)} min`
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const getIncidentColor = (type) => {
    const colors = {
      'Robo': '#ef4444',
      'Asalto': '#dc2626',
      'Acoso': '#f59e0b',
      'Vandalismo': '#8b5cf6',
      'Iluminación': '#fbbf24',
      'Infraestructura': '#6b7280',
      'Sospechoso': '#f97316',
      'Otro': '#10b981'
    }
    return colors[type] || '#6b7280'
  }

  const getIncidentIcon = (type) => {
    const icons = {
      'Robo': '🚨',
      'Asalto': '⚠️',
      'Acoso': '🚫',
      'Vandalismo': '🔨',
      'Iluminación': '💡',
      'Infraestructura': '🏗️',
      'Sospechoso': '👁️',
      'Otro': '📋'
    }
    return icons[type] || '📍'
  }

  if (loading && incidentTypes.length === 0) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px' }}>⏳</div>
          <h2>Cargando reportes...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: '8px' }}>Reportes de Incidentes</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Incidentes reportados por la comunidad
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Botón inicio usuario */}
            {!isUserAdmin && (
              <button
                onClick={() => navigate('/dashboard')}
                className="map-preview-btn"
              >
                inicio
              </button>
            )}

            {/* Botón NUEVO REPORTE SOLO para usuarios */}
            {!isUserAdmin && (
              <button
                onClick={() => navigate('/map-reporte')}
                className="btn btn-primary"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Nuevo Reportes
              </button>
            )}

            {/* Botón VER MAPA usuario */}
            {!isUserAdmin && (
              <button
                onClick={() => navigate('/mapa-reportes')}
                className="map-preview-btn"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Ver Mapa
              </button>
            )}

            {/* Botón VER MAPA admin */}
            {isUserAdmin && (
              <button
                onClick={() => navigate('/admin/mapa-reportes')}
                className="map-preview-btn"
              >
                Ver Mapa
              </button>
            )}
          </div>
        </div>

        {/* categoria de reporte */}
        <div className='categoriadereporte'>
          {incidentTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                background: filter === type ? getIncidentColor(type) : '',
                color: filter === type ? 'white' : '',
                fontWeight: filter === type ? '600' : '400',
              }}
            >
              {type !== 'Todos' && getIncidentIcon(type)} {type}
            </button>
          ))}
        </div>

        {/* Lista de incidentes */}
        {incidents.length === 0 ? (
          <div className='cuandonohayreporte'>
            <h3>
              No hay reportes de {filter === 'Todos' ? 'incidentes' : filter.toLowerCase()}
            </h3>
            <p>
              Sé el primero en reportar un incidente en esta categoría
            </p>
          </div>
        ) : (

          <div className='Comienzareporte'>
            {incidents.map(incident => (
              <div className='sub_Comienzareporte'
                key={incident.id}
                style={{
                  borderLeft: `6px solid ${getIncidentColor(incident.incident_type)}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)'
                }}
              >
                <div className='botonesdeladminreport'>
                  <div style={{ flex: 1 }}>
                    <div className='subb_botonesdeladminreport'>
                      <span style={{ fontSize: '32px' }}>
                        {getIncidentIcon(incident.incident_type)}
                      </span>
                      <div>
                        <h3>{incident.incident_type}</h3>
                        <p >
                          {formatDate(incident.created_at)}
                        </p>
                      </div>
                    </div>

                    {incident.description && (
                      <div className='sub_subb_comentario'>
                        <p>
                          "{incident.description}"
                        </p>
                      </div>
                    )}

                    {/* Info del usuario - Email SOLO para admin */}
                    <div className='adminemailreporte'>
                      <div className='sud_adminemailreporte'>
                        <span><strong>Usuario:</strong> {incident.user_name || 'Anónimo'}</span>
                      </div>

                      {/* EMAIL - SOLO VISIBLE PARA ADMIN */}
                      {isUserAdmin && incident.user_email && (
                        <div className='sud_adminemailreporte'>
                          <strong>Correo:</strong><span> {incident.user_email}</span>
                        </div>
                      )}

                      <div className='sud_adminemailreporte'>
                        <span>Ubicación:</span>
                        <span>
                          Lat: {parseFloat(incident.lat).toFixed(4)}, Lng: {parseFloat(incident.lng).toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
                    <span style={{
                      background: `${getIncidentColor(incident.incident_type)}20`,
                      color: getIncidentColor(incident.incident_type),
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
                    }}>
                      {incident.incident_type}
                    </span>

                    {/* BOTÓN VER UBICACIÓN */}
                    <button
                      onClick={() => handleViewLocation(incident.lat, incident.lng, incident.incident_type)}
                      style={{
                        padding: '8px 14px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      Ubicación
                    </button>

                    {/* BOTÓN ELIMINAR - SOLO ADMIN */}
                    {isUserAdmin && (
                      <button
                        onClick={() => handleDelete(incident.id)}
                        style={{
                          padding: '8px 14px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div style={{
          marginTop: '30px',
          padding: '16px',
          background: '#f0f9ff',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#075985'
        }}>
          <strong>Total de incidentes activos:</strong> {incidents.length} •
          <strong> Filtro actual:</strong> {filter}
        </div>
      </div>

      {/* MODAL DE MAPA */}
      {showMapModal && selectedLocation && (
        <div
          className="modal-overlay"
          onClick={() => setShowMapModal(false)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1200px',
              width: '100%',
              padding: '0',
              overflow: 'hidden'
            }}
          >
            <div className='navbarsububicacion'>
              <h2>
                Ubicación del Incidente
              </h2>
              <button
                onClick={() => setShowMapModal(false)}>
                ✕ Cerrar
              </button>
            </div>

            <div className='conenidodelmapaubicac'>
              <p>
                <strong>Tipo:</strong> {selectedLocation.type}
              </p>
              <p>
                <strong>Coordenadas:</strong> {selectedLocation.lat}, {selectedLocation.lng}
              </p>

              {/* Mapa con iframe de OpenStreetMap */}
              <iframe
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.01},${selectedLocation.lat - 0.01},${selectedLocation.lng + 0.01},${selectedLocation.lat + 0.01}&layer=mapnik&marker=${selectedLocation.lat},${selectedLocation.lng}`}
                style={{ border: '2px solid #e5e7eb', borderRadius: '10px' }}
              />

              {/* EDITAR */}
              {/* Enlace para abrir en Google Maps */}
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <a
                  href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 24px',
                    background: '#10b981',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IncidentReports