import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function Privacy({ onNavigateToHome, onNavigateToDetection, onNavigateToArticles, user, onLogout, onLogin }) {
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
        activeLink="privacy"
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
          Privacy Policy
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
          This Privacy Policy ("Policy") describes how Fact.it ("Fact.it," "we," "our," or "us"), a service originating from Indonesia, collects, uses, discloses, and safeguards personal data when you access or use our website, applications, and related services (collectively, the "Services").
        </p>
        <p style={{
          lineHeight: 1.8,
          marginBottom: 40,
          color: '#ccc'
        }}>
          By accessing or using the Services, you acknowledge that you have read, understood, and agree to the terms of this Policy.
        </p>

        {/* Section 1 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            1. Scope and Applicability
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            This Policy applies to all users of the Services globally. We are committed to handling personal data in accordance with applicable data protection laws and regulations, including those in Indonesia.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            2. Personal Data We Collect
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 16
          }}>
            We collect only the personal data necessary to operate and provide the Services, including:
          </p>
          
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 8,
            marginTop: 16
          }}>
            a. Account Registration Data
          </h3>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 16
          }}>
            <li>Name (if provided)</li>
            <li>Email address</li>
            <li>Password (securely stored in encrypted/hashed form)</li>
          </ul>

          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 8
          }}>
            b. Third-Party Authentication Data
          </h3>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            If you choose to log in via Google Sign-In, we may receive limited profile information such as:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 16
          }}>
            <li>Name</li>
            <li>Email address</li>
          </ul>

          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 8
          }}>
            c. User-Provided Content
          </h3>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>Images uploaded by users for the purpose of deepfake detection</li>
          </ul>

          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            We do not intentionally collect sensitive personal data unless explicitly provided by the user.
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            3. Purpose of Processing
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            We process personal data strictly for legitimate and limited purposes, including:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>Providing, operating, and maintaining the Services</li>
            <li>Authenticating user identity and managing user accounts</li>
            <li>Facilitating login via email/password or third-party authentication (Google)</li>
            <li>Sending transactional communications, including password reset emails</li>
            <li>Processing uploaded images for analysis and generating detection results</li>
            <li>Enabling users to download results generated by the system</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            We do not process personal data for advertising, behavioral profiling, or commercial marketing purposes.
          </p>
        </section>

        {/* Section 4 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            4. Legal Basis for Processing
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            Where applicable, we rely on the following legal bases:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20
          }}>
            <li><strong>Consent</strong>: When you voluntarily provide information or use the Services</li>
            <li><strong>Contractual Necessity</strong>: To provide the Services you request</li>
            <li><strong>Legitimate Interest</strong>: To ensure functionality, security, and improvement of the Services</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            5. Data Storage and Retention
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            We retain personal data only for as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required or permitted by law.
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20
          }}>
            <li>Account data is retained while your account is active</li>
            <li>Uploaded images are processed temporarily and are not stored beyond what is necessary for service functionality</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            6. Data Security
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            We implement reasonable administrative, technical, and organizational safeguards designed to protect personal data from unauthorized access, disclosure, alteration, or destruction.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            However, no method of transmission over the internet or electronic storage is completely secure. Therefore, we cannot guarantee absolute security.
          </p>
        </section>

        {/* Section 7 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            7. No Tracking Technologies or Analytics
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Fact.it does <strong>not</strong> use tracking technologies, cookies for behavioral tracking, or third-party analytics services such as Google Analytics. We do not monitor or track user activity across websites or services.
          </p>
        </section>

        {/* Section 8 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            8. No Advertising and No Financial Transactions
          </h2>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20
          }}>
            <li>The Services do not display advertisements, sponsored content, or promotional materials</li>
            <li>The Services do not involve payments, subscriptions, or financial transactions of any kind</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            9. Data Sharing and Disclosure
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            We do not sell, rent, or trade your personal data to third parties.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            We may disclose personal data only in the following circumstances:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20
          }}>
            <li>To comply with applicable laws, regulations, or legal processes</li>
            <li>To enforce our terms, policies, or legal rights</li>
            <li>To protect the rights, safety, and security of users or the public</li>
          </ul>
        </section>

        {/* Section 10 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            10. International Data Transfers
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            If you access the Services from outside Indonesia, you acknowledge that your information may be processed in jurisdictions where data protection laws may differ from those in your country.
          </p>
        </section>

        {/* Section 11 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            11. User Rights
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 8
          }}>
            Subject to applicable law, you may have the following rights:
          </p>
          <ul style={{
            lineHeight: 1.8,
            color: '#ccc',
            paddingLeft: 20,
            marginBottom: 12
          }}>
            <li>The right to access and obtain a copy of your personal data</li>
            <li>The right to request correction of inaccurate or incomplete data</li>
            <li>The right to request deletion of your personal data</li>
            <li>The right to withdraw consent at any time (where processing is based on consent)</li>
          </ul>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Requests may be submitted through the contact information provided below.
          </p>
        </section>

        {/* Section 12 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            12. Children's Privacy
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            The Services are not directed to individuals under the age of 13 (or equivalent minimum age under applicable law). We do not knowingly collect personal data from children.
          </p>
        </section>

        {/* Section 13 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            13. Changes to This Privacy Policy
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            We reserve the right to modify or update this Policy at any time. Changes will become effective upon posting the updated Policy on this page, with a revised "Last Updated" date.
          </p>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc'
          }}>
            Your continued use of the Services after any changes constitutes acceptance of such changes.
          </p>
        </section>

        {/* Section 14 */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 16
          }}>
            14. Contact Information
          </h2>
          <p style={{
            lineHeight: 1.8,
            color: '#ccc',
            marginBottom: 12
          }}>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
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
            By accessing or using Fact.it, you acknowledge and agree to this Privacy Policy.
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
        activeLink="privacy"
      />
    </div>
  )
}
