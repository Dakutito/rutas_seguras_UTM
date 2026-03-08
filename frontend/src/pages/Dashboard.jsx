import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Components.css'
import { API_URL } from '../services/api'

const Dashboard = ({ user }) => {
  const navigate = useNavigate()
  const [showHistorial, setShowHistorial] = useState(false)
  const [userReports, setUserReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [reportCount, setReportCount] = useState(0)
  const [impactLevel, setImpactLevel] = useState('Bajo')
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  useEffect(() => {
    loadUserReports()
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  const loadUserReports = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/user-reports/my-reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUserReports(data)
        setReportCount(data.length)

        // Calcular impacto basado en reportes negativos
        const negativeReports = data.filter(r => ['😢', '😡', '😰', '😨'].includes(r.emotion)).length
        const total = data.length
        if (total === 0) setImpactLevel('Bajo')
        else if (negativeReports / total > 0.5) setImpactLevel('Alto')
        else if (negativeReports / total > 0.2) setImpactLevel('Medio')
        else setImpactLevel('Bajo')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('¿Eliminar este reporte?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/user-reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) loadUserReports()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const emotions = [
    { emoji: '😊', label: 'Feliz', level: 'Nivel: Seguro', class: 'emotion-feliz' },
    { emoji: '😌', label: 'Tranquilo', level: 'Nivel: Seguro', class: 'emotion-tranquilo' },
    { emoji: '😐', label: 'Neutral', level: 'Nivel: Bajo', class: 'emotion-neutral' },
    { emoji: '😰', label: 'Ansioso', level: 'Nivel: Medio', class: 'emotion-ansioso' },
    { emoji: '😨', label: 'Asustado', level: 'Nivel: Medio', class: 'emotion-asustado' },
    { emoji: '😢', label: 'Triste', level: 'Nivel: Alto', class: 'emotion-triste' },
    { emoji: '😡', label: 'Enojado', level: 'Nivel: Peligro', class: 'emotion-enojado' }
  ]

  // VISTA DE HISTORIAL
  if (showHistorial) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <h1>Historial de Reportes</h1>
            <button onClick={() => setShowHistorial(false)} className="btn" style={{ background: '#6b7280', color: 'white' }}>
              ← Volver
            </button>
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Cargando...</div> :
            userReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#f9fafb', borderRadius: '12px' }}>
                <div style={{ fontSize: '72px' }}>📭</div>
                <h2 style={{ color: '#6b7280' }}>No tienes reportes aún</h2>
                <Link to="/map" className="btn btn-primary" style={{ marginTop: '20px' }}>Ir al Mapa</Link>
              </div>
            ) : (
              <>
                <div className='historialreportetotaluser'>
                  <strong>Total:</strong> {userReports.length} • <strong>Último:</strong> {formatDate(userReports[0].created_at)}
                </div>
                <div className='subcontenidohistorialreportetotaluser'>
                  {userReports.map(r => (
                    <div className='sub_subcontenidohistorialreportetotaluser' key={r.id} style={{ borderLeft: `6px solid ${r.emotion_color}` }}>
                      <div className='botonesreportehistorial'>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '36px' }}>{r.emotion}</span>
                            <div>
                              <div style={{ fontSize: '18px', fontWeight: '700' }}>{r.emotion_label}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(r.created_at)}</div>
                            </div>
                          </div>
                          {r.comment && <div className='sub_sub_subcontenidohistorialreportetotaluser'>"{r.comment}"</div>}
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            Lat: {parseFloat(r.lat).toFixed(4)}, Lng: {parseFloat(r.lng).toFixed(4)}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteReport(r.id)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginLeft: '16px' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
        </div>
      </div>
    )
  }

  // VISTA PRINCIPAL - DASHBOARD MODERNO
  return (
    <div className="container">
      <div className="dashboard-container">

        {/* SIDEBAR IZQUIERDO DEL USUARIO*/}
        <aside className="dashboard-sidebar">
          <h2>TU ACTIVIDAD</h2>

          {/* Info del usuario */}
          <div className="user-activity-box">
            <div className="user-email">
              <div className="email-icon">@</div>
              <div className="email-text">
                <div className="email-label">Correo Institucional</div>
                <div className="email-value">{user?.email}</div>
              </div>
            </div>

            <div className="user-stats">
              <div className="user-stat-item">
                <div className="user-stat-label">Reportes</div>
                <div className="user-stat-value">{reportCount}</div>
              </div>
              <div className="user-stat-item">
                <div className="user-stat-label">Impacto</div>
                <div className={`user-stat-impact impact-${impactLevel.toLowerCase()}`}>
                  {impactLevel}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <h2>ACCIONES RÁPIDAS</h2>
          <div className="quick-actions">
            <button onClick={() => navigate('/map')} className="action-btn btn-primary">
              <div className="action-btn-content">
                <div className="action-btn-icon">😊</div>
                <span>Reportar Emoción</span>
              </div>
              <span className="action-btn-arrow">›</span>
            </button>

            <button onClick={() => setShowHistorial(true)} className="action-btn btn-tertiary">
              <div className="action-btn-content">
                <div className="action-btn-icon">📋</div>
                <span>Reportes Emocionales</span>
              </div>
              <span className="action-btn-arrow">›</span>
            </button>

            <button onClick={() => navigate('/map-reporte')} className="action-btn btn-secondary">
              <div className="action-btn-content">
                <div className="action-btn-icon">⚠️</div>
                <span>Reportar incidente</span>
              </div>
              <span className="action-btn-arrow">›</span>
            </button>

            <button onClick={() => navigate('/')} className="action-btn btn-secondary">
              <div className="action-btn-content">
                <div className="action-btn-icon">🤖</div>
                <span>Asistente Emocional</span>
              </div>
              <span className="action-btn-arrow">›</span>
            </button>

            <button onClick={() => navigate('/settings')} className="action-btn btn-secondary">
              <div className="action-btn-content">
                <div className="action-btn-icon">⚙️</div>
                <span>Mi Configuración</span>
              </div>
              <span className="action-btn-arrow">›</span>
            </button>


          </div>
        </aside>

        {/* ========== CONTENIDO PRINCIPAL ========== */}
        <main className="dashboard-main">

          {/* Sección de emociones MODIFICANDO*/}
          <section className="emotion-section">
            <details className="modern-details" open={isDesktop}>
              <summary className="emotion-header-summary">
                <div className="header-info">
                  <div>
                    <h2>Estado de Ánimo</h2>
                    <p>¿Cómo te sientes en este sector? <span className="mobile-only">(Toca para expandir)</span></p>
                  </div>
                  <span className="toggle-icon">▾</span>
                </div>
              </summary>

              <div className="emotions-grid-wrapper">
                <div className="emotions-grid">
                  {emotions.map((emotion, idx) => (
                    <Link
                      key={idx}
                      to="/map"
                      className={`emotion-card-dashboard ${emotion.class}`}
                      style={{ textDecoration: 'none', borderRadius: '15px' }}
                    >
                      <div className="emotion-card-inner">
                        <span className="emotion-emoji">{emotion.emoji}</span>
                        <div className="emotion-info">
                          <h3>{emotion.label}</h3>
                          <span className="emotion-level">{emotion.level}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          </section>



          {/* Mapa en tiempo real */}
          <section className="map-preview-section">
            <div className="map-preview-content">
              <h3>Mapa en tiempo real</h3>
              <p>Visualiza zonas de riesgo reportadas recientemente.</p>
              <button
                onClick={() => navigate('/mapa-reportes')}
                className="map-preview-btn"
              >
                Ver Mapa
              </button>

            </div>
            <div className="map-preview-visual"></div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="system-status">
          <span className="status-dot"></span>
          <span>SISTEMA ACTIVO</span>
        </div>

        <div className="copyright">
          © 2026 Rutas Seguras UTM. Desarrollado para la comunidad universitaria.
        </div>
      </footer>
    </div>
  )
}

export default Dashboard