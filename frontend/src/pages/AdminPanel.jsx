import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AdminPanel = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, reports: [], dangerCount: 0, todayCount: 0 })
  const [loading, setLoading] = useState(true)
  const [emotionStats, setEmotionStats] = useState([])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [usersRes, reportsRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/reports`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      const users = await usersRes.json()
      const reports = await reportsRes.json()

      const totalUsers = Array.isArray(users) ? users.length : 0
      const activeUsers = Array.isArray(users) ? users.filter(u => u.status === 'active').length : 0
      const hoy = new Date().toDateString()
      const todayCount = Array.isArray(reports) ? reports.filter(r => new Date(r.created_at).toDateString() === hoy).length : 0
      const dangerCount = Array.isArray(reports) ? reports.filter(r => r.emotion === '😢' || r.emotion === '😡').length : 0

      setStats({ totalUsers, activeUsers, reports: Array.isArray(reports) ? reports : [], dangerCount, todayCount })

      // 🆕 Calcular estadísticas de emociones para el mapa de calor
      calculateEmotionStats(Array.isArray(reports) ? reports : [])
    } catch (error) {
      console.error('Error:`, error)
    } finally {
      setLoading(false)
    }
  }

  // 🆕 Función para calcular estadísticas de emociones
  const calculateEmotionStats = (reports) => {
    const emotionCount = {}

    reports.forEach(report => {
      const emotion = report.emotion
      if (!emotionCount[emotion]) {
        emotionCount[emotion] = {
          emotion,
          label: report.emotion_label,
          count: 0,
          color: getDangerColor(emotion)
        }
      }
      emotionCount[emotion].count++
    })

    const statsArray = Object.values(emotionCount).sort((a, b) => b.count - a.count)
    setEmotionStats(statsArray)
  }

  // 🆕 Función para ir al mapa con un reporte específico
  const goToReportLocation = (report) => {
    // Navegar al mapa con parámetros de ubicación
    navigate(`/map?lat=${report.lat}&lng=${report.lng}&reportId=${report.id}`)
  }

  const getDangerColor = (e) => ({ '😊': '#10b981', '😌': '#34d399', '😐': '#a3e635', '😰': '#fbbf24', '😨': '#f59e0b', '😢': '#f97316', '😡': '#ef4444' }[e] || '#6b7280')
  const getDangerLabel = (e) => ({ '😊': 'Bajo', '😌': 'Bajo', '😐': 'Bajo', '😰': 'Medio', '😨': 'Medio', '😢': 'Alto', '😡': 'Alto' }[e] || 'Bajo`)
  const formatTime = (d) => { const diff = (new Date() - new Date(d)) / 1000; return diff < 60 ? 'Hace unos segundos' : diff < 3600 ? `Hace ${Math.floor(diff / 60)} min` : diff < 86400 ? `Hace ${Math.floor(diff / 3600)}h` : `Hace ${Math.floor(diff / 86400)} días` }

  if (loading) return <div className="container"><div className="card" style={{ textAlign: 'center', padding: '60px' }}><div style={{ fontSize: '48px' }}>⏳</div><h2>Conectando...</h2></div></div>

  const cards = [
    { title: 'Total Usuarios', value: stats.totalUsers, bg: '#6b7280', icon: '👥', route: null },
    { title: 'Usuarios Activos', value: stats.activeUsers, bg: '#3b82f6', icon: '👤', route: '/admin/users' },
    { title: 'Zonas en Peligro', value: stats.dangerCount, bg: '#ef4444', icon: '⚠️', route: '/admin/danger' },
    { title: 'Reportes Hoy', value: stats.todayCount, bg: '#10b981', icon: '📈', route: '/admin/today' },
    { title: 'Total Reportes', value: stats.reports.length, bg: '#8b5cf6', icon: '📋', route: '/admin/all-reports' },
  ]

  const getTotalReports = () => emotionStats.reduce((sum, stat) => sum + stat.count, 0)
  const getPercentage = (count) => {
    const total = getTotalReports()
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ color: '#f86b6b', margin: 0 }}>Panel de Administración</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/admin/users" className="btn" style={{ background: '#3b82f6', color: 'white' }}>Usuarios</Link>
            <Link to="/admin/stats" className="btn" style={{ background: '#8b5cf6', color: 'white' }}>Analíticas</Link>
            <Link to="/admin/categorias" className="btn" style={{ background: '#5cb6f6', color: 'white' }}>Categorías</Link>
            <Link to="/admin/mapa-reportes" className="btn" style={{ background: '#10b981', color: 'white' }}>Mapa Reportes</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px', marginBottom: '36px' }}>
          {cards.map((c, i) => (
            <div key={i} onClick={() => c.route && navigate(c.route)} style={{ background: c.bg, color: 'white', padding: '22px', borderRadius: '12px', cursor: c.route ? 'pointer' : 'default', transition: 'transform 0.2s' }}
              onMouseEnter={e => c.route && (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => c.route && (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '6px' }}>{c.title}</div>
                  <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{c.value}</div>
                </div>
                <div style={{ fontSize: '42px', opacity: 0.25 }}>{c.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* EDITARRR PENDIENTE */}



        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px' }}>
          {/* MAPA DE CALOR - Reportes por Emoción */}
          <div className='mapacaloradmindeuser'>
            <h2>
              Mapa de Calor - Reportes por Emoción
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Total de reportes: {getTotalReports()}
            </p>

            {emotionStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', margin: 0 }}>No hay reportes registrados</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {emotionStats.map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f9fafb',
                      padding: '16px',
                      borderRadius: '8px`,
                      borderLeft: `6px solid ${stat.color}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>{stat.emotion}</span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: '#1f2937' }}>
                            {stat.label}
                          </div>
                          <div style={{ fontSize: '13px', color: '#6b7280' }}>
                            {stat.count} {stat.count === 1 ? 'reporte' : 'reportes`}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        background: `${stat.color}20`,
                        color: stat.color,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        {getPercentage(stat.count)}%
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden`
                    }}>
                      <div style={{
                        width: `${getPercentage(stat.count)}%`,
                        height: '100%',
                        background: stat.color,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/admin/mapa-reportes"
              className="btn"
              style={{
                width: '100%',
                marginTop: '20px',
                background: '#3b82f6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Ver Mapa Completo
            </Link>
          </div>

          {/* ÚLTIMOS INCIDENTES con botón de ubicación */}
          <div style={{ background: '#fef2f2', padding: '22px', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '16px', color: '#dc2626' }}> Reportes emocionales</h3>
            {stats.reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ fontSize: '48px' }}>🔭</div><p style={{ color: '#6b7280' }}>No hay reportes</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                {stats.reports.slice(0, 10).map(r => {
                  const color = getDangerColor(r.emotion)
                  return (
                    <div key={r.id} style={{ background: 'white', padding: '12px 14px', borderRadius: '8px`, borderLeft: `5px solid ${color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                          <span style={{ fontSize: '22px' }}>{r.emotion}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ color:'#1f2937',fontWeight: '600', fontSize: '14px' }}>{r.emotion_label}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}><span style={{ fontSize: '12px', fontWeight: '600' }}>usuario:</span> {r.user_name || 'Anónimo'} ({r.user_email || 'sin email'})</div>
                            {r.comment && <div style={{ fontSize: '12px', color: '#6b7280' }}> {r.comment}</div>}

                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '600' }}>Ubicación:</span>  {parseFloat(r.lat).toFixed(4)}, {parseFloat(r.lng).toFixed(4)} • <br /> {formatTime(r.created_at)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '12px' }}>
                          <span style={{ background: color + '20', color, padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {getDangerLabel(r.emotion)}
                          </span>
                          {/* BOTÓN DE UBICACIÓN */}
                          <button
                            onClick={() => goToReportLocation(r)}
                            style={{
                              padding: '6px 12px',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap`
                            }}
                            title="Ver ubicación en el mapa"
                          >
                            📍 Ubicación
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminPanel