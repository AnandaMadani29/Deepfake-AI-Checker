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

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [targetSection, setTargetSection] = useState(null)
  const [user, setUser] = useState(null)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState(null)

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
    
    // Check URL for reset-password route
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    
    if (path === '/reset-password' || params.has('token')) {
      setCurrentPage('reset-password')
    }
    
    setIsAuthChecked(true)
  }, [])

  const navigateToHome = (sectionId = null) => {
    setTargetSection(sectionId)
    setCurrentPage('home')
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
        onNavigateToHistory={() => setCurrentPage('history')}
        onNavigateToArticles={() => setCurrentPage('articles')}
        user={user}
      />
    )
  }

  if (currentPage === 'history') {
    return (
      <History 
        onNavigateToHome={navigateToHome}
        onNavigateToDetection={() => setCurrentPage('detection')}
        onNavigateToArticles={() => setCurrentPage('articles')}
        user={user}
      />
    )
  }

  if (currentPage === 'articles') {
    return (
      <Articles 
        onNavigateToArticleDetail={(articleId) => {
          setSelectedArticleId(articleId)
          setCurrentPage('article-detail')
        }}
        onNavigateToHome={navigateToHome}
        onNavigateToDetection={() => setCurrentPage('detection')}
      />
    )
  }

  if (currentPage === 'article-detail') {
    return (
      <ArticleDetail 
        articleId={selectedArticleId}
        onNavigateToArticles={() => setCurrentPage('articles')}
        onNavigateToArticleDetail={(articleId) => {
          setSelectedArticleId(articleId)
          window.scrollTo(0, 0)
        }}
        onNavigateToHome={navigateToHome}
      />
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
        onNavigateToDetection={() => setCurrentPage('detection')}
        onNavigateToLogin={() => setCurrentPage('login')}
        onNavigateToRegister={() => setCurrentPage('register')}
        onNavigateToHistory={() => setCurrentPage('history')}
        onNavigateToArticles={() => setCurrentPage('articles')}
        onLogout={handleLogout}
        targetSection={targetSection}
        onSectionScrolled={() => setTargetSection(null)}
        user={user}
      />
    </>
  )
}
