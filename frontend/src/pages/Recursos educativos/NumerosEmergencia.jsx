import { useNavigate } from 'react-router-dom';
import '../../styles/Recursos.css';

const NumerosEmergencia = () => {
    const navigate = useNavigate();

    return (
        <div className="recursos-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <button className="btn-volver" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                ← Volver a Recursos Educativos
            </button>

            <div className="card" style={{ padding: '30px', borderRadius: '15px' }}>
                <h1 style={{ color: '#1e40af', marginBottom: '15px' }}>Números de Emergencia</h1>
                <span className="tag" style={{ display: 'inline-block', marginBottom: '20px', background: '#fee2e2', color: '#b91c1c', padding: '5px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>Referencia</span>

                <img
                    src="/img/Seguridad/numeemer.png"
                    alt="Números de Emergencia"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '10px', marginBottom: '20px' }}
                />

                <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                    <p>Ante cualquier situación de riesgo inminente, tu seguridad es lo primero. Ten siempre a mano estos contactos clave.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <h2 style={{ color: '#ef4444', fontSize: '32px', margin: '0 0 10px 0' }}>911</h2>
                            <h4 style={{ margin: '0', color: '#1f2937' }}>ECU 911</h4>
                            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#1f2937' }}>Emergencias Generales</p>
                        </div>

                        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <h2 style={{ color: '#3b82f6', fontSize: '32px', margin: '0 0 10px 0' }}>911</h2>
                            <h4 style={{ margin: '0', color: '#1f2937' }}>Policía Nacional</h4>
                            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#1f2937' }}>Auxilio Inmediato</p>
                        </div>

                        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <h2 style={{ color: '#f59e0b', fontSize: '32px', margin: '0 0 10px 0' }}>911</h2>
                            <h4 style={{ margin: '0', color: '#1f2937' }}>Cuerpo de Bomberos</h4>
                            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#1f2937' }}>Incendios y Rescates</p>
                        </div>

                        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                            <h2 style={{ color: '#10b981', fontSize: '32px', margin: '0 0 10px 0' }}>911</h2>
                            <h4 style={{ margin: '0', color: '#1f2937' }}>Cruz Roja</h4>
                            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#1f2937' }}>Asistencia Médica</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NumerosEmergencia;
