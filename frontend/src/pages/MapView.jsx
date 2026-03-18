import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Map from '../components/Map'
import EmotionSelector from '../components/EmotionSelector'
import CommentForm from '../components/CommentForm'
import '../styles/MapView.css'

const MapView = ({ isAdmin, user, onInicio, center }) => {
  const location = useLocation()
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
    }
  }, [])

  if (isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 className="map-title" style={{ margin: 0 }}>Mapa Emocional UTM</h1>
          </div>
          <Map
            userLocation={userLocation}
            onZoneClick={setSelectedZone}
            center={center}
            isAdmin={isAdmin}
            user={user}
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