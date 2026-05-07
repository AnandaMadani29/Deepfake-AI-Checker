import React from 'react'
import { FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Footer({ 
  onNavigateToHome, 
  onNavigateToDetection, 
  onNavigateToArticles, 
  onNavigateToTerms,
  onNavigateToPrivacy,
  isMobile = false,
  activeLink = null
}) {
  const scrollToSection = (sectionId) => {
    if (onNavigateToHome) {
      onNavigateToHome(sectionId)
    }
  }

  return (
    <footer style={{ 
      background: '#E94E1B',
      padding: isMobile ? '40px 20px' : '50px 60px',
      borderTop: 'none',
      margin: 0
    }}>
      {/* Top Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        maxWidth: 1400,
        margin: '0 auto',
        paddingBottom: 30,
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        gap: isMobile ? 20 : 0
      }}>
        <div 
          onClick={() => onNavigateToHome && onNavigateToHome()}
          style={{ 
            fontSize: isMobile ? 28 : 36, 
            fontWeight: 700, 
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          FACT.IT
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 12 : 40,
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <a onClick={() => scrollToSection('about')} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: activeLink === 'about' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>About Us</a>
          <a onClick={() => onNavigateToDetection && onNavigateToDetection()} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: activeLink === 'detection' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Detection</a>
          <a onClick={() => onNavigateToArticles && onNavigateToArticles()} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: activeLink === 'resources' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Resources</a>
          <a onClick={() => onNavigateToTerms && onNavigateToTerms()} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: activeLink === 'terms' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Terms</a>
          <a onClick={() => onNavigateToPrivacy && onNavigateToPrivacy()} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: activeLink === 'privacy' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Privacy</a>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        maxWidth: 1400,
        margin: '0 auto',
        paddingTop: 30,
        gap: isMobile ? 12 : 0
      }}>
        <div style={{ color: '#fff', fontSize: 14 }}>
          © 2025 Fact.it All rights reserved
        </div>
        <div style={{ color: '#fff', fontSize: 14 }}>
          factit.support@gmail.com
        </div>
      </div>
    </footer>
  )
}
