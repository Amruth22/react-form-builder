// API Configuration
// Update this file to point to your Flask API server

// Auto-detect API URL based on where the frontend is accessed from
const getApiUrl = () => {
  // If env var is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Auto-detect from browser location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${hostname}:5000`;
  }
  
  // Fallback for server-side rendering
  return 'http://localhost:5000';
};

const API_CONFIG = {
  // Base URL for the Flask API
  baseUrl: getApiUrl(),
  
  // API endpoints
  endpoints: {
    upload: '/api/upload',
    extract: '/api/extract',
    files: '/api/files',
    health: '/api/health',
    info: '/api/info'
  },
  
  // Request timeout (in milliseconds)
  timeout: 300000, // 5 minutes for PDF processing
  
  // API key (if required)
  apiKey: process.env.REACT_APP_API_KEY || null,
};

export default API_CONFIG;
