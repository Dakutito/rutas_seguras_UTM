// frontend/src/services/authService.js
export const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user?.role === 'admin'
  } catch {
    return false
  }
}

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}