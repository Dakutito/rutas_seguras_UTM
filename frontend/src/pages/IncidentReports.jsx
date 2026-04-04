import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdmin } from '../services/authService'
import '../styles/Components.css'
import { FaMapMarkerAlt } from 'react-icons/fa'; // Font Awesome
import { MdLocationOn } from 'react-icons/md'; // Material Icons

import { incidentsAPI } from '../services/api'

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
        const data = await incidentsAPI.getCategories()
        setIncidentTypes([{ name: 'Todos', color: '#64748b', icon: '📋' }, ...data])
      } catch (error) {
        console.error('Error:', error)
      }
    }
    loadCategories()
  }, [])

  const loadIncidents = async () => {
    try {
      const data = await incidentsAPI.getAll(filter)
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
      await incidentsAPI.delete(id)
      alert('Incidente eliminado')
      loadIncidents()
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
    let date = new Date(dateStr)
    const now = new Date()
    let diff = (now - date) / 1000 / 60

    // Si diff es muy negativo, hay desfase de timezone → corregir
    if (diff < -2) {
      date = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      diff = (now - date) / 1000 / 60
    }

    if (diff < 1) return 'Justo ahora'
    if (diff < 60) return `Hace ${Math.floor(diff)} min`
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Ya no necesitamos mapeos estáticos, usamos lo que viene de la DB
  const getIncidentColor = (incident) => incident.category_color || '#6b7280'
  const getIncidentIcon = (incident) => incident.category_icon || '📍'

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
    <div className="Contenidoreporteincidet">
      <div className="card">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: '8px' }}>Reportes Comunitario</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Vigilancia en tiempo real de incidentes locales para una comunidad más segura.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Botón NUEVO REPORTE SOLO para usuarios */}
            {!isUserAdmin && (
              <button
                onClick={() => navigate('/map-reporte')}
                className="map-preview-btn"
              >
                Nuevo Reportes
              </button>
            )}

            {/* Botón VER MAPA usuario */}
            {!isUserAdmin && (
              <button
                onClick={() => navigate('/mapa-reportes')}
                className="map-preview-btn"
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
          {incidentTypes.map(cat => (
            <button
              key={cat.name}
              onClick={() => setFilter(cat.name)}
              style={{
                background: filter === cat.name ? cat.color : '',
                color: filter === cat.name ? 'white' : '',
                fontWeight: filter === cat.name ? '600' : '400',
              }}
            >
              {cat.name !== 'Todos' && cat.icon} {cat.name}
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
                  borderLeft: `6px solid ${getIncidentColor(incident)}`,
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
                      <span style={{
                        background: 'rgba(0,0,0,0.05)',
                        color: getIncidentColor(incident),
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        textAlign: 'center'
                      }}>
                        {incident.incident_type}
                      </span><div>
                        <p style={{ marginTop: '10px' }}>
                          {formatDate(incident.created_at)}
                        </p>
                      </div>
                    </div>

                    {incident.title && (
                      <h3 style={{
                        margin: '8px 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: 'var(--text-primary, #1f2937)'
                      }}>
                        {incident.title}
                      </h3>
                    )}

                    {incident.description && (
                      <div className='sub_subb_comentario'>
                        <p>
                          {incident.description}
                        </p>
                      </div>
                    )}

                    {/* Info del usuario - Email SOLO para admin */}
                    <div className='adminemailreporte'>

                      {/* EMAIL - SOLO VISIBLE PARA ADMIN */}
                      {isUserAdmin && incident.user_email && (
                        <div className='sud_adminemailreporte'>
                          <strong>Correo:</strong><span> {incident.user_email}</span>
                        </div>
                      )}


                    </div>
                  </div>

                  <div className='ListadeReporteUser'>
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
                      <MdLocationOn style={{ marginRight: '5px', fontSize: '14px' }} />  Ubicación
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
          style={{ zIndex: 9999, padding: '0' }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100vw',
              width: '100%',
              height: '100vh',
              maxHeight: '100vh',
              borderRadius: '0',
              padding: '0',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className='navbarsububicacion'>
              <h2>
                Ubicación del Incidente
              </h2>
              <button
                onClick={() => setShowMapModal(false)}>
                ✕
              </button>
            </div>

            <div className='conenidodelmapaubicac' style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
              <p>
                <strong>Tipo:</strong> {selectedLocation.type}
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>Coordenadas:</strong> {selectedLocation.lat}, {selectedLocation.lng}
              </p>

              {/* Mapa con iframe de OpenStreetMap */}
              <div style={{ flex: 1, minHeight: '300px' }}>
                <iframe
                  title="mapa-ubicacion"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.01},${selectedLocation.lat - 0.01},${selectedLocation.lng + 0.01},${selectedLocation.lat + 0.01}&layer=mapnik&marker=${selectedLocation.lat},${selectedLocation.lng}`}
                  style={{ border: '2px solid #e5e7eb', borderRadius: '10px' }}
                />
              </div>

              {/* EDITAR */}
              {/* Enlace para abrir en Google Maps */}
              <div style={{ marginTop: '20px', textAlign: 'center', paddingBottom: '20px' }}>
                <a
                  href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '16px 32px',
                    background: '#10b981',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    display: 'inline-block',
                    width: '100%',
                    boxSizing: 'border-box'
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