import React from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import Logo from './Logo'

export default function Navbar({ 
  onNavigateToAbout, 
  onNavigateToDetection, 
  onNavigateToArticles,
  onNavigateToHistory,
  onNavigateToTerms,
  onNavigateToPrivacy,
  onNavigateToHome,
  user,
  onLogout,
  onLogin,
  activeLink = null,
  isMobile = false
}) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu - Sidebar Drawer (Home.jsx style) */}
        {menuOpen && (
          <>
            {/* Overlay */}
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 99998,
                animation: "fadeIn 0.3s ease-in-out",
              }}
            />
            {/* Sidebar Drawer */}
            <div
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "280px",
                maxWidth: "80vw",
                background: "#FF5733",
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
                animation: "slideInRight 0.3s ease-in-out",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  position: "absolute",
                  top: 30,
                  right: 30,
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 28,
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaTimes />
              </button>

              {/* Menu Items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 32,
                  marginTop: 80,
                }}
              >
                <a
                  onClick={() => {
                    onNavigateToAbout && onNavigateToAbout()
                    setMenuOpen(false)
                  }}
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 20,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  About Us
                </a>
                <a
                  onClick={() => {
                    onNavigateToDetection && onNavigateToDetection()
                    setMenuOpen(false)
                  }}
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 20,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Detection
                </a>
                <a
                  onClick={() => {
                    onNavigateToArticles && onNavigateToArticles()
                    setMenuOpen(false)
                  }}
                  style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: 20,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Resources
                </a>
                {onNavigateToTerms && (
                  <a
                    onClick={() => {
                      onNavigateToTerms()
                      setMenuOpen(false)
                    }}
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 20,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Terms
                  </a>
                )}
                {onNavigateToPrivacy && (
                  <a
                    onClick={() => {
                      onNavigateToPrivacy()
                      setMenuOpen(false)
                    }}
                    style={{
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 20,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Privacy
                  </a>
                )}
              </div>

              {/* User Section at Bottom */}
              <div style={{ marginTop: "auto", paddingBottom: 40 }}>
                {user ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>Hi,</span>{" "}
                      <span style={{ fontWeight: 600 }}>
                        {user.full_name || user.email}
                      </span>
                    </div>
                    {onNavigateToHistory && (
                      <button
                        onClick={() => {
                          onNavigateToHistory()
                          setMenuOpen(false)
                        }}
                        style={{
                          background: "#1a1a1a",
                          color: "#fff",
                          border: "none",
                          padding: "16px",
                          borderRadius: 4,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontSize: 16,
                          width: "100%",
                        }}
                      >
                        History
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout && onLogout()
                        setMenuOpen(false)
                      }}
                      style={{
                        background: "transparent",
                        color: "#fff",
                        border: "1px solid #fff",
                        padding: "16px",
                        borderRadius: 4,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 16,
                        width: "100%",
                      }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  onLogin && (
                    <button
                      onClick={() => {
                        onLogin()
                        setMenuOpen(false)
                      }}
                      style={{
                        background: "#1a1a1a",
                        color: "#fff",
                        border: "none",
                        padding: "18px",
                        borderRadius: 4,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: 18,
                        width: "100%",
                      }}
                    >
                      Log in
                    </button>
                  )
                )}
              </div>
            </div>
          </>
        )}

        {/* Mobile Navbar */}
        <nav
          style={{
            position: "absolute",
            top: 30,
            right: 0,
            left: 0,
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Logo onClick={onNavigateToHome || onNavigateToAbout} isMobile={true} variant="header" />
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              background: "rgba(13,13,13,0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            }}
          >
            <FaBars />
          </button>
        </nav>
      </>
    )
  }

  // Desktop Navbar
  return (
    <nav
      style={{
        position: "absolute",
        top: 20,
        right: 60,
        zIndex: 1000,
        display: "flex",
        gap: 24,
        alignItems: "center",
        background: "rgba(13,13,13,0.8)",
        backdropFilter: "blur(10px)",
        padding: "12px 20px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <a
        onClick={onNavigateToAbout}
        style={{
          color: activeLink === 'about' ? '#fff' : '#999',
          textDecoration: "none",
          fontSize: 14,
          cursor: "pointer",
          transition: "color 0.2s",
          fontWeight: activeLink === 'about' ? 600 : 400
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = activeLink === 'about' ? '#fff' : "#999")}
      >
        About us
      </a>
      <a
        onClick={onNavigateToDetection}
        style={{
          color: activeLink === 'detection' ? '#fff' : '#999',
          textDecoration: "none",
          fontSize: 14,
          cursor: "pointer",
          transition: "color 0.2s",
          fontWeight: activeLink === 'detection' ? 600 : 400
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = activeLink === 'detection' ? '#fff' : "#999")}
      >
        Detection
      </a>
      <a
        onClick={onNavigateToArticles}
        style={{
          color: activeLink === 'resources' ? '#fff' : '#999',
          textDecoration: "none",
          fontSize: 14,
          cursor: "pointer",
          transition: "color 0.2s",
          fontWeight: activeLink === 'resources' ? 600 : 400
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = activeLink === 'resources' ? '#fff' : "#999")}
      >
        Resources
      </a>
      {onNavigateToTerms && (
        <a
          onClick={onNavigateToTerms}
          style={{
            color: activeLink === 'terms' ? '#fff' : '#999',
            textDecoration: "none",
            fontSize: 14,
            cursor: "pointer",
            transition: "color 0.2s",
            fontWeight: activeLink === 'terms' ? 600 : 400
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = activeLink === 'terms' ? '#fff' : "#999")}
        >
          Terms
        </a>
      )}
      {onNavigateToPrivacy && (
        <a
          onClick={onNavigateToPrivacy}
          style={{
            color: activeLink === 'privacy' ? '#fff' : '#999',
            textDecoration: "none",
            fontSize: 14,
            cursor: "pointer",
            transition: "color 0.2s",
            fontWeight: activeLink === 'privacy' ? 600 : 400
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = activeLink === 'privacy' ? '#fff' : "#999")}
        >
          Privacy
        </a>
      )}
      {user && onNavigateToHistory && (
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ 
            color: "#fff", 
            fontSize: 14,
            fontWeight: 500
          }}>
            Hi, <span style={{ fontWeight: 600 }}>{user.full_name || user.email}</span>
          </div>
          <button
            onClick={onNavigateToHistory}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
            }}
          >
            History
          </button>
          <button
            onClick={onLogout}
            style={{
              background: "#E94E1B",
              border: "none",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#d43d0f")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#E94E1B")}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
