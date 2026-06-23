const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
  }

  // Se a resposta for vazia (ex: 204 No Content), evitamos JSON crash
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Autenticação
  login: async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    // Salvar token e user no localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Unidades
  getUnits: () => apiFetch('/units'),
  getUnitById: (id) => apiFetch(`/units/${id}`),
  createUnit: (data) => apiFetch('/units', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateUnit: (id, data) => apiFetch(`/units/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteUnit: (id) => apiFetch(`/units/${id}`, {
    method: 'DELETE'
  }),

  // Serviços da Unidade
  createService: (unitId, data) => apiFetch(`/units/${unitId}/services`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateService: (id, data) => apiFetch(`/units/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteService: (id) => apiFetch(`/units/services/${id}`, {
    method: 'DELETE'
  }),

  // Notícias da Unidade
  createNews: (unitId, data) => apiFetch(`/units/${unitId}/news`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateNews: (id, data) => apiFetch(`/units/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteNews: (id) => apiFetch(`/units/news/${id}`, {
    method: 'DELETE'
  }),

  // Perfis de Administradores de Unidades (Apenas System Admin)
  getProfiles: () => apiFetch('/profiles'),
  createProfile: (data) => apiFetch('/profiles', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProfile: (id, data) => apiFetch(`/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  resetProfilePassword: (id, newPassword) => apiFetch(`/profiles/${id}/reset-password`, {
    method: 'PUT',
    body: JSON.stringify({ newPassword })
  }),
  deleteProfile: (id) => apiFetch(`/profiles/${id}`, {
    method: 'DELETE'
  }),

  // Histórico de Logs
  getHistory: (page = 1, limit = 10, unitId = null, actionType = null, startDate = null, endDate = null) => {
    let url = `/history?page=${page}&limit=${limit}`;
    if (unitId) url += `&unitId=${unitId}`;
    if (actionType) url += `&actionType=${encodeURIComponent(actionType)}`;
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    return apiFetch(url);
  },
  createHistory: (data) => apiFetch('/history', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createTriageLog: (data) => apiFetch('/units/triage/log', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Médicos
  getDoctors: (unitId) => apiFetch(`/units/${unitId}/doctors`),
  createDoctor: (unitId, data) => apiFetch(`/units/${unitId}/doctors`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateDoctor: (id, data) => apiFetch(`/units/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteDoctor: (id) => apiFetch(`/units/doctors/${id}`, {
    method: 'DELETE'
  }),

  // UBS mais próxima (Haversine)
  getClosestUbs: (query) => apiFetch(`/units/closest?q=${encodeURIComponent(query)}`),

  // Avaliações / Feedbacks de Serviços
  getReviews: (status = null) => {
    let url = '/reviews';
    if (status) url += `?status=${status}`;
    return apiFetch(url);
  },
  createReview: (data) => apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  readReview: (id) => apiFetch(`/reviews/${id}/read`, {
    method: 'PUT'
  }),

  // Dashboard
  getAdminDashboard: (severity = 'all') => apiFetch(`/dashboard/admin?severity=${encodeURIComponent(severity)}`),
  getGestorDashboard: () => apiFetch('/dashboard/gestor')
};

