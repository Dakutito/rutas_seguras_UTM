import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const ManejoEstresAcademico = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Manejo del estrés académico</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#fef3c7', color: '#b45309', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Curso</span>

                <img
                    src="/img/Bienestar/ManejoEstres.png"
                    alt="Manejo del estrés"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>La carga universitaria puede ser abrumadora. Aprender a manejar el estrés no solo mejora tus calificaciones, sino también tu salud mental y física.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Organización y Planificación:</h3>
                    <p>El uso de agendas o calendarios (físicos o digitales) ayuda a liberar la mente de la carga de recordar todo. Divide las tareas grandes en pasos pequeños y manejables.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Técnicas de Relajación (Mindfulness):</h3>
                    <p>Tómate 5 minutos al día para hacer ejercicios de respiración profunda ("Square Breathing": inhala en 4 segundos, mantén 4, exhala 4, espera 4). La meditación básica ayuda a reducir significativamente la ansiedad.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Descanso Adecuado:</h3>
                    <p>Dormir entre 7 y 8 horas diarias es innegociable para asimilar la información estudiada. El cerebro necesita descansar para fijar el aprendizaje y regular tus emociones ante los exámenes.</p>
                </div>
            </div>
        </div>
    );
};

export default ManejoEstresAcademico;
