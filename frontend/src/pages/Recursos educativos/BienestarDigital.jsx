import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const BienestarDigital = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Bienestar Digital</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#f3e8ff', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Artículo</span>

                <img
                    src="/img/Bienestar/BienestarDigi.png"
                    alt="Bienestar Digital"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>Pasamos gran parte de nuestro día conectados. El Bienestar Digital se trata de desarrollar una relación saludable con la tecnología, asegurando que esta sirva a nuestras vidas en lugar de dominarlas.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Límites de Tiempo de Pantalla:</h3>
                    <p>Configura temporizadores para las aplicaciones de redes sociales en tu teléfono y evita abrirlas 30 minutos después de despertar y 1 hora antes de dormir. La luz azul interfiere con la producción de melatonina y degrada tu sueño.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Desactiva Notificaciones No Esenciales:</h3>
                    <p>Cada vibración o pitido es una interrupción a tu concentración. Limita las notificaciones de (WhatsApp, llamadas) desactiva las notificaciones de "Me gusta", "Nuevos correos promocionales", y juegos.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>El Síndrome de FOMO:</h3>
                    <p>El miedo a perderse de algo ("Fear Of Missing Out") causa ansiedad al ver la vida "perfecta" de otros en internet. Entiende que las redes sociales son un escaparate curado y editado, no muestran la realidad completa de nadie.</p>
                </div>
            </div>
        </div>
    );
};

export default BienestarDigital;
