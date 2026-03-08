import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const RutasSegurasPortoviejo = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Rutas seguras en Portoviejo</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#dcfce7', color: '#15803d', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Mapa</span>

                <img
                    src="/img/Seguridad/img_mapa.png"
                    alt="Mapa de Rutas Seguras"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>La ciudad de Portoviejo ofrece distintas alternativas para desplazarte con seguridad, pero es importante saber identificar los espacios con mayor vigilancia y afluencia.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Mapa Interactivo de Zonas Seguras:</h3>
                    <p>Dentro de nuestra plataforma, el Mapa de Incidentes te permite visualizar las áreas catalogadas como seguras gracias a los reportes de otros usuarios. Te sugerimos revisar el mapa antes de emprender rutas largas caminando.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Criterios de una Ruta Segura:</h3>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Iluminación:</strong> Calles con buen alumbrado público.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Robo:</strong> Zonas donde existen diversos tipos de robos</li>
                        <li style={{ marginBottom: '10px' }}><strong>Presencia policial:</strong> Sectores cercanos a UPCs o áreas con patrullaje constante.</li>
                    </ul>

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <button onClick={() => navigate('/mapa-reportes')} style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Abrir Mapa De Incidentes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RutasSegurasPortoviejo;
