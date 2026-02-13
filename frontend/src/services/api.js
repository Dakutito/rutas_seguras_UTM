// services/api.js - Servicio para conectar frontend con backend

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_URL = getApiUrl();

// Helper para manejar respuestas
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición');
  }

  return data;
};

// Helper para obtener el token
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper para headers con autenticación
const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ==================== AUTENTICACIÓN ====================

export const authAPI = {
  // Registro
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Login
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);

    // Guardar token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders()
    });

    // Limpiar token
    localStorage.removeItem('token');

    return handleResponse(response);
  },

  // Verificar token
  verifyToken: async () => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== USUARIOS ====================

export const usersAPI = {
  // Obtener todos los usuarios (admin)
  getAll: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Obtener perfil propio
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Suspender usuario
  suspend: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/suspend`, {
      method: 'PUT',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Reactivar usuario
  activate: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/activate`, {
      method: 'PUT',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Eliminar usuario
  delete: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Restablecer contraseña
  resetPassword: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Cambiar contraseña
  changePassword: async (passwords) => {
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(passwords)
    });
    return handleResponse(response);
  }
};

// ==================== REPORTES ====================

export const reportsAPI = {
  // Crear reporte
  create: async (reportData) => {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(reportData)
    });
    return handleResponse(response);
  },

  // Obtener todos los reportes activos
  getAll: async () => {
    const response = await fetch(`${API_URL}/reports`);
    return handleResponse(response);
  },

  // Obtener reportes de un usuario
  getByUser: async (userId) => {
    const response = await fetch(`${API_URL}/reports/user/${userId}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Eliminar reporte
  delete: async (reportId) => {
    const response = await fetch(`${API_URL}/reports/${reportId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Limpiar reportes expirados (admin)
  cleanup: async () => {
    const response = await fetch(`${API_URL}/reports/cleanup`, {
      method: 'POST',
      headers: authHeaders()
    });
    return handleResponse(response);
  }
};

// ==================== ZONAS DE RIESGO ====================

export const zonesAPI = {
  // Obtener todas las zonas
  getAll: async () => {
    const response = await fetch(`${API_URL}/zones`);
    return handleResponse(response);
  },

  // Obtener zonas por nivel de peligro
  getByDangerLevel: async (level) => {
    const response = await fetch(`${API_URL}/zones/danger/${level}`);
    return handleResponse(response);
  },

  // Buscar zonas cercanas
  getNearby: async (lat, lng, radius = 0.01) => {
    const response = await fetch(
      `${API_URL}/zones/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return handleResponse(response);
  }
};

// ==================== ESTADÍSTICAS ====================

export const statsAPI = {
  // Estadísticas generales
  getGeneral: async () => {
    const response = await fetch(`${API_URL}/stats/general`);
    return handleResponse(response);
  },

  // Estadísticas de admin
  getAdmin: async () => {
    const response = await fetch(`${API_URL}/stats/admin`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Estadísticas de usuario
  getUser: async () => {
    const response = await fetch(`${API_URL}/stats/user`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Heatmap
  getHeatmap: async () => {
    const response = await fetch(`${API_URL}/stats/heatmap`);
    return handleResponse(response);
  }
};

// ==================== HEALTH CHECK ====================

export const healthCheck = async () => {
  const response = await fetch(`${API_URL}/health`);
  return handleResponse(response);
};

export default {
  auth: authAPI,
  users: usersAPI,
  reports: reportsAPI,
  zones: zonesAPI,
  stats: statsAPI,
  healthCheck
};