import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Logo from './components/Logo'

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
        const handleCredential = async (resp) => {
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

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredential,
          ux_mode: 'popup'
        })

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

  useEffect(() => {
    if (!googleReady) return
    const container = document.getElementById('google-signin-container')
    if (container && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        width: container.offsetWidth || 340
      })
    }
  }, [googleReady])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
      background: isMobile ? '#000' : '#FF4B25',
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
          viewBox="0 0 1440 880"
          preserveAspectRatio="none"
        >
          <path
            d="M 250,-1 
               Q 150,150 250,300 
               Q 350,450 250,600 
               Q 150,750 250,900 
               L 1190,900 
               Q 1290,750 1190,600 
               Q 1090,450 1190,300 
               Q 1290,150 1190,-20 
               Z"
            fill="#1a1a1a"
            stroke="#fff"
            strokeWidth="2"
          />
        </svg>
      )}
      
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 24 : 40,
        left: isMobile ? 20 : 40,
        zIndex: 3
      }}>
        <Logo onClick={isMobile ? undefined : onNavigateToHome} isMobile={isMobile} variant="header" />
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
            borderRadius: 2,
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


      {/* Form Content */}
      <div className="animate-fade-in-up" style={{
        maxWidth: 420,
        width: '100%',
        position: 'relative',
        zIndex: 5,
        padding: isMobile ? '20px' : '0',
        marginTop: isMobile ? '60px' : '0'
      }}>
        {/* Title */}
        <h2 style={{ 
          fontSize: isMobile ? 36 : 48, 
          fontWeight: 700, 
          margin: '0 0 12px 0', 
          color: '#fff', 
          textAlign: isMobile ? 'left' : 'center' 
        }}>
          Login
        </h2>
        <p style={{ 
          fontSize: isMobile ? 14 : 16, 
          color: '#ccc', 
          margin: '0 0 40px 0', 
          textAlign: isMobile ? 'left' : 'center',
          lineHeight: 1.5 
        }}>
          Enter your email address and password to login
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontSize: 14, 
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
                padding: "12px",
                background: 'transparent',
                border: '1px solid #444',
                borderRadius: 2,
                color: '#fff',
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF4B25'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ 
              display: 'block', 
              marginBottom: 8, 
              fontSize: 14, 
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
                  padding: '12px',
                  paddingRight: '45px',
                  background: 'transparent',
                  border: '1px solid #444',
                  borderRadius: 2,
                  color: '#fff',
                  fontSize: 12,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF4B25'}
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
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
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
                color: '#FF4B25',
                fontSize: 12,
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
              padding: '18px',
              background: loading ? '#999' : '#FF4B25',
              color: '#fff',
              border: 'none',
              borderRadius: 2,
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#d43d0f')}
            onMouseLeave={(e) => (e.target.style.background = '#FF4B25')}
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
              borderRadius: 2,
              fontSize: 14
            }}>
              {submitError}
            </div>
          )}

          {/* OR Divider */}
          <div style={{ 
            textAlign: 'center', 
            fontSize: 12, 
            color: '#666', 
            margin: '20px 0', 
            fontWeight: 500 
          }}>
            or
          </div>

          {/* Google Login */}
          <div style={{ marginBottom: 20 }}>
            {googleReady ? (
              <div
                id="google-signin-container"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              />
            ) : (
              <button
                type="button"
                disabled
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#f5f5f5',
                  color: '#aaa',
                  border: '1px solid #dadce0',
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxSizing: 'border-box'
                }}
              >
                Login with Google
              </button>
            )}
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', fontSize: 12, color: '#ccc' }}>
            Don't you have an account?{' '}
            <a
              onClick={onNavigateToRegister}
              className="transition-colors"
              style={{
                color: '#FF4B25',
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
