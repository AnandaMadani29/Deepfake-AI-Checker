import React from 'react'
import { FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Footer({ onNavigateToHome, onNavigateToDetection, onNavigateToArticles, isMobile = false }) {
  const scrollToSection = (sectionId) => {
    if (onNavigateToHome) {
      onNavigateToHome(sectionId)
    }
  }

  return (
    <footer style={{ 
      padding: isMobile ? '30px 20px 20px 20px' : '40px 60px 20px 60px',
      borderTop: '1px solid #2a2a2a',
      margin: 0,
      background: '#0d0d0d'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        maxWidth: 1400,
        margin: '0 auto',
        gap: isMobile ? 30 : 0
      }}>
        <div>
          <div 
            onClick={() => onNavigateToHome && onNavigateToHome()}
            style={{ 
              fontSize: isMobile ? 20 : 24, 
              fontWeight: 700, 
              marginBottom: isMobile ? 10 : 20,
              cursor: 'pointer'
            }}
          >
            Fact.it
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 20 : 80 }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>About us</div>
            <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
              <a onClick={() => scrollToSection('about')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>About</a>
              <a onClick={() => scrollToSection('about')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Mission</a>
              <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Service</div>
            <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
              <a onClick={() => onNavigateToDetection && onNavigateToDetection()} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Detection</a>
              <a onClick={() => scrollToSection('services')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Services</a>
              <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Enterprise</a>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Resources</div>
            <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
              <a onClick={() => scrollToSection('how-to-use')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>How To Use</a>
              <a onClick={() => onNavigateToArticles && onNavigateToArticles()} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Articles & Guides</a>
              <a onClick={() => scrollToSection('faq')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>FAQ</a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E94E1B'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
              <FaYoutube size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E94E1B'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
              <FaInstagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E94E1B'} onMouseLeave={(e) => e.currentTarget.style.color = '#666'}>
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>
      <div style={{ 
        textAlign: 'center', 
        marginTop: 40, 
        paddingTop: 20,
        borderTop: '1px solid #2a2a2a',
        color: '#666',
        fontSize: 12,
        paddingBottom: 0,
        marginBottom: 0
      }}>
        © 2025 Fact.it All rights reserved
      </div>
    </footer>
  )
}
