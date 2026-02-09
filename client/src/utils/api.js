export const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, opts);
  return res.json();
}
