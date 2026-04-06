import Notification from '../models/Notification.js'
import { isValidEmail } from '../utils/validation.js'
import {
  getFromCache,
  setCache,
  deleteFromCache,
  deleteByPattern,
  notificationCacheKeys,
} from '../utils/redis.js'

// Get all notifications for user (with Redis caching)
export const getNotifications = async (req, res) => {
  try {
    // Prefer authenticated user from middleware
    // Fall back to email query parameter for backward compatibility
    let userId = req.user?.userId
    let userEmail = req.user?.email

    // If not authenticated but email provided, validate it
    if (!userId && req.query.email) {
      if (!isValidEmail(req.query.email)) {
        return res.status(400).json({ message: 'Invalid email format' })
      }
      userEmail = req.query.email
    }

    // Require at least one identifier
    if (!userId && !userEmail) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Try to get from cache
    let cacheKey = null
    if (userId) {
      cacheKey = notificationCacheKeys.byUserId(userId)
    } else if (userEmail) {
      cacheKey = notificationCacheKeys.byEmail(userEmail)
    }

    if (cacheKey) {
      const cached = await getFromCache(cacheKey)
      if (cached) {
        console.log(`Cache hit for ${cacheKey}`)
        return res.status(200).json(cached)
      }
    }

    // Build search criteria
    let searchCriteria = {}
    if (userId) {
      searchCriteria.userId = userId
    }
    if (userEmail) {
      searchCriteria.email = userEmail
    }

    const notifications = await Notification.find(searchCriteria).sort({
      createdAt: -1,
    })

    const unreadCount = notifications.filter((n) => n.status === 'unread').length

    const response = {
      notifications,
      unreadCount,
      count: notifications.length,
    }

    // Cache the response (1 hour TTL)
    if (cacheKey) {
      await setCache(cacheKey, response, 3600)
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Get notifications error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' })
    }

    // Fetch notification to check authorization
    const notification = await Notification.findById(notificationId)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    // Authorization: User can only update their own notifications
    const userId = req.user?.userId
    const userEmail = req.user?.email

    if (userId) {
      // Check if notification belongs to user
      if (notification.userId && notification.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Unauthorized' })
      }
    } else if (userEmail) {
      // Fall back to email check
      if (notification.email !== userEmail) {
        return res.status(403).json({ message: 'Unauthorized' })
      }
    } else {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    )

    // Invalidate user's notification cache
    const cacheKeyUser = notificationCacheKeys.byUserId(notification.userId)
    const cacheKeyEmail = notificationCacheKeys.byEmail(notification.email)
    
    await deleteFromCache(cacheKeyUser)
    await deleteFromCache(cacheKeyEmail)

    return res.status(200).json({
      message: 'Notification marked as read',
      notification: updatedNotification,
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    // Use user from authentication middleware, or email from body
    let userId = req.user?.userId
    let userEmail = req.user?.email

    // If not authenticated, try to use email from request body
    if (!userId && req.body.email) {
      if (!isValidEmail(req.body.email)) {
        return res.status(400).json({ message: 'Invalid email format' })
      }
      userEmail = req.body.email
    }

    // Require at least one identifier
    if (!userId && !userEmail) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Build search criteria for the update
    let searchCriteria = {}
    if (userId) {
      searchCriteria.userId = userId
    }
    if (userEmail) {
      searchCriteria.email = userEmail
    }

    await Notification.updateMany(searchCriteria, { status: 'read' })

    // Invalidate user's notification cache
    if (userId) {
      await deleteFromCache(notificationCacheKeys.byUserId(userId))
    }
    if (userEmail) {
      await deleteFromCache(notificationCacheKeys.byEmail(userEmail))
    }

    return res.status(200).json({
      message: 'All notifications marked as read',
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
