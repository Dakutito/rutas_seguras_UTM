import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const CiudadaniaDigital = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Ciudadanía Digital</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#e0e7ff', color: '#4338ca', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Guía</span>

                <img
                    src="/img/Digital/Ciudaddigi.png"
                    alt="Ciudadanía Digital"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>Ser un buen ciudadano digital significa usar las tecnologías de la información de forma responsable y con respeto hacia ti mismo y hacia la comunidad en línea.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Netiqueta y Comportamiento:</h3>
                    <p>Detente a pensar antes de escribir o reaccionar a publicaciones cargadas de emociones. Nunca publiques mensajes de burla, insultos o material sensible sobre otras personas sin su consentimiento.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Huella Digital:</h3>
                    <p>Todo lo que buscas, compartes, envías por mensaje o reaccionas deja un rastro imborrable en la internet. Las futuras instituciones educativas o empleadores pueden (y suelen) buscar esta huella para evaluar a los candidatos a un puesto.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Verificación de la Información:</h3>
                    <p>Combate las noticias falsas ("fake news") no compartiendo cadenas de WhatsApp sin antes corroborar si provienen de un medio confiable, oficial e imparcial. Revisa las fechas, ya que muchas veces se usan noticias antiguas para desinformar.</p>
                </div>
            </div>
        </div>
    );
};

export default CiudadaniaDigital;
