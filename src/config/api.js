// API Configuration
// Update this file to point to your Flask API server

const API_CONFIG = {
  // Base URL for the Flask API (hardcoded for EC2)
  baseUrl: 'http://98.84.123.251:5000',
  
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
