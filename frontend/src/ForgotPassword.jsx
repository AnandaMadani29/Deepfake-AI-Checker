import React, { useState } from 'react'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ForgotPassword({ onNavigateToHome, onNavigateToLogin }) {
  const [step, setStep] = useState('request') // 'request' or 'reset'
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed')
      }

      // In development, we get the token in response
      // In production, this would be sent via email
      if (data.reset_token) {
        setResetToken(data.reset_token)
        setStep('reset')
        setSuccess('Reset token generated. In production, this would be sent to your email.')
      } else {
        setSuccess(data.message || 'If your email exists, you will receive a reset link.')
      }
    } catch (err) {
      setError(err.message || 'Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          new_password: newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Password reset failed')
      }

      setSuccess('Password has been reset successfully! Redirecting to login...')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onNavigateToLogin()
      }, 2000)
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 450, padding: '0 20px' }}>
        {/* Logo/Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div 
            onClick={onNavigateToHome}
            style={{ fontSize: 32, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', marginBottom: 8 }}
          >
            Fact.it
          </div>
          <p style={{ fontSize: 16, color: '#999', margin: 0 }}>
            {step === 'request' ? 'Reset your password' : 'Create new password'}
          </p>
        </div>

        {/* Form Container */}
        <div style={{
          background: '#0d0d0d',
          padding: 40,
          borderRadius: 8,
          border: '1px solid #2a2a2a'
        }}>
          {step === 'request' ? (
            // Request Reset Form
            <form onSubmit={handleRequestReset}>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 24, lineHeight: 1.6 }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {/* Email Field */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E94E1B'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              {/* Success Message */}
              {success && (
                <div style={{
                  marginBottom: 24,
                  padding: 12,
                  background: '#1a2e1a',
                  border: '1px solid #2d5016',
                  borderRadius: 4,
                  color: '#4ade80',
                  fontSize: 13
                }}>
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  marginBottom: 24,
                  padding: 12,
                  background: '#2a1120',
                  border: '1px solid #5b1a2e',
                  borderRadius: 4,
                  color: '#fecaca',
                  fontSize: 13
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? '#444' : '#E94E1B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: 24
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              {/* Back to Login */}
              <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
                Remember your password?{' '}
                <a
                  onClick={onNavigateToLogin}
                  style={{
                    color: '#E94E1B',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Sign in
                </a>
              </div>
            </form>
          ) : (
            // Reset Password Form
            <form onSubmit={handleResetPassword}>
              <p style={{ fontSize: 14, color: '#999', marginBottom: 24, lineHeight: 1.6 }}>
                Enter your new password below.
              </p>

              {/* Reset Token Field (Development only) */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  Reset Token
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  placeholder="Paste your reset token here"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 12,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E94E1B'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                  In production, you would click a link from your email
                </div>
              </div>

              {/* New Password Field */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E94E1B'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  At least 6 characters
                </div>
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#E94E1B'}
                  onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
                />
              </div>

              {/* Success Message */}
              {success && (
                <div style={{
                  marginBottom: 24,
                  padding: 12,
                  background: '#1a2e1a',
                  border: '1px solid #2d5016',
                  borderRadius: 4,
                  color: '#4ade80',
                  fontSize: 13
                }}>
                  {success}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  marginBottom: 24,
                  padding: 12,
                  background: '#2a1120',
                  border: '1px solid #5b1a2e',
                  borderRadius: 4,
                  color: '#fecaca',
                  fontSize: 13
                }}>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? '#444' : '#E94E1B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: 24
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              {/* Back to Login */}
              <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
                <a
                  onClick={onNavigateToLogin}
                  style={{
                    color: '#E94E1B',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Back to Sign in
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a
            onClick={onNavigateToHome}
            style={{
              color: '#999',
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
