import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Map from '../components/Map'
import EmotionSelector from '../components/EmotionSelector'
import CommentForm from '../components/CommentForm'
import '../styles/MapView.css'

const MapView = ({ isAdmin, user, onInicio, center }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(false)

  // Obtener ubicación real
  const getLocation = () => {
    setLocationLoading(true)
    setLocationError(false)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationLoading(false)
        },
        (error) => {
          console.error("Error de geolocalización:", error);
          setLocationError(true)
          setLocationLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError(true)
      setLocationLoading(false)
    }
  }

  // Cargar ubicación al iniciar y verificar si venimos del Dashboard
  useEffect(() => {
    getLocation();

    // Si venimos del dashboard con una emoción seleccionada, la seteamos
    if (location.state?.emotionFromDashboard) {
      setSelectedEmotion(location.state.emotionFromDashboard)
      setShowReportForm(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [])

  const EMOTIONS_CONFIG = {
    '😊': { label: 'Feliz', color: '#10b981' },
    '😌': { label: 'Tranquilo', color: '#34d399' },
    '😐': { label: 'Neutro', color: '#a3e635' },
    '😰': { label: 'Ansioso', color: '#fbbf24' },
    '😨': { label: 'Asustado', color: '#f59e0b' },
    '😢': { label: 'Triste', color: '#f97316' },
    '😡': { label: 'Enojado', color: '#ef4444' }
  }

  const [activeFilters, setActiveFilters] = useState([])
  const [loadedReports, setLoadedReports] = useState([])

  const toggleFilter = (emotionEmoji) => {
    setActiveFilters(prev => {
      if (prev.includes(emotionEmoji)) {
        return prev.filter(e => e !== emotionEmoji)
      } else {
        return [...prev, emotionEmoji]
      }
    })
  }

  const visibleReportsCount = activeFilters.length === 0
    ? loadedReports.length
    : loadedReports.filter(r => activeFilters.includes(r.emotion)).length

  if (isAdmin) {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
        <div className='contenidoapartadobo' style={{ marginBottom: '15px' }}>
          <div className='sub_contenidoapartadobo'>
            <h1 className="map-title" style={{ margin: 0, fontSize: '24px', color: 'var(--text-heading)' }}>Mapa Emocional UTM</h1>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Visualización de emociones reportadas en tiempo real
            </p>
          </div>
        </div>

        <div className="filter-chips-container">
          <button
            className={`filter-chip ${activeFilters.length === 0 ? 'active' : ''}`}
            onClick={() => setActiveFilters([])}
            style={{
              borderColor: activeFilters.length === 0 ? '#3b82f6' : 'var(--border-color)',
              background: activeFilters.length === 0 ? '#3b82f615' : 'var(--bg-card)',
              color: activeFilters.length === 0 ? '#3b82f6' : 'var(--text-primary)'
            }}
          >
            🔍 Todos
            <span className="chip-count" style={{ background: activeFilters.length === 0 ? '#3b82f6' : 'var(--border-color)', color: activeFilters.length === 0 ? 'white' : 'var(--text-primary)' }}>
              {loadedReports.length}
            </span>
          </button>
          {Object.entries(EMOTIONS_CONFIG).map(([emoji, config]) => {
            const count = loadedReports.filter(r => r.emotion === emoji).length
            const isActive = activeFilters.includes(emoji)
            return (
              <button
                key={emoji}
                className={`filter-chip ${isActive ? 'active' : ''}`}
                onClick={() => toggleFilter(emoji)}
                style={{
                  borderColor: isActive ? config.color : 'var(--border-color)',
                  background: isActive ? `${config.color}15` : 'var(--bg-card)',
                  color: isActive ? config.color : 'var(--text-primary)'
                }}
              >
                {emoji} {config.label}
                <span className="chip-count" style={{
                  background: isActive ? config.color : 'var(--border-color)',
                  color: isActive ? 'white' : 'var(--text-primary)'
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {activeFilters.length > 0 && (
          <div className="filter-results-badge">
            📊 Mostrando {visibleReportsCount} de {loadedReports.length} emociones
          </div>
        )}

        <div className="admin-map-container" style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', minHeight: 0 }}>
          <Map
            userLocation={userLocation}
            onZoneClick={setSelectedZone}
            center={center}
            isAdmin={isAdmin}
            user={user}
            onReportsUpdate={setLoadedReports}
            activeFilters={activeFilters}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="map-view-container">
      <div className="map-view-header">
        <div className='ContenidoMapaInteractivo_User'>
          <Map
            userLocation={userLocation}
            onZoneClick={setSelectedZone}
            user={user}
          />

          <div className="map-interactive-content">
            <div className='map-sub-interactive-content'>
              <h3 style={{ marginBottom: '15px' }}>¿Cómo te sientes ahora?</h3>
              <span>Registra tu estado emocional para contribuir al mapa de bienestar</span>

              {/* Tarjeta de bienestar */}
              <div className="wellness-card">
                <div className="wellness-icon">🌟</div>
                <div className="wellness-text">
                  <strong>Cada emoción cuenta</strong>
                  <small>Tu reporte ayuda a construir un campus más consciente</small>
                </div>
              </div>

              {/* Ubicación */}
              <div className="location-status">
                <div className="location-info">
                  <strong>Ubicación</strong>
                  <span>
                    {userLocation
                      ? `Activada (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
                      : 'No activada'
                    }
                  </span>
                </div>
                {!userLocation && (
                  <button
                    onClick={getLocation}
                    className="location-btn"
                    disabled={locationLoading}
                  >
                    {locationLoading ? 'Obteniendo...' : 'Activar Ubicación'}
                  </button>
                )}
                {locationError && !userLocation && (
                  <div className="location-error-msg" style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', fontWeight: '500' }}>
                    No se pudo obtener la ubicación. Por favor, activa el GPS y otorga permisos.
                  </div>
                )}
              </div>

              {/* Selector de emociones */}
              <div className="emotion-section">
                <EmotionSelector onSelect={(emo) => {
                  setSelectedEmotion(emo)
                  setShowReportForm(true)
                }} />
              </div>
            </div>
          </div>
        </div>

        {showReportForm && (
          <div className="modal-overlay">
            <CommentForm
              emotion={selectedEmotion}
              location={userLocation}
              locationLoading={locationLoading}
              locationError={locationError}
              onClose={() => {
                setShowReportForm(false)
                setSelectedEmotion(null)
              }}
              user={user}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MapView