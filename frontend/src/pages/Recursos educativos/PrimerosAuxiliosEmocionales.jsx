import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const PrimerosAuxiliosEmocionales = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Primeros auxilios emocionales</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#e0e7ff', color: '#4338ca', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Guía</span>

                <img
                    src="/img/Bienestar/PrimerAuxilio.png"
                    alt="Primeros Auxilios Emocionales"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>Al igual que aplicamos curitas a las heridas físicas, debemos aprender a tratar los "rasguños" y heridas emocionales antes de que se infecten y causen problemas psicológicos mayores.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Presta atención a tu dolor emocional:</h3>
                    <p>Reconoce cuando estás experimentando dolor psicológico severo o prolongado. Ignorar la tristeza profunda, la soledad o la sensación prolongada de fracaso empeorará las cosas.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Detén la rumiación ("overthinking"):</h3>
                    <p>Cuando no puedes dejar de repetir eventos dolorosos o situaciones estresantes en tu mente, distráete inmediatamente con tareas que requieran concentración total durante al menos 2 minutos para romper el ciclo.</p>

                    <h3 style={{ marginTop: '20px', color: '#525252b7' }}>Cómo ayudar a alguien en crisis:</h3>
                    <p>Si un compañero de la UTM experimenta una crisis de ansiedad o llanto:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Llévalo a un lugar tranquilo y apartado.</strong></li>
                        <li style={{ marginBottom: '10px' }}><strong>Háblale con voz suave y calmada, sin hacer preguntas abrumadoras.</strong></li>
                        <li style={{ marginBottom: '10px' }}><strong>Guíalo a hacer respiraciones lentas para recuperar el control físico.</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PrimerosAuxiliosEmocionales;
