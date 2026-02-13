import { useState, useEffect } from 'react'
import Map from '../components/Map'
import EmotionSelector from '../components/EmotionSelector'
import CommentForm from '../components/CommentForm'
import '../styles/MapView.css'

const MapView = ({ isAdmin, user }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)

  // Obtener ubicación real
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => alert( "Activa el GPS para reportar tu ubicación"),
        { enableHighAccuracy: true }
      )
    }
  }

  // Cargar ubicación al iniciar
  useEffect(() => { getLocation() }, [])

  if (isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="map-title">Mapa Emocional UTM</h1>
          <Map
            userLocation={userLocation}
            onZoneClick={setSelectedZone}
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
    <h3 style={{marginBottom:'15px'}}>¿Cómo te sientes ahora?</h3>
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
        <button onClick={getLocation} className="location-btn">
          Activar Ubicación
        </button>
      )}
    </div>
    
    {/* Selector de emociones */}
    <div className="emotion-section">
      <EmotionSelector onSelect={setSelectedEmotion} />
    </div>
    
    {/* Botón de reporte */}
    {selectedEmotion && userLocation && !showReportForm && (
      <button
        onClick={() => setShowReportForm(true)} 
        className="report-btn"
      >
        <span className="emotion-icon">{selectedEmotion.emoji}</span>
        Reportar {selectedEmotion.label}
        <span className="arrow">→</span>
      </button>
    )}
    
    {/* Estado del reporte */}
    {selectedEmotion && userLocation && (
      <div className="report-status">
        <div className="status-dot"></div>
        <span>
          Listo para reportar <strong>{selectedEmotion.label.toLowerCase()}</strong> en tu ubicación actual
        </span>
      </div>
    )}
  </div>
</div>
        </div>

        {showReportForm && (
          <div className="modal-overlay">
            <CommentForm
              emotion={selectedEmotion}
              location={userLocation}
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