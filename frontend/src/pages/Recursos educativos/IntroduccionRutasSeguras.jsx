import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const IntroduccionRutasSeguras = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Introducción a Rutas Seguras UTM</h1>
                <span className="badge-video" style={{ display: 'inline-block', marginBottom: '20px' }}>Video Destacado</span>

                {/* Placeholder de video para YouTube o reproductor interno */}
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#000', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
                        <span>▶ Reproductor de Video Educativo</span>
                    </div>
                </div>

                <div style={{ lineHeight: '1.8', color: '#374151', fontSize: '16px' }}>
                    <p><strong>Rutas Seguras UTM</strong> es un espacio creado pensando en tu integridad. Conoce todo el ecosistema de la plataforma en este corto video y descubre cómo aprovechar cada herramienta disponible a favor del bienestar local.</p>

                    <h3 style={{ marginTop: '20px', color: '#1f2937' }}>¿Qué descubrirás en este video?</h3>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '10px' }}>Los pilares fundamentales del "Mapa Emocional" y por qué funciona.</li>
                        <li style={{ marginBottom: '10px' }}>La correcta categorización a usar en el "Mapa de Incidentes".</li>
                        <li style={{ marginBottom: '10px' }}>Un repaso sobre las opciones de Privacidad y Anonimato al emitir reportes.</li>
                        <li style={{ marginBottom: '10px' }}>Qué ocurre del lado de los Operadores y Administradores al usar los canales de ayuda.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default IntroduccionRutasSeguras;
