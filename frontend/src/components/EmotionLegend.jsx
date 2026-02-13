const EmotionLegend = () => {
  const emotions = [
    { emoji: '😊', label: 'Feliz', color: '#10b981', level: 'Seguro' },
    { emoji: '😌', label: 'Tranquilo', color: '#34d399', level: 'Seguro' },
    { emoji: '😐', label: 'Neutral', color: '#a7f3d0', level: 'Bajo' },
    { emoji: '😰', label: 'Ansioso', color: '#fbbf24', level: 'Medio' },
    { emoji: '😨', label: 'Asustado', color: '#f59e0b', level: 'Medio' },
    { emoji: '😢', label: 'Triste', color: '#f97316', level: 'Alto' },
    { emoji: '😡', label: 'Enojado', color: '#ef4444', level: 'Peligro' },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
      marginTop: '15px'
    }}>
      {emotions.map((emotion, index) => (
        <div key={index} style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          background: emotion.color + '20',
          borderRadius: '8px',
          borderLeft: `4px solid ${emotion.color}`
        }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>{emotion.emoji}</span>
          <div>
            <div style={{ fontWeight: '600' }}>{emotion.label}</div>
            <div style={{ fontSize: '12px', color: '#6b7280` }}>Nivel: {emotion.level}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default EmotionLegend