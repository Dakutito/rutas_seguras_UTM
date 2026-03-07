import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Components.css'

import { usersAPI, reportsAPI } from '../services/api' // Importar API centralizada

const AdminPanel = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, reports: [], dangerCount: 0, todayCount: 0 })
  const [loading, setLoading] = useState(true)
  const [emotionStats, setEmotionStats] = useState([])
  const [incidentStats, setIncidentStats] = useState([])

  // Definición de las 7 emociones base
  const BASE_EMOTIONS = ['😊', '😌', '😐', '😰', '😨', '😢', '😡'];
  // Definición de emociones graves
  const GRAVE_EMOTIONS = ['😰', '😨', '😢', '😡']; // Ansioso, Asustado, Triste, Enojado

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [users, reports] = await Promise.all([
        usersAPI.getAll(),
        reportsAPI.getAll()
      ])

      const totalUsers = Array.isArray(users) ? users.length : 0
      const activeUsers = Array.isArray(users) ? users.filter(u => u.status === 'active').length : 0
      const hoy = new Date().toDateString()
      const todayCount = Array.isArray(reports) ? reports.filter(r => new Date(r.created_at).toDateString() === hoy).length : 0
      const dangerCount = Array.isArray(reports) ? reports.filter(r => GRAVE_EMOTIONS.includes(r.emotion) || r.is_incident).length : 0

      setStats({ totalUsers, activeUsers, reports: Array.isArray(reports) ? reports : [], dangerCount, todayCount })

      // Calcular estadísticas de emociones e incidentes
      calculateStats(Array.isArray(reports) ? reports : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular estadísticas de emociones e incidentes por separado
  const calculateStats = (reports) => {
    const emotionCount = {}
    const incidentCount = {}

    reports.forEach(report => {
      if (report.is_incident) {
        // Es un incidente
        const type = report.emotion_label // En incidentes guardamos el nombre en emotion_label
        if (!incidentCount[type]) {
          incidentCount[type] = {
            label: type,
            icon: report.emotion,
            count: 0,
            color: report.emotion_color || '#ef4444'
          }
        }
        incidentCount[type].count++
      } else if (BASE_EMOTIONS.includes(report.emotion)) {
        // Es una de las 7 emociones base
        const emotion = report.emotion
        if (!emotionCount[emotion]) {
          emotionCount[emotion] = {
            emotion,
            label: report.emotion_label,
            count: 0,
            color: report.emotion_color || getDangerColor(emotion)
          }
        }
        emotionCount[emotion].count++
      }
    })

    const emoArray = Object.values(emotionCount).sort((a, b) => b.count - a.count)
    const incArray = Object.values(incidentCount).sort((a, b) => b.count - a.count)

    setEmotionStats(emoArray)
    setIncidentStats(incArray)
  }

  // Función para ir al mapa con un reporte específico
  const goToReportLocation = (report) => {
    // Si es incidente ir al mapa de reportes, si es emoción al mapa emocional
    const route = report.is_incident ? '/admin/mapa-reportes' : '/map'
    navigate(`${route}?lat=${report.lat}&lng=${report.lng}&reportId=${report.id}`)
  }

  const getDangerColor = (e) => ({ '😊': '#10b981', '😌': '#34d399', '😐': '#a3e635', '😰': '#fbbf24', '😨': '#f59e0b', '😢': '#f97316', '😡': '#ef4444' }[e] || '#6b7280')
  const getDangerLabel = (e) => ({ '😊': 'Bajo', '😌': 'Bajo', '😐': 'Bajo', '😰': 'Medio', '😨': 'Medio', '😢': 'Alto', '😡': 'Alto' }[e] || 'Bajo')
  const formatTime = (d) => { const diff = (new Date() - new Date(d)) / 1000; return diff < 60 ? 'Hace unos segundos' : diff < 3600 ? `Hace ${Math.floor(diff / 60)} min` : diff < 86400 ? `Hace ${Math.floor(diff / 3600)}h` : `Hace ${Math.floor(diff / 86400)} días` }

  if (loading) return <div className="container"><div className="card" style={{ textAlign: 'center', padding: '60px' }}><div style={{ fontSize: '48px' }}>⏳</div><h2>Conectando...</h2></div></div>

  const cards = [
    { title: 'Total Usuarios', value: stats.totalUsers, bg: '#6b7280', icon: '👥', route: null },
    { title: 'Usuarios Activos', value: stats.activeUsers, bg: '#3b82f6', icon: '👤', route: '/admin/users' },
    { title: 'Alertas Graves', value: stats.dangerCount, bg: '#ef4444', icon: '⚠️', route: '/admin/danger' },
    { title: 'Reportes Hoy', value: stats.todayCount, bg: '#10b981', icon: '📈', route: '/admin/today' },
    { title: 'Total Reportes', value: stats.reports.length, bg: '#8b5cf6', icon: '📋', route: '/admin/all-reports' },
  ]

  const getTotalEmotions = () => emotionStats.reduce((sum, stat) => sum + stat.count, 0)
  const getTotalIncidents = () => incidentStats.reduce((sum, stat) => sum + stat.count, 0)

  const getEmoPercentage = (count) => {
    const total = getTotalEmotions()
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0
  }

  const getIncPercentage = (count) => {
    const total = getTotalIncidents()
    return total > 0 ? ((count / total) * 100).toFixed(1) : 0
  }

  // Filtrar reportes emocionales graves para la lista
  const graveReports = stats.reports.filter(r => !r.is_incident && GRAVE_EMOTIONS.includes(r.emotion))

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ color: '#f86b6b', margin: 0 }}>Panel de Administración</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/admin/users" className="btn" style={{ background: '#3b82f6', color: 'white' }}>Usuarios</Link>
            <Link to="/admin/stats" className="btn" style={{ background: '#8b5cf6', color: 'white' }}>Analíticas</Link>
            <Link to="/admin/categorias" className="btn" style={{ background: '#5cb6f6', color: 'white' }}>Categorías</Link>
            <Link to="/map" className="btn" style={{ background: '#f59e0b', color: 'white' }}>Mapa Emocional</Link>
            <Link to="/admin/mapa-reportes" className="btn" style={{ background: '#10b981', color: 'white' }}>Mapa Incidentes</Link>
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

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px' }}>

          {/* SECCIÓN EMOCIONES */}
          <div className='mapacaloradmindeuser'>
            <h2 style={{ color: '#8b5cf6' }}>Mapa de Calor - Emociones</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Base de 7 emociones principales • Total: {getTotalEmotions()}
            </p>

            {emotionStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', margin: 0 }}>No hay emociones registradas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {emotionStats.map((stat, idx) => (
                  <div key={idx} style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', borderLeft: `6px solid ${stat.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>{stat.emotion}</span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '15px' }}>{stat.label}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{stat.count} reportes</div>
                        </div>
                      </div>
                      <span style={{ background: `${stat.color}20`, color: stat.color, padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                        {getEmoPercentage(stat.count)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${getEmoPercentage(stat.count)}%`, height: '100%', background: stat.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/map" className="btn" style={{ width: '100%', marginTop: '20px', background: '#8b5cf6', color: 'white', textAlign: 'center' }}>
              Ver Mapa Emocional
            </Link>
          </div>

          {/* SECCIÓN INCIDENTES */}
          <div className='mapacaloradmindeuser'>
            <h2 style={{ color: '#ef4444' }}>Mapa de Calor - Incidentes</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Reportes de seguridad ciudadana • Total: {getTotalIncidents()}
            </p>

            {incidentStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ color: '#6b7280', margin: 0 }}>No hay incidentes reportados</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incidentStats.map((stat, idx) => (
                  <div key={idx} style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', borderLeft: `6px solid ${stat.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '15px' }}>{stat.label}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{stat.count} reportes</div>
                        </div>
                      </div>
                      <span style={{ background: `${stat.color}20`, color: stat.color, padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                        {getIncPercentage(stat.count)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${getIncPercentage(stat.count)}%`, height: '100%', background: stat.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link to="/admin/mapa-reportes" className="btn" style={{ width: '100%', marginTop: '20px', background: '#ef4444', color: 'white', textAlign: 'center' }}>
              Ver Mapa de Incidentes
            </Link>
          </div>

          {/* LISTA REPORTES GRAVES */}
          <div style={{ background: '#fff7ed', padding: '22px', borderRadius: '12px', flex: '1 1 100%' }}>
            <h3 style={{ marginBottom: '16px', color: '#c2410c' }}>⚠️ Reportes Emocionales Graves</h3>
            <p style={{ color: '#9a3412', fontSize: '13px', marginBottom: '15px' }}>
              Filtrado por: Ansioso, Asustado, Triste y Enojado
            </p>
            {graveReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: '#6b7280' }}>No hay alertas críticas</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                {graveReports.map(r => {
                  const color = r.emotion_color || getDangerColor(r.emotion)
                  return (
                    <div key={r.id} style={{ background: 'white', padding: '14px', borderRadius: '8px', borderLeft: `5px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>{r.emotion}</span>
                          <div>
                            <div style={{ color: '#1f2937', fontWeight: '700', fontSize: '14px' }}>{r.emotion_label}</div>
                            <div style={{ fontSize: '12px', color: '#4b5563' }}>{r.user_name || 'Anónimo'}</div>
                            {r.comment && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>"{r.comment}"</div>}
                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>{formatTime(r.created_at)}</div>
                          </div>
                        </div>
                        <button onClick={() => goToReportLocation(r)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
                          Localizar
                        </button>
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