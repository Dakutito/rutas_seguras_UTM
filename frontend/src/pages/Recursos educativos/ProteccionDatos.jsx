import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const ProteccionDatos = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Protección de Datos</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#f3f4f6', color: '#4b5563', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Artículo</span>

                <img
                    src="/img/Digital/Protestafa.png"
                    alt="Protección de Datos"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>Nuestros datos en línea (edad, gustos, ubicación constante, número telefónico) son considerados el "petróleo" del siglo XXI, y debes evitar a toda costa regalarlos sin pensarlo.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Contraseñas Fuertes y Autenticación en 2 Pasos (2FA):</h3>
                    <p>Como mínimo, asegúrate de activar el 2FA en tu cuenta de correo electrónico principal y en WhatsApp. Si usan un PIN numérico de 6 dígitos que solo tú conoces (o bien una app como Google Authenticator), será virtualmente imposible que accedan sin tu autorización física.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Permisos Excesivos en Apps:</h3>
                    <p>Revisa la configuración del teléfono móvil y desautoriza el acceso a micrófono, ubicación, galería y contactos en aquellas aplicaciones que sean dudosas o que no necesiten esa información para la actividad que desempeñan (por ejemplo: ¿por qué un juego de ajedrez requeriría acceso al micrófono o los contactos?).</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Wi-Fi Público:</h3>
                    <p>Jamás inicies sesión en tu banco o uses tarjetas de crédito si estás conectado al Wi-Fi público de un centro comercial o cafetería, a no ser que estés usando una VPN para ocultar tu tráfico u operes usando tus red de datos móviles (megas).</p>
                </div>
            </div>
        </div>
    );
};

export default ProteccionDatos;
