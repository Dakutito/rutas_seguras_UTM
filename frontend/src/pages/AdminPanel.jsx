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

  // Componente para la vista de Dashboard (Home)
  const DashboardHome = () => {
    const graveReports = stats.reports.filter(r => !r.is_incident && GRAVE_EMOTIONS.includes(r.emotion))
    const filteredGraveReports = graveReports.filter(r => {
      const search = searchTerm.toLowerCase()
      return (r.user_name || '').toLowerCase().includes(search) || (r.user_email || '').toLowerCase().includes(search)
    })

    return (
      <>
        <div className="admin-content-grid" style={{ marginBottom: '30px' }}>
          <div className="heatmap-card">
            <h2 style={{ color: '#8b5cf6' }}>Mapa de Calor - Emociones</h2>
            <div className="heatmap-subtitle">Base de 7 emociones principales • Total: {getTotalEmotions()}</div>
            <div className="heatmap-list">
              {emotionStats.length === 0 ? (<div style={{ color: '#64748b' }}>No hay emociones registradas</div>) : emotionStats.map((stat, idx) => (
                <div key={idx} className="stat-item" style={{ borderLeft: `4px solid ${stat.color}` }}>
                  <div className="stat-item-header">
                    <div className="stat-item-left">
                      <span className="stat-item-icon">{stat.emotion}</span>
                      <div><div className="stat-item-name">{stat.label}</div><div className="stat-item-count">{stat.count} reportes</div></div>
                    </div>
                    <div className="stat-item-value">{getEmoPercentage(stat.count)}%</div>
                  </div>
                  <div className="progress-container"><div className="progress-bar" style={{ width: `${getEmoPercentage(stat.count)}%`, background: stat.color }}></div></div>
                </div>
              ))}
            </div>
            <button onClick={() => { setCurrentView('map_emotional'); setSelectedCenter(null); }} className="admin-card-btn">Ver Mapa Emocional</button>
          </div>

          <div className="heatmap-card">
            <h2 style={{ color: '#ef4444' }}>Mapa de Calor - Incidentes</h2>
            <div className="heatmap-subtitle">Reportes de seguridad ciudadana • Total: {getTotalIncidents()}</div>
            <div className="heatmap-list">
              {incidentStats.length === 0 ? (<div style={{ color: '#64748b' }}>No hay incidentes registrados</div>) : incidentStats.map((stat, idx) => (
                <div key={idx} className="stat-item" style={{ borderLeft: `4px solid ${stat.color}` }}>
                  <div className="stat-item-header">
                    <div className="stat-item-left">
                      <span className="stat-item-icon">{stat.icon}</span>
                      <div><div className="stat-item-name">{stat.label}</div><div className="stat-item-count">{stat.count} reportes</div></div>
                    </div>
                    <div className="stat-item-value">{getIncPercentage(stat.count)}%</div>
                  </div>
                  <div className="progress-container"><div className="progress-bar" style={{ width: `${getIncPercentage(stat.count)}%`, background: stat.color }}></div></div>
                </div>
              ))}
            </div>
            <button onClick={() => { setCurrentView('map_incident'); setSelectedCenter(null); }} className="admin-card-btn" style={{ background: '#ef4444' }}>Ver Mapa Incidentes</button>
          </div>
          <div className="danger-zone-container">
            <div className="danger-zone-header">
              <div>
                <h2 className="danger-zone-title">Reportes Emocionales Graves</h2>
                <p className="danger-zone-subtitle">Filtrado por: Ansioso, Asustado, Triste y Enojado</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {filteredGraveReports.length > 0 && (
                  <button onClick={openBulkDeleteModal} className="admin-danger-btn-bulk">
                    Eliminar Todas
                  </button>
                )}
                <div className="search-box-container">
                  <input type="text" placeholder="Buscar por usuario o correo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input" />
                  <span className="search-icon">🔍</span>
                </div>
              </div>
            </div>
            {filteredGraveReports.length === 0 ? (<div style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: '#6b7280' }}>No hay alertas críticas</p></div>) : (
              <div className="danger-reports-grid">
                {filteredGraveReports.map(r => (
                  <div key={r.id} className="danger-report-card" style={{ borderLeft: `5px solid ${getDangerColor(r.emotion)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span className="emotion-icon">{r.emotion}</span>
                        <div>
                          <div className="report-emotion-label">{r.emotion_label}</div>
                          <div className="report-user-name">{r.user_name || 'Anónimo'}</div>
                          {r.comment && <div className="report-comment">"{r.comment}"</div>}
                          <div className="report-time">{formatTime(r.created_at)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleLocate(r)}
                          style={{ padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Localizar</button>
                        <button onClick={() => openDeleteModal(r.id)}
                          style={{ padding: '8px 15px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


      </>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'home': return <DashboardHome />
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
      default: return <DashboardHome />
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
        <div className="sidebar-title">Panel de Administración</div>
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