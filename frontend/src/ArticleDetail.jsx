import React from 'react'
import { FaClock, FaUser, FaArrowRight, FaShareAlt } from 'react-icons/fa'
import { HiArrowLeft } from 'react-icons/hi'
import { getArticleById, getRelatedArticles } from './articlesData'

export default function ArticleDetail({ articleId, onNavigateToArticles, onNavigateToArticleDetail, onNavigateToHome }) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768)

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
      background: '#000',
      color: '#fff',
      margin: 0
    }}>
      {/* Header */}
      <header style={{ 
        padding: isMobile ? '20px' : '20px 60px',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div 
          onClick={onNavigateToHome}
          style={{ 
            fontSize: 24, 
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Fact.it
        </div>
        <nav style={{ display: 'flex', gap: isMobile ? 20 : 40, fontSize: 14 }}>
          <a onClick={onNavigateToHome} style={{ color: '#999', cursor: 'pointer', textDecoration: 'none' }}>Home</a>
          <a onClick={() => onNavigateToHome('about')} style={{ color: '#999', cursor: 'pointer', textDecoration: 'none' }}>About</a>
          <a onClick={onNavigateToArticles} style={{ color: '#E94E1B', cursor: 'pointer', textDecoration: 'none' }}>Resources</a>
        </nav>
      </header>

      {/* Back Button */}
      <div style={{ 
        padding: isMobile ? '20px' : '30px 60px',
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

      {/* Footer */}
      <footer style={{ 
        background: 'linear-gradient(to bottom, #0d0d0d 0%, #0d0d0d 15%, rgba(13, 13, 13, 0.8) 20%, rgba(13, 13, 13, 0.5) 30%, rgba(13, 13, 13, 0.2) 40%, rgba(51, 51, 51, 0) 45%, rgba(102, 102, 102, 0.25) 60%, rgba(102, 102, 102, 0.5) 75%, rgba(102, 102, 102, 0.75) 90%, rgba(102, 102, 102, 1) 100%)', 
        padding: isMobile ? '40px 20px' : '60px 60px',
        borderTop: 'none'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 40
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Fact.it</div>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                AI-powered deepfake detection to protect digital media authenticity.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#222' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#666' }}>
                <a onClick={onNavigateToArticles} style={{ cursor: 'pointer' }}>Guidance</a>
                <a onClick={onNavigateToArticles} style={{ cursor: 'pointer' }}>Blog</a>
                <a onClick={onNavigateToArticles} style={{ cursor: 'pointer' }}>News</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#222' }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#666' }}>
                <a onClick={onNavigateToHome} style={{ cursor: 'pointer' }}>About Us</a>
                <a onClick={onNavigateToHome} style={{ cursor: 'pointer' }}>Contact</a>
              </div>
            </div>
          </div>
          <div style={{ 
            marginTop: 40,
            paddingTop: 30,
            borderTop: '1px solid #2a2a2a',
            textAlign: 'center',
            fontSize: 12,
            color: '#666'
          }}>
            © 2026 Fact.it. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
