import React, { useEffect } from 'react'
import { FaShieldAlt, FaRobot, FaCheckCircle, FaHistory, FaArrowUp, FaChevronDown, FaChevronUp, FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { HiLightningBolt, HiShieldCheck } from 'react-icons/hi'
import { BiAnalyse } from 'react-icons/bi'
import { MdSecurity, MdVerified } from 'react-icons/md'

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div style={{
      background: '#141414',
      border: '1px solid #2a2a2a',
      borderRadius: 8,
      overflow: 'hidden'
    }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: isOpen ? '#1a1a1a' : 'transparent',
          transition: 'background 0.2s'
        }}
      >
        <h3 style={{ 
          fontSize: 16, 
          fontWeight: 600, 
          margin: 0,
          color: isOpen ? '#E94E1B' : '#fff'
        }}>
          {question}
        </h3>
        <div style={{ color: '#E94E1B', fontSize: 16 }}>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>
      {isOpen && (
        <div style={{
          padding: '0 24px 20px 24px',
          fontSize: 14,
          lineHeight: 1.8,
          color: '#ccc'
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}

export default function Home({ onNavigateToDetection, onNavigateToLogin, onNavigateToRegister, onNavigateToHistory, onNavigateToArticles, onLogout, targetSection, onSectionScrolled, user }) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [showBackToTop, setShowBackToTop] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    <div style={{ background: '#1a1a1a', color: '#fff' }}>
      {/* Navbar */}
      <nav style={{ 
        background: '#0d0d0d', 
        padding: isMobile ? '16px 20px' : '20px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a2a2a',
        position: 'relative'
      }}>
        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, letterSpacing: 1 }}>Fact.it</div>
        
        {isMobile ? (
          // Mobile Menu
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                padding: 8
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#0d0d0d',
                borderBottom: '1px solid #2a2a2a',
                padding: '20px',
                zIndex: 1000
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <a onClick={() => scrollToSection('about')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}>About us</a>
                  <a onClick={() => scrollToSection('services')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}>Services</a>
                  <a onClick={() => scrollToSection('how-to-use')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}>How To Use</a>
                  <a onClick={onNavigateToArticles} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}>Resources</a>
                  {user ? (
                    <>
                      <div style={{ color: '#999', fontSize: 14, padding: '8px 0' }}>Hi, {user.full_name || user.email}</div>
                      <button onClick={() => { onNavigateToDetection(); setMenuOpen(false); }} style={{ background: '#E94E1B', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Get Started</button>
                      <button onClick={() => { onNavigateToHistory(); setMenuOpen(false); }} style={{ background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 20px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>History</button>
                      <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ background: 'transparent', color: '#999', border: '1px solid #2a2a2a', padding: '10px 16px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Logout</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { onNavigateToDetection(); setMenuOpen(false); }} style={{ background: '#E94E1B', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Get Started</button>
                      <button onClick={() => { onNavigateToLogin(); setMenuOpen(false); }} style={{ background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 20px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Sign In</button>
                      <a onClick={() => { onNavigateToRegister(); setMenuOpen(false); }} style={{ color: '#E94E1B', textDecoration: 'none', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}>Sign Up</a>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          // Desktop Menu
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <a onClick={() => scrollToSection('about')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>About us</a>
            <a onClick={() => scrollToSection('services')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Services</a>
            <a onClick={() => scrollToSection('how-to-use')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>How To Use</a>
            <a onClick={onNavigateToArticles} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Resources</a>
          
          {user ? (
            // Logged in: Show user menu
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
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
              <button
                onClick={onNavigateToHistory}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid #2a2a2a',
                  padding: '10px 20px',
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                History
              </button>
              <div style={{ color: '#999', fontSize: 14 }}>
                Hi, {user.full_name || user.email}
              </div>
              <button
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  color: '#999',
                  border: '1px solid #2a2a2a',
                  padding: '8px 16px',
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            // Logged out: Show detection/login/register buttons
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
              <button
                onClick={onNavigateToLogin}
                style={{
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid #2a2a2a',
                  padding: '10px 20px',
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 14
                }}
              >
                Sign In
              </button>
              <a
                onClick={onNavigateToRegister}
                style={{
                  color: '#E94E1B',
                  textDecoration: 'none',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Sign Up
              </a>
            </div>
          )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: isMobile ? '40px 20px' : '80px 60px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: isMobile ? 40 : 80,
        maxWidth: 1400,
        margin: '0 auto'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: isMobile ? 36 : 64, 
            fontWeight: 700, 
            margin: 0,
            lineHeight: 1.1
          }}>
            <span style={{ color: '#E94E1B' }}>Detect Deepfakes</span>
            <br />
            <span style={{ color: '#fff' }}>with AI Technology</span>
          </h1>
          <p style={{ 
            fontSize: isMobile ? 14 : 16, 
            color: '#999', 
            margin: isMobile ? '20px 0 30px 0' : '24px 0 40px 0',
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
        
        {/* Hero Image */}
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
            
            {/* Hero Illustration */}
            <img 
              src="/hero-illustration.png" 
              alt="AI Detection Illustration"
              style={{
                width: '450px',
                height: '500px',
                objectFit: 'contain'
              }}
            />
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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <HiShieldCheck size={48} color="#E94E1B" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px 0' }}>Our Mission</h3>
              <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
                Empower everyone to distinguish real from fake in the digital age
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <FaRobot size={48} color="#E94E1B" />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 12px 0' }}>Our Technology</h3>
              <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
                State-of-the-art deep learning models trained on millions of images
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <FaShieldAlt size={48} color="#E94E1B" />
              </div>
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
        padding: isMobile ? '40px 20px' : '80px 60px',
        background: '#0d0d0d'
      }}>
        <div style={{ 
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 30 : 60,
          alignItems: 'center'
        }}>
          <div style={{ 
            flex: 1,
            width: isMobile ? '100%' : 'auto',
            background: 'linear-gradient(135deg, #E94E1B 0%, #FF7A50 100%)',
            height: isMobile ? 250 : 350,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: isMobile ? 80 : 120, opacity: 0.9 }}>🧠</div>
            <div style={{
              position: 'absolute',
              top: 20,
              right: 20,
              fontSize: isMobile ? 30 : 40,
              opacity: 0.3
            }}>⚡</div>
            <div style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              fontSize: isMobile ? 30 : 40,
              opacity: 0.3
            }}>🔍</div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 700, margin: '0 0 16px 0' }}>
              Advanced AI Detection
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: '#999', lineHeight: 1.7 }}>
              Our cutting-edge neural network analyzes images at the pixel level to identify 
              subtle manipulation artifacts. Using EfficientNet architecture trained on thousands 
              of real and fake images, we achieve industry-leading accuracy in deepfake detection.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Reversed */}
      <section style={{ 
        padding: isMobile ? '40px 20px' : '80px 60px',
        background: '#1a1a1a'
      }}>
        <div style={{ 
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 30 : 60,
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, order: isMobile ? 2 : 1 }}>
            <h2 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 700, margin: '0 0 16px 0' }}>
              Real-Time Analysis
            </h2>
            <p style={{ fontSize: isMobile ? 14 : 16, color: '#999', lineHeight: 1.7 }}>
              Get instant results within seconds. Our optimized inference pipeline processes 
              images quickly without compromising accuracy. Upload, analyze, and verify 
              authenticity in real-time.
            </p>
          </div>
          <div style={{ 
            flex: 1,
            order: isMobile ? 1 : 2,
            width: isMobile ? '100%' : 'auto',
            background: 'linear-gradient(135deg, #E94E1B 0%, #FF7A50 100%)',
            height: isMobile ? 250 : 350,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ fontSize: isMobile ? 80 : 120, opacity: 0.9 }}>⚡</div>
            <div style={{
              position: 'absolute',
              top: 20,
              left: 20,
              fontSize: isMobile ? 30 : 40,
              opacity: 0.3
            }}>⏱️</div>
            <div style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              fontSize: isMobile ? 30 : 40,
              opacity: 0.3
            }}>🚀</div>
          </div>
        </div>
      </section>

      {/* How To Use Section */}
      <section id="how-to-use" style={{ 
        padding: isMobile ? '60px 20px' : '100px 60px',
        background: '#0d0d0d',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: isMobile ? 32 : 48, 
          fontWeight: 700, 
          margin: isMobile ? '0 0 40px 0' : '0 0 60px 0' 
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
              <HiLightningBolt size={48} color="#E94E1B" />
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
              <BiAnalyse size={48} color="#E94E1B" />
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
              <FaCheckCircle size={48} color="#E94E1B" />
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

      {/* FAQ Section */}
      <section id="faq" style={{ 
        padding: isMobile ? '60px 20px' : '80px 60px',
        background: '#0a0a0a'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: isMobile ? 32 : 42, 
            fontWeight: 700, 
            textAlign: 'center',
            marginBottom: 16,
            background: 'linear-gradient(135deg, #E94E1B 0%, #FF7A50 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FAQs
          </h2>
          <p style={{ 
            fontSize: isMobile ? 14 : 16, 
            color: '#999', 
            textAlign: 'center',
            marginBottom: isMobile ? 30 : 50,
            maxWidth: 600,
            margin: isMobile ? '0 auto 30px auto' : '0 auto 50px auto'
          }}>
            Find answers to common questions about our deepfake detection service
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            {[
              {
                q: "What is Deepfake?",
                a: "Deepfake detection is the process of using software, usually AI algorithms, to discern whether a piece of media contains a deepfake or otherwise AI-generated elements. It helps prevent misinformation and fraud due to media manipulation."
              },
              {
                q: "Is the deepfake detector 100% accurate?",
                a: "Our AI model achieves high accuracy rates typically above 90%. However, accuracy can vary depending on the quality and sophistication of the deepfake. The system provides a confidence score with each detection."
              },
              {
                q: "What file types does the product support?",
                a: "We support common image formats including JPG, JPEG, PNG, and WebP. For best results, we recommend using high-quality images with clear facial features. Maximum file size is 10MB per image."
              },
              {
                q: "How do I interpret the detection result?",
                a: "Results include a label (Real/Fake), confidence score, and detailed analysis of 7 indicators. Each indicator is scored and categorized as CRITICAL, WARNING, or NORMAL to help you understand the authenticity."
              },
              {
                q: "Is my data safe?",
                a: "Yes, we take privacy seriously. Images are processed securely and are not stored permanently unless you're logged in and choose to save them. You can delete your history at any time."
              },
              {
                q: "Is there a free version or trial?",
                a: "Yes! You can use the basic detection feature without an account. Creating a free account allows you to save detection history and download detailed PDF reports."
              }
            ].map((faq, idx) => (
              <FAQItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: isMobile ? '30px 20px 20px 20px' : '40px 60px 20px 60px',
        borderTop: '1px solid #2a2a2a',
        margin: 0
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
            <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, marginBottom: isMobile ? 10 : 20 }}>Fact.it</div>
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
                <a onClick={onNavigateToDetection} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Detection</a>
                <a onClick={() => scrollToSection('services')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Services</a>
                <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Enterprise</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Resources</div>
              <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
                <a onClick={() => scrollToSection('how-to-use')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>How To Use</a>
                <a onClick={onNavigateToArticles} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Articles & Guides</a>
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

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 40,
            right: 40,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E94E1B 0%, #d43d10 100%)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(233, 78, 27, 0.4)',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(233, 78, 27, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 78, 27, 0.4)'
          }}
          title="Back to top"
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  )
}
