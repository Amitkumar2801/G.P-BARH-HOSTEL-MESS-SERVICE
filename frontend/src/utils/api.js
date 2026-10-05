// frontend/src/utils/api.js
import axios from 'axios';

/**
 * Returns prioritized API base URLs:
 * 1. Environment variable VITE_API_BASE_URL or VITE_BACKEND_URL
 * 2. Localhost URL (only when browsing from localhost/127.0.0.1)
 * 3. Relative path '' (for Vercel rewrites or direct domain deployment)
 */
export const getApiBaseUrls = () => {
  const envBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const bases = [];
  if (envBase) bases.push(envBase);
  if (isLocal) {
    bases.push("http://127.0.0.1:8000");
    bases.push("http://localhost:8000");
  }
  bases.push(""); // relative
  return [...new Set(bases)];
};

/**
 * Resolves full candidate URL paths for a given API endpoint path
 * @param {string} path e.g. "/api/auth/send-registration-otp"
 */
export const getCandidateEndpoints = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const bases = getApiBaseUrls();
  return bases.map(base => `${base}${cleanPath}`);
};

/**
 * Robust API POST caller that iterates candidate endpoints,
 * preserves actionable HTTP error responses (400, 403, 404, 429),
 * and only falls back on actual network timeouts / connection refused.
 */
export const apiPost = async (path, payload, options = {}) => {
  const candidates = getCandidateEndpoints(path);
  let lastErr = null;

  for (const url of candidates) {
    try {
      const response = await axios.post(url, payload, {
        timeout: 15000,
        ...options
      });
      if (response && response.data) {
        return response;
      }
    } catch (err) {
      lastErr = err;
      // If the backend actually responded with an HTTP status code (e.g. 400 Bad Request, 429 Rate Limit),
      // we must NOT fall back or mask it as a network error; propagate immediately!
      if (err.response && err.response.data) {
        throw err;
      }
    }
  }

  throw lastErr || new Error("Failed to connect to backend server. Please verify your connection.");
};

/**
 * Robust API GET caller that iterates candidate endpoints
 */
export const apiGet = async (path, options = {}) => {
  const candidates = getCandidateEndpoints(path);
  let lastErr = null;

  for (const url of candidates) {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        ...options
      });
      if (response && response.data) {
        return response;
      }
    } catch (err) {
      lastErr = err;
      if (err.response && err.response.data) {
        throw err;
      }
    }
  }

  throw lastErr || new Error("Failed to connect to backend server.");
};
