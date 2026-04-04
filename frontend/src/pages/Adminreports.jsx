import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportsAPI, incidentsAPI } from '../services/api'
import ConfirmationModal from '../components/ConfirmationModal'

const AdminReports = ({ type, onLocate }) => {
  const navigate = useNavigate()
  const [allReports, setAllReports] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalState, setModalState] = useState({ isOpen: false, reportId: null, isBulk: false })
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
    setIsDeleting(true);
    try {
      if (modalState.isBulk) {
        // Eliminar todos los fitrados
        const reportsToDelete = filteredBySearch;
        await Promise.all(reportsToDelete.map(r => {
          if (r.is_incident) {
            return incidentsAPI.delete(r.id);
          } else {
            return reportsAPI.delete(r.id);
          }
        }));
        setAllReports(allReports.filter(r => !reportsToDelete.find(rd => rd.id === r.id)));
      } else {
        // Eliminar uno solo
        const id = modalState.reportId;
        if (!id) return;

        // Buscar el reporte para saber si es incidente o emoción
        const report = allReports.find(r => r.id === id);
        if (report && report.is_incident) {
          await incidentsAPI.delete(id);
        } else {
          await reportsAPI.delete(id);
        }

        setAllReports(allReports.filter(r => r.id !== id))
      }
      setModalState({ isOpen: false, reportId: null, isBulk: false });
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar los reportes");
    } finally {
      setIsDeleting(false);
    }
  }

  const openDeleteModal = (id) => {
    setModalState({ isOpen: true, reportId: id, isBulk: false });
  }

  const openBulkDeleteModal = () => {
    if (filteredBySearch.length === 0) return;
    setModalState({ isOpen: true, reportId: null, isBulk: true });
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
    if (type === 'danger') return allReports.filter(r => !r.is_incident && ['😰', '😨', '😢', '😡'].includes(r.emotion))
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
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ color: cfg.color }}>{cfg.title}</h1>
            <p className="admin-desc-text">{cfg.desc}</p>
          </div>
          {filteredBySearch.length > 0 && (
            <button
              onClick={openBulkDeleteModal}
              className="admin-danger-btn-bulk"
              style={{ alignSelf: 'center' }}
            >
              Eliminar Todo ({filteredBySearch.length})
            </button>
          )}
        </div>

        <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="admin-search-input-list" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', }}>
          {filteredBySearch.map(r => (
            <div className='reportedeuseraladmi' key={r.id} style={{ borderLeft: `6px solid ${r.emotion_color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontWeight: 'bold', color: r.emotion_color, fontSize: '13px' }}>{r.emotion_label}</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>{new Date(r.created_at).toLocaleString()}</div>
                    </div>

                    {r.is_incident && r.title && (
                      <div style={{ fontSize: '20px', marginTop: '4px', fontWeight: '500' }}>{r.title}</div>
                    )}

                    <div className="report-comment-box">
                      {r.comment || 'Sin comentario'}
                    </div>
                    <div className="report-author-info">
                      <div><strong>Usuario:</strong> {r.user_name || 'Anónimo'} ({r.user_email || 'sin email'})</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                  {/* BOTÓN GOOGLE MAPS */}
                  <a
                    href={`https://www.google.com/maps?q=${r.lat},${r.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#EAEDFF',
                      color: '#4A3FE3',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    Ubicación
                  </a>
                  {/* BOTÓN MAPA INTERNO */}
                  <button
                    onClick={() => goToReportLocation(r)}
                    style={{
                      background: '#EAEDFF',
                      color: '#4A3FE3',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                    title="Ver en el mapa interno"
                  >
                    Mapa
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
          onClose={() => setModalState({ isOpen: false, reportId: null, isBulk: false })}
          onConfirm={handleDelete}
          title={modalState.isBulk ? "Eliminar Todos los Reportes" : "Eliminar Reporte"}
          message={modalState.isBulk
            ? `¿Estás seguro de que deseas eliminar permanentemente estos ${filteredBySearch.length} reportes?`
            : "¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer."}
          requiredText={modalState.isBulk ? "ELIMINAR" : null}
          confirmButtonText={modalState.isBulk ? "ELIMINAR TODO" : "SÍ, ELIMINAR"}
          isLoading={isDeleting}
        />
      </div>
    </div>
  )
}

export default AdminReports