import React, { useEffect } from "react";
import {
  FaShieldAlt,
  FaRobot,
  FaPlus,
  FaMinus,
  FaTimes,
} from "react-icons/fa";

import { MdSecurity } from "react-icons/md";
import Logo from "./components/Logo";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 2,
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
          <FaMinus size={16} color="#FF4B25" />
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
  onNavigateToTerms,
  onNavigateToPrivacy,
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
              background: "#FF4B25",
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
                Detection
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
              <a
                onClick={() => {
                  window.location.hash = 'terms';
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
                Terms
              </a>
              <a
                onClick={() => {
                  window.location.hash = 'privacy';
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
                Privacy
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

      {/* ── NAVBAR ── */}
      <Navbar 
        onNavigateToAbout={() => scrollToSection("about")}
        onNavigateToDetection={onNavigateToDetection}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToHistory={user ? onNavigateToHistory : null}
        onNavigateToTerms={() => window.location.hash = 'terms'}
        onNavigateToPrivacy={() => window.location.hash = 'privacy'}
        onNavigateToHome={scrollToTop}
        user={user}
        onLogout={onLogout}
        onLogin={onNavigateToLogin}
        isMobile={isMobile}
        activeLink="about"
      />

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
            <span style={{ color: "#FF4B25" }}>Detect Deepfakes</span>
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
                    top: 10,
                    left: 10,
                    width: 20,
                    height: 20,
                    borderTop: "2px solid rgba(255,255,255,0.3)",
                    borderLeft: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 20,
                    height: 20,
                    borderTop: "2px solid rgba(255,255,255,0.3)",
                    borderRight: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    width: 20,
                    height: 20,
                    borderBottom: "2px solid rgba(255,255,255,0.3)",
                    borderLeft: "2px solid rgba(255,255,255,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    width: 20,
                    height: 20,
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
                    maxWidth: 280,
                    maxHeight: 280,
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
                background: "#FF4B25",
                color: "#fff",
                border: "none",
                padding: isMobile ? "14px 20px" : "18px 40px",
                borderRadius: 4,
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
                e.currentTarget.style.background = "#FF4B25";
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
                borderRadius: 4,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: isMobile ? 14 : 16,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                flex: isMobile ? 1 : "0 1 auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#FF4B25";
                e.currentTarget.style.color = "#FF4B25";
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
          <h1
            style={{
              fontSize: isMobile ? 36 : 48,
              fontWeight: 700,
              margin: "0 0 16px 0",
            }}
          >
            About <span style={{ color: "#FF4B25" }}>Fact.it</span>
          </h1>
          <h2
            style={{
              fontSize: isMobile ? 14 : 16,
              fontWeight: 500,
              color: "#999",
              textAlign: "center",
              maxWidth: 800,
              margin: isMobile ? "0 auto 60px auto" : "0 auto 60px auto",
            }}
          >
            Learn about our mission, technology, and commitment to protecting digital media authenticity
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
                description: "Fact.it was created to help people identify manipulated and AI-generated images more easily. As deepfake technology becomes increasingly realistic, our mission is to support digital awareness, reduce misinformation, and help users make more informed decisions when consuming visual content online.",
              },
              {
                icon: <FaRobot size={isMobile ? 30 : 40} color="#fff" />,
                title: "Detection Technology",
                description: "Our platform uses Convolutional Neural Network (CNN) technology to analyze visual patterns such as facial structure, lighting consistency, skin texture, and image artifacts. Through AI-powered detection and visual analysis, Fact.it helps users understand whether an image may contain signs of manipulation.",
              },
              {
                icon: <MdSecurity size={isMobile ? 30 : 40} color="#fff" />,
                title: "Privacy & Accessibility",
                description: "Fact.it is designed to be accessible, easy to use, and privacy-conscious. We do not display ads, use tracking analytics, or include payment systems. Uploaded images are processed only for detection purposes, allowing users to securely analyze and download their detection results with confidence.",
              },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#1a1a1a",
                  borderRadius: 2,
                  padding: isMobile ? "40px 30px" : "50px 40px",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  cursor: isMobile ? "default" : "pointer",
                }}
                {...!isMobile && {
                  onMouseEnter: (e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 24px rgba(233,78,27,0.2)";
                    e.currentTarget.style.background = "#222";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "#1a1a1a";
                  }
                }}
              >
                <div
                  style={{
                    width: isMobile ? 60 : 80,
                    height: isMobile ? 60 : 80,
                    margin: "0 auto 24px auto",
                    borderRadius: "50%",
                    background: "#FF4B25",
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
                    fontSize: isMobile ? 12 : 14,
                    color: "#999",
                    lineHeight: 1.8,
                    margin: 0,
                  }}
                >
                  {card.description}
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
            margin: isMobile ? "0 0 16px 0" : "0 0 16px 0",
          }}
        >
          How To Use Deepfake Detection
        </h2>
        <h2
          style={{
            fontSize: isMobile ? 14 : 16,
            fontWeight: 500,
            color: "#999",
            textAlign: "center",
            maxWidth: 800,
            margin: isMobile ? "0 auto 40px auto" : "0 auto 60px auto",
          }}
        >
          Detect manipulated or AI-generated images quickly by following these simple steps.
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
              icon: <img src="/assets/howToUse/icon1.png" alt="Upload" style={{ width: 28, height: 28 }} />,
              title: "Step 1: Upload Your Image",
              visual: (
                <div
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 2,
                    padding: isMobile ? "20px" : "30px",
                    marginBottom: 20,
                    minHeight: isMobile ? 120 : 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img 
                    src="/assets/howToUse/howToUse1.png" 
                    alt="Upload Image" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ),
              text: "Start by uploading the image you want to analyze. You can select a file from your device or simply drag and drop it into the upload area. We support JPG, PNG, and other common image formats. No account is required—just upload your image and continue.",
            },
            {
              icon: <img src="/assets/howToUse/icon2.png" alt="Detect" style={{ width: 28, height: 28 }} />,
              title: "Step 2: Detect Image",
              visual: (
                <div
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 2,
                    padding: isMobile ? "20px" : "30px",
                    marginBottom: 20,
                    minHeight: isMobile ? 120 : 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img 
                    src="/assets/howToUse/howToUse2.png" 
                    alt="Detect Image" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ),
              text: "Once your image is uploaded, our AI system immediately begins analyzing it. The technology examines elements such as lighting, shadows, pixel patterns, and facial details. It then compares these features against a large dataset of real and manipulated images to detect potential deepfake indicators.",
            },
            {
              icon: <img src="/assets/howToUse/icon3.png" alt="Review" style={{ width: 28, height: 28 }} />,
              title: "Step 3: Review the Detection Report",
              visual: (
                <div
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 2,
                    padding: isMobile ? "20px" : "30px",
                    marginBottom: 20,
                    minHeight: isMobile ? 120 : 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img 
                    src="/assets/howToUse/howToUse3.png" 
                    alt="Review Detection Report" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ),
              text: "Within seconds, the system generates an authenticity score that indicates the likelihood of the image being real or manipulated. The results are presented in a clear and user-friendly format, combining visual summary with a more detailed report for those who want deeper insights into the analysis.",
            },
            {
              icon: <img src="/assets/howToUse/icon4.png" alt="History" style={{ width: 28, height: 28 }} />,
              title: "Step 4: View History & Download Reports",
              visual: (
                <div
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 2,
                    padding: isMobile ? "20px" : "30px",
                    marginBottom: 20,
                    minHeight: isMobile ? 120 : 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img 
                    src="/assets/howToUse/howToUse4.png" 
                    alt="View History & Download Reports" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ),
              text: "For a more complete experience, you can log in to access your analysis history. This feature allows you to view all previously uploaded images along with their results and reports. You can also download the analysis reports anytime for future reference.",
            },
          ].map((step) => (
            <div
              key={step.title}
              style={{
                background: "linear-gradient(180deg, rgba(255,75,37,0.05) 0%, rgba(36,36,36,0.05) 100%)",
                padding: isMobile ? "20px 20px" : "30px",
                borderRadius: 0,
                border: "0.6px solid #292929",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                textAlign: "left",
              }}
            >
              {step.visual}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 20,
                  marginBottom: 20,
                  color: "#FF4B25",
                }}
              >
                <div
                  style={{
                    width: isMobile ? 50 : 60,
                    height: isMobile ? 50 : 60,
                    borderRadius: 0,
                    // background: "rgba(255,75,37,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {step.icon}
                </div>
                <h3
                  style={{
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: 700,
                    margin: 0,
                    color: "#fff",
                  }}
                >
                  {step.title}
                </h3>
              </div>
              <p
                style={{
                  fontSize: isMobile ? 13 : 14,
                  color: "#fff",
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
          <h1
            style={{
              fontSize: isMobile ? 32 : 42,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 16,
              color: "#ffffff",
            }}
          >
            FAQs
          </h1>
          <h2
            style={{
              fontSize: isMobile ? 14 : 16,
              fontWeight: 500,
              color: "#999",
              textAlign: "center",
              maxWidth: 800,
              margin: isMobile ? "0 auto 30px auto" : "0 auto 50px auto",
            }}
          >
            Find answers to common questions about our deepfake detection
            service
          </h2>
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

      <Footer 
        onNavigateToHome={scrollToTop}
        onNavigateToDetection={onNavigateToDetection}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToTerms={onNavigateToTerms}
        onNavigateToPrivacy={onNavigateToPrivacy}
        isMobile={isMobile}
      />

      {/* ── BACK TO TOP ── */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: 40,
            right: 40,
            background: "#FF4B25",
            color: "#ffffff",
            border: "1px solid #ffffff",
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
          <img src="/assets/icons/arrowUp.svg" alt="Back to top" style={{ width: 24, height: 24 }} />
        </button>
      )}
    </div>
  );
}