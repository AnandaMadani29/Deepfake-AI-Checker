import { useState, useEffect, useRef } from "react";
import { FaArrowRight, FaClock, FaUser, FaTimes } from "react-icons/fa";
import { HiSearch } from "react-icons/hi";
import Logo from "./components/Logo";
import { articles, categories, getArticlesByCategory } from "./articlesData";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Articles({
  onNavigateToArticleDetail,
  onNavigateToHome,
  onNavigateToDetection,
  onNavigateToTerms,
  onNavigateToPrivacy,
  onLogin,
  user,
  onLogout,
  onNavigateToHistory,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tempSearch, setTempSearch] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const articlesGridRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const filteredArticles = getArticlesByCategory(selectedCategory).filter(
    (article) => {
      const title = article.title.toLowerCase().trim();
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return title.includes(query);
    },
  );

  const featuredArticle = articles[0];

  const gridArticles = filteredArticles;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a1a",
        color: "#fff",
        position: "relative",
      }}
    >
      {/* ── MOBILE SIDEBAR ── */}
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
                onClick={() => {
                  onNavigateToHome("about");
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
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: "default",
                }}
              >
                Resources
              </a>
            </div>
            <div style={{ marginTop: "auto", paddingBottom: 40 }}>
              <button
                onClick={() => {
                  onNavigateToHome();
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
                Home
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── NAVBAR ── */}
      <Navbar
        onNavigateToAbout={() => onNavigateToHome("about")}
        onNavigateToDetection={onNavigateToDetection}
        onNavigateToArticles={() => {}}
        onNavigateToHistory={user ? onNavigateToHistory : null}
        onNavigateToTerms={() => {
          window.location.hash = "terms";
          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
        }}
        onNavigateToPrivacy={() => {
          window.location.hash = "privacy";
          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
        }}
        onNavigateToHome={onNavigateToHome}
        onLogin={onLogin}
        user={user}
        onLogout={onLogout}
        isMobile={isMobile}
        activeLink="resources"
      />

      {/* Hero Section */}
      <section
        style={{
          padding: isMobile ? "100px 20px 60px" : "140px 60px 80px",
          textAlign: "center",
          background: "#0d0d0d",
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? 36 : 56,
            fontWeight: 700,
            margin: "0 0 16px 0",
            lineHeight: 1.2,
          }}
        >
          Resources
        </h1>
        <p
          style={{
            fontSize: isMobile ? 14 : 16,
            color: "#999",
            maxWidth: 600,
            margin: "0 auto 40px auto",
            lineHeight: 1.6,
          }}
        >
          Learn about deepfake detection, stay updated with the latest news, and
          discover best practices for digital media verification
        </p>
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <input
            type="text"
            placeholder="Search articles..."
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchQuery(tempSearch);
                setTimeout(
                  () =>
                    articlesGridRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    }),
                  100,
                );
              }
            }}
            style={{
              flex: 1,
              padding: "16px 20px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={() => {
              setSearchQuery(tempSearch);
              setTimeout(
                () =>
                  articlesGridRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  }),
                100,
              );
            }}
            style={{
              background: "#FF4B25",
              border: "none",
              padding: "16px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#d43e0f")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FF4B25")}
          >
            <HiSearch size={18} color="#fff" />
          </button>
        </div>
      </section>

      {/* Latest Post */}
      <section
        style={{
          padding: isMobile ? "40px 20px" : "60px 60px",
          background: "#000",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: isMobile ? 24 : 32,
              fontWeight: 700,
              marginBottom: 30,
            }}
          >
            Latest Post
          </h2>
          <div
            onClick={() => onNavigateToArticleDetail(featuredArticle.id)}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 6 : 40,
              background: "#0d0d0d",
              borderRadius: 2,
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid #2a2a2a",
              transition: "border-color 0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "#FF4B25")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#2a2a2a")
            }
          >
            <div
              style={{
                background: "#2a2a2a",
                minHeight: isMobile ? 200 : 350,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:14px;">Image not available</div>';
                }}
              />
            </div>
            <div style={{ padding: isMobile ? 20 : 40 }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "#FF4B25",
                  color: "#fff",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                {featuredArticle.category}
              </div>
              <h3
                style={{
                  fontSize: isMobile ? 20 : 28,
                  fontWeight: 700,
                  margin: "0 0 16px 0",
                  lineHeight: 1.3,
                }}
              >
                {featuredArticle.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#999",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                {featuredArticle.excerpt}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 20,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FaClock size={12} />
                  {featuredArticle.readTime}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FaUser size={12} />
                  {featuredArticle.author}
                </span>
                <span>{featuredArticle.date}</span>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#FF4B25",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Read More <FaArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section
        style={{
          padding: isMobile ? "20px 20px 0" : "40px 60px 0",
          background: "#000",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: isMobile ? 16 : 40,
              overflowX: "auto",
              paddingBottom: 16,
              justifyContent: "center",
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: selectedCategory === category ? "#FF4B25" : "#999",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "8px 0",
                  borderBottom:
                    selectedCategory === category
                      ? "2px solid #FF4B25"
                      : "2px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section
        ref={articlesGridRef}
        style={{
          padding: isMobile ? "40px 20px" : "60px 60px",
          background: "#000",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {gridArticles.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#666" }}>
              No articles found matching your search.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(350px, 1fr))",
                gap: 30,
              }}
            >
              {gridArticles.map((article, idx) => (
                <div
                  key={article.id}
                  className="animate-fade-in-up"
                  onClick={() => onNavigateToArticleDetail(article.id)}
                  style={{
                    background: "#0d0d0d",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid #2a2a2a",
                    transition: "transform 0.3s, border-color 0.3s",
                    animationDelay: `${idx * 0.1}s`,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#E94E1B";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#2a2a2a";
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      background: "#2a2a2a",
                      height: 200,
                      overflow: "hidden",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={article.image}
                      alt={article.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:12px;">Image not available</div>';
                      }}
                    />
                  </div>

                  {/* Card Content — category + title + excerpt + metadata */}
                  <div
                    style={{
                      padding: "24px 24px 0 24px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Category badge */}
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        background: "#FF4B25",
                        color: "#fff",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        alignSelf: "flex-start",
                        flexShrink: 0,
                      }}
                    >
                      {article.category}
                    </div>

                    {/* Title — no line clamp */}
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        margin: "0 0 8px 0",
                        lineHeight: 1.4,
                        flexShrink: 0,
                      }}
                    >
                      {article.title}
                    </h3>

                    {/* Excerpt — 2 line clamp */}
                    <p
                      style={{
                        fontSize: 13,
                        color: "#999",
                        lineHeight: 1.6,
                        margin: "0 0 12px 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {article.excerpt}
                    </p>

                    {/* Metadata */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          fontSize: 11,
                          color: "#666",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <FaClock size={10} />
                          {article.readTime}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <FaUser size={10} />
                          {article.author}
                        </span>
                        <span>{article.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Spacer — gap kosong selalu di antara konten dan Read More */}
                  <div style={{ flexGrow: 1 }} />

                  {/* Read More — di luar fixed div, selalu sejajar antar card */}
                  <div
                    style={{
                      padding: "16px 24px 24px 24px",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#FF4B25",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Read More <FaArrowRight size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer
        onNavigateToHome={onNavigateToHome}
        onNavigateToDetection={onNavigateToDetection}
        onNavigateToArticles={() => {}}
        onNavigateToTerms={onNavigateToTerms}
        onNavigateToPrivacy={onNavigateToPrivacy}
        isMobile={isMobile}
        activeLink="resources"
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
          <img
            src="/assets/icons/arrowUp.svg"
            alt="Back to top"
            style={{ width: 24, height: 24 }}
          />
        </button>
      )}
    </div>
  );
}