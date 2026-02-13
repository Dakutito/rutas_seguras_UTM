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
  const [incidentType, setIncidentType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingIncidents, setExistingIncidents] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [incidentTypes, setIncidentTypes] = useState([])

  // CARGAR CATEGORÍAS DESDE LA BASE DE DATOS
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await incidentsAPI.getCategories()
        const formatted = data.map(cat => ({
          value: cat.name,
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

    // Actualizar cada 10 segundos
    const interval = setInterval(loadIncidents, 10000)

    // Obtener ubicación del usuario
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
      alert('Por favor selecciona un tipo de incidente')
      return
    }

    if (!position) {
      alert('Por favor selecciona una ubicación en el mapa')
      return
    }

    setLoading(true)

    try {
      await incidentsAPI.create({
        incident_type: incidentType,
        description: description.trim(),
        latitude: position.lat,
        longitude: position.lng
      })

      alert('Incidente reportado exitosamente')
      navigate('/reportes')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const getIncidentColor = (type) => {
    const incident = incidentTypes.find(i => i.value === type)
    return incident ? incident.color : '#6b7280'
  }

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className='contenidoapartadobo'>
          <div className='sub_contenidoapartadobo'>
            <h1>
              Mapa de Reportes
            </h1>
            <p>
              {viewOnly
                ? 'Visualización de todos los incidentes reportados'
                : 'Haz clic en el mapa para seleccionar la ubicación del incidente'
              }
            </p>
          </div>
          {/* Botón ver reportes */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Botón inicio usuario */}
            {!viewOnly && (
              <button
                onClick={() => navigate('/dashboard')}
                className="map-preview-btn"
              >
                inicio
              </button>
            )}
            <button
              onClick={() => navigate('/reportes')}
              className="btn"
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
              ver Reportes
            </button>
          </div>


        </div>

        {/* Mapa */}
        <div style={{ marginBottom: viewOnly ? '0' : '24px' }}>
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [-1.0234, -80.4667]}
            zoom={15}
            style={{
              height: '500px',
              width: '100%',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              position: 'sticky',
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Marcador seleccionado por el usuario - SOLO SI NO ES viewOnly */}
            {!viewOnly && <LocationMarker position={position} setPosition={setPosition} />}

            {/* Mostrar incidentes existentes */}
            {existingIncidents.map(incident => (
              <Circle
                key={incident.id}
                center={[incident.lat, incident.lng]}
                radius={50}
                pathOptions={{
                  fillColor: getIncidentColor(incident.incident_type),
                  color: getIncidentColor(incident.incident_type),
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

            {/* Ubicación del usuario */}
            {userLocation && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={30}
                pathOptions={{
                  fillColor: '#3b82f6',
                  color: '#3b82f6',
                  fillOpacity: 0.6
                }}
              >
                <Popup>Tu ubicación actual</Popup>
              </Circle>
            )}
          </MapContainer>
        </div>

        {/* Formulario - SOLO SI NO ES viewOnly */}
        {!viewOnly && (
          <div className='detallesincidenteuser' >
            <h3>
              Detalles del Incidente
            </h3>

            {/* Selector de tipo de incidente */}
            <div className='sub_detallesincidenteuser'>
              <label>
                Tipo de Incidente *
              </label>

              {incidentTypes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: '#92400e' }}>
                    Cargando categorías...
                  </p>
                </div>
              ) : (
                <div className='sub_detallesincidenteuserBotones'>
                  {incidentTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setIncidentType(type.value)}
                      style={{
                        border: incidentType === type.value ? `3px solid ${type.color}` : 'none',
                        background: incidentType === type.value ? `${type.color}15` : '',
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>{type.icon}</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: incidentType === type.value ? '700' : '500',
                        color: incidentType === type.value ? type.color : '#5b5e63'
                      }}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className='sub_detallesincidenteuser'>
              <label >
                Descripción (Opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe lo que sucedió..."
                maxLength={500}
              />
              <small style={{ color: '#9ca3af', fontSize: '12px' }}>
                {description.length}/500 caracteres
              </small>
            </div>

            {/* Info de ubicación seleccionada */}
            {position && (
              <div style={{
                background: '#dbeafe',
                border: '2px solid #3b82f6',
                padding: '14px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>
                  Ubicación seleccionada:
                  Lat {position.lat.toFixed(6)}, Lng {position.lng.toFixed(6)}
                </p>
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSubmit}
                disabled={!incidentType || !position || loading}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '14px 24px',
                  background: incidentType ? getIncidentColor(incidentType) : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: !incidentType || !position || loading ? 'not-allowed' : 'pointer',
                  opacity: !incidentType || !position || loading ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Enviando...' : 'Enviar Reporte'}
              </button>
              <button
                onClick={() => {
                  setPosition(null)
                  setIncidentType('')
                  setDescription('')
                }}
                style={{
                  padding: '14px 24px',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Leyenda de colores */}
        {viewOnly && incidentTypes.length > 0 && (
          <div className='mensajemap'>
            <h4 className='h4mensa'>
              Incidentes:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {incidentTypes.map(type => (
                <div key={type.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: type.color
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {type.icon} {type.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapaReporte