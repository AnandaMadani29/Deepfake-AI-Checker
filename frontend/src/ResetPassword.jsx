import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Logo from './components/Logo'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ResetPassword({ onNavigateToLogin, onNavigateToHome }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search)
    const tokenFromUrl = params.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      toast.error('Invalid reset link')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Invalid reset link')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      console.log('Sending reset password request with token:', token)
      
      const response = await fetch(`${DEFAULT_API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          new_password: newPassword
        })
      })

      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        console.log('Password reset successful!')
        setResetSuccess(true)
      } else {
        console.error('Reset failed:', data)
        const errorMessage = data.detail || 'Internal Server Error'
        
        // Show specific error messages
        if (errorMessage.includes('expired')) {
          toast.error('Reset link sudah expired. Silakan request reset password lagi.', { duration: 5000 })
        } else if (errorMessage.includes('used') || errorMessage.includes('invalid')) {
          toast.error('Reset link sudah digunakan atau tidak valid. Silakan request reset password lagi.', { duration: 5000 })
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Internal Server Error')
    } finally {
      setLoading(false)
    }
  }

  // Success page
  if (resetSuccess) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        background: isMobile ? '#000' : '#FF5733',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px'
      }}>
        {/* SVG Wavy Shape - Desktop Only */}
        {!isMobile && (
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
        )}
        
        {/* Logo */}
        <div style={{
          position: 'absolute',
          top: isMobile ? 20 : 40,
          left: isMobile ? 20 : 40,
          zIndex: 3
        }}>
          <Logo onClick={onNavigateToHome} isMobile={isMobile} variant="header" />
        </div>

        {/* Success Content */}
        <div style={{
          maxWidth: 420,
          width: '100%',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center'
        }}>
          <div style={{
            background: isMobile ? 'rgba(26, 26, 26, 0.95)' : '#1a1a1a',
            padding: isMobile ? '48px 24px' : '60px 40px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            {/* Success Icon */}
            <div style={{
              textAlign: 'center',
              marginBottom: isMobile ? 20 : 30
            }}>
              <img 
                src="/assets/resetPass/reset2.png" 
                alt="Password Reset Success" 
                style={{ 
                  maxWidth: isMobile ? '100px' : '150px',
                  height: 'auto',
                  width: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            <h2 style={{ 
              fontSize: isMobile ? 28 : 32, 
              fontWeight: 700, 
              marginBottom: 12,
              color: '#fff'
            }}>
              Reset Password<br/>Success
            </h2>
            
            <p style={{ 
              color: '#999', 
              marginBottom: 32, 
              fontSize: isMobile ? 14 : 15,
              lineHeight: 1.5 
            }}>
              Get started with an account on Fact.it
            </p>

            <button
              onClick={onNavigateToLogin}
              style={{
                width: '100%',
                padding: '16px',
                background: '#FF5733',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E94E1B'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FF5733'}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      background: isMobile ? '#000' : '#FF5733',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* SVG Wavy Shape - Desktop Only */}
      {!isMobile && (
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
      )}
      
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 20 : 40,
        left: isMobile ? 20 : 40,
        zIndex: 3
      }}>
        <Logo onClick={onNavigateToHome} isMobile={isMobile} variant="header" />
      </div>

      {/* Back Button - Mobile Only */}
      {isMobile && (
        <button
          type="button"
          onClick={onNavigateToHome}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 3,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '12px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      )}

      {/* Form Content */}
      <div className="animate-fade-in-up" style={{
        maxWidth: 420,
        width: '100%',
        position: 'relative',
        zIndex: 2,
        padding: isMobile ? '20px' : '0',
        marginTop: isMobile ? '60px' : '0'
      }}>
        <div style={{
          background: isMobile ? 'rgba(26, 26, 26, 0.95)' : '#1a1a1a',
          padding: isMobile ? '32px 24px' : '48px 40px',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <h2 style={{ 
            fontSize: isMobile ? 28 : 32, 
            fontWeight: 700, 
            marginBottom: 12,
            color: '#fff',
            textAlign: 'center'
          }}>
            Set New Password
          </h2>
          
          <p style={{ 
            color: '#999', 
            marginBottom: 32, 
            fontSize: isMobile ? 14 : 15,
            textAlign: 'center',
            lineHeight: 1.5 
          }}>
            Get started with an account on Fact.it
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#fff',
                fontSize: 13,
                fontWeight: 400
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '14px 45px 14px 16px',
                    background: 'transparent',
                    border: '1px solid #444',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#666'}
                  onBlur={(e) => e.target.style.borderColor = '#444'}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showNewPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                color: '#fff',
                fontSize: 13,
                fontWeight: 400
              }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '14px 45px 14px 16px',
                    background: 'transparent',
                    border: '1px solid #444',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#666'}
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
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? '#666' : '#FF5733',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                marginBottom: 16
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#E94E1B'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#FF5733'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={onNavigateToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  fontSize: 14,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FF5733'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
