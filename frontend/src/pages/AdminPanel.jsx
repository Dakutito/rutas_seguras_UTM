import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AdminPanel.css'
import { usersAPI, reportsAPI, incidentsAPI } from '../services/api'

// Importar sub-componentes para el modo dinámico
import AdminUsers from './Adminusers'
import AdminReports from './Adminreports'
import AdminStats from './AdminStats'
import AdminCategories from './AdminCategories'
import MapView from './MapView'
import MapaReporte from './MapaReporte'
import ConfirmationModal from '../components/ConfirmationModal'

const AdminPanel = ({ user }) => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, reports: [], dangerCount: 0, todayCount: 0 })
  const [loading, setLoading] = useState(true)
  const [emotionStats, setEmotionStats] = useState([])
  const [incidentStats, setIncidentStats] = useState([])

  // Estado para la vista dinámica
  const [currentView, setCurrentView] = useState('home')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [modalState, setModalState] = useState({ isOpen: false, reportId: null, isBulk: false })
  const [isDeleting, setIsDeleting] = useState(false)

  const BASE_EMOTIONS = ['😊', '😌', '😐', '😰', '😨', '😢', '😡'];
  const GRAVE_EMOTIONS = ['😰', '😨', '😢', '😡'];

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
      const dangerCount = Array.isArray(reports) ? reports.filter(r => !r.is_incident && GRAVE_EMOTIONS.includes(r.emotion)).length : 0

      setStats({ totalUsers, activeUsers, reports: Array.isArray(reports) ? reports : [], dangerCount, todayCount })
      calculateStats(Array.isArray(reports) ? reports : [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (reports) => {
    const emotionCount = {}
    const incidentCount = {}

    reports.forEach(report => {
      if (report.is_incident) {
        const type = report.emotion_label
        if (!incidentCount[type]) {
          incidentCount[type] = { label: type, icon: report.emotion, count: 0, color: report.emotion_color || '#ef4444' }
        }
        incidentCount[type].count++
      } else if (BASE_EMOTIONS.includes(report.emotion)) {
        const emotion = report.emotion
        if (!emotionCount[emotion]) {
          emotionCount[emotion] = { emotion, label: report.emotion_label, count: 0, color: getDangerColor(emotion) }
        }
        emotionCount[emotion].count++
      }
    })

    setEmotionStats(Object.values(emotionCount).sort((a, b) => b.count - a.count))
    setIncidentStats(Object.values(incidentCount).sort((a, b) => b.count - a.count))
  }

  const getDangerColor = (e) => ({ '😊': '#10b981', '😌': '#34d399', '😐': '#a3e635', '😰': '#fbbf24', '😨': '#f59e0b', '😢': '#f97316', '😡': '#ef4444' }[e] || '#6366f1')
  const formatTime = (d) => { const diff = (new Date() - new Date(d)) / 1000; return diff < 60 ? 'Hace unos segundos' : diff < 3600 ? `Hace ${Math.floor(diff / 60)} min` : diff < 86400 ? `Hace ${Math.floor(diff / 3600)}h` : `Hace ${Math.floor(diff / 86400)} días` }

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

  const handleLocate = (report) => {
    setSelectedCenter({ lat: report.lat, lng: report.lng })
    if (report.is_incident) {
      setCurrentView('map_incident')
    } else {
      setCurrentView('map_emotional')
    }
  }

  const handleDeleteReport = async () => {
    setIsDeleting(true);
    try {
      if (modalState.isBulk) {
        const graveReports = stats.reports.filter(r => !r.is_incident && GRAVE_EMOTIONS.includes(r.emotion));
        await Promise.all(graveReports.map(r => {
          if (r.is_incident) {
            return incidentsAPI.delete(r.id);
          } else {
            return reportsAPI.delete(r.id);
          }
        }));
        setStats(prev => ({
          ...prev,
          reports: prev.reports.filter(r => !graveReports.find(gr => gr.id === r.id)),
          dangerCount: prev.reports.filter(r => !graveReports.find(gr => gr.id === r.id) && (GRAVE_EMOTIONS.includes(r.emotion) || r.is_incident)).length
        }));
      } else {
        const id = modalState.reportId;
        if (!id) return;

        // Buscar el reporte para saber si es incidente o emoción
        const report = stats.reports.find(r => r.id === id);
        if (report && report.is_incident) {
          await incidentsAPI.delete(id);
        } else {
          await reportsAPI.delete(id);
        }

        setStats(prev => ({
          ...prev,
          reports: prev.reports.filter(r => r.id !== id),
          dangerCount: prev.reports.filter(r => (r.id !== id) && (GRAVE_EMOTIONS.includes(r.emotion) || r.is_incident)).length
        }));
      }
      setModalState({ isOpen: false, reportId: null, isBulk: false });
      loadData();
    } catch (error) {
      alert("Error al eliminar el reporte");
    } finally {
      setIsDeleting(false);
    }
  }

  const openDeleteModal = (id) => {
    setModalState({ isOpen: true, reportId: id, isBulk: false });
  }

  const openBulkDeleteModal = () => {
    setModalState({ isOpen: true, reportId: null, isBulk: true });
  }

  // Función para renderizar la vista de Dashboard (Home)
  const renderDashboardHome = () => {
    const graveReports = stats.reports.filter(r => !r.is_incident && GRAVE_EMOTIONS.includes(r.emotion))
    const filteredGraveReports = graveReports.filter(r => {
      const search = searchTerm.toLowerCase()
      return (r.user_name || '').toLowerCase().includes(search) || (r.user_email || '').toLowerCase().includes(search)
    })

    return (
      <>
        <div className="admin-layout-grid">
          <div className="admin-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="admin-new-card">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title" style={{ color: '#312e81' }}>Mapa de Calor - Emociones</h2>
                  <p className="admin-card-subtitle">Visualización de sentimientos ciudadanos reportados.</p>
                </div>
                <button onClick={() => { setCurrentView('map_emotional'); setSelectedCenter(null); }} className="admin-header-btn">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  Ver Mapa Emocional
                </button>
              </div>
              <div className="new-heatmap-list">
                {emotionStats.length === 0 ? (<div style={{ color: '#64748b' }}>No hay emociones registradas</div>) : emotionStats.map((stat, idx) => (
                  <div key={idx} className="new-stat-item">
                    <div className="new-stat-info">
                      <div className="new-stat-name">
                        <span className="dot" style={{ backgroundColor: stat.color }}></span>
                        {stat.label}
                      </div>
                      <div className="new-stat-value">{getEmoPercentage(stat.count)}% ({stat.count} reporte{stat.count !== 1 ? 's' : ''})</div>
                    </div>
                    <div className="new-progress-container"><div className="new-progress-bar" style={{ width: `${getEmoPercentage(stat.count)}%`, background: stat.color }}></div></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-new-card">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title" style={{ color: '#312e81' }}>Mapa de Calor - Incidentes</h2>
                  <p className="admin-card-subtitle">Análisis de eventos críticos y seguridad urbana.</p>
                </div>
                <button onClick={() => { setCurrentView('map_incident'); setSelectedCenter(null); }} className="admin-header-btn">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  Ver Mapa Incidentes
                </button>
              </div>
              <div className="new-heatmap-list">
                {incidentStats.length === 0 ? (<div style={{ color: '#64748b' }}>No hay incidentes registrados</div>) : incidentStats.map((stat, idx) => (
                  <div key={idx} className="new-stat-item">
                    <div className="new-stat-info">
                      <div className="new-stat-name">
                        <span className="dot" style={{ backgroundColor: stat.color }}></span>
                        {stat.label}
                      </div>
                      <div className="new-stat-value">{getIncPercentage(stat.count)}% ({stat.count} reporte{stat.count !== 1 ? 's' : ''})</div>
                    </div>
                    <div className="new-progress-container"><div className="new-progress-bar" style={{ width: `${getIncPercentage(stat.count)}%`, background: stat.color }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-right-col">
            <div className="admin-new-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="admin-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h2 className="admin-card-title" style={{ color: '#312e81' }}>Reportes Emocionales Graves</h2>
                <p className="admin-card-subtitle">Alertas de intervención inmediata.</p>
              </div>

              <div className="new-search-container">
                <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Buscar por usuario o correo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              {filteredGraveReports.length === 0 ? (
                <div className="empty-alerts-state">
                  <div className="shield-icon">
                    <svg width="24" height="24" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                  </div>
                  <h3>No hay alertas críticas</h3>
                  <p>El sistema no ha detectado anomalías emocionales graves en las últimas 24 horas.</p>
                </div>
              ) : (
                <div className="new-danger-reports-grid">
                  {filteredGraveReports.map(r => (
                    <div key={r.id} className="new-danger-report-card" style={{ borderLeftColor: getDangerColor(r.emotion) }}>
                      <div className="ndr-header">
                        <div className="ndr-info">
                          <div className="ndr-label" style={{ color: getDangerColor(r.emotion) }}>{r.emotion_label}</div>
                          <div className="ndr-user"><strong>Estudiante:</strong> {r.user_name || 'Anónimo'}</div>
                          <div className="ndr-user"><strong>Correo:</strong> ({r.user_email || 'sin email'})</div>
                        </div>
                        <div className="ndr-time">{formatTime(r.created_at)}</div>
                      </div>
                      {r.comment && <div className="ndr-comment">{r.comment}</div>}
                      <div className="ndr-actions">
                        <a
                          href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ndr-btn-gmaps"
                        >
                          Ubicación en Google Maps
                        </a>
                        <button onClick={() => handleLocate(r)} className="ndr-btn-locate">Ver Mapa</button>
                        <button onClick={() => openDeleteModal(r.id)} className="ndr-btn-delete">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'home': return renderDashboardHome()
      case 'users': return <AdminUsers />
      case 'incident_reports': return <AdminReports key="incidents" type="incidents" onLocate={handleLocate} />
      case 'emotion_reports': return <AdminReports key="emotions" type="emotions" onLocate={handleLocate} />
      case 'reports': return <AdminReports key="all" type="all-reports" onLocate={handleLocate} />
      case 'danger': return <AdminReports key="danger" type="danger" onLocate={handleLocate} />
      case 'today': return <AdminReports key="today" type="today" onLocate={handleLocate} />
      case 'stats': return <AdminStats />
      case 'categories': return <AdminCategories />
      case 'map_emotional': return <MapView isAdmin={true} user={user} onInicio={() => setCurrentView('home')} center={selectedCenter} />
      case 'map_incident': return <MapaReporte user={user} viewOnly={true} onInicio={() => setCurrentView('home')} center={selectedCenter} />
      default: return renderDashboardHome()
    }
  }

  const sidebarLinks = [
    { name: 'Home', view: 'home' },
    { name: 'Reportes Total Hoy', view: 'today' },
    { name: 'Reporte Incidente', view: 'incident_reports' },
    { name: 'Reporte Emoción', view: 'emotion_reports' },
    { name: 'Usuario', view: 'users' },
    { name: 'Analíticas', view: 'stats' },
    { name: 'Categorías', view: 'categories' },
    { name: 'Emociones Graves', view: 'danger' },
    { name: 'Mapa Emocional', view: 'map_emotional' },
    { name: 'Mapa incidente', view: 'map_incident' },
  ]

  if (loading) return <div className="admin-layout"><div className="admin-main"><div className="card" style={{ textAlign: 'center', padding: '60px' }}><h2>Cargando Panel...</h2></div></div></div>

  const cards = [
    { title: 'Total Usuarios', value: stats.totalUsers },
    { title: 'Usuarios Activos', value: stats.activeUsers },
    { title: 'Alertas Graves', value: stats.dangerCount },
    { title: 'Reportes Hoy', value: stats.todayCount },
    { title: 'Total Reportes', value: stats.reports.length },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" style={{ zIndex: 100 }}>
        <div className="sidebar-title">Panel de <br /> Administración</div>
        <nav className="sidebar-nav">
          {sidebarLinks.map(link => (
            <button key={link.name} className={`sidebar-link ${currentView === link.view ? 'active' : ''}`}
              onClick={() => { setCurrentView(link.view); setSelectedCenter(null); }}>
              {link.name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        {/* STATS GRID - Solo visible en HOME */}
        {currentView === 'home' && (
          <div className="stats-grid">
            {cards.map((c, i) => (
              <div key={i} className="stat-card" style={{ background: c.bg }}>
                <div className="stat-info"><div className="stat-label">{c.title}</div><div className="stat-value">{c.value}</div></div>
                <div className="stat-icon">{c.icon}</div>
              </div>
            ))}
          </div>
        )}

        <div className="view-content-area">{renderView()}</div>
      </main>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, reportId: null, isBulk: false })}
        onConfirm={handleDeleteReport}
        title={modalState.isBulk ? "Eliminar Todas las Alertas" : "Eliminar Reporte Grave"}
        message={modalState.isBulk
          ? "¿Estás seguro de que deseas eliminar todas las alertas emocionales críticas?"
          : "¿Estás seguro de que deseas eliminar este reporte crítico del sistema?"}
        requiredText={modalState.isBulk ? "ELIMINAR" : null}
        confirmButtonText={modalState.isBulk ? "ELIMINAR TODAS" : "SÍ, ELIMINAR"}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default AdminPanel