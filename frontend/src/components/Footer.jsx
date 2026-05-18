import React from 'react'

export default function Footer({ 
  onNavigateToHome, 
  onNavigateToDetection, 
  onNavigateToArticles, 
  onNavigateToTerms,
  onNavigateToPrivacy,
  isMobile = false,
  activeLink = null
}) {
  return (
    <footer style={{ 
      background: '#E94E1B',
      padding: isMobile ? '40px 20px' : '50px 60px',
      borderTop: 'none',
      margin: 0
    }}>
      {isMobile ? (
        // ── MOBILE LAYOUT ── 
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Baris 1: Logo + Email */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32
          }}>
            {/* Logo kiri */}
            <div
              onClick={() => onNavigateToHome && onNavigateToHome()}
              style={{ fontSize: 24, fontWeight: 700, color: '#fff', cursor: 'pointer', letterSpacing: 1, lineHeight: 1 }}
            >
              FACT.IT
            </div>
            {/* Email kanan */}
            <a href="mailto:factit.support@gmail.com" style={{ color: '#fff', fontSize: 12, fontWeight: 500, textAlign: 'center', textDecoration: 'none' }}>
              factit.support@gmail.com
            </a>
          </div>

          {/* Baris 2: Links dalam grid 3 kolom */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px 0',
            textAlign: 'center',
            justifyContent:'space-between',
            marginBottom: 32
          }}>
            <a
              onClick={() => onNavigateToHome && onNavigateToHome('about')}
              style={{ color: '#fff', textDecoration: 'none', fontSize: 14, cursor: 'pointer', fontWeight: activeLink === 'home' ? 700 : 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Home
            </a>
            <a
              onClick={() => onNavigateToDetection && onNavigateToDetection()}
              style={{ color: '#fff', textDecoration: 'none', fontSize: 14, cursor: 'pointer', fontWeight: activeLink === 'detection' ? 700 : 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Detection
            </a>
            <a
              onClick={() => onNavigateToArticles && onNavigateToArticles()}
              style={{ color: '#fff', textDecoration: 'none', fontSize: 14, cursor: 'pointer', fontWeight: activeLink === 'resources' ? 700 : 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Resources
            </a>
            {/* Baris kedua: Terms & Privacy centered */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-evenly', marginTop: 10 }}>
              <a
                onClick={() => onNavigateToTerms && onNavigateToTerms()}
                style={{ color: '#fff', textDecoration: 'none', fontSize: 14, cursor: 'pointer', fontWeight: activeLink === 'terms' ? 700 : 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Terms
              </a>
              <a
                onClick={() => onNavigateToPrivacy && onNavigateToPrivacy()}
                style={{ color: '#fff', textDecoration: 'none', fontSize: 14, cursor: 'pointer', fontWeight: activeLink === 'privacy' ? 700 : 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Privacy
              </a>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgb(255, 255, 255)', marginBottom: 20 }} />

          {/* Baris 3: Copyright centered */}
          <div style={{ color: '#fff', fontSize: 12, textAlign: 'center', fontWeight: 400 }}>
            ©2025 Fact.it. All right reserved
          </div>
        </div>
      ) : (
        // ── DESKTOP LAYOUT ── sama seperti sebelumnya
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Top Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 30,
            borderBottom: '1px solid rgb(255, 255, 255)',
          }}>
            <div
              onClick={() => onNavigateToHome && onNavigateToHome()}
              style={{ fontSize: 48, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
            >
              FACT.IT
            </div>

            <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
              <a onClick={() => onNavigateToHome && onNavigateToHome()} style={{ color: '#fff', textDecoration: 'none', fontSize: 18, cursor: 'pointer', fontWeight: activeLink === 'home' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Home</a>
              <a onClick={() => onNavigateToDetection && onNavigateToDetection()} style={{ color: '#fff', textDecoration: 'none', fontSize: 18, cursor: 'pointer', fontWeight: activeLink === 'detection' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Detection</a>
              <a onClick={() => onNavigateToArticles && onNavigateToArticles()} style={{ color: '#fff', textDecoration: 'none', fontSize: 18, cursor: 'pointer', fontWeight: activeLink === 'resources' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Resources</a>
              <a onClick={() => onNavigateToTerms && onNavigateToTerms()} style={{ color: '#fff', textDecoration: 'none', fontSize: 18, cursor: 'pointer', fontWeight: activeLink === 'terms' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Terms</a>
              <a onClick={() => onNavigateToPrivacy && onNavigateToPrivacy()} style={{ color: '#fff', textDecoration: 'none', fontSize: 18, cursor: 'pointer', fontWeight: activeLink === 'privacy' ? 700 : 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Privacy</a>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 30,
          }}>
            <a href="mailto:factit.support@gmail.com" style={{ color: '#fff', fontSize: 14, textDecoration: 'none' }}>
              factit.support@gmail.com
            </a>
            <div style={{ color: '#fff', fontSize: 14 }}>
              © 2025 Fact.it All rights reserved
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}