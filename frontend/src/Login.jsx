import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function Login({ onNavigateToHome, onNavigateToRegister, onNavigateToForgotPassword, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setLoading(true)

    try {
      const response = await fetch(`${DEFAULT_API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const rawText = await response.text()
      let data = {}
      try {
        data = rawText ? JSON.parse(rawText) : {}
      } catch {
        data = {}
      }

      if (!response.ok) {
        const msg =
          data?.detail ||
          (response.status === 401 ? 'Invalid email or password' : '') ||
          'Login failed'
        throw new Error(msg)
      }

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Login successful! Welcome back.')
      
      if (onLoginSuccess) {
        onLoginSuccess(data.user)
      }
    } catch (err) {
      const msg = err?.message || 'Login failed. Please try again.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return

    const init = () => {
      if (!window.google?.accounts?.id) return

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp) => {
            const idToken = resp?.credential
            if (!idToken) {
              toast.error('Google sign-in failed')
              return
            }

            const loadingToast = toast.loading('Signing in with Google...')
            try {
              const response = await fetch(`${DEFAULT_API_BASE}/auth/google`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id_token: idToken })
              })

              const rawText = await response.text()
              let data = {}
              try {
                data = rawText ? JSON.parse(rawText) : {}
              } catch {
                data = {}
              }

              if (!response.ok) {
                throw new Error(data?.detail || 'Google login failed')
              }

              localStorage.setItem('access_token', data.access_token)
              localStorage.setItem('user', JSON.stringify(data.user))
              toast.success('Login successful! Welcome back.', { id: loadingToast })

              if (onLoginSuccess) {
                onLoginSuccess(data.user)
              }
            } catch (err) {
              toast.error(err.message || 'Google login failed', { id: loadingToast })
            }
          }
        })

        const container = document.getElementById('googleSignInButton')
        if (container && !container.hasChildNodes()) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            width: 400
          })
        }
        setGoogleReady(true)
      } catch {
        setGoogleReady(false)
      }
    }

    // wait for GIS script
    const interval = window.setInterval(() => {
      if (window.google?.accounts?.id) {
        window.clearInterval(interval)
        init()
      }
    }, 200)

    return () => window.clearInterval(interval)
  }, [onLoginSuccess])

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
        <h1
          onClick={onNavigateToHome}
          style={{ 
          fontSize: 32, 
          fontWeight: 400, 
          color: '#fff',
          margin: 0,
          fontFamily: 'Georgia, serif',
          letterSpacing: 1,
          cursor: onNavigateToHome ? 'pointer' : 'default'
        }}>
          Fact.it
        </h1>
      </div>

      {/* Back to Home Button - Top Right */}
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

      {/* Form Content */}
      <div className="animate-fade-in-up" style={{
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
          Login
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
              className="transition-colors"
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
                className="transition-colors"
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
          </div>

          {/* Forgot Password Link */}
          <div style={{ marginBottom: 24, textAlign: 'right' }}>
            <a
              onClick={onNavigateToForgotPassword}
              className="transition-colors"
              style={{
                color: '#FF5733',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Forgot password?
            </a>
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
              marginBottom: 20,
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {submitError && (
            <div style={{
              marginTop: -8,
              marginBottom: 18,
              padding: '10px 12px',
              border: '1px solid rgba(255,87,51,0.5)',
              background: 'rgba(255,87,51,0.08)',
              color: '#ffd2c8',
              borderRadius: 6,
              fontSize: 13
            }}>
              {submitError}
            </div>
          )}

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

          {/* Google Login */}
          <div style={{ marginBottom: 24 }}>
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <div>
                <div
                  id="googleSignInButton"
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                />
                {googleReady && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#999', textAlign: 'center' }}>
                    Login or create account with Google
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => toast.error('Google sign-in is not configured')}
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
                Login with Google
              </button>
            )}

            {import.meta.env.VITE_GOOGLE_CLIENT_ID && !googleReady && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#999', textAlign: 'center' }}>
                Loading Google sign-in...
              </div>
            )}
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', fontSize: 14, color: '#999' }}>
            Don't you have an account?{' '}
            <a
              onClick={onNavigateToRegister}
              className="transition-colors"
              style={{
                color: '#FF5733',
                cursor: 'pointer',
                textDecoration: 'none',
                fontWeight: 600
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Register
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
