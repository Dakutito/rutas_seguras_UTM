import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import '../styles/Map.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

// AGREGADO: Props isAdmin y user para controlar privacidad
const Map = ({ userLocation, onZoneClick, isAdmin = false, user }) => {
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (isAdmin) {
        // Admin ve TODOS los reportes
        const response = await fetch(`${API_URL}/reports`);
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } else if (user) {
        // Usuario normal solo ve SUS PROPIOS reportes
        const response = await fetch(`${API_URL}/reports/my-reports`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } else {
        setReports([]);
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
  }, [isAdmin, user]); // Dependencias actualizadas

  return (
    <MapContainer className='tamañodelMapa' style={{position:'sticky'}}  center={[-1.0234, -80.4667]} zoom={15}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {userLocation && <ChangeView center={[userLocation.lat, userLocation.lng]} />}
      
      {/* Mostrar círculos: TODOS para admin, SOLO PROPIOS para usuario */}
      {reports.map((report) => (
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
            <strong>{report.emotion} {report.emotion_label}</strong><br/>
            {report.comment && <em>"{report.comment}"</em>}<br/>
            <small style={{ color: '#6b7280` }}>
              {isAdmin ? `Por: ${report.user_name || 'Usuario`}` : 'Tu reporte`}
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