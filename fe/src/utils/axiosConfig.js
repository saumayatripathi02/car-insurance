/**
 * Axios Configuration with Security Headers
 * Automatically adds Authorization header to all requests
 * Prevents passing tokens via query parameters
 */

import axios from 'axios'
import { getAuthToken } from './tokenStorage'

/**
 * Create axios instance with security headers
 */
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:2005/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor to add Authorization header
 * Automatically includes token from storage
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    
    if (token) {
      // Use Authorization header (secure) instead of query parameters
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Remove any token from query parameters for security
    if (config.params?.token) {
      delete config.params.token
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor to handle authentication errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear stored auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // Optionally redirect to login
      window.location.href = '/'
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
