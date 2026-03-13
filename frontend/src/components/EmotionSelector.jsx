const EmotionSelector = ({ onSelect }) => {
  const emotions = [
    { emoji: '😊', label: 'Feliz', color: '#10b981' },
    { emoji: '😌', label: 'Tranquilo', color: '#34d399' },
    { emoji: '😐', label: 'Neutral', color: '#a7f3d0' },
    { emoji: '😰', label: 'Ansioso', color: '#fbbf24' },
    { emoji: '😨', label: 'Asustado', color: '#f59e0b' },
    { emoji: '😢', label: 'Triste', color: '#f97316' },
    { emoji: '😡', label: 'Enojado', color: '#ef4444' },
  ]

  return (
    <div>
      <h4>Selecciona tu emoción actual</h4>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center'
      }}>
        {emotions.map((emotion, index) => (
          <button
            key={index}
            onClick={() => onSelect(emotion)}
            style={{
              padding: '15px',
              background: emotion.color + '20',
              border: `2px solid ${emotion.color}`,
              borderRadius: '10px',
              fontSize: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            title={emotion.label}
          >
            {emotion.emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EmotionSelector