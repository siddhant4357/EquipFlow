import api from './api';

export const assetService = {
  getAll: async (params) => {
    const res = await api.get('/assets', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/assets/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/assets', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/assets/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/assets/${id}`);
    return res.data;
  },
  regenerateQR: async (id) => {
    const res = await api.post(`/assets/${id}/qr`);
    return res.data;
  },
  getHistory: async (id) => {
    const res = await api.get(`/assets/${id}/history`);
    return res.data;
  },
};

export const dashboardService = {
  getOverview: async () => {
    const { data } = await api.get('/dashboard/overview');
    return data;
  },
  getActivity: async (limit = 20) => {
    const { data } = await api.get('/dashboard/activity', { params: { limit } });
    return data;
  },
};

export const userService = {
  getAll: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/users', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },
  deactivate: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};

export const syncService = {
  pullAssets: async () => {
    const { data } = await api.get('/sync/assets');
    return data;
  },
  pushEvents: async (events) => {
    const { data } = await api.post('/sync/events', { events });
    return data;
  },
};
