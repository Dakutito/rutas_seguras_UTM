import { reportsAPI } from '../services/api'

const CommentForm = ({ emotion, location, onClose, isAdmin, user }) => {
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Preparar el objeto con los nombres exactos que espera tu backend/DB
    const reportData = {
      emotion: emotion.emoji,
      emotionLabel: emotion.label,
      emotionColor: emotion.color,
      comment: comment.trim(),
      latitude: location.lat,
      longitude: location.lng
    }

    try {
      // Petición al servidor usando el servicio centralizado
      await reportsAPI.create(reportData)

      console.log('Reporte guardado en PostgreSQL')
      setSubmitted(true)
      // Recargar la página después de 2 segundos para ver el punto en el mapa
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error al guardar reporte:', error)
      alert(`Error al guardar: ${error.message || 'Intenta de nuevo'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!emotion) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', background: '#fef3c7', borderRadius: '10px' }}>
        <h3>Selecciona una emoción primero</h3>
        <button onClick={onClose} className="btn">Cerrar</button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#10b981', color: 'white', borderRadius: '10px' }}>
        <h3>¡Reporte guardado correctamente!</h3>
        <p>Gracias por contribuir a la seguridad de Portoviejo.</p>
      </div>
    )
  }

  return (
    <div className='tardemotion'>
      <h3 style={{ marginBottom: '18px' }}>Confirmar Reporte</h3>

      <div style={{ display: 'flex', alignItems: 'center', background: emotion.color + '18', border: `2px solid ${emotion.color}40`, padding: '16px', borderRadius: '10px', marginBottom: '22px' }}>
        <span style={{ fontSize: '44px', marginRight: '16px' }}>{emotion.emoji}</span>
        <div>
          <div className='tardemotion_user'>{emotion.label}</div>
          <div className='tardemotion_ubi_us'><span>Ubicación:</span> {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}</div>
          <div className='tardemotion_ubi_us'><span>Usuario:</span> {user?.name || 'Usuario'}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>¿Algún detalle adicional?</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ej: Mucha iluminación, calle tranquila..."
          style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}
          rows="3"
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className='tardemotionboton' onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ flex: 2, padding: '12px', background: emotion.color, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Guardando en DB...' : 'Enviar Reporte Real'}
        </button>
      </div>
    </div>
  )
}

export default CommentForm