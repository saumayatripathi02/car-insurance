import express from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js'
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/list', optionalAuthMiddleware, getNotifications)
router.put('/:notificationId/read', optionalAuthMiddleware, markAsRead)
router.put('/mark-all/read', optionalAuthMiddleware, markAllAsRead)

export default router
