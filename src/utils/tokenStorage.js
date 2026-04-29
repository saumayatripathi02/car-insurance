/**
 * Secure Token Management Utility
 * Provides methods for storing and retrieving authentication tokens safely
 * 
 * SECURITY NOTES:
 * - localStorage is vulnerable to XSS attacks
 * - For production, consider using httpOnly cookies instead
 * - This is a temporary solution to improve current security
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_info'

/**
 * Store authentication token
 * @param {string} token - JWT token to store
 */
export const setAuthToken = (token) => {
  if (!token || typeof token !== 'string') {
    console.error('Invalid token provided')
    return false
  }
  try {
    // Sanitize token (basic check)
    if (token.split('.').length !== 3) {
      console.error('Invalid JWT format')
      return false
    }
    localStorage.setItem(TOKEN_KEY, token)
    return true
  } catch (error) {
    console.error('Failed to store token:', error)
    return false
  }
}

/**
 * Retrieve authentication token
 * @returns {string|null} - JWT token or null if not found
 */
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    return token || null
  } catch (error) {
    console.error('Failed to retrieve token:', error)
    return null
  }
}

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Failed to clear token:', error)
  }
}

/**
 * Store user information
 * @param {object} user - User information object
 */
export const setUserInfo = (user) => {
  if (!user || typeof user !== 'object') {
    console.error('Invalid user object provided')
    return false
  }
  try {
    // Only store necessary user info, avoid storing sensitive data
    const safeUser = {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    }
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser))
    return true
  } catch (error) {
    console.error('Failed to store user info:', error)
    return false
  }
}

/**
 * Retrieve user information
 * @returns {object|null} - User object or null if not found
 */
export const getUserInfo = () => {
  try {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Failed to retrieve user info:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if token exists
 */
export const isAuthenticated = () => {
  return getAuthToken() !== null
}

/**
 * Logout user
 * Clears all stored authentication data
 */
export const logout = () => {
  clearAuthToken()
}

export default {
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  setUserInfo,
  getUserInfo,
  isAuthenticated,
  logout,
}
