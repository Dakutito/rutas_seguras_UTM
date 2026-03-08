import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const LineasApoyoPsicologico = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Líneas de apoyo psicológico</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#fee2e2', color: '#b91c1c', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Referencia</span>

                <img
                    src="/img/Bienestar/ApoyoPsicolo.png"
                    alt="Líneas de apoyo psicológico"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>La ayuda profesional es fundamental cuando el dolor emocional y mental sobrepasa tus capacidades personales para lidiar con él.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Departamento de Bienestar Estudiantil UTM:</h3>
                    <p>La universidad cuenta con psicólogos clínicos capacitados para atender a los estudiantes de manera confidencial y gratuita. Acércate a sus oficinas para agendar una cita presencial o virtual.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Ministerio de Salud Pública (Línea 171 - Opción 6):</h3>
                    <p>El MSP ofrece una línea gratuita de consejería psicológica telefónica a nivel nacional. Disponible de lunes a domingo para contención emocional o primeros auxilios psicológicos.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Centros de Salud Locales:</h3>
                    <p>Los centros de salud públicos de Portoviejo cuentan con el servicio gratuito de psicología. Puedes acudir directamente para solicitar una evaluación si sientes depresión grave, ansiedad o pensamientos suicidas.</p>

                    <div style={{ marginTop: '30px', padding: '15px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                        <p style={{ margin: 0, color: '#991b1b' }}><strong>Recuerda:</strong> Pedir ayuda es un acto de valentía, no de debilidad. Si tú o un amigo están en peligro inminente, llama al ECU 911.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineasApoyoPsicologico;
