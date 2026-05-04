import React, { useEffect } from "react";
import {
  FaShieldAlt,
  FaRobot,
  FaArrowUp,
  FaPlus,
  FaMinus,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {
  HiUpload,
  HiPhotograph,
  HiDocumentText,
  HiClock,
} from "react-icons/hi";
import { BiAnalyse } from "react-icons/bi";
import { MdSecurity } from "react-icons/md";
import Logo from "./components/Logo";

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: isOpen ? "#1a1a1a" : "transparent",
          transition: "background 0.2s",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>
          {question}
        </h3>
        {isOpen ? (
          <FaMinus size={16} color="#E94E1B" />
        ) : (
          <FaPlus size={16} color="#999" />
        )}
      </div>
      {isOpen && (
        <div
          style={{
            padding: "20px 24px 24px 24px",
            color: "#999",
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Home({
  onNavigateToDetection,
  onNavigateToLogin,
  onNavigateToHistory,
  onNavigateToArticles,
  onLogout,
  targetSection,
  onSectionScrolled,
  user,
}) {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    if (targetSection) {
      setTimeout(() => {
        scrollToSection(targetSection);
        if (onSectionScrolled) onSectionScrolled();
      }, 100);
    }
  }, [targetSection]);

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, #666666 50%, #333333 100%)",
        color: "#fff",
      }}
    >
      {/* ── MOBILE SIDEBAR: overlay + drawer dirender di ROOT level ──
          Ini kunci utama: dengan berada di luar nav, overlay (zIndex 99998)
          bisa menutupi logo dan semua elemen lainnya tanpa hambatan
          stacking context dari parent.                               */}
      {isMobile && menuOpen && (
        <>
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 32,
                marginTop: 80,
              }}
            >
              <a
                onClick={() => scrollToSection("about")}
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
                  onNavigateToDetection();
                  setMenuOpen(false);
                }}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Service
              </a>
              <a
                onClick={() => {
                  onNavigateToArticles();
                  setMenuOpen(false);
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
            </div>
            <div style={{ marginTop: "auto", paddingBottom: 40 }}>
              {user ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Hi,</span>{" "}
                    <span style={{ fontWeight: 600 }}>
                      {user.full_name || user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onNavigateToHistory();
                      setMenuOpen(false);
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
                  <button
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
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
                <button
                  onClick={() => {
                    onNavigateToLogin();
                    setMenuOpen(false);
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
              )}
            </div>
          </div>
        </>
      )}

      {/* ── LOGO: hanya position absolute di desktop ──
          Di mobile, logo masuk ke dalam navbar row
          sehingga zIndex-nya 1000 (di bawah overlay 99998) */}
      {!isMobile && (
        <div style={{ position: "absolute", top: 40, left: 60, zIndex: 1001 }}>
          <Logo onClick={scrollToTop} isMobile={isMobile} variant="header" />
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "absolute",
          top: isMobile ? 30 : 20,
          right: isMobile ? 0 : 60,
          left: isMobile ? 0 : "auto",
          padding: isMobile ? "0 20px" : 0,
          display: "flex",
          justifyContent: isMobile ? "space-between" : "flex-end",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        {isMobile ? (
          <>
            {/* Logo kiri — zIndex ikut nav (1000), di bawah overlay */}
            <Logo onClick={scrollToTop} isMobile={isMobile} variant="header" />
            {/* Hamburger kanan */}
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
          </>
        ) : (
          <div
            style={{
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
              onClick={() => scrollToSection("about")}
              style={{
                color: "#999",
                textDecoration: "none",
                fontSize: 14,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              About us
            </a>
            <a
              onClick={onNavigateToDetection}
              style={{
                color: "#999",
                textDecoration: "none",
                fontSize: 14,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              Services
            </a>
            <a
              onClick={onNavigateToArticles}
              style={{
                color: "#999",
                textDecoration: "none",
                fontSize: 14,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
            >
              Resources
            </a>
            {user ? (
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <button
                  onClick={onNavigateToHistory}
                  style={{
                    background: "transparent",
                    color: "#999",
                    border: "1px solid #2a2a2a",
                    padding: "10px 20px",
                    borderRadius: 4,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2a2a2a";
                    e.currentTarget.style.borderColor = "#E94E1B";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "#2a2a2a";
                    e.currentTarget.style.color = "#999";
                  }}
                >
                  History
                </button>
                <span style={{ color: "#fff", fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>Hi,</span>{" "}
                  <span style={{ fontWeight: 600 }}>
                    {user.full_name || user.email}
                  </span>
                </span>
                <button
                  onClick={onLogout}
                  style={{
                    background: "transparent",
                    color: "#999",
                    border: "1px solid #2a2a2a",
                    padding: "10px 20px",
                    borderRadius: 4,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2a2a2a";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#999";
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onNavigateToLogin}
                style={{
                  background: "#E94E1B",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 4,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#d43e0f")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#E94E1B")
                }
              >
                Log in
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          padding: isMobile ? "100px 20px 60px" : "140px 60px 80px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          gap: isMobile ? 40 : 100,
          maxWidth: 1400,
          margin: "0 auto",
          minHeight: isMobile ? "auto" : "100vh",
          position: "relative",
        }}
      >
        <div style={{ flex: 1, width: "100%" }}>
          <h1
            style={{
              fontSize: isMobile ? 40 : 72,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#E94E1B" }}>Detect Deepfakes</span>
            <br />
            <span style={{ color: "#fff" }}>with AI</span>
            <br />
            <span style={{ color: "#fff" }}>Technology</span>
          </h1>
          <p
            style={{
              fontSize: isMobile ? 15 : 17,
              color: "#999",
              margin: isMobile ? "24px 0 0 0" : "32px 0 48px 0",
              lineHeight: 1.7,
              maxWidth: 520,
            }}
          >
            Verify image authenticity using advanced machine learning. Protect
            yourself from manipulated media with our state-of-the-art detection
            system.
          </p>
          {isMobile && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "32px 0",
              }}
            >
              <div
                style={{
                  width: 280,
                  height: 280,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: -10,
                    width: 40,
                    height: 40,
                    borderTop: "2px solid rgba(255,255,255,0.3)",
                    borderLeft: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderTop: "2px solid rgba(255,255,255,0.3)",
                    borderRight: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -10,
                    left: -10,
                    width: 40,
                    height: 40,
                    borderBottom: "2px solid rgba(255,255,255,0.3)",
                    borderLeft: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    width: 40,
                    height: 40,
                    borderBottom: "2px solid rgba(255,255,255,0.3)",
                    borderRight: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <img
                  src="/hero-illustration.png"
                  alt="AI Face Detection Mesh"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>
          )}
          <div
            style={{ display: "flex", gap: isMobile ? 12 : 16, width: "100%" }}
          >
            <button
              onClick={onNavigateToDetection}
              style={{
                background: "#E94E1B",
                color: "#fff",
                border: "none",
                padding: isMobile ? "14px 20px" : "18px 40px",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: isMobile ? 14 : 16,
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(233,78,27,0.3)",
                whiteSpace: "nowrap",
                flex: isMobile ? 1 : "0 1 auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#d43e0f";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#E94E1B";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Try Detection
            </button>
            <button
              onClick={() => scrollToSection("how-to-use")}
              style={{
                background: "transparent",
                color: "#fff",
                border: "2px solid #666",
                padding: isMobile ? "14px 20px" : "18px 40px",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: isMobile ? 14 : 16,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                flex: isMobile ? 1 : "0 1 auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#E94E1B";
                e.currentTarget.style.color = "#E94E1B";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#666";
                e.currentTarget.style.color = "#fff";
              }}
            >
              Learn More
            </button>
          </div>
        </div>
        {!isMobile && (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 500,
                height: 500,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: -10,
                  width: 60,
                  height: 60,
                  borderTop: "2px solid rgba(255,255,255,0.3)",
                  borderLeft: "2px solid rgba(255,255,255,0.3)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  right: -10,
                  width: 60,
                  height: 60,
                  borderTop: "2px solid rgba(255,255,255,0.3)",
                  borderRight: "2px solid rgba(255,255,255,0.3)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: -10,
                  width: 60,
                  height: 60,
                  borderBottom: "2px solid rgba(255,255,255,0.3)",
                  borderLeft: "2px solid rgba(255,255,255,0.3)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  right: -10,
                  width: 60,
                  height: 60,
                  borderBottom: "2px solid rgba(255,255,255,0.3)",
                  borderRight: "2px solid rgba(255,255,255,0.3)",
                }}
              />
              <img
                src="/hero-illustration.png"
                alt="AI Face Detection Mesh"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 40px rgba(233,78,27,0.2))",
                }}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── ABOUT ── */}
      <section
        id="about"
        style={{
          padding: isMobile ? "60px 20px" : "100px 60px",
          background: "#0d0d0d",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontSize: isMobile ? 36 : 48,
              fontWeight: 700,
              margin: "0 0 60px 0",
            }}
          >
            About <span style={{ color: "#E94E1B" }}>Fact.it</span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: isMobile ? 30 : 40,
            }}
          >
            {[
              {
                icon: <FaShieldAlt size={isMobile ? 30 : 40} color="#fff" />,
                title: "Our Mission",
              },
              {
                icon: <FaRobot size={isMobile ? 30 : 40} color="#fff" />,
                title: "Our Technology",
              },
              {
                icon: <MdSecurity size={isMobile ? 30 : 40} color="#fff" />,
                title: "Our Promise",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#1a1a1a",
                  borderRadius: 12,
                  padding: isMobile ? "40px 30px" : "50px 40px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 24px rgba(233,78,27,0.2)";
                  e.currentTarget.style.background = "#222";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "#1a1a1a";
                }}
              >
                <div
                  style={{
                    width: isMobile ? 60 : 80,
                    height: isMobile ? 60 : 80,
                    margin: "0 auto 24px auto",
                    borderRadius: "50%",
                    background: "#E94E1B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: 700,
                    margin: "0 0 20px 0",
                    color: "#fff",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: isMobile ? 14 : 15,
                    color: "#999",
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  We're on a mission to combat misinformation and protect
                  digital media authenticity. Our AI-powered deepfake detection
                  technology helps individuals and organizations verify image
                  authenticity with confidence.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TO USE ── */}
      <section
        id="how-to-use"
        style={{
          padding: isMobile ? "60px 20px" : "100px 60px",
          background: "#0d0d0d",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? 32 : 48,
            fontWeight: 700,
            margin: isMobile ? "0 0 40px 0" : "0 0 60px 0",
          }}
        >
          How To Use Deepfake Detection
        </h2>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: isMobile ? 30 : 40,
          }}
        >
          {[
            {
              icon: <HiUpload size={28} />,
              title: "Step 1: Upload Your Image",
              visual: (
                <div
                  style={{
                    background: "#2a2a2a",
                    borderRadius: 8,
                    padding: isMobile ? "30px 20px" : "40px",
                    marginBottom: 20,
                    border: "2px dashed #444",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: isMobile ? 120 : 150,
                  }}
                >
                  <HiPhotograph size={isMobile ? 40 : 60} color="#E94E1B" />
                  <div
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      color: "#999",
                      marginTop: 12,
                    }}
                  >
                    Drag & drop an image or click
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? 11 : 12,
                      color: "#666",
                      marginTop: 4,
                    }}
                  >
                    PNG, JPG, up to 3 MB
                  </div>
                </div>
              ),
              text: "Start by uploading the image you want to analyze. You can select a file from your device or simply drag and drop it into the upload area. We support JPG, PNG, and other common image formats. No account is required—just upload your image and continue.",
            },
            {
              icon: <BiAnalyse size={28} />,
              title: "Step 2: Detect Image",
              visual: (
                <div
                  style={{
                    background: "#2a2a2a",
                    borderRadius: 8,
                    padding: isMobile ? "20px" : "30px",
                    marginBottom: 20,
                    minHeight: isMobile ? 120 : 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      background:
                        "linear-gradient(135deg, #333 0%, #2a2a2a 100%)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      padding: "20px",
                    }}
                  >
                    <HiPhotograph size={isMobile ? 50 : 80} color="#444" />
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#E94E1B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color: "#fff",
                      }}
                    >
                      ×
                    </div>
                  </div>
                </div>
              ),
              text: "Once your image is uploaded, our AI system immediately begins analyzing it. The technology examines elements such as lighting, shadows, pixel patterns, and facial details. It then compares these features against a large dataset of real and manipulated images to detect potential deepfake indicators.",
            },
            {
              icon: <HiDocumentText size={28} />,
              title: "Step 3: Review the Detection Report",
              visual: (
                <div
                  style={{
                    background: "#2a2a2a",
                    borderRadius: 8,
                    padding: isMobile ? "15px" : "20px",
                    marginBottom: 20,
                    minHeight: isMobile ? 120 : 150,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <div
                      style={{
                        background: "#1a1a1a",
                        padding: isMobile ? "8px 12px" : "10px 15px",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #E94E1B",
                      }}
                    >
                      <span
                        style={{ fontSize: isMobile ? 11 : 12, color: "#999" }}
                      >
                        Unnatural Eye Reflections
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: "#E94E1B",
                          fontWeight: 600,
                        }}
                      >
                        89%
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#1a1a1a",
                        padding: isMobile ? "8px 12px" : "10px 15px",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #f59e0b",
                      }}
                    >
                      <span
                        style={{ fontSize: isMobile ? 11 : 12, color: "#999" }}
                      >
                        Overly Smooth Skin Texture
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: "#f59e0b",
                          fontWeight: 600,
                        }}
                      >
                        71%
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#1a1a1a",
                        padding: isMobile ? "8px 12px" : "10px 15px",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: "1px solid #666",
                      }}
                    >
                      <span
                        style={{ fontSize: isMobile ? 11 : 12, color: "#999" }}
                      >
                        Greedy Smooth Skin Texture
                      </span>
                      <span
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: "#999",
                          fontWeight: 600,
                        }}
                      >
                        71%
                      </span>
                    </div>
                  </div>
                </div>
              ),
              text: "Within seconds, the system generates an authenticity score that indicates the likelihood of the image being real or manipulated. The results are presented in a clear and user-friendly format, combining visual summary with a more detailed report for those who want deeper insights into the analysis.",
            },
            {
              icon: <HiClock size={28} />,
              title: "Step 4: View History & Download Reports",
              visual: (
                <div
                  style={{
                    background: "#2a2a2a",
                    borderRadius: 8,
                    padding: isMobile ? "15px" : "20px",
                    marginBottom: 20,
                    minHeight: isMobile ? 120 : 150,
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {[
                      { label: "Fake Label", prob: "1%", badge: "Fake" },
                      { label: "Real-Art", prob: "88.7%", badge: "Real" },
                      { label: "Real-Art", prob: "1.0%", badge: "Real" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#1a1a1a",
                          padding: isMobile ? "8px 12px" : "10px 15px",
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: isMobile ? 30 : 40,
                              height: isMobile ? 30 : 40,
                              background: "#333",
                              borderRadius: 4,
                            }}
                          />
                          <span
                            style={{
                              fontSize: isMobile ? 11 : 12,
                              color: "#999",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: isMobile ? 11 : 12,
                              color: "#999",
                            }}
                          >
                            Fake Probability: {item.prob}
                          </span>
                          <span
                            style={{
                              fontSize: isMobile ? 10 : 11,
                              padding: "4px 8px",
                              borderRadius: 4,
                              background:
                                item.badge === "Fake" ? "#E94E1B" : "#10b981",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          >
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ),
              text: "For a more complete experience, you can log in to access your analysis history. This feature allows you to view all previously uploaded images along with their results and reports. You can also download the analysis reports anytime for future reference.",
            },
          ].map((step) => (
            <div
              key={step.title}
              style={{
                background: "#1a1a1a",
                padding: isMobile ? "30px 20px" : "40px",
                borderRadius: 12,
                border: "2px solid #333",
                textAlign: "left",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = "#E94E1B";
                e.currentTarget.style.boxShadow =
                  "0 8px 16px rgba(233,78,27,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "#333";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 20,
                  color: "#E94E1B",
                }}
              >
                {step.icon}
                <h3
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
              </div>
              {step.visual}
              <p
                style={{
                  fontSize: isMobile ? 13 : 14,
                  color: "#999",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        style={{
          padding: isMobile ? "60px 20px" : "80px 60px",
          background: "#0d0d0d",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: isMobile ? 32 : 42,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 16,
              background: "linear-gradient(135deg, #E94E1B 0%, #FF7A50 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            FAQs
          </h2>
          <p
            style={{
              fontSize: isMobile ? 14 : 16,
              color: "#999",
              textAlign: "center",
              maxWidth: 600,
              margin: isMobile ? "0 auto 30px auto" : "0 auto 50px auto",
            }}
          >
            Find answers to common questions about our deepfake detection
            service
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              {
                q: "What is Deepfake?",
                a: "Deepfake detection is the process of using software, usually AI algorithms, to discern whether a piece of media contains a deepfake or otherwise AI-generated elements. It helps prevent misinformation and fraud due to media manipulation.",
              },
              {
                q: "Is the deepfake detector 100% accurate?",
                a: "Our AI model achieves high accuracy rates typically above 90%. However, accuracy can vary depending on the quality and sophistication of the deepfake. The system provides a confidence score with each detection.",
              },
              {
                q: "What file types does the product support?",
                a: "We support common image formats including JPG, JPEG, PNG, and WebP. For best results, we recommend using high-quality images with clear facial features. Maximum file size is 10MB per image.",
              },
              {
                q: "How do I interpret the detection result?",
                a: "Results include a label (Real/Fake), confidence score, and detailed analysis of 7 indicators. Each indicator is scored and categorized as CRITICAL, WARNING, or NORMAL to help you understand the authenticity.",
              },
              {
                q: "Is my data safe?",
                a: "Yes, we take privacy seriously. Images are processed securely and are not stored permanently unless you're logged in and choose to save them. You can delete your history at any time.",
              },
              {
                q: "Is there a free version or trial?",
                a: "Yes! You can use the basic detection feature without an account. Creating a free account allows you to save detection history and download detailed PDF reports.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <FAQItem question={faq.q} answer={faq.a} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#E94E1B",
          padding: isMobile ? "40px 20px" : "50px 60px",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: isMobile ? "flex-start" : "space-between",
              gap: isMobile ? 24 : 0,
              paddingBottom: isMobile ? 24 : 30,
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              marginBottom: isMobile ? 24 : 30,
            }}
          >
            <Logo onClick={scrollToTop} isMobile={isMobile} variant="footer" />
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 12 : 48,
                alignItems: isMobile ? "flex-start" : "center",
              }}
            >
              <a
                onClick={() => scrollToSection("about")}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "opacity 0.2s",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                About Us
              </a>
              <a
                onClick={onNavigateToDetection}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "opacity 0.2s",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Service
              </a>
              <a
                onClick={onNavigateToArticles}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "opacity 0.2s",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Resources
              </a>
              <a
                href="#"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "opacity 0.2s",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Terms
              </a>
              <a
                href="#"
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "opacity 0.2s",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Privacy Policy
              </a>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? 8 : 0,
            }}
          >
            <div style={{ color: "#fff", fontSize: 13 }}>
              © 2025 Fact.it All rights reserved
            </div>
            <div style={{ color: "#fff", fontSize: 13 }}>
              factit.support@gmail.com
            </div>
          </div>
        </div>
      </footer>

      {/* ── BACK TO TOP ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: 40,
            right: 40,
            background: "#fff",
            color: "#1a1a1a",
            border: "2px solid #e0e0e0",
            borderRadius: "50%",
            width: 50,
            height: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
        >
          <FaArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
