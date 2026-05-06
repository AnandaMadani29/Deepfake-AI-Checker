import React from 'react'

export default function Navbar({ 
  onNavigateToAbout, 
  onNavigateToDetection, 
  onNavigateToArticles,
  onNavigateToHistory,
  onNavigateToTerms,
  onNavigateToPrivacy,
  user,
  onLogout,
  activeLink = null
}) {
  return (
    <nav
      style={{
        position: "fixed",
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
          color: activeLink === 'services' ? '#fff' : '#999',
          textDecoration: "none",
          fontSize: 14,
          cursor: "pointer",
          transition: "color 0.2s",
          fontWeight: activeLink === 'services' ? 600 : 400
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = activeLink === 'services' ? '#fff' : "#999")}
      >
        Services
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
