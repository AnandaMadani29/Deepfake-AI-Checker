import React, { useState } from 'react'
import { FaArrowRight, FaClock, FaUser } from 'react-icons/fa'
import { HiSearch } from 'react-icons/hi'
import { articles, categories, getArticlesByCategory } from './articlesData'

export default function Articles({ onNavigateToArticleDetail, onNavigateToHome }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredArticles = getArticlesByCategory(selectedCategory).filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const featuredArticle = articles[0]

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      margin: 0
    }}>
      {/* Header */}
      <header style={{ 
        background: '#0d0d0d',
        padding: isMobile ? '16px 20px' : '20px 60px',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div 
          onClick={onNavigateToHome}
          style={{ 
            fontSize: isMobile ? 20 : 24, 
            fontWeight: 700,
            letterSpacing: 1,
            cursor: 'pointer'
          }}
        >
          Fact.it
        </div>
        {isMobile ? (
          <button onClick={onNavigateToHome} style={{ background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 16px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            Home
          </button>
        ) : (
          <nav style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <a onClick={() => onNavigateToHome('about')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>About us</a>
            <a onClick={() => onNavigateToHome('services')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Services</a>
            <a onClick={() => onNavigateToHome('how-to-use')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>How To Use</a>
            <a style={{ color: '#E94E1B', textDecoration: 'none', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Resources</a>
            <button onClick={onNavigateToHome} style={{ background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 20px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Home
            </button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: isMobile ? '60px 20px' : '80px 60px',
        textAlign: 'center',
        background: '#0d0d0d'
      }}>
        <h1 style={{ 
          fontSize: isMobile ? 36 : 56, 
          fontWeight: 700, 
          margin: '0 0 16px 0',
          lineHeight: 1.2
        }}>
          Resources & Guidance
        </h1>
        <p style={{ 
          fontSize: isMobile ? 14 : 16, 
          color: '#999', 
          maxWidth: 600, 
          margin: '0 auto 40px auto',
          lineHeight: 1.6
        }}>
          Learn about deepfake detection, stay updated with the latest news, and discover best practices for digital media verification
        </p>

        {/* Search Bar */}
        <div style={{ 
          maxWidth: 600, 
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 50px 16px 20px',
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
          />
          <HiSearch 
            size={20} 
            color="#999" 
            style={{ 
              position: 'absolute', 
              right: 20, 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }} 
          />
        </div>
      </section>

      {/* Featured Article */}
      <section style={{ 
        padding: isMobile ? '40px 20px' : '60px 60px',
        background: '#000'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: isMobile ? 24 : 32, 
            fontWeight: 700, 
            marginBottom: 30 
          }}>
            Featured Article
          </h2>
          
          <div 
            onClick={() => onNavigateToArticleDetail(featuredArticle.id)}
            style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 40,
              background: '#0d0d0d',
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid #2a2a2a',
              transition: 'border-color 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E94E1B'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2a2a'}
          >
            <div style={{ 
              background: '#2a2a2a',
              minHeight: isMobile ? 200 : 350,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: 14
            }}>
              Featured Image
            </div>
            <div style={{ padding: isMobile ? 20 : 40 }}>
              <div style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                background: '#E94E1B',
                color: '#fff',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 16,
                textTransform: 'uppercase'
              }}>
                {featuredArticle.category}
              </div>
              <h3 style={{ 
                fontSize: isMobile ? 20 : 28, 
                fontWeight: 700, 
                margin: '0 0 16px 0',
                lineHeight: 1.3
              }}>
                {featuredArticle.title}
              </h3>
              <p style={{ 
                fontSize: 14, 
                color: '#999', 
                lineHeight: 1.6,
                marginBottom: 20
              }}>
                {featuredArticle.excerpt}
              </p>
              <div style={{ 
                display: 'flex', 
                gap: 20, 
                fontSize: 12, 
                color: '#666',
                marginBottom: 20
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaClock size={12} />
                  {featuredArticle.readTime}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaUser size={12} />
                  {featuredArticle.author}
                </span>
                <span>{featuredArticle.date}</span>
              </div>
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#E94E1B',
                fontSize: 14,
                fontWeight: 600
              }}>
                Read More <FaArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section style={{ 
        padding: isMobile ? '20px 20px 0' : '40px 60px 0',
        background: '#000'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto',
          borderBottom: '1px solid #2a2a2a'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: isMobile ? 16 : 40,
            overflowX: 'auto',
            paddingBottom: 16
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: selectedCategory === category ? '#E94E1B' : '#999',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: selectedCategory === category ? '2px solid #E94E1B' : '2px solid transparent',
                  whiteSpace: 'nowrap'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section style={{ 
        padding: isMobile ? '40px 20px' : '60px 60px',
        background: '#000'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {filteredArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
              No articles found matching your search.
            </div>
          ) : (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 30
            }}>
              {filteredArticles.slice(1).map(article => (
                <div
                  key={article.id}
                  onClick={() => onNavigateToArticleDetail(article.id)}
                  style={{
                    background: '#0d0d0d',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #2a2a2a',
                    transition: 'transform 0.3s, border-color 0.3s'
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
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: 12
                  }}>
                    Article Image
                  </div>
                  <div style={{ padding: 24 }}>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: '#E94E1B',
                      color: '#fff',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      marginBottom: 12,
                      textTransform: 'uppercase'
                    }}>
                      {article.category}
                    </div>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 700, 
                      margin: '0 0 12px 0',
                      lineHeight: 1.4
                    }}>
                      {article.title}
                    </h3>
                    <p style={{ 
                      fontSize: 13, 
                      color: '#999', 
                      lineHeight: 1.6,
                      marginBottom: 16
                    }}>
                      {article.excerpt}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      gap: 16, 
                      fontSize: 11, 
                      color: '#666',
                      marginBottom: 16
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaClock size={10} />
                        {article.readTime}
                      </span>
                      <span>{article.date}</span>
                    </div>
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
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#0d0d0d', 
        padding: isMobile ? '40px 20px' : '60px 60px',
        borderTop: '1px solid #2a2a2a'
      }}>
        <div style={{ 
          maxWidth: 1200,
          margin: '0 auto',
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
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#666' }}>
              <a style={{ cursor: 'pointer' }}>Guidance</a>
              <a style={{ cursor: 'pointer' }}>Blog</a>
              <a style={{ cursor: 'pointer' }}>News</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: '#666' }}>
              <a onClick={onNavigateToHome} style={{ cursor: 'pointer' }}>About Us</a>
              <a onClick={onNavigateToHome} style={{ cursor: 'pointer' }}>Contact</a>
            </div>
          </div>
        </div>
        <div style={{ 
          maxWidth: 1200,
          margin: '40px auto 0',
          paddingTop: 30,
          borderTop: '1px solid #2a2a2a',
          textAlign: 'center',
          fontSize: 12,
          color: '#666'
        }}>
          © 2026 Fact.it. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
