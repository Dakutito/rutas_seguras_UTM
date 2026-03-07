import { reportsAPI } from '../services/api'
import ConfirmationModal from '../components/ConfirmationModal'

const AdminReports = ({ type, onLocate }) => {
  const navigate = useNavigate()
  const [allReports, setAllReports] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState({ isOpen: false, reportId: null })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadReports()
    const interval = setInterval(loadReports, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadReports = async () => {
    try {
      const data = await reportsAPI.getAll()
      setAllReports(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const id = modalState.reportId;
    if (!id) return;

    setIsDeleting(true);
    try {
      await reportsAPI.delete(id)
      setAllReports(allReports.filter(r => r.id !== id))
      setModalState({ isOpen: false, reportId: null });
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar el reporte");
    } finally {
      setIsDeleting(false);
    }
  }

  const openDeleteModal = (id) => {
    setModalState({ isOpen: true, reportId: id });
  }

  // Función para ir a la ubicación del reporte
  const goToReportLocation = (report) => {
    if (onLocate) {
      onLocate(report)
    } else {
      navigate(`/map?lat=${report.lat}&lng=${report.lng}&reportId=${report.id}`)
    }
  }

  const getFilteredByType = () => {
    if (type === 'incidents') return allReports.filter(r => r.is_incident)
    if (type === 'emotions') return allReports.filter(r => !r.is_incident)
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
    'incidents': { title: 'Reportes de Incidentes', color: '#ef4444', desc: 'Lista de incidentes de seguridad reportados' },
    'emotions': { title: 'Reportes de Emociones', color: '#6366f1', desc: 'Lista de estados emocionales de usuarios' },
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
            <p className="admin-desc-text">{cfg.desc}</p>
          </div>
        </div>

        <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input-list" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBySearch.map(r => (
            <div className='reportedeuseraladmi' key={r.id} style={{ borderLeft: `6px solid ${getDangerColor(r.emotion)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                  <span style={{ fontSize: '32px' }}>{r.emotion}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{r.emotion_label}</div>
                    <div className="report-time">{new Date(r.created_at).toLocaleString()}</div>
                    <div className="report-comment-box">
                      "{r.comment || 'Sin comentario'}"
                    </div>
                    <div className="report-author-info">
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
                    onClick={() => openDeleteModal(r.id)}
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
                    Eliminar Reporte
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBySearch.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', borderRadius: '12px' }}>
            <h3 style={{ color: '#6b7280' }}>No hay reportes que coincidan</h3>
          </div>
        )}

        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, reportId: null })}
          onConfirm={handleDelete}
          title="Eliminar Reporte"
          message="¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer."
          requiredText="ELIMINAR"
          confirmButtonText="ELIMINAR REPORTE"
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
}

export default AdminReports