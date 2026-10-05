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
  const pathWithoutSlash = cleanPath.length > 1 && cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
  const pathWithSlash = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  const bases = getApiBaseUrls();
  const list = [];
  for (const base of bases) {
    list.push(`${base}${pathWithoutSlash}`);
    list.push(`${base}${pathWithSlash}`);
  }
  return [...new Set(list)];
};

/**
 * Robust API POST caller that iterates candidate endpoints,
 * skips candidates returning 404/405 (e.g. static CDN hosts or mismatched slash),
 * and immediately preserves actionable business responses (400, 401, 403, 422, 429).
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
      if (err.response) {
        const st = err.response.status;
        // 404 Not Found or 405 Method Not Allowed indicates wrong host/path/method for this candidate.
        // Try the remaining candidate URLs instead of aborting.
        if (st === 404 || st === 405) {
          continue;
        }
        // Actionable business validation errors (400, 401, 403, 422, 429) -> propagate immediately
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
      if (err.response) {
        const st = err.response.status;
        if (st === 404 || st === 405) {
          continue;
        }
        throw err;
      }
    }
  }

  throw lastErr || new Error("Failed to connect to backend server.");
};
