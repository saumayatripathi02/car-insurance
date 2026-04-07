import express from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js'

const router = express.Router()

// All endpoints require userId query parameter
router.get('/list-notifications', getNotifications)
router.put('/:notificationId/read', markAsRead)
router.put('/mark-all/read', markAllAsRead)

export default router
