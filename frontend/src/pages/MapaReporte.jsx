import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/reporteusers.css'
import { incidentsAPI } from '../services/api'

// Iconos de Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

// Componente para capturar clicks en el mapa
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : <Marker position={position} />
}

const MapaReporte = ({ user, viewOnly = false }) => {
  const navigate = useNavigate()
  const [position, setPosition] = useState(null)
  const [showReportMobile, setShowReportMobile] = useState(false)
  const [incidentType, setIncidentType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingIncidents, setExistingIncidents] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [incidentTypes, setIncidentTypes] = useState([])
  const [selectedFilters, setSelectedFilters] = useState([]) // Array vacío = todos
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768)
  const [toast, setToast] = useState(null) // { message, type: 'success'|'error'|'warning' }

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // CARGAR CATEGORÍAS DESDE LA BASE DE DATOS
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await incidentsAPI.getCategories()
        const formatted = data.map(cat => ({
          value: cat.id,
          label: cat.name,
          icon: cat.icon,
          color: cat.color
        }))
        setIncidentTypes(formatted)
      } catch (error) {
        console.error('Error cargando categorías:', error)
      }
    }

    loadCategories()

    const handleResize = () => setIsDesktop(window.innerWidth > 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cargar incidentes existentes
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await incidentsAPI.getAll()
        setExistingIncidents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error:', error)
      }
    }
    loadIncidents()

    const interval = setInterval(loadIncidents, 10000)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        () => console.log('No se pudo obtener ubicación')
      )
    }

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async () => {
    if (!incidentType) {
      showToast('Por favor selecciona un tipo de incidente', 'warning')
      return
    }

    if (!position) {
      showToast('Por favor selecciona una ubicación en el mapa', 'warning')
      return
    }

    setLoading(true)

    try {
      await incidentsAPI.create({
        category_id: incidentType,
        description: description.trim(),
        latitude: position.lat,
        longitude: position.lng
      })

      showToast('¡Incidente reportado exitosamente!', 'success')
      if (showReportMobile) setShowReportMobile(false)
      setTimeout(() => navigate('/reportes'), 1500)
    } catch (error) {
      console.error('Error:', error)
      showToast('Error al enviar el reporte. Intenta de nuevo.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getIncidentColor = (incident) => {
    return incident.category_color || '#6b7280'
  }

  // Toggle filtro de categoría (multi-select)
  const toggleFilter = (categoryId) => {
    setSelectedFilters(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  // Filtrar incidentes (multi-categoría)
  const filteredIncidents = selectedFilters.length === 0
    ? existingIncidents
    : existingIncidents.filter(inc => selectedFilters.includes(inc.category_id))

  // Contar incidentes por categoría
  const getCountForCategory = (categoryId) => {
    return existingIncidents.filter(inc => inc.category_id === categoryId).length
  }

  // JSX del formulario (inline para evitar pérdida de focus)
  const renderIncidentForm = () => (
    <div className='detallesincidenteuser'>
      <div className="report-sidebar-header">
        <h3>Reportar Incidente</h3>
        <p>Selecciona el tipo y ubicación en el mapa</p>
        {!isDesktop && (
          <button className="close-report-btn" onClick={() => setShowReportMobile(false)}>✕</button>
        )}
      </div>

      <div className='sub_detallesincidenteuser'>
        <label>Tipo de Incidente *</label>
        {incidentTypes.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '10px' }}>Cargando categorías...</p>
        ) : (
          <div className='sub_detallesincidenteuserBotones grid-sidebar'>
            {incidentTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setIncidentType(type.value)}
                className={`type-btn-sidebar ${incidentType === type.value ? 'selected' : ''}`}
                style={{
                  border: incidentType === type.value ? `2px solid ${type.color}` : '1px solid var(--border-color)',
                  background: incidentType === type.value ? `${type.color}15` : 'var(--bg-card)',
                }}
              >
                <span className="type-icon">{type.icon}</span>
                <span className="type-label">{type.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='sub_detallesincidenteuser' style={{ marginTop: '15px' }}>
        <label>Descripción (Opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe lo que sucedió..."
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="report-actions-sidebar">
        <button
          onClick={handleSubmit}
          disabled={!incidentType || !position || loading}
          className="btn-submit-report"
        >
          {loading ? 'Enviando...' : 'Enviar Reporte'}
        </button>
        <button
          onClick={() => { setPosition(null); setIncidentType(''); setDescription(''); }}
          className="btn-clear-report"
        >
          Limpiar
        </button>
      </div>
    </div>
  )

  return (
    <div className="container_Ver_mapaReporte">
      <div className={`ontainer_Ver_mapaReportecard ${viewOnly ? 'full-width-layout' : ''}`}>

        <div className="mapa-reporte-layout">
          <div className="main-map-area">
            {/* Header */}
            <div className='contenidoapartadobo' style={{ marginBottom: '15px' }}>
              <div className='sub_contenidoapartadobo'>
                <h1>{viewOnly ? 'Mapa de Incidentes' : 'Reportar un Incidente'}</h1>
                <p>
                  {viewOnly
                    ? 'Visualización de incidentes reportados en tiempo real'
                    : 'Selecciona la zona del mapa y luego reportalo'
                  }
                </p>
              </div>

              <div className="header-actions-map">
                <div className="nav-buttons-map">
                  <button onClick={() => navigate('/reportes')} className="btn-secondary-map">
                    Ver Lista
                  </button>

                  {/* BOTÓN MÓVIL PARA ABRIR FORMULARIO */}
                  {!viewOnly && !isDesktop && (
                    <button
                      onClick={() => setShowReportMobile(true)}
                      className="mobile-report-toggle-btn"
                    >
                      ⚠️ Reportar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FILTRO MULTI-CATEGORÍA CON CONTEO (SOLO EN VER MAPA) */}
            {viewOnly && (
              <>
                <div className="filter-chips-container">
                  <button
                    className={`filter-chip ${selectedFilters.length === 0 ? 'active' : ''}`}
                    onClick={() => setSelectedFilters([])}
                  >
                    🔍 Todos
                    <span className="chip-count">{existingIncidents.length}</span>
                  </button>
                  {incidentTypes.map(type => {
                    const count = getCountForCategory(type.value)
                    const isActive = selectedFilters.includes(type.value)
                    return (
                      <button
                        key={type.value}
                        className={`filter-chip ${isActive ? 'active' : ''}`}
                        onClick={() => toggleFilter(type.value)}
                        style={{
                          borderColor: isActive ? type.color : 'var(--border-color)',
                          background: isActive ? `${type.color}15` : 'var(--bg-card)',
                        }}
                      >
                        {type.icon} {type.label}
                        <span className="chip-count" style={{ background: isActive ? type.color : '' }}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Badge de resultados filtrados */}
                {selectedFilters.length > 0 && (
                  <div className="filter-results-badge">
                    📊 Mostrando {filteredIncidents.length} de {existingIncidents.length} incidentes
                  </div>
                )}
              </>
            )}

            {/* Mapa */}
            <div className="map-container-wrapper">
              <MapContainer
                center={userLocation ? [userLocation.lat, userLocation.lng] : [-1.0234, -80.4667]}
                zoom={15}
                className="full-map-reporte"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {!viewOnly && <LocationMarker position={position} setPosition={setPosition} />}
                {filteredIncidents.map(incident => (
                  <Circle
                    key={incident.id}
                    center={[incident.lat, incident.lng]}
                    radius={50}
                    pathOptions={{
                      fillColor: getIncidentColor(incident),
                      color: getIncidentColor(incident),
                      fillOpacity: 0.4
                    }}
                  >
                    <Popup>
                      <strong>{incident.incident_type}</strong><br />
                      {incident.description && <em>"{incident.description}"</em>}<br />
                      <small>Reportado: {new Date(incident.created_at).toLocaleDateString()}</small>
                    </Popup>
                  </Circle>
                ))}
                {userLocation && (
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={30}
                    pathOptions={{ fillColor: '#3b82f6', color: '#3b82f6', fillOpacity: 0.6 }}
                  >
                    <Popup>Tu ubicación actual</Popup>
                  </Circle>
                )}
              </MapContainer>
            </div>

            {/* NOTIFICACIÓN DE POSICIÓN SELECCIONADA (SOLO REPORTE) */}
            {!viewOnly && position && (
              <div className="position-indicator-badge">
                📍 Ubicación seleccionada: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </div>
            )}
          </div>

          {/* SIDEBAR FORMULARIO (ESCRITORIO) */}
          {!viewOnly && isDesktop && (
            <aside className="report-sidebar-desktop">
              {renderIncidentForm()}
            </aside>
          )}
        </div>

        {/* DRAWER FORMULARIO (MÓVIL) */}
        {!viewOnly && !isDesktop && (
          <>
            <div
              className={`drawer-overlay ${showReportMobile ? 'active' : ''}`}
              onClick={() => setShowReportMobile(false)}
            />
            <div className={`report-drawer-mobile ${showReportMobile ? 'open' : ''}`}>
              <div className="drawer-handle" onClick={() => setShowReportMobile(false)}></div>
              {renderIncidentForm()}
            </div>
          </>
        )}

        {/* Leyenda (SOLO EN viewOnly) */}
        {viewOnly && incidentTypes.length > 0 && (
          <div className='mensajemap' style={{ margin: '15px' }}>
            <h4 className='h4mensa'>Leyenda de Incidentes:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {incidentTypes.map(type => (
                <div key={type.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: type.color }}></div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{type.icon} {type.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'warning' && '⚠️'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}
    </div>
  )
}

export default MapaReporte
