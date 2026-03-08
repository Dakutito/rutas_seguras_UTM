import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const GuiaSeguridadUrbana = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Guía de Seguridad Urbana</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#e0e7ff', color: '#4338ca', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Guía</span>

                <img
                    src="/img/Seguridad/SeguridadUrbana.png"
                    alt="Seguridad Urbana"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>La seguridad urbana es esencial para el bienestar de todos los ciudadanos. En esta guía, te ofrecemos consejos prácticos para desplazarte de forma segura por las calles de Portoviejo.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Planifica tu ruta:</h3>
                    <p>Antes de salir, asegúrate de conocer tu destino y las rutas más transitadas e iluminadas. Evita caminar por lugares solitarios o poco conocidos, especialmente de noche.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Mantente alerta:</h3>
                    <p>Evita distracciones como el uso excesivo del celular mientras caminas. Mantén contacto visual con tu entorno y confía en tu intuición si algún lugar no te transmite seguridad.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Usa Rutas Seguras UTM:</h3>
                    <p>Apóyate en nuestra plataforma para conocer las zonas de riesgo reportadas por la comunidad y planear un recorrido más tranquilo.</p>
                </div>
            </div>
        </div>
    );
};

export default GuiaSeguridadUrbana;
