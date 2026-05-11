import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function Terms({ onNavigateToHome, onNavigateToDetection, onNavigateToArticles, user, onLogout, onLogin }) {
  console.log('Terms component rendered', { user, onNavigateToHome, onNavigateToDetection, onNavigateToArticles })
  
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const navigateTo = (page) => {
    window.location.hash = page
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff'
    }}>
      <Navbar 
        onNavigateToAbout={() => onNavigateToHome && onNavigateToHome('about')}
        onNavigateToDetection={onNavigateToDetection}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToHistory={user ? () => window.location.hash = 'history' : null}
        onNavigateToTerms={() => navigateTo('terms')}
        onNavigateToPrivacy={() => navigateTo('privacy')}
        onNavigateToHome={() => onNavigateToHome && onNavigateToHome()}
        user={user}
        onLogout={onLogout}
        onLogin={onLogin}
        isMobile={isMobile}
        activeLink="terms"
      />

      {/* Content */}
      <main style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '60px 40px 100px'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: 42,
          fontWeight: 700,
          marginBottom: 8,
          fontFamily: 'serif'
        }}>
          Terms & Conditions
        </h1>
        <p style={{
          color: '#999',
          fontSize: 14,
          marginBottom: 40
        }}>
          Last Updated: May 6, 2026
        </p>

        {/* Introduction */}
        <p style={{
          lineHeight: 1.8,
          marginBottom: 30,
          color: '#ccc'
        }}>
          These Terms and Conditions ("Terms") govern your access to and use of the website, applications, and services provided by Fact.it ("Fact.it," "we," "our," or "us") (collectively, the "Services").
        </p>
        <p style={{
          lineHeight: 1.8,
          marginBottom: 40,
          color: '#ccc'
        }}>
          By accessing or using the Services, you agree to be bound by these Terms. If you do not agree, you must discontinue use of the Services immediately.
        </p>

        {/* Section 1 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            1. Eligibility
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            You must be at least 13 years old (or the minimum legal age in your jurisdiction) to use the Services. By using Fact.it, you represent and warrant that you meet this requirement.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            2. Account Registration
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            To access certain features, you may be required to create an account.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            You agree to:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>Provide accurate and complete information</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Be responsible for all activities under your account</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Fact.it reserves the right to suspend or terminate accounts that provide false information or violate these Terms.
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            3. Use of Services
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            Fact.it provides a tool for detecting potential deepfake content in images.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            You agree to use the Services only for lawful purposes and in accordance with these Terms. You shall not:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20
          }}>
            <li>Use the Services for fraudulent, deceptive, or unlawful activities</li>
            <li>Upload content that violates intellectual property rights or privacy rights of others</li>
            <li>Attempt to interfere with, disrupt, or gain unauthorized access to the system</li>
            <li>Reverse engineer, copy, or exploit the system beyond its intended use</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            4. User Content
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            You retain ownership of any images or content you upload ("User Content").
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            By uploading content, you represent and warrant that:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>You have the legal right to use and upload such content</li>
            <li>The content does not violate any laws or third-party rights</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Fact.it does not claim ownership over your content. Uploaded images are used solely for processing and analysis purposes.
          </p>
        </section>

        {/* Section 5 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            5. Intellectual Property
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            All content, features, and functionality of the Services—including but not limited to design, text, graphics, logos, and software—are owned by Fact.it or its licensors and are protected by applicable intellectual property laws.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            You may not reproduce, distribute, modify, or create derivative works without prior written consent from Fact.it.
          </p>
        </section>

        {/* Section 6 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            6. Disclaimer of Warranties
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            The Services are provided on an "as is" and "as available" basis.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            Fact.it makes no warranties, express or implied, regarding:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>The accuracy or reliability of detection results</li>
            <li>The availability or uninterrupted operation of the Services</li>
            <li>The absence of errors or security vulnerabilities</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Detection results are provided for informational and educational purposes only and should not be considered definitive proof.
          </p>
        </section>

        {/* Section 7 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            7. Limitation of Liability
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            To the fullest extent permitted by law, Fact.it shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>Loss of data</li>
            <li>Loss of profits</li>
            <li>Misuse of detection results</li>
            <li>Unauthorized access to your account</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Your use of the Services is at your own risk.
          </p>
        </section>

        {/* Section 8 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            8. Third-Party Services
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            The Services may include authentication through third-party providers (e.g., Google Sign-In).
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Fact.it is not responsible for the practices, policies, or content of such third-party services. Your use of third-party services is subject to their respective terms and policies.
          </p>
        </section>

        {/* Section 9 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            9. Service Availability and Modifications
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            We reserve the right to:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>Modify, suspend, or discontinue any part of the Services at any time</li>
            <li>Update features, functionality, or system requirements without prior notice</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            We are not liable for any disruption or discontinuation of the Services.
          </p>
        </section>

        {/* Section 10 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            10. Termination
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            We may suspend or terminate your access to the Services at our sole discretion, with or without notice, if:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>You violate these Terms</li>
            <li>Your use poses a risk to the system or other users</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Upon termination, your right to use the Services will immediately cease.
          </p>
        </section>

        {/* Section 11 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            11. Governing Law
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            These Terms shall be governed and interpreted in accordance with the laws of the Republic of Indonesia, without regard to conflict of law principles.
          </p>
        </section>

        {/* Section 12 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            12. Changes to These Terms
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            We reserve the right to update or modify these Terms at any time. Changes will be effective upon posting.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Your continued use of the Services constitutes acceptance of the updated Terms.
          </p>
        </section>

        {/* Section 13 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            13. Contact Information
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            If you have any questions regarding these Terms, please contact us at:
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            <strong>Email:</strong> <a href="mailto:support@factit.com" style={{ color: '#ff6b35', textDecoration: 'none' }}>support@factit.com</a>
          </p>
        </section>

        {/* Final Note */}
        <div style={{
          marginTop: 60,
          padding: 20,
          background: '#1a1a1a',
          borderRadius: 8,
          border: '1px solid #2a2a2a'
        }}>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            margin: 0,
            textAlign: 'center'
          }}>
            By accessing or using Fact.it, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
          </p>
        </div>
      </main>

      <Footer 
        onNavigateToHome={onNavigateToHome}
        onNavigateToDetection={onNavigateToDetection}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToTerms={() => navigateTo('terms')}
        onNavigateToPrivacy={() => navigateTo('privacy')}
        isMobile={isMobile}
        activeLink="terms"
      />
    </div>
  )
}
