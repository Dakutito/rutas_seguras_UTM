import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import '../styles/Map.css'
import { reportsAPI } from '../services/api'

// Corrección de iconos de Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

function ChangeView({ center }) {
  const map = useMap();
  if (center) map.setView(center, map.getZoom());
  return null;
}

const Map = ({ userLocation, onZoneClick, isAdmin = false, user, center, onReportsUpdate, activeFilters = [] }) => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      if (isAdmin) {
        // Admin ve TODOS los reportes de tipo EMOCIÓN
        const data = await reportsAPI.getAll()
        // Filtrar solo los que NO son incidentes (emociones)
        const emos = Array.isArray(data) ? data.filter(r => !r.is_incident) : [];
        setReports(emos);
        if (onReportsUpdate) onReportsUpdate(emos);
      } else if (user) {
        // Usuario normal solo ve SUS PROPIOS reportes
        const data = await reportsAPI.getMyReports()
        const emos = Array.isArray(data) ? data : [];
        setReports(emos);
        if (onReportsUpdate) onReportsUpdate(emos);
      } else {
        setReports([]);
        if (onReportsUpdate) onReportsUpdate([]);
      }
    } catch (error) {
      console.error("Error al cargar puntos de calor:", error);
    }
  };

  useEffect(() => {
    fetchReports();

    // Actualizar cada 15 segundos
    const timer = setInterval(fetchReports, 15000);
    return () => clearInterval(timer);
  }, [isAdmin, user]);

  const visibleReports = activeFilters.length > 0
    ? reports.filter(r => activeFilters.includes(r.emotion))
    : reports;

  return (
    <MapContainer className='tamañodelMapa' style={{ position: 'sticky' }} center={center ? [center.lat, center.lng] : [-1.0234, -80.4667]} zoom={15}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Priorizar center (de una lista) sobre userLocation */}
      {center ? (
        <ChangeView center={[center.lat, center.lng]} />
      ) : (
        userLocation && <ChangeView center={[userLocation.lat, userLocation.lng]} />
      )}

      {/* Mostrar círculos filtrados */}
      {visibleReports.map((report) => (
        <Circle
          key={report.id}
          center={[report.lat, report.lng]}
          radius={35}
          pathOptions={{
            fillColor: report.emotion_color || report.emotionColor,
            color: report.emotion_color || report.emotionColor,
            fillOpacity: 0.5
          }}
          eventHandlers={{ click: () => onZoneClick && onZoneClick(report) }}
        >
          <Popup>
            <strong>{report.emotion} {report.emotion_label}</strong><br />
            {report.comment && <em>"{report.comment}"</em>}<br />
            <small style={{ color: '#6b7280' }}>
              {isAdmin ? `Por: ${report.user_name || 'Usuario'}` : 'Tu reporte'}
            </small>
          </Popup>
        </Circle>
      ))}

      {/* MARCADOR DE USUARIO ACTUAL */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Estás aquí</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;