import React, { useState } from 'react'
import toast from 'react-hot-toast'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function Login({ onNavigateToHome, onNavigateToRegister, onNavigateToForgotPassword, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
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

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Login successful! Welcome back.')
      
      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.')
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
      {/* Organic Blob Shape - Left */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-8%',
        width: '45%',
        height: '130%',
        background: '#FF5733',
        borderRadius: '0% 100% 50% 50% / 0% 50% 50% 100%',
        zIndex: 1
      }} />
      
      {/* Organic Blob Shape - Right */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        right: '-8%',
        width: '45%',
        height: '130%',
        background: '#FF5733',
        borderRadius: '100% 0% 50% 50% / 50% 0% 100% 50%',
        zIndex: 1
      }} />
      
      {/* Dark Center Blob */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '95%' : '70%',
        height: isMobile ? '85%' : '75%',
        background: '#1a1a1a',
        borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
        zIndex: 1
      }} />
      
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
        {/* Title */}
        <h2 style={{ 
          fontSize: isMobile ? 36 : 48, 
          fontWeight: 700, 
          margin: '0 0 12px 0', 
          color: '#fff', 
          textAlign: 'center' 
        }}>
          Log in
        </h2>
        <p style={{ 
          fontSize: 15, 
          color: '#999', 
          margin: '0 0 40px 0', 
          textAlign: 'center' 
        }}>
          Enter your email address and password to login
        </p>

        <form onSubmit={handleSubmit}>
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

          {/* Password Field */}
          <div style={{ marginBottom: 12 }}>
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

          {/* Forgot Password Link */}
          <div style={{ marginBottom: 24, textAlign: 'right' }}>
            <a
              onClick={onNavigateToForgotPassword}
              style={{
                color: '#FF5733',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
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
            {loading ? 'Signing in...' : 'Log in'}
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

          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => toast.info('Google Sign-in not implemented yet')}
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
            Sign in with Google
          </button>

          {/* Register Link */}
          <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
            Don't you have an account?{' '}
            <a
              onClick={onNavigateToRegister}
              style={{
                color: '#FF5733',
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
  )
}
