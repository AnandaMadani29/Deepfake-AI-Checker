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
  const [error, setError] = useState('')
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
    setError('')

    // Validation
    if (!agreedToTerms) {
      setError('Please agree to the Terms and Privacy Policies')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
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

      // Store token and user info
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Registration successful! Welcome to Fact.it')
      
      // Call success callback
      if (onRegisterSuccess) {
        onRegisterSuccess(data.user)
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isMobile = window.innerWidth <= 768

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: '#2a2a2a' }}>
      {/* Left Panel - Orange */}
      <div style={{
        flex: isMobile ? '0 0 auto' : '0 0 50%',
        background: '#D44527',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '40px 20px' : 60,
        minHeight: isMobile ? '200px' : 'auto'
      }}>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? 48 : 64, 
            fontWeight: 400, 
            color: '#fff',
            margin: 0,
            fontFamily: 'Georgia, serif',
            letterSpacing: 2
          }}>
            Fact.it
          </h1>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        flex: isMobile ? '1' : '0 0 50%',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '40px 20px' : 60,
        color: '#fff',
        overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Title */}
          <h2 style={{ fontSize: isMobile ? 32 : 40, fontWeight: 700, margin: '0 0 12px 0' }}>Sign Up</h2>
          <p style={{ fontSize: isMobile ? 14 : 15, color: '#999', margin: '0 0 28px 0' }}>
            Get started with an account on Fact.it
          </p>

          <form onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#ccc' }}>
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
                onFocus={(e) => e.target.style.borderColor = '#D44527'}
                onBlur={(e) => e.target.style.borderColor = '#444'}
              />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#ccc' }}>
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
                onFocus={(e) => e.target.style.borderColor = '#D44527'}
                onBlur={(e) => e.target.style.borderColor = '#444'}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#ccc' }}>
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
                  onFocus={(e) => e.target.style.borderColor = '#D44527'}
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

            {/* Confirm Password Field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#ccc' }}>
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
                  onFocus={(e) => e.target.style.borderColor = '#D44527'}
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

            {/* Terms Checkbox */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  marginTop: 4,
                  cursor: 'pointer',
                  width: 16,
                  height: 16
                }}
              />
              <label htmlFor="terms" style={{ fontSize: 13, color: '#999', cursor: 'pointer', lineHeight: 1.5 }}>
                I agree to all the{' '}
                <a href="#" style={{ color: '#D44527', textDecoration: 'none' }}>Terms</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#D44527', textDecoration: 'none' }}>Privacy Policies</a>
              </label>
            </div>

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
                padding: '16px',
                background: loading ? '#999' : '#D44527',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 16
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div style={{ textAlign: 'center', margin: '20px 0', color: '#666', fontSize: 13 }}>or</div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={() => alert('Google Sign-up not implemented yet')}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #444',
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
              <span style={{ fontSize: 18 }}>🔍</span>
              Sign up with Google
            </button>

            {/* Login Link */}
            <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
              Don't you have an account?{' '}
              <a
                onClick={onNavigateToLogin}
                style={{
                  color: '#D44527',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
