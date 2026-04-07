import Notification from '../models/Notification.js'
import {
  getFromCache,
  setCache,
  deleteFromCache,
  notificationCacheKeys,
} from '../utils/redis.js'

// Get all notifications for user (with Redis caching)
export const getNotifications = async (req, res) => {
  try {
    // Get userId from query parameter
    const userId = req.query.userId

    // Require userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: userId required' })
    }

    // Try to get from cache
    const cacheKey = notificationCacheKeys.byUserId(userId)
    const cached = await getFromCache(cacheKey)
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`)
      return res.status(200).json(cached)
    }

    // Query notifications by userId
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    })

    const unreadCount = notifications.filter((n) => n.status === 'unread').length

    const response = {
      notifications,
      unreadCount,
      count: notifications.length,
    }

    // Cache the response (1 hour TTL)
    await setCache(cacheKey, response, 3600)

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
    const userId = req.query.userId

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID is required' })
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: userId required' })
    }

    // Fetch notification to check authorization
    const notification = await Notification.findById(notificationId)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    // Check if notification belongs to user
    if (notification.userId && notification.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    )

    // Invalidate user's notification cache
    await deleteFromCache(notificationCacheKeys.byUserId(userId))

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
    // Get userId from query parameter
    const userId = req.query.userId

    // Require userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: userId required' })
    }

    // Update all notifications for this userId
    await Notification.updateMany({ userId }, { status: 'read' })

    // Invalidate user's notification cache
    await deleteFromCache(notificationCacheKeys.byUserId(userId))

    return res.status(200).json({
      message: 'All notifications marked as read',
    })
  } catch (error) {
    console.error('Mark all as read error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
