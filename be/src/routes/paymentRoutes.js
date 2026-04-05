import express from 'express'
import {
  createPaymentIntent,
  confirmPayment,
  getPolicyDetails,
  getAllPolicies,
} from '../controllers/paymentController.js'
import { optionalAuthMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/create-payment-intent', createPaymentIntent)
router.post('/confirm-payment', optionalAuthMiddleware, confirmPayment)
router.get('/policy/:policyId', optionalAuthMiddleware, getPolicyDetails)
router.get('/policies', optionalAuthMiddleware, getAllPolicies)

export default router
