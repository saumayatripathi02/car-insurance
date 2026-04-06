import { createClient } from 'redis'

let redisClient = null

export const initializeRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_HOST
    const redisPassword = process.env.REDIS_ACCESS_KEY

    if (!redisUrl || !redisPassword) {
      console.warn('⚠️  Redis credentials not configured. Caching disabled.')
      return null
    }

    redisClient = createClient({
      socket: {
            host: redisUrl,
            port: 10000,
            tls: true
        },
        username: "default",
        password: redisPassword
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('✓ Redis connected')
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('Redis initialization error:', error)
    return null
  }
}

export const getRedisClient = () => {
  return redisClient
}

// Cache key builder
export const buildCacheKey = (prefix, ...args) => {
  return `${prefix}:${args.join(':')}`
}

// Get from cache
export const getFromCache = async (key) => {
  if (!redisClient) return null

  try {
    const cached = await redisClient.get(key)
    return cached ? JSON.parse(cached) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

// Set cache with TTL
export const setCache = async (key, data, ttl = 3600) => {
  if (!redisClient) return false

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Cache set error:', error)
    return false
  }
}

// Delete from cache
export const deleteFromCache = async (key) => {
  if (!redisClient) return false

  try {
    await redisClient.del(key)
    return true
  } catch (error) {
    console.error('Cache delete error:', error)
    return false
  }
}

// Delete multiple keys by pattern
export const deleteByPattern = async (pattern) => {
  if (!redisClient) return false

  try {
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
    return true
  } catch (error) {
    console.error('Cache delete pattern error:', error)
    return false
  }
}

// Cache notification keys
export const notificationCacheKeys = {
  byUserId: (userId) => buildCacheKey('notifications:user', userId),
  byEmail: (email) => buildCacheKey('notifications:email', email),
  userPattern: (userId) => `notifications:user:${userId}*`,
  emailPattern: (email) => `notifications:email:${email}*`,
}

export default {
  initializeRedis,
  getRedisClient,
  buildCacheKey,
  getFromCache,
  setCache,
  deleteFromCache,
  deleteByPattern,
  notificationCacheKeys,
}
