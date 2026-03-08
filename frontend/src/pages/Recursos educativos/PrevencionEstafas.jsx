import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const PrevencionEstafas = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Prevención de Estafas</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#fef2f2', color: '#dc2626', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Seguridad</span>

                <img
                    src="/img/Digital/preveestafa.png"
                    alt="Prevención de Estafas"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>Con el aumento de la conectividad, las estafas virtuales se han vuelto más sofisticadas. Aprender a detectarlas es la mejor manera de no caer en ellas.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Phishing (Suplantación de Identidad):</h3>
                    <p>Evita hacer clic en enlaces sospechosos que llegan por correo, SMS, o mensajes de texto afirmando problemas urgentes con tu cuenta bancaria. Un banco NUNCA te pedirá contraseñas completas ni claves dinámicas a través de estos medios. Entra directamente escribiendo la dirección del banco en el navegador.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Ofertas Demasiado Buenas para ser Ciertadas:</h3>
                    <p>Desconfía de anuncios emergentes o mensajes prometiendo dinero fácil, premios en los que no te registraste, sorteos inmediatos o dispositivos a precios increíblemente bajos. "Si parece demasiado bueno para ser verdad, probablemente no lo sea".</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Suplantación de Amistades (Vishing):</h3>
                    <p>Si un familiar o amigo universitario te pide dinero con extrema urgencia desde un número nuevo (o incluso desde su cuenta de Facebook/WhatsApp hackeada), no transfieras sin antes hacerle una videollamada para comprobar de manera visual y auditiva que es la persona real.</p>
                </div>
            </div>
        </div>
    );
};

export default PrevencionEstafas;
