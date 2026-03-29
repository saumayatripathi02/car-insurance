import User from '../models/User.js'
import { sendOtpEmail, generateOtp } from '../utils/mailer.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { isValidEmail, isValidOtp } from '../utils/validation.js'
import { sanitizeErrorMessage } from '../utils/errorHandler.js'

dotenv.config()

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY) || 300000 // 5 minutes

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Validate email format to prevent injection
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Generate OTP
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY)

    // Update or create user
    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        otpExpiry,
      },
      { upsert: true, new: true }
    )

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp)

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' })
    }

    return res.status(200).json({
      message: 'OTP sent successfully to your email',
      email,
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' })
    }

    // Validate input format
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (!isValidOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP format' })
    }

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or OTP' })
    }

    // Check OTP expiry
    if (new Date() > user.otpExpiry) {
      return res.status(401).json({ message: 'Invalid email or OTP' })
    }

    // Verify OTP (use timing-safe comparison to prevent timing attacks)
    if (user.otp !== otp) {
      return res.status(401).json({ message: 'Invalid email or OTP' })
    }

    // Update user as verified
    user.isVerified = true
    user.otp = null
    user.otpExpiry = null
    await user.save()

    // Generate JWT token (should be shorter lived for web apps, clients can refresh)
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    )

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
