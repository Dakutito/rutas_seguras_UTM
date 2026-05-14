const getApiUrl = () => {
  // Obtener URL del .env
  let url = import.meta.env.VITE_API_URL;

  // Si no hay variable de entorno, usar la IP actual para red local
  if (!url) {
    const hostname = window.location.hostname;
    url = `http://${hostname}:5000`;
  }
  url = url.replace(/\/$/, '');
  return url;
};

export const API_URL = getApiUrl();

// HELPERS DE TOKENS

const getToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const setToken = (token) => localStorage.setItem('token', token);
const setRefreshToken = (token) => localStorage.setItem('refreshToken', token);

const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

// Helper para headers con autenticación
const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/* INTERCEPTOR DE REFRESH TOKEN
 Control de estado para evitar múltiples refrescos simultáneos.
 Si 10 peticiones fallan al mismo tiempo, solo se hace UNA llamada a /refresh
 y las otras 9 esperan en cola a que termine.
*/
let isRefreshing = false;
let refreshQueue = []; // Cola de callbacks pendientes mientras se refresca

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
};

/*
 fetchWithRefresh — Envuelve fetch() con lógica de renovación automática.
 Flujo:
 1. Hace la petición normal.
 2. Si responde 401 (token expirado) → intenta renovar con el refreshToken.
 3. Si la renovación es exitosa → reintenta la petición original con el nuevo token.
 4. Si la renovación falla → dispara el evento 'auth:expired' para logout global.
 
 @param {string} url - URL a la que hacer la petición
 @param {RequestInit} options - Opciones de fetch (method, headers, body, etc.)
 @returns {Promise<Response>}
*/
const fetchWithRefresh = async (url, options = {}) => {
  // Primera petición
  const response = await fetch(url, options);

  // Si NO es error de autenticación, devolver directamente
  if (response.status !== 401) {
    return response;
  }

  // Revisar si es un error de token expirado (no de credenciales incorrectas)
  // Clonar la respuesta para poder leerla y aun así devolverla si es necesario
  const responseClone = response.clone();
  let errorData;
  try {
    errorData = await responseClone.json();
  } catch {
    return response;
  }

  // Solo intentar refresh si el código es TOKEN_EXPIRED
  // Si es otro 401 (credenciales inválidas en login, etc.), no hacer refresh
  const isTokenExpired = errorData?.code === 'TOKEN_EXPIRED' || errorData?.error === 'Token expirado';
  if (!isTokenExpired) {
    return response;
  }

  const storedRefreshToken = getRefreshToken();

  // Si no hay refresh token guardado, no se puede renovar
  if (!storedRefreshToken) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return response;
  }

  // Si ya hay un refresh en curso, encolar esta petición
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    }).then((newToken) => {
      // Reintentar con el nuevo token
      const retryOptions = {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        }
      };
      return fetch(url, retryOptions);
    });
  }

  // Iniciar proceso de renovación
  isRefreshing = true;

  try {
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken })
    });

    if (!refreshResponse.ok) {
      // El refresh token también expiró → cerrar sesión
      processQueue(new Error('Refresh token inválido'));
      clearTokens();
      window.dispatchEvent(new CustomEvent('auth:expired'));
      return response;
    }

    const data = await refreshResponse.json();
    const newToken = data.token;

    // Guardar el nuevo access token
    setToken(newToken);

    // Notificar a todas las peticiones en cola
    processQueue(null, newToken);

    // Reintentar la petición original con el nuevo token
    const retryOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      }
    };

    return fetch(url, retryOptions);
  } catch (err) {
    processQueue(err);
    clearTokens();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return response;
  } finally {
    isRefreshing = false;
  }
};

// HELPER PARA MANEJAR RESPUESTAS HTTP

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'Error en la petición');
    error.data = data;
    throw error;
  }

  return data;
};


// AUTENTICACIÓN

export const authAPI = {
  // Registro
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Login — guarda AMBOS tokens al iniciar sesión
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);

    // Guardar ambos tokens
    if (data.token) {
      setToken(data.token);
    }
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }

    return data;
  },

  // Logout — elimina el refreshToken de la BD y limpia localStorage
  logout: async () => {
    const storedRefreshToken = getRefreshToken();

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });
    } catch {
      // Si falla la petición, igual limpiamos localmente
    } finally {
      clearTokens();
    }
  },

  // Verificar token
  verifyToken: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/auth/verify`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Verificar Email
  verifyEmail: async (token) => {
    const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`);
    return handleResponse(response);
  }
};

