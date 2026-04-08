import React, { useState } from 'react'
import toast from 'react-hot-toast'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function Login({ onNavigateToHome, onNavigateToRegister, onNavigateToForgotPassword, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed')
      }

      // Store token and user info
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Login successful! Welcome back.')
      
      // Call success callback
      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
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
        color: '#fff'
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Title */}
          <h2 style={{ fontSize: isMobile ? 32 : 40, fontWeight: 700, margin: '0 0 12px 0' }}>Log in</h2>
          <p style={{ fontSize: isMobile ? 14 : 15, color: '#999', margin: '0 0 32px 0' }}>
            Enter your email address and password to login
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#ccc' }}>
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
                onFocus={(e) => e.target.style.borderColor = '#D44527'}
                onBlur={(e) => e.target.style.borderColor = '#444'}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#ccc' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Forgot Password Link */}
            <div style={{ marginBottom: 24, textAlign: 'right' }}>
              <a
                onClick={onNavigateToForgotPassword}
                style={{
                  color: '#D44527',
                  fontSize: 13,
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </a>
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
                marginBottom: 20
              }}
            >
              {loading ? 'Signing in...' : 'Log in'}
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => alert('Google Sign-in not implemented yet')}
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
              Sign in with Google
            </button>

            {/* Register Link */}
            <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
              Don't you have an account?{' '}
              <a
                onClick={onNavigateToRegister}
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
