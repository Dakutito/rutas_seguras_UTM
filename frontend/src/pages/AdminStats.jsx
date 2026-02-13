import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AdminStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 10000) // Actualizar cada 10s
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/stats/general`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2>Cargando estadísticas...</h2>
        </div>
      </div>
    )
  }

  // PANTALLA VACÍA si no hay reportes
  if (!stats || stats.totalReports === 0) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ color: '#1f2937', marginBottom: '6px' }}>Analíticas de Seguridad</h1>
              <p style={{ color: '#6b7280', margin: 0 }}>Análisis del impacto emocional basado en reportes de usuarios</p>
            </div>
            <Link to="/admin" className="btn" style={{ background: '#6b7280', color: 'white' }}>← Volver al Panel</Link>
          </div>

          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f9fafb', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ color: '#6b7280', fontSize: '22px', marginBottom: '10px' }}>No hay datos de analíticas aún</h2>
            <p style={{ color: '#9ca3af', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
              Las analíticas se generarán automáticamente cuando los usuarios reporten sus emociones en el mapa.
              Aquí verás gráficos de emociones, duración y zonas de riesgo.
            </p>
            <Link to="/map" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
              📍 Ir al Mapa
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // PANTALLA CON DATOS REALES
  const emotionColors = {
    'Feliz': '#10b981',
    'Tranquilo': '#34d399',
    'Neutral': '#a3e635',
    'Ansioso': '#fbbf24',
    'Asustado': '#f59e0b',
    'Triste': '#f97316',
    'Enojado': '#ef4444'
  }

  const maxCount = Math.max(...stats.reportsByEmotion.map(e => e.count), 1)

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className='analisisemocionuser'>
          <div className='sub_analisisemocionuser'>
            <h1>Analíticas de Seguridad</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Basado en {stats.totalReports} reporte{stats.totalReports > 1 ? 's' : ''} activos
            </p>
          </div>
          <Link to="/admin" className="btn" style={{ background: '#6b7280', color: 'white' }}>← Volver al Panel</Link>
        </div>

        {/* Resumen rápido */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '34px'
        }}>
          {[
            { label: 'Total Reportes', value: stats.totalReports, color: '#4f46e5', icon: '📊' },
            { label: 'Reportes Hoy', value: stats.todayReports, color: '#10b981', icon: '📈' },
            { label: 'Emociones Positivas', value: stats.positiveCount, color: '#10b981', icon: '😊' },
            { label: 'Emociones Negativas', value: stats.negativeCount, color: '#ef4444', icon: '😢' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.color, color: 'white', padding: '18px', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px' }}>{s.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0' }}>{s.value}</div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Distribución de emociones */}
        <div className='sub_distribuiremouser' style={{ marginBottom: '36px' }}>
          <h2>
            Distribución de Emociones Reportadas
          </h2>
          <div className='sub_sub_distribuiremouser'>
            {stats.reportsByEmotion.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                No hay datos de emociones
              </p>
            ) : (
              stats.reportsByEmotion.map((emotion) => {
                const percentage = (emotion.count / stats.totalReports) * 100
                return (
                  <div key={emotion.emotion_label} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>
                        {emotion.emotion_label}
                      </span>
                      <span style={{ fontWeight: '600', color: '#374151' }}>
                        {emotion.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      background: '#e5e7eb',
                      borderRadius: '6px',
                      overflow: 'hidden`
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: emotion.emotion_color,
                        transition: 'width 0.4s',
                        borderRadius: '6px'
                      }}></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Impacto: positivas vs negativas */}
        <div className='sub_distribuiremouser' style={{ marginBottom: '36px' }}>
          <h2>
            Análisis de Impacto Emocional
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#d1fae5', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600', marginBottom: '8px' }}>
                Emociones Positivas
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981' }}>
                {stats.positiveCount}
              </div>
              <div style={{ fontSize: '13px', color: '#047857', marginTop: '6px' }}>
                {stats.totalReports > 0 ? ((stats.positiveCount / stats.totalReports) * 100).toFixed(1) : 0}% del total
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Feliz, Tranquilo y Neutral
              </div>
            </div>

            <div style={{ background: '#fee2e2', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600', marginBottom: '8px' }}>
                Emociones Negativas
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444' }}>
                {stats.negativeCount}
              </div>
              <div style={{ fontSize: '13px', color: '#dc2626', marginTop: '6px' }}>
                {stats.totalReports > 0 ? ((stats.negativeCount / stats.totalReports) * 100).toFixed(1) : 0}% del total
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Ansioso, Asustado, Triste y Enojado
              </div>
            </div>
          </div>
        </div>

        {/* Zonas por nivel de peligro */}
        <div className='sub_distribuiremouser' >
          <h2 >
            Zonas por Nivel de Peligro
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {['bajo', 'medio', 'alto'].map(level => {
              const count = stats.zonesByDanger[level] || 0
              const colors = {
                'bajo': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
                'medio': { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
                'alto': { bg: '#fee2e2', text: '#991b1b', border: '#ef4444` }
              }
              return (
                <div
                  key={level}
                  style={{
                    background: colors[level].bg,
                    border: `2px solid ${colors[level].border}`,
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    color: colors[level].text,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    Peligro {level}
                  </div>
                  <div style={{ fontSize: '40px', fontWeight: 'bold', color: colors[level].text }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '12px', color: colors[level].text, marginTop: '4px' }}>
                    {count === 1 ? 'zona' : 'zonas'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Información adicional */}
        <div style={{
          marginTop: '30px',
          padding: '16px',
          background: '#eff6ff',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1e40af`
        }}>
          <strong>💡 Nota:</strong> Los datos se actualizan automáticamente cada 10 segundos.
          Las zonas de peligro se calculan en base a la concentración de emociones negativas.
        </div>
      </div>
    </div>
  )
}

export default AdminStats