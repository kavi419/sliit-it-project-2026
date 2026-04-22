import axios from 'axios';

const api = axios.create();

api.defaults.withCredentials = true;

// Add a request interceptor to attach the simulated role header
api.interceptors.request.use(
  (config) => {
    const mockRole = localStorage.getItem('mockRole');
    if (mockRole) {
      config.headers['X-Mock-Role'] = mockRole;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
