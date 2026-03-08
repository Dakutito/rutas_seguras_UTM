import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const ComoReportarIncidentes = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Cómo reportar incidentes</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#dbeafe', color: '#1e40af', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Tutorial</span>

                <img
                    src="/img/Seguridad/reporincident.png"
                    alt="Reportar Incidentes"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>El sistema de reportes de Rutas Seguras UTM es una herramienta comunitaria poderosa. Aprender a usarla correctamente ayuda a proteger a otros.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Paso 1: Accede al mapa de reportes</h3>
                    <p>Desde el Inicio de la aplicación, presiona el botón "Reportar Incidente". Asegúrate de tener los permisos de ubicación habilitados en tu dispositivo.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Paso 2: Selecciona el Mapa</h3>
                    <p>Mira el Mapa y selecciona la zona que Quieres reportar.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Paso 3: Selecciona el tipo de incidente</h3>
                    <p>Elige entre las categorías disponibles (Robo, Acoso, Zona Insegura, etc.) para clasificar correctamente tu reporte.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Paso 4: Añade detalles</h3>
                    <p>Agrega una descripción breve de lo sucedido para dar más contexto a la comunidad y a los administradores.</p>

                    <div style={{ marginTop: '30px', padding: '15px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                        <p style={{ margin: 0, color: '#991b1b' }}><strong>Importante:</strong> Usa esta herramienta con responsabilidad. Reportes falsos pueden desviar la atención de incidentes reales. <strong>El usuario que realice múltiples reportes falsos será suspendido del sistema.</strong></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComoReportarIncidentes;
