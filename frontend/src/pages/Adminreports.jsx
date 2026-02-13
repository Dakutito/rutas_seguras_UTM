import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Components.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const AdminReports = ({ type }) => {
  const navigate = useNavigate()
  const [allReports, setAllReports] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
    const interval = setInterval(loadReports, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadReports = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/reports', {
        headers: { 'Authorization`: `Bearer ${token}` }
      })
      const data = await response.json()
      setAllReports(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este reporte?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) setAllReports(allReports.filter(r => r.id !== id))
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Función para ir a la ubicación del reporte
  const goToReportLocation = (report) => {
    navigate(`/map?lat=${report.lat}&lng=${report.lng}&reportId=${report.id}`)
  }

  const getFilteredByType = () => {
    if (type === 'danger') return allReports.filter(r => r.emotion === '😢' || r.emotion === '😡')
    if (type === 'today') {
      const hoy = new Date().toDateString()
      return allReports.filter(r => new Date(r.created_at).toDateString() === hoy)
    }
    return allReports
  }

  const filteredBySearch = getFilteredByType().filter(r => {
    if (!search) return true
    const s = search.toLowerCase()
    return (r.user_name || '').toLowerCase().includes(s) ||
      (r.user_email || '').toLowerCase().includes(s) ||
      (r.comment || '').toLowerCase().includes(s) ||
      (r.emotion_label || '').toLowerCase().includes(s)
  })

  const config = {
    'all-reports': { title: 'Todos los Reportes', color: '#8b5cf6', desc: 'Historial completo de la data base' },
    'danger': { title: 'Zonas en Peligro', color: '#ef4444', desc: 'Reportes críticos del sistema' },
    'today': { title: 'Reportes de Hoy', color: '#10b981', desc: 'Actividad de las últimas 24 horas' },
  }
  const cfg = config[type] || config['all-reports']

  const getDangerColor = (e) => ({ '😊': '#10b981', '😌': '#34d399', '😐': '#a3e635', '😰': '#fbbf24', '😨': '#f59e0b', '😢': '#f97316', '😡': '#ef4444' }[e] || '#6b7280')
  const getDangerLabel = (e) => ({ '😊': 'Bajo', '😌': 'Bajo', '😐': 'Bajo', '😰': 'Medio', '😨': 'Medio', '😢': 'Alto', '😡': 'Alto' }[e] || 'Bajo')

  if (loading) return <div className="container"><div className="card">Cargando...</div></div>

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: cfg.color }}>{cfg.title}</h1>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{cfg.desc}</p>
          </div>
          <Link to="/admin" className="btn" style={{ background: '#6b7280', color: 'white' }}>← Volver</Link>
        </div>

        <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '2px solid #e5e7eb' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBySearch.map(r => (
            <div className='reportedeuseraladmi' key={r.id} style={{ borderLeft: `6px solid ${getDangerColor(r.emotion)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                  <span style={{ fontSize: '32px' }}>{r.emotion}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{r.emotion_label}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(r.created_at).toLocaleString()}</div>
                    <div  style={{ margin: '10px 0', padding: '8px', borderRadius: '6px', fontSize: '14px' }}>
                      "{r.comment || 'Sin comentario'}"
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Usuario: {r.user_name || 'Anónimo'} ({r.user_email || 'sin email'}) | 📍 {parseFloat(r.lat).toFixed(4)}, {parseFloat(r.lng).toFixed(4)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                  {/* BOTÓN DE UBICACIÓN */}
                  <button
                    onClick={() => goToReportLocation(r)}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                    title="Ver ubicación en el mapa"
                  >
                    Ubicación
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    style={{
                      background: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBySearch.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px',borderRadius: '12px' }}>
            <h3 style={{ color: '#6b7280' }}>No hay reportes que coincidan</h3>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReports