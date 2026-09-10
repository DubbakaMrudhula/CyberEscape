// API Base URL Configuration
// If on localhost, uses relative path (Vite proxy to localhost:5000)
// If deployed in production, connects to the live Vercel backend
export const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://cyber-escape-wheat.vercel.app'
);
