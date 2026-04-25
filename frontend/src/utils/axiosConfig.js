import axios from 'axios';

const api = axios.create();

api.defaults.withCredentials = true;

// DEV/TEST ONLY: Add the X-Mock-Role header if set in localStorage.
// To simulate admin access during development, run in the browser console:
//   localStorage.setItem('mockRole', 'ADMIN')
// Remove with: localStorage.removeItem('mockRole')
// This is used by ResourceController.ensureAdmin() to allow test/unit test access.
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
