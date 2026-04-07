import Stripe from 'stripe'
import Policy from '../models/Policy.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { isValidEmail, isValidAmount, isValidCarDetails } from '../utils/validation.js'
import { deleteFromCache, notificationCacheKeys } from '../utils/redis.js'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { email, amount, carDetails, planDetails } = req.body

    if (!email || !amount || !carDetails || !planDetails) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Validate input to prevent injection
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    if (!isValidCarDetails(carDetails)) {
      return res.status(400).json({ message: 'Invalid car details' })
    }

    // Amount in cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100)

    // Create description for transaction
    const description = `Car Insurance Policy - ${carDetails.year} ${carDetails.make} ${carDetails.model} - ${planDetails.type}`

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'inr',
      description: description,
      statement_descriptor: 'INSURANCEPRO CAR INS',
      metadata: {
        email,
        carMake: carDetails.make,
        carModel: carDetails.model,
        carYear: carDetails.year,
        planType: planDetails.type,
        coverage: planDetails.coverage,
      },
    })

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      description: description,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Confirm Payment and Save Policy
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, email, carDetails, planDetails, amount } = req.body

    if (!paymentIntentId || !email || !carDetails || !planDetails) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Validate input to prevent injection
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!isValidAmount(amount)) {
      return res.status(400).json({ message: 'Invalid amount' })
    }

    if (!isValidCarDetails(carDetails)) {
      return res.status(400).json({ message: 'Invalid car details' })
    }

    // Verify payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' })
    }

    // Get user ID from authenticated request or look up by email
    let userId = req.user?.userId

    if (!userId) {
      // Try to find user by email
      let user = await User.findOne({ email: email })
      
      // If user doesn't exist, create one
      if (!user) {
        user = new User({
          email: email,
          isVerified: false,
        })
        await user.save()
      }
      
      userId = user._id
    }

    // Create policy
    const policy = new Policy({
      userId,
      email,
      carDetails: {
        make: carDetails.make,
        model: carDetails.model,
        year: carDetails.year,
      },
      planDetails: {
        type: planDetails.type,
        coverage: planDetails.coverage,
      },
      amount,
      paymentStatus: 'succeeded',
      stripePaymentIntentId: paymentIntentId,
    })

    await policy.save()

    // Create payment completed notification
    const paymentNotification = new Notification({
      userId,
      email,
      policyId: policy._id,
      type: 'payment_completed',
      title: 'Payment Completed',
      message: `Payment of ₹${amount.toLocaleString('en-IN')} has been successfully processed for your ${carDetails.year} ${carDetails.make} ${carDetails.model} insurance policy.`,
      metadata: {
        policyNumber: policy.policyNumber,
        carDetails: {
          make: carDetails.make,
          model: carDetails.model,
          year: carDetails.year,
        },
        planType: planDetails.type,
        amount: amount,
        paymentStatus: 'succeeded',
      },
    })

    await paymentNotification.save()

    // Create policy purchased notification
    const policyNotification = new Notification({
      userId,
      email,
      policyId: policy._id,
      type: 'policy_purchased',
      title: 'Policy Purchased Successfully',
      message: `Your ${planDetails.type} insurance policy for ${carDetails.year} ${carDetails.make} ${carDetails.model} has been purchased. Policy Number: ${policy.policyNumber}. Coverage: ${planDetails.coverage}. Valid till ${new Date(policy.validUpto).toLocaleDateString('en-US')}.`,
      metadata: {
        policyNumber: policy.policyNumber,
        carDetails: {
          make: carDetails.make,
          model: carDetails.model,
          year: carDetails.year,
        },
        planType: planDetails.type,
        amount: amount,
        paymentStatus: 'succeeded',
      },
    })

    await policyNotification.save()

    // Clear Redis cache for user's notifications so fresh data is fetched next time
    await deleteFromCache(notificationCacheKeys.byUserId(userId))

    return res.status(200).json({
      message: 'Payment successful',
      policy: {
        id: policy._id,
        policyNumber: policy.policyNumber,
        email: policy.email,
        carDetails: policy.carDetails,
        planDetails: policy.planDetails,
        amount: policy.amount,
        validFrom: policy.validFrom,
        validUpto: policy.validUpto,
        paymentStatus: policy.paymentStatus,
      },
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get Policy Details
export const getPolicyDetails = async (req, res) => {
  try {
    const { policyId } = req.params

    if (!policyId) {
      return res.status(400).json({ message: 'Policy ID is required' })
    }

    const policy = await Policy.findById(policyId)

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' })
    }

    // Authorization: User can only access their own policy
    const userId = req.user?.userId
    const userEmail = req.user?.email

    if (userId) {
      // Check if policy belongs to user
      if (policy.userId && policy.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Unauthorized' })
      }
    } else if (userEmail) {
      // Fall back to email check
      if (policy.email !== userEmail) {
        return res.status(403).json({ message: 'Unauthorized' })
      }
    }

    return res.status(200).json({
      policy: {
        id: policy._id,
        policyNumber: policy.policyNumber,
        email: policy.email,
        carDetails: policy.carDetails,
        planDetails: policy.planDetails,
        amount: policy.amount,
        paymentStatus: policy.paymentStatus,
        validFrom: policy.validFrom,
        validUpto: policy.validUpto,
        createdAt: policy.createdAt,
      },
    })
  } catch (error) {
    console.error('Get policy details error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// Get All Policies for User
export const getAllPolicies = async (req, res) => {
  try {
    // Prefer authenticated user from middleware
    let userId = req.user?.userId
    let userEmail = req.user?.email

    // If not authenticated but email provided in query, validate it
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

    let searchCriteria = {}
    if (userId) {
      searchCriteria.userId = userId
    }
    if (userEmail) {
      searchCriteria.email = userEmail
    }

    const policies = await Policy.find(searchCriteria).sort({ createdAt: -1 })

    if (!policies || policies.length === 0) {
      return res.status(200).json({
        policies: [],
        message: 'No policies found',
      })
    }

    const formattedPolicies = policies.map((policy) => ({
      id: policy._id,
      policyNumber: policy.policyNumber,
      email: policy.email,
      carDetails: policy.carDetails,
      planDetails: policy.planDetails,
      amount: policy.amount,
      paymentStatus: policy.paymentStatus,
      validFrom: policy.validFrom,
      validUpto: policy.validUpto,
      createdAt: policy.createdAt,
    }))

    return res.status(200).json({
      policies: formattedPolicies,
      count: formattedPolicies.length,
    })
  } catch (error) {
    console.error('Get all policies error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
