import React, { useState, useEffect } from 'react'
import { FaClock, FaUser, FaArrowLeft, FaBars, FaTimes, FaShareAlt, FaArrowRight } from 'react-icons/fa'
import Logo from './components/Logo'
import { HiArrowLeft } from 'react-icons/hi'
import { getArticleById, getRelatedArticles } from './articlesData'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function ArticleDetail({ articleId, onNavigateToArticles, onNavigateToArticleDetail, onNavigateToHome, user, onLogout, onNavigateToHistory }) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const article = getArticleById(articleId)
  const relatedArticles = getRelatedArticles(articleId)

  if (!article) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Article not found</h2>
          <button onClick={onNavigateToArticles} style={{ background: '#E94E1B', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer' }}>
            Back to Articles
          </button>
        </div>
      </div>
    )
  }

  // Parse markdown-style content to JSX
  const renderContent = (content) => {
    const lines = content.trim().split('\n')
    const elements = []
    let currentParagraph = []

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} style={{ fontSize: 15, color: '#ccc', lineHeight: 1.8, marginBottom: 20 }}>{currentParagraph.join(' ')}</p>)
          currentParagraph = []
        }
        elements.push(<h1 key={`h1-${index}`} style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, marginBottom: 24, marginTop: 40 }}>{line.substring(2)}</h1>)
      } else if (line.startsWith('## ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} style={{ fontSize: 15, color: '#ccc', lineHeight: 1.8, marginBottom: 20 }}>{currentParagraph.join(' ')}</p>)
          currentParagraph = []
        }
        elements.push(<h2 key={`h2-${index}`} style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, marginBottom: 20, marginTop: 32, color: '#E94E1B' }}>{line.substring(3)}</h2>)
      } else if (line.startsWith('### ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} style={{ fontSize: 15, color: '#ccc', lineHeight: 1.8, marginBottom: 20 }}>{currentParagraph.join(' ')}</p>)
          currentParagraph = []
        }
        elements.push(<h3 key={`h3-${index}`} style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, marginBottom: 16, marginTop: 24 }}>{line.substring(4)}</h3>)
      } else if (line.startsWith('- ') || line.startsWith('✅ ') || line.startsWith('• ')) {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} style={{ fontSize: 15, color: '#ccc', lineHeight: 1.8, marginBottom: 20 }}>{currentParagraph.join(' ')}</p>)
          currentParagraph = []
        }
        const text = line.substring(line.indexOf(' ') + 1)
        elements.push(
          <li key={`li-${index}`} style={{ fontSize: 15, color: '#ccc', lineHeight: 1.8, marginBottom: 12, marginLeft: 20 }}>
            {text.replace(/\*\*(.*?)\*\*/g, (_, p1) => p1)}
          </li>
        )
      } else if (line.trim() === '') {
        if (currentParagraph.length > 0) {
          elements.push(<p key={`p-${index}`} style={{ fontSize: 15, color: '#ccc', lineHeight: 1.8, marginBottom: 20 }}>{currentParagraph.join(' ')}</p>)
          currentParagraph = []
        }
      } else {
        currentParagraph.push(line)
      }
    })

    if (currentParagraph.length > 0) {
      elements.push(<p key="p-last" style={{ fontSize: 15, color: '#ccc', lineHeight: 1.8, marginBottom: 20 }}>{currentParagraph.join(' ')}</p>)
    }

    return elements
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#1a1a1a',
      color: '#fff',
      position: 'relative'
    }}>
      {/* ── MOBILE SIDEBAR: overlay + drawer di ROOT level ── */}
      {isMobile && menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 99998,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '80vw',
              background: '#FF5733',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
              animation: 'slideInRight 0.3s ease-in-out'
            }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'absolute',
                top: 30,
                right: 30,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 28,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
                marginTop: 80
              }}
            >
              <a
                onClick={() => {
                  onNavigateToHome('about');
                  setMenuOpen(false);
                }}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                About Us
              </a>
              <a
                onClick={() => {
                  onNavigateToHome();
                  setMenuOpen(false);
                }}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Service
              </a>
              <a
                onClick={() => {
                  onNavigateToArticles();
                  setMenuOpen(false);
                }}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Resources
              </a>
            </div>
            <div style={{ marginTop: 'auto', paddingBottom: 40 }}>
              <button
                onClick={() => {
                  onNavigateToHome();
                  setMenuOpen(false);
                }}
                style={{
                  background: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  padding: '18px',
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 18,
                  width: '100%'
                }}
              >
                Home
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── NAVBAR ── */}
      <Navbar 
        onNavigateToAbout={() => onNavigateToHome('about')}
        onNavigateToDetection={() => onNavigateToHome()}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToHistory={user ? onNavigateToHistory : null}
        onNavigateToTerms={() => window.location.hash = 'terms'}
        onNavigateToPrivacy={() => window.location.hash = 'privacy'}
        onNavigateToHome={onNavigateToHome}
        user={user}
        onLogout={onLogout}
        isMobile={isMobile}
        activeLink="resources"
      />

      {/* Back Button */}
      <div style={{ 
        padding: isMobile ? '100px 20px 20px' : '120px 60px 30px',
        maxWidth: 900,
        margin: '0 auto'
      }}>
        <button
          onClick={onNavigateToArticles}
          style={{
            background: 'transparent',
            border: '1px solid #2a2a2a',
            color: '#999',
            padding: '10px 20px',
            borderRadius: 6,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <HiArrowLeft size={16} />
          Back to Articles
        </button>
      </div>

      {/* Article Header */}
      <article style={{ 
        maxWidth: 900,
        margin: '0 auto',
        padding: isMobile ? '20px' : '0 60px 60px'
      }}>
        <div style={{ 
          display: 'inline-block',
          padding: '6px 14px',
          background: '#E94E1B',
          color: '#fff',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 20,
          textTransform: 'uppercase'
        }}>
          {article.category}
        </div>

        <h1 style={{ 
          fontSize: isMobile ? 32 : 48, 
          fontWeight: 700, 
          margin: '0 0 24px 0',
          lineHeight: 1.2
        }}>
          {article.title}
        </h1>

        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 20, 
          fontSize: 13, 
          color: '#666',
          marginBottom: 40,
          paddingBottom: 30,
          borderBottom: '1px solid #2a2a2a'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaClock size={13} />
            {article.readTime}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaUser size={13} />
            {article.author}
          </span>
          <span>{article.date}</span>
        </div>

        {/* Featured Image */}
        <div style={{ 
          background: '#2a2a2a',
          height: isMobile ? 250 : 400,
          borderRadius: 12,
          marginBottom: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: 14
        }}>
          Article Featured Image
        </div>

        {/* Article Content */}
        <div style={{ marginBottom: 60 }}>
          {renderContent(article.content)}
        </div>

        {/* Share Section */}
        <div style={{ 
          padding: 30,
          background: '#0d0d0d',
          borderRadius: 12,
          border: '1px solid #2a2a2a',
          marginBottom: 60,
          textAlign: 'center'
        }}>
          <FaShareAlt size={24} color="#E94E1B" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Found this helpful?</h3>
          <p style={{ fontSize: 14, color: '#999', marginBottom: 20 }}>Share this article with others who might benefit from it</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
              Share
            </button>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section style={{ 
          padding: isMobile ? '40px 20px' : '60px 60px',
          background: '#0d0d0d',
          borderTop: '1px solid #2a2a2a'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: isMobile ? 24 : 32, 
              fontWeight: 700, 
              marginBottom: 30 
            }}>
              Other Resources
            </h2>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 30
            }}>
              {relatedArticles.map((relatedArticle, idx) => (
                <div
                  key={relatedArticle.id}
                  className="animate-fade-in-up"
                  onClick={() => onNavigateToArticleDetail(relatedArticle.id)}
                  style={{
                    background: '#1a1a1a',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #2a2a2a',
                    transition: 'transform 0.3s, border-color 0.3s',
                    animationDelay: `${idx * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = '#E94E1B'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#2a2a2a'
                  }}
                >
                  <div style={{ 
                    background: '#2a2a2a',
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: 12
                  }}>
                    Related Article
                  </div>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ 
                      fontSize: 16, 
                      fontWeight: 700, 
                      margin: '0 0 12px 0',
                      lineHeight: 1.4
                    }}>
                      {relatedArticle.title}
                    </h3>
                    <p style={{ 
                      fontSize: 13, 
                      color: '#999', 
                      lineHeight: 1.6,
                      marginBottom: 16
                    }}>
                      {relatedArticle.excerpt}
                    </p>
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#E94E1B',
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      Read More <FaArrowRight size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer 
        onNavigateToHome={() => onNavigateToHome('about')}
        onNavigateToDetection={() => onNavigateToHome()}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToTerms={() => {
          window.location.hash = 'terms'
          window.location.reload()
        }}
        onNavigateToPrivacy={() => {
          window.location.hash = 'privacy'
          window.location.reload()
        }}
        isMobile={isMobile}
        activeLink="resources"
      />
    </div>
  )
}
