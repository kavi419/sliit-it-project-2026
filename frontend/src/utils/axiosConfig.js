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
    // Inject mock headers from the actual logged-in user to prevent stale backend sessions
    try {
      const userStr = sessionStorage.getItem('sc_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.email) config.headers['X-Mock-Email'] = user.email;
        if (user.role) config.headers['X-Mock-Role'] = user.role;
      }
    } catch (e) {
      // ignore parsing errors
    }
    
    // Fallback to explicit localStorage mockRole if no session exists
    const mockRole = localStorage.getItem('mockRole');
    if (mockRole && !config.headers['X-Mock-Role']) {
      config.headers['X-Mock-Role'] = mockRole;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
