import React, { useState } from 'react'
import toast from 'react-hot-toast'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ForgotPassword({ onNavigateToHome, onNavigateToLogin }) {
  const [step, setStep] = useState('request') // 'request', 'check-email', or 'reset'
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRequestReset = async (e) => {
    e.preventDefault()
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
      if (data.reset_token) {
        setResetToken(data.reset_token)
        setStep('check-email')
        toast.success('Reset token generated. Check your email!')
      } else {
        setStep('check-email')
        toast.success('If your email exists, you will receive a reset link.')
      }
    } catch (err) {
      toast.error(err.message || 'Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
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

      toast.success('Password reset successfully! Redirecting to login...')
      
      setTimeout(() => {
        onNavigateToLogin()
      }, 2000)
    } catch (err) {
      toast.error(err.message || 'Password reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isMobile = window.innerWidth <= 768

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FF5733',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* SVG Wavy Shape with 3 Waves */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <path
          d="M 250,0 
             Q 150,150 250,300 
             Q 350,450 250,600 
             Q 150,750 250,900 
             L 1190,900 
             Q 1290,750 1190,600 
             Q 1090,450 1190,300 
             Q 1290,150 1190,0 
             Z"
          fill="#1a1a1a"
        />
      </svg>
      
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 40,
        zIndex: 3
      }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 400, 
          color: '#fff',
          margin: 0,
          fontFamily: 'Georgia, serif',
          letterSpacing: 1
        }}>
          Fact.it
        </h1>
      </div>

      {/* Form Content */}
      <div style={{
        maxWidth: 420,
        width: '100%',
        position: 'relative',
        zIndex: 2,
        padding: isMobile ? '20px' : '0'
      }}>
        {step === 'request' && (
          <>
            <h2 style={{ 
              fontSize: isMobile ? 36 : 48, 
              fontWeight: 700, 
              margin: '0 0 12px 0', 
              color: '#fff', 
              textAlign: 'center' 
            }}>
              Forgot Password
            </h2>
            <p style={{ 
              fontSize: 15, 
              color: '#999', 
              margin: '0 0 40px 0', 
              textAlign: 'center' 
            }}>
              Enter your email to reset your password
            </p>

            <form onSubmit={handleRequestReset}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 13, 
                  fontWeight: 500, 
                  color: '#ccc' 
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email Address"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: '1px solid #444',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF5733'}
                  onBlur={(e) => e.target.style.borderColor = '#444'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#999' : '#FF5733',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: 20
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
                Remember Password?{' '}
                <a
                  onClick={onNavigateToLogin}
                  style={{
                    color: '#FF5733',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Login
                </a>
              </div>
            </form>
          </>
        )}

        {step === 'check-email' && (
          <>
            <h2 style={{ 
              fontSize: isMobile ? 36 : 48, 
              fontWeight: 700, 
              margin: '0 0 12px 0', 
              color: '#fff', 
              textAlign: 'center' 
            }}>
              Check Your Email
            </h2>
            <p style={{ 
              fontSize: 15, 
              color: '#999', 
              margin: '0 0 40px 0', 
              textAlign: 'center' 
            }}>
              We've sent a password reset link to:<br/>
              <strong style={{ color: '#fff' }}>{email}</strong>
            </p>

            <button
              onClick={() => window.open('https://mail.google.com', '_blank')}
              style={{
                width: '100%',
                padding: '16px',
                background: '#FF5733',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: 20
              }}
            >
              Open Your Gmail
            </button>

            <div style={{ textAlign: 'center', fontSize: 14, color: '#999', marginBottom: 20 }}>
              or
            </div>

            <button
              onClick={() => setStep('reset')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 24
              }}
            >
              I have the reset token
            </button>

            <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
              Didn't receive email?{' '}
              <a
                onClick={() => setStep('request')}
                style={{
                  color: '#FF5733',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Resend Link
              </a>
            </div>
          </>
        )}

        {step === 'reset' && (
          <>
            <h2 style={{ 
              fontSize: isMobile ? 36 : 48, 
              fontWeight: 700, 
              margin: '0 0 12px 0', 
              color: '#fff', 
              textAlign: 'center' 
            }}>
              Set New Password
            </h2>
            <p style={{ 
              fontSize: 15, 
              color: '#999', 
              margin: '0 0 40px 0', 
              textAlign: 'center' 
            }}>
              Get started with an account on Fact.it
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 13, 
                  fontWeight: 500, 
                  color: '#ccc' 
                }}>
                  Reset Token
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  placeholder="Paste reset token"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'transparent',
                    border: '1px solid #444',
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 12,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF5733'}
                  onBlur={(e) => e.target.style.borderColor = '#444'}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 13, 
                  fontWeight: 500, 
                  color: '#ccc' 
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Password"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '45px',
                      background: 'transparent',
                      border: '1px solid #444',
                      borderRadius: 4,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF5733'}
                    onBlur={(e) => e.target.style.borderColor = '#444'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: 18,
                      padding: 4
                    }}
                  >
                    👁
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 13, 
                  fontWeight: 500, 
                  color: '#ccc' 
                }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm Password"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      paddingRight: '45px',
                      background: 'transparent',
                      border: '1px solid #444',
                      borderRadius: 4,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF5733'}
                    onBlur={(e) => e.target.style.borderColor = '#444'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: 18,
                      padding: 4
                    }}
                  >
                    👁
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#999' : '#FF5733',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: 20
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
                Remember Password?{' '}
                <a
                  onClick={onNavigateToLogin}
                  style={{
                    color: '#FF5733',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Login
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
