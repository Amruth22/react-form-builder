// API Configuration
// Uses environment variables from .env file
// If REACT_APP_API_BASE_URL is empty, defaults to localhost:5000

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_BASE_URL;

  // Return environment URL if it's defined and not empty
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  // Default to localhost if environment variable is not set or empty
  return 'http://localhost:5000';
};

const API_CONFIG = {
  // Base URL for the Flask API (from .env or localhost default)
  baseUrl: getBaseUrl(),

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
