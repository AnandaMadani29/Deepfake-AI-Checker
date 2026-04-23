import React, { useState } from 'react'
import toast from 'react-hot-toast'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function Register({ onNavigateToHome, onNavigateToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms and Privacy Policies')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed')
      }

      toast.success('Registration successful! Please login.')
      
      if (onRegisterSuccess) {
        onRegisterSuccess()
      } else {
        onNavigateToLogin()
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
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
      background: isMobile ? '#000' : '#FF5733',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* SVG Wavy Shape with 3 Waves - Desktop Only */}
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
        <h1
          onClick={isMobile ? undefined : onNavigateToHome}
          style={{ 
          fontSize: isMobile ? 24 : 32, 
          fontWeight: 400, 
          color: '#fff',
          margin: 0,
          fontFamily: 'Georgia, serif',
          letterSpacing: 1,
          cursor: (isMobile || !onNavigateToHome) ? 'default' : 'pointer'
        }}>
          Fact.it
        </h1>
      </div>

      {/* Back Button - Mobile Only (Icon) */}
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
            cursor: onNavigateToHome ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          disabled={!onNavigateToHome}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      )}

      {/* Back to Home Button - Top Right - Desktop Only */}
      {!isMobile && (
        <button
          type="button"
          onClick={onNavigateToHome}
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            zIndex: 3,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: onNavigateToHome ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s ease'
          }}
          disabled={!onNavigateToHome}
          onMouseEnter={(e) => {
            if (onNavigateToHome) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
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
        {/* Title */}
        <h2 style={{ 
          fontSize: isMobile ? 48 : 48, 
          fontWeight: 700, 
          margin: '0 0 12px 0', 
          color: '#fff', 
          textAlign: isMobile ? 'left' : 'center' 
        }}>
          Register
        </h2>
        <p style={{ 
          fontSize: isMobile ? 16 : 15, 
          color: '#ccc', 
          margin: '0 0 40px 0', 
          textAlign: isMobile ? 'left' : 'center',
          lineHeight: 1.5 
        }}>
          Get started with an account on Fact.it
        </p>

        <form onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontSize: 13, 
              fontWeight: 500, 
              color: '#ccc' 
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Name"
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

          {/* Email Field */}
          <div style={{ marginBottom: 20 }}>
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
              name="email"
              value={formData.email}
              onChange={handleChange}
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

          {/* Password Field */}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? (
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
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              Password must be at least 8 characters.
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: 20 }}>
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
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
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

          {/* Terms Checkbox */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                cursor: 'pointer'
              }}
            />
            <label style={{ fontSize: 13, color: '#999', cursor: 'pointer' }} onClick={() => setAgreedToTerms(!agreedToTerms)}>
              I agree to all the{' '}
              <span style={{ color: '#FF5733' }}>Terms</span>
              {' '}and{' '}
              <span style={{ color: '#FF5733' }}>Privacy Policies</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="transition-all"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* OR Divider */}
          <div style={{ 
            textAlign: 'center', 
            fontSize: 13, 
            color: '#666', 
            margin: '20px 0', 
            fontWeight: 500 
          }}>
            or
          </div>

          {/* Google Register */}
          <button
            type="button"
            onClick={() => toast.info('Google Sign-up not implemented yet')}
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
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Register with Google
          </button>

          {/* Login Link */}
          <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
            Don't you have an account?{' '}
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
      </div>
    </div>
  )
}
