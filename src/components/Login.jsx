import { useState } from 'react'
import { CgProfile, IoArrowBack } from '../utils/icons'
import axios from 'axios'
import { setAuthToken, setUserInfo } from '../utils/tokenStorage'

const API_BASE_URL = 'http://localhost:5000/api'

export default function Login({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        email,
      })
      
      if (response.status === 200) {
        setShowOtpInput(true)
        setError('')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter OTP')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp,
      })

      if (response.status === 200) {
        // Store token securely using utility functions
        const tokenStored = setAuthToken(response.data.token)
        const userStored = setUserInfo(response.data.user)
        
        if (tokenStored && userStored) {
          alert('Logged in successfully!')
          onLoginSuccess(response.data.user)
          onClose()
        } else {
          setError('Failed to store authentication data')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-8 w-full max-w-sm shadow-xl animate-slide-up border border-border-light dark:border-border-dark">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-text-primary dark:text-white text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CgProfile size={24} className="text-primary" />
              </div>
              Login
            </h2>
            <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">Sign in to your account</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Email Section */}
        <div className="mb-6">
          <label className="block text-text-primary dark:text-white text-sm font-semibold mb-3">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={showOtpInput}
            placeholder="Enter your email"
            className="input-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* OTP Input */}
        {showOtpInput && (
          <div className="mb-6 animate-slide-down">
            <label className="block text-text-primary dark:text-white text-sm font-semibold mb-3">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="input-primary text-center text-2xl letter-spacing tracking-widest"
            />
            <p className="text-text-secondary dark:text-gray-400 text-xs mt-2">Check your email for the verification code</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-danger/10 dark:bg-danger/20 border border-danger/20 text-danger dark:text-danger/90 rounded-lg text-sm font-medium animate-slide-down">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Send OTP Button */}
        {!showOtpInput && (
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="btn-primary w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        )}

        {/* Verify OTP Button */}
        {showOtpInput && (
          <>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="btn-primary w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button
              onClick={() => {
                setShowOtpInput(false)
                setOtp('')
                setError('')
              }}
              className="w-full h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary dark:text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <IoArrowBack size={18} />
              Back
            </button>
          </>
        )}

        {/* Close Button */}
        {!showOtpInput && (
          <button
            onClick={onClose}
            className="w-full h-12 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary dark:text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
