import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../services/api'
import '../styles/darkMode.css'

const AdminStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000) // Actualizar cada 30s para optimizar rendimiento
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/stats/general`, {
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
              <h1 style={{ marginBottom: '6px' }}>Analíticas de Seguridad</h1>
              <p style={{ color: '#6b7280', margin: 0 }}>Análisis del impacto emocional basado en reportes de usuarios</p>
            </div>
            <Link to="/admin" className="btn" style={{ background: '#6b7280', color: 'white' }}>← Volver al Panel</Link>
          </div>

          <div style={{ textAlign: 'center', padding: '80px 20px', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
            <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>No hay datos de analíticas aún</h2>
            <p style={{ fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
              Las analíticas se generarán automáticamente cuando los usuarios reporten sus emociones en el mapa.
              Aquí verás gráficos de emociones, duración y zonas de riesgo.
            </p>
            <Link to="/map" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
              Ir al Mapa
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
    <div className="card">
      {/* Header */}
      <div className='analisisemocionuser'>
        <div className='sub_analisisemocionuser'>
          <h1>Analíticas Emocinales</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Basado en {stats.totalReports} reporte{stats.totalReports > 1 ? 's' : ''} activos
          </p>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="stats-summary-grid">
        {[
          { label: 'Total Reportes', value: stats.totalReports, className: 'stats-summary-card purple' },
          { label: 'Reportes Hoy', value: stats.todayReports, className: 'stats-summary-card green' },
          { label: 'Emociones Positivas', value: stats.positiveCount, className: 'stats-summary-card green-light' },
          { label: 'Emociones Negativas', value: stats.negativeCount, className: 'stats-summary-card red' },
        ].map((s, i) => (
          <div key={i} className={s.className}>
            <div className="stats-summary-value">{s.value}</div>
            <div className="stats-summary-label">{s.label}</div>
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
                    <span className="emotion-stat-label">
                      {emotion.emotion_label}
                    </span>
                    <span className="emotion-stat-count">
                      {emotion.count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="stats-progress-container">
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
        <div className="impact-analysis-grid">
          <div className="impact-box-positive">
            <div className="impact-label">Emociones Positivas</div>
            <div className="impact-value">{stats.positiveCount}</div>
            <div className="impact-percent">{stats.totalReports > 0 ? ((stats.positiveCount / stats.totalReports) * 100).toFixed(1) : 0}% del total</div>
            <div className="impact-desc">Feliz, Tranquilo y Neutral</div>
          </div>

          <div className="impact-box-negative">
            <div className="impact-label">Emociones Negativas</div>
            <div className="impact-value">{stats.negativeCount}</div>
            <div className="impact-percent">{stats.totalReports > 0 ? ((stats.negativeCount / stats.totalReports) * 100).toFixed(1) : 0}% del total</div>
            <div className="impact-desc">Ansioso, Asustado, Triste y Enojado</div>
          </div>
        </div>
      </div>

      <div className='sub_distribuiremouser' >
        <h2 >
          Zonas por Nivel de Peligro
        </h2>
        <div className="danger-levels-grid">
          {['bajo', 'medio', 'alto'].map(level => {
            const count = stats.zonesByDanger[level] || 0
            return (
              <div key={level} className={`danger-level-card ${level}`}>
                <div className="danger-level-label">Peligro {level}</div>
                <div className="danger-level-value">{count}</div>
                <div className="danger-level-unit">{count === 1 ? 'zona' : 'zonas'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Información adicional */}
      <div className="stats-info-note">
        <strong>Nota:</strong> Los datos se actualizan automáticamente cada 10 segundos.
        Las zonas de peligro se calculan en base a la concentración de emociones negativas.
      </div>
    </div>
  )
}

export default AdminStats