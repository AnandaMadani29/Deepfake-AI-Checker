import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import './animations.css'
import Home from './Home.jsx'
import Detection from './Detection.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import History from './History.jsx'
import Articles from './Articles.jsx'
import ArticleDetail from './ArticleDetail.jsx'
import Terms from './Terms.jsx'
import Privacy from './Privacy.jsx'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [targetSection, setTargetSection] = useState(null)
  const [user, setUser] = useState(null)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState(null)
  const [detectionResults, setDetectionResults] = useState([])
  const [fromDetection, setFromDetection] = useState(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
    
    // Check URL for reset-password route or hash
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash.slice(1)
    
    console.log('Initial load - hash:', hash) // Debug log
    
    if (path === '/reset-password' || params.has('token')) {
      setCurrentPage('reset-password')
    } else if (hash === 'terms') {
      setCurrentPage('terms')
    } else if (hash === 'privacy') {
      setCurrentPage('privacy')
    } else if (hash === 'history') {
      setCurrentPage('history')
    }
    
    setIsAuthChecked(true)
    
    // Listen for hash changes after initial load
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1)
      console.log('Hash changed to:', newHash) // Debug log
      if (newHash === 'terms') {
        setCurrentPage('terms')
      } else if (newHash === 'privacy') {
        setCurrentPage('privacy')
      } else if (newHash === 'history') {
        setCurrentPage('history')
      } else if (!newHash) {
        setCurrentPage('home')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateToHome = (sectionId = null) => {
    setTargetSection(sectionId)
    setCurrentPage('home')
    // Scroll to top if no section specified
    if (!sectionId) {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    }
  }

  const handleNavigateToHome = (sectionId = null) => {
    setTargetSection(sectionId)
    setCurrentPage('home')
    // Scroll to top if no section specified
    if (!sectionId) {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    }
  }

  const handleNavigateToDetection = () => {
    setCurrentPage('detection')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const handleNavigateToArticles = () => {
    setCurrentPage('articles')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const handleNavigateToTerms = () => {
    window.location.hash = 'terms'
    setCurrentPage('terms')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const handleNavigateToPrivacy = () => {
    window.location.hash = 'privacy'
    setCurrentPage('privacy')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('home')
  }

  const handleRegisterSuccess = (userData) => {
    setUser(userData)
    setCurrentPage('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
    setCurrentPage('home')
  }

  // Wait for auth check to complete
  if (!isAuthChecked) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  console.log('Current page:', currentPage) // Debug log

  // Toaster component for all pages
  const toasterComponent = (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#0d0d0d',
          color: '#fff',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: '#4ade80',
            secondary: '#0d0d0d',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: '#0d0d0d',
          },
        },
      }}
    />
  )

  // Route handling
  if (currentPage === 'login') {
    return (
      <>
        {toasterComponent}
        <Login 
          onNavigateToHome={() => setCurrentPage('home')}
          onNavigateToRegister={() => setCurrentPage('register')}
          onNavigateToForgotPassword={() => setCurrentPage('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    )
  }

  if (currentPage === 'register') {
    return (
      <>
        {toasterComponent}
        <Register 
          onNavigateToHome={() => setCurrentPage('home')}
          onNavigateToLogin={() => setCurrentPage('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      </>
    )
  }

  if (currentPage === 'forgot-password') {
    return (
      <>
        {toasterComponent}
        <ForgotPassword 
          onNavigateToHome={() => setCurrentPage('home')}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      </>
    )
  }

  if (currentPage === 'reset-password') {
    return (
      <>
        {toasterComponent}
        <ResetPassword 
          onNavigateToHome={() => setCurrentPage('home')}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      </>
    )
  }

  if (currentPage === 'detection') {
    return (
      <Detection 
        onNavigateToHome={navigateToHome}
        onNavigateToHistory={() => {
          setFromDetection(detectionResults.length > 0)
          setCurrentPage('history')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToArticles={() => {
          setCurrentPage('articles')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToTerms={handleNavigateToTerms}
        onNavigateToPrivacy={handleNavigateToPrivacy}
        onLogin={() => {
          setCurrentPage('home')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        user={user}
        detectionResults={detectionResults}
        setDetectionResults={setDetectionResults}
      />
    )
  }

  if (currentPage === 'history') {
    return (
      <History 
        onNavigateToHome={navigateToHome}
        onNavigateToDetection={() => {
          setCurrentPage('detection')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToArticles={() => {
          setCurrentPage('articles')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        user={user}
        fromDetection={fromDetection}
        onBackToDetection={() => {
          setFromDetection(false)
          setCurrentPage('detection')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
      />
    )
  }

  if (currentPage === 'articles') {
    return (
      <Articles 
        onNavigateToArticleDetail={(articleId) => {
          setSelectedArticleId(articleId)
          setCurrentPage('article-detail')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToHome={navigateToHome}
        onNavigateToDetection={() => {
          setCurrentPage('detection')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToTerms={handleNavigateToTerms}
        onNavigateToPrivacy={handleNavigateToPrivacy}
        onLogin={() => {
          setCurrentPage('home')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        user={user}
        onLogout={handleLogout}
        onNavigateToHistory={() => {
          setCurrentPage('history')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
      />
    )
  }

  if (currentPage === 'article-detail') {
    return (
      <ArticleDetail 
        articleId={selectedArticleId}
        onNavigateToArticles={() => {
          setCurrentPage('articles')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToArticleDetail={(articleId) => {
          setSelectedArticleId(articleId)
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToHome={navigateToHome}
        user={user}
        onLogout={handleLogout}
        onNavigateToHistory={() => {
          setCurrentPage('history')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
      />
    )
  }

  if (currentPage === 'terms') {
    return (
      <>
        {toasterComponent}
        <Terms 
          onNavigateToHome={handleNavigateToHome}
          onNavigateToDetection={handleNavigateToDetection}
          onNavigateToArticles={handleNavigateToArticles}
          user={user}
          onLogout={handleLogout}
          onLogin={() => setCurrentPage('login')}
        />
      </>
    )
  }

  if (currentPage === 'privacy') {
    return (
      <>
        {toasterComponent}
        <Privacy 
          onNavigateToHome={handleNavigateToHome}
          onNavigateToDetection={handleNavigateToDetection}
          onNavigateToArticles={handleNavigateToArticles}
          user={user}
          onLogout={handleLogout}
          onLogin={() => setCurrentPage('login')}
        />
      </>
    )
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0d0d0d',
            color: '#fff',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#0d0d0d',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#0d0d0d',
            },
          },
        }}
      />
      <Home 
        onNavigateToDetection={() => {
          setCurrentPage('detection')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToLogin={() => setCurrentPage('login')}
        onNavigateToRegister={() => setCurrentPage('register')}
        onNavigateToHistory={() => {
          setCurrentPage('history')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToArticles={() => {
          setCurrentPage('articles')
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToTerms={handleNavigateToTerms}
        onNavigateToPrivacy={handleNavigateToPrivacy}
        onLogout={handleLogout}
        targetSection={targetSection}
        onSectionScrolled={() => setTargetSection(null)}
        user={user}
      />
    </>
  )
}