// USUARIOS

export const usersAPI = {
  // Obtener todos los usuarios (admin)
  getAll: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/users`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Obtener perfil propio
  getProfile: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/users/profile`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Cambiar estado de usuario (suspend/active)
  updateStatus: async (userId, status) => {
    const response = await fetchWithRefresh(`${API_URL}/api/users/${userId}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // Eliminar usuario
  delete: async (userId) => {
    const response = await fetchWithRefresh(`${API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Restablecer contraseña
  resetPassword: async (userId) => {
    const response = await fetchWithRefresh(`${API_URL}/api/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    const response = await fetchWithRefresh(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Cambiar contraseña
  changePassword: async (passwords) => {
    const response = await fetchWithRefresh(`${API_URL}/api/users/change-password`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(passwords)
    });
    return handleResponse(response);
  }
};

// REPORTES

export const reportsAPI = {
  // Crear reporte
  create: async (reportData) => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-reports`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(reportData)
    });
    return handleResponse(response);
  },

  // Obtener todos los reportes activos (soporta ?type=emotion o ?type=incident)
  getAll: async (type = '') => {
    const url = type ? `${API_URL}/api/user-reports?type=${type}` : `${API_URL}/api/user-reports`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Obtener mis reportes
  getMyReports: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-reports/my-reports`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Obtener reportes de un usuario
  getByUser: async (userId) => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-reports/user/${userId}`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Eliminar reporte
  delete: async (reportId) => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-reports/${reportId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Limpiar reportes expirados (admin)
  cleanup: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-reports/cleanup`, {
      method: 'POST',
      headers: authHeaders()
    });
    return handleResponse(response);
  }
};

// ZONAS DE RIESGO

export const zonesAPI = {
  // Obtener todas las zonas
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/zones`);
    return handleResponse(response);
  },

  // Obtener zonas por nivel de peligro
  getByDangerLevel: async (level) => {
    const response = await fetch(`${API_URL}/api/zones/danger/${level}`);
    return handleResponse(response);
  },

  // Buscar zonas cercanas
  getNearby: async (lat, lng, radius = 0.01) => {
    const response = await fetch(
      `${API_URL}/api/zones/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return handleResponse(response);
  }
};

// ESTADÍSTICAS

export const statsAPI = {
  // Estadísticas generales
  getGeneral: async () => {
    const response = await fetch(`${API_URL}/api/stats/general`);
    return handleResponse(response);
  },

  // Estadísticas de admin
  getAdmin: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/stats/admin`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Estadísticas de usuario
  getUser: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/stats/user`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Heatmap
  getHeatmap: async () => {
    const response = await fetch(`${API_URL}/api/stats/heatmap`);
    return handleResponse(response);
  }
};


// INCIDENTES

export const incidentsAPI = {
  // Obtener todos
  getAll: async (type = null) => {
    const url = type && type !== 'Todos'
      ? `${API_URL}/api/incidents?type=${type}`
      : `${API_URL}/api/incidents`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Crear incidente
  create: async (data) => {
    const response = await fetchWithRefresh(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // Eliminar incidente
  delete: async (id) => {
    const response = await fetchWithRefresh(`${API_URL}/api/incidents/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await fetch(`${API_URL}/api/incident-categories`);
    return handleResponse(response);
  }
};


// CONFIGURACIÓN DE USUARIO

export const userSettingsAPI = {
  // Obtener perfil completo
  getProfile: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-settings/profile`, {
      headers: authHeaders()
    });
    return handleResponse(response);
  },

  // Actualizar nombre
  updateName: async (name) => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-settings/update-name`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ name })
    });
    return handleResponse(response);
  },

  // Eliminar cuenta
  deleteAccount: async () => {
    const response = await fetchWithRefresh(`${API_URL}/api/user-settings/delete-account`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return handleResponse(response);
  }
};

// HEALTH CHECK

export const healthCheck = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  return handleResponse(response);
};

export default {
  auth: authAPI,
  users: usersAPI,
  reports: reportsAPI,
  zones: zonesAPI,
  stats: statsAPI,
  incidents: incidentsAPI,
  userSettings: userSettingsAPI,
  healthCheck
};