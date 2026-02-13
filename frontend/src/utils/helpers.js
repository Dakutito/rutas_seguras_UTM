// src/utils/helpers.js

// Función para obtener color basado en emoción
export const getEmotionColor = (emoji) => {
  const colors = {
    '😊': '#10b981',
    '😌': '#34d399',
    '😐': '#a7f3d0',
    '😰': '#fbbf24',
    '😨': '#f59e0b',
    '😢': '#f97316',
    '😡': '#ef4444'
  }
  return colors[emoji] || '#6b7280'
}

// Función para obtener label de emoción
export const getEmotionLabel = (emoji) => {
  const labels = {
    '😊': 'Feliz',
    '😌': 'Tranquilo',
    '😐': 'Neutral',
    '😰': 'Ansioso',
    '😨': 'Asustado',
    '😢': 'Triste',
    '😡': 'Enojado'
  }
  return labels[emoji] || 'Desconocido'
}

// Función para obtener nivel de peligro
export const getDangerLevel = (emoji) => {
  const levels = {
    '😊': 'Seguro',
    '😌': 'Seguro',
    '😐': 'Bajo',
    '😰': 'Medio',
    '😨': 'Medio',
    '😢': 'Alto',
    '😡': 'Peligro'
  }
  return levels[emoji] || 'Desconocido'
}

// Función de random con semilla (determinista)
export const seededRandom = (seed = 12345) => {
  let currentSeed = seed
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    return currentSeed / 233280
  }
}

// Función segura para localStorage
export const safeStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}