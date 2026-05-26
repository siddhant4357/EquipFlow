import api from './api';

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  refresh: async (refreshToken) => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },
};
