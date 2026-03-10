import React, { useEffect } from 'react'

export default function Home({ onNavigateToDetection, targetSection, onSectionScrolled }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    if (targetSection) {
      setTimeout(() => {
        scrollToSection(targetSection)
        if (onSectionScrolled) {
          onSectionScrolled()
        }
      }, 100)
    }
  }, [targetSection])
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff' }}>
      {/* Navbar */}
      <nav style={{ 
        background: '#0d0d0d', 
        padding: '20px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>Fact.it</div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <a onClick={() => scrollToSection('about')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>About us</a>
          <a onClick={() => scrollToSection('services')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Services</a>
          <a onClick={() => scrollToSection('how-to-use')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>How To Use</a>
          <button 
            onClick={onNavigateToDetection}
            style={{
              background: '#E94E1B',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 4,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14
            }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '80px 60px',
        display: 'flex',
        alignItems: 'center',
        gap: 80,
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: 64, 
            fontWeight: 700, 
            margin: 0,
            lineHeight: 1.1
          }}>
            <span style={{ color: '#E94E1B' }}>Detect Deepfakes</span>
            <br />
            <span style={{ color: '#fff' }}>with AI Technology</span>
          </h1>
          <p style={{ 
            fontSize: 16, 
            color: '#999', 
            margin: '24px 0 40px 0',
            lineHeight: 1.6,
            maxWidth: 500
          }}>
            Verify image authenticity using advanced machine learning. 
            Protect yourself from manipulated media with our state-of-the-art detection system.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              onClick={onNavigateToDetection}
              style={{
                background: '#E94E1B',
                color: '#fff',
                border: 'none',
                padding: '14px 32px',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 16
              }}>
              Try Detection
            </button>
            <button 
              onClick={() => scrollToSection('how-to-use')}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '2px solid #444',
                padding: '14px 32px',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 16
              }}>
              Learn More
            </button>
          </div>
        </div>
        
        {/* 3D Face Mesh Illustration */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ 
            width: 400, 
            height: 400, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Corner brackets */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 60, height: 60, borderTop: '3px solid #E94E1B', borderLeft: '3px solid #E94E1B' }}></div>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, borderTop: '3px solid #E94E1B', borderRight: '3px solid #E94E1B' }}></div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 60, height: 60, borderBottom: '3px solid #E94E1B', borderLeft: '3px solid #E94E1B' }}></div>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 60, height: 60, borderBottom: '3px solid #E94E1B', borderRight: '3px solid #E94E1B' }}></div>
            
            {/* Wireframe face placeholder */}
            <svg width="300" height="350" viewBox="0 0 300 350" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="150" cy="175" rx="100" ry="140" stroke="#666" strokeWidth="1" strokeDasharray="4 4"/>
              <circle cx="120" cy="150" r="8" fill="#E94E1B"/>
              <circle cx="180" cy="150" r="8" fill="#E94E1B"/>
              <ellipse cx="150" cy="200" rx="30" ry="15" stroke="#666" strokeWidth="1"/>
              <path d="M 100 120 Q 120 110 140 120" stroke="#666" strokeWidth="1"/>
              <path d="M 160 120 Q 180 110 200 120" stroke="#666" strokeWidth="1"/>
              <line x1="150" y1="50" x2="150" y2="300" stroke="#333" strokeWidth="1" strokeDasharray="2 2"/>
              <line x1="50" y1="175" x2="250" y2="175" stroke="#333" strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{ 
        padding: '100px 60px',
        background: '#1a1a1a'
      }}>
        <div style={{ 
          maxWidth: 1200,
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 48, fontWeight: 700, margin: '0 0 24px 0' }}>
            About <span style={{ color: '#E94E1B' }}>Fact.it</span>
          </h2>
          <p style={{ fontSize: 18, color: '#999', lineHeight: 1.8, maxWidth: 800, margin: '0 auto 60px auto' }}>
            We're on a mission to combat misinformation and protect digital media authenticity. 
            Our AI-powered deepfake detection technology helps individuals and organizations 
            verify image authenticity with confidence.
          </p>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 40,
            marginTop: 60
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px 0' }}>Our Mission</h3>
              <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
                Empower everyone to distinguish real from fake in the digital age
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px 0' }}>Our Technology</h3>
              <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
                State-of-the-art deep learning models trained on millions of images
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px 0' }}>Our Promise</h3>
              <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
                Fast, accurate, and privacy-focused detection you can trust
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1 - Services */}
      <section id="services" style={{ 
        padding: '80px 60px',
        background: '#0d0d0d'
      }}>
        <div style={{ 
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          gap: 60,
          alignItems: 'center'
        }}>
          <div style={{ 
            flex: 1,
            background: '#E94E1B',
            height: 350,
            borderRadius: 8
          }}></div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px 0' }}>
              Advanced AI Detection
            </h2>
            <p style={{ fontSize: 16, color: '#999', lineHeight: 1.7 }}>
              Our cutting-edge neural network analyzes images at the pixel level to identify 
              subtle manipulation artifacts. Using EfficientNet architecture trained on thousands 
              of real and fake images, we achieve industry-leading accuracy in deepfake detection.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Reversed */}
      <section style={{ 
        padding: '80px 60px',
        background: '#1a1a1a'
      }}>
        <div style={{ 
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          gap: 60,
          alignItems: 'center'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px 0' }}>
              Real-Time Analysis
            </h2>
            <p style={{ fontSize: 16, color: '#999', lineHeight: 1.7 }}>
              Get instant results within seconds. Our optimized inference pipeline processes 
              images quickly without compromising accuracy. Upload, analyze, and verify 
              authenticity in real-time.
            </p>
          </div>
          <div style={{ 
            flex: 1,
            background: '#E94E1B',
            height: 350,
            borderRadius: 8
          }}></div>
        </div>
      </section>

      {/* How To Use Section */}
      <section id="how-to-use" style={{ 
        padding: '100px 60px',
        background: '#0d0d0d',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: 48, 
          fontWeight: 700, 
          margin: '0 0 60px 0' 
        }}>
          How To Use Deepfake Detection
        </h2>
        
        <div style={{ 
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 40
        }}>
          {/* Step 1 */}
          <div style={{ 
            background: '#1a1a1a',
            padding: 40,
            borderRadius: 8,
            border: '1px solid #2a2a2a'
          }}>
            <div style={{ 
              fontSize: 48, 
              color: '#E94E1B',
              marginBottom: 20
            }}>
              🎯
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px 0' }}>
              Upload Image
            </h3>
            <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
              Select or drag & drop the image you want to verify. 
              Supports JPG, PNG formats up to 10MB.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ 
            background: '#1a1a1a',
            padding: 40,
            borderRadius: 8,
            border: '1px solid #2a2a2a'
          }}>
            <div style={{ 
              fontSize: 48, 
              color: '#E94E1B',
              marginBottom: 20
            }}>
              📊
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px 0' }}>
              AI Analysis
            </h3>
            <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
              Our AI model processes the image and analyzes patterns 
              to detect manipulation artifacts.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ 
            background: '#1a1a1a',
            padding: 40,
            borderRadius: 8,
            border: '1px solid #2a2a2a'
          }}>
            <div style={{ 
              fontSize: 48, 
              color: '#E94E1B',
              marginBottom: 20
            }}>
              ✅
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 16px 0' }}>
              Get Results
            </h3>
            <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
              Receive instant classification with confidence scores 
              showing Real or Fake probability.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: '#0d0d0d', 
        padding: '40px 60px',
        borderTop: '1px solid #2a2a2a'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Fact.it</div>
          </div>
          <div style={{ display: 'flex', gap: 80 }}>
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
                <a onClick={onNavigateToDetection} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Detection</a>
                <a onClick={() => scrollToSection('services')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Services</a>
                <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Enterprise</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Resources</div>
              <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
                <a onClick={() => scrollToSection('how-to-use')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>How To Use</a>
                <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Blog</a>
                <a onClick={() => scrollToSection('how-to-use')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>FAQ</a>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20 }}>▶️</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20 }}>📷</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20 }}>💼</a>
            </div>
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          marginTop: 40, 
          paddingTop: 20,
          borderTop: '1px solid #2a2a2a',
          color: '#666',
          fontSize: 12
        }}>
          © 2025 Fact.it All rights reserved
        </div>
      </footer>
    </div>
  )
}
