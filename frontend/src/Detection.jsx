import React, { useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import Logo from "./components/Logo";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const DEFAULT_API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const MAX_FILES = 10;

function formatPct(x) {
  if (typeof x !== "number" || Number.isNaN(x)) return "-";
  return `${(x * 100).toFixed(2)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ResultCard — komponen terpisah agar expand state lokal per card
// Card tidak akan pindah kolom karena setiap kolom adalah array independen
// ─────────────────────────────────────────────────────────────────────────────
function ResultCard({ item, user, onDownload, expandedResults, onToggleExpand, isMobile }) {
  const isExpanded = !!expandedResults[item.id];

  return (
    <div
      style={{
        background: "#0d0d0d",
        borderRadius: 2,
        border: "1px solid #2a2a2a",
        transition: "border-color 0.3s, box-shadow 0.3s",
        marginBottom: 20,
        alignSelf: "stretch",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
        e.currentTarget.style.borderColor = "#3a3a3a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#2a2a2a";
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 280, background: "#000", borderRadius: "2px", overflow: "hidden" }}>
        <img
          src={item.preview}
          alt={item.filename}
          style={{ width: "100%", height: "100%", objectFit: "contain", opacity: item.error ? 0.3 : 1 }}
        />
        {item.result && (
          <div style={{ position: "absolute", bottom: 20, left: 20, background: item.result.label === "Real" ? "rgba(42, 121, 28, 0.2)" : "rgba(108, 5, 5, 0.2)", color: item.result.label === "Real" ? "#76FF5E" : "#FF4141", padding: "4px 10px", borderRadius: 2, fontSize: 14, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", border: `0.2px solid ${item.result.label === "Real" ? "#76FF5E" : "#FF4141"}`, display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(8px)" }}>
            <img src={item.result.label === "Real" ? "/assets/icons/realIcon.svg" : "/assets/icons/fakeIcon.svg"} alt={item.result.label} style={{ width: 18, height: 18 }} />
            {item.result.label === "Fake" ? "Fake" : "Real"}
          </div>
        )}
        {item.error && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ color: "#FF4141", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Detection Failed</div>
            <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5, maxWidth: 300 }}>{item.error}</div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0E0E0E", borderTop: "1px solid #2a2a2a" }}>
        <div style={{ fontSize: 14, color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.filename}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {item.result && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  e.stopPropagation();
                  e.preventDefault();
                  if (!user) {
                    setTimeout(() => { toast.error("Please login to download detection results", { duration: 4000, icon: "🔒" }); }, 0);
                    return false;
                  }
                  onDownload(item);
                  return false;
                }}
                style={{ background: "#FF4B25", border: "none", color: "#fff", padding: "4px 10px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#d43d0f"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FF4B25"; }}
              >
                <img src="/assets/icons/downloadIcon.svg" alt="Download" style={{ width: 18, height: 18 }} />
                Download
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpand(item.id); }}
                style={{ background: "transparent", border: "none", color: "#fff", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}
              >
                <img src={isExpanded ? "/assets/icons/chevronIcon.svg" : "/assets/icons/chevronIcon.svg"} alt={isExpanded ? "Collapse" : "Expand"} style={{ width: 18, height: 18, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && item.result && (
        <div style={{ padding: 16, background: "#0E0E0E", borderTop: "1px solid #2a2a2a" }}>
          {/* Analysis Summary + Classification Details */}
          <div style={{ padding: 16, background: "#080808", border: "1px solid rgba(238, 238, 238, 0.2)", borderRadius: 2, marginBottom: 16 }}>
            {/* Header with Analysis Summary */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", textAlign: "left", flex: 1 }}>Analysis Summary</div>
            </div>

            {/* Analysis Summary Content */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "#999", margin: 0, textAlign: "justify" }}>
                {item.result.prob_fake > 0.7
                  ? "This image shows strong evidence of AI generation or significant manipulation. Key indicators include unnatural eye reflections and overly smoothed skin textures, along with subtle distortions in facial features. The highly improbable scenario or gathering supports the assessment of fabrication."
                  : item.result.prob_fake > 0.5
                  ? 'This image exhibits characteristic "processed" or "composited" look, where subjects appear to be artificially inserted or heavily altered within a genuine background. Moderate signs of manipulation detected.'
                  : "This image demonstrates a high degree of authenticity with no discernible signs of AI generation or deepfake manipulation. Key indicators include coherent and legible text, natural facial features, and consistent lighting throughout the scene."}
              </p>
            </div>

            {/* Probabilities */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", textAlign: "left" }}>Classification Details</div>
                <div style={{ background: item.result.label === "Real" ? "rgba(42, 121, 28, 0.2)" : "rgba(108, 5, 5, 0.2)", color: item.result.label === "Real" ? "#76FF5E" : "#FF4141", padding: "4px 10px", borderRadius: 2, fontSize: 14, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", border: `0.2px solid ${item.result.label === "Real" ? "#76FF5E" : "#FF4141"}`, display: "flex", alignItems: "center", gap: 4 }}>
                  <img src={item.result.label === "Real" ? "/assets/icons/realIcon.svg" : "/assets/icons/fakeIcon.svg"} alt={item.result.label} style={{ width: 18, height: 18 }} />
                  {item.result.label === "Fake" ? "Fake" : "Real"}
                </div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#999", fontSize: 12 }}>Fake Probability</span>
                    <strong style={{ color: "#FF4141", fontSize: 13 }}>{formatPct(item.result.prob_fake)}</strong>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(item.result.prob_fake * 100).toFixed(2)}%`, height: "100%", background: "linear-gradient(90deg, #EEEEEE 0%, #F79797 40%, #FF4141 100%)", transition: "width 0.5s ease", borderRadius: 4 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: "#999", fontSize: 12 }}>Real Probability</span>
                    <strong style={{ color: "#4ade80", fontSize: 13 }}>{formatPct(1 - item.result.prob_fake)}</strong>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${((1 - item.result.prob_fake) * 100).toFixed(2)}%`, height: "100%", background: "linear-gradient(90deg, #EEEEEE 0%, #B2F7A6 40%, #76FF5E 100%)", transition: "width 0.5s ease", borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            </div>
            {/* Confidence Display */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              {(() => {
                const confidenceLevel = item.result.prob_fake > 0.8 || item.result.prob_fake < 0.2 ? "High" : item.result.prob_fake > 0.6 || item.result.prob_fake < 0.4 ? "Medium" : "Low";
                const confidenceBgColor = confidenceLevel === "High" ? "rgba(20, 108, 5, 0.1)" : confidenceLevel === "Medium" ? "rgba(186, 119, 6, 0.1)" : "rgba(108, 5, 5, 0.1)";
                const confidenceBorderColor = confidenceLevel === "High" ? "#76FF5E" : confidenceLevel === "Medium" ? "#F59E0B" : "#FF4141";
                const confidenceTextColor = confidenceLevel === "High" ? "#76FF5E" : confidenceLevel === "Medium" ? "#F59E0B" : "#FF4141";
                return (
                  <div style={{ padding: "4px 10px", background: confidenceBgColor, border: `0.5px solid ${confidenceBorderColor}`, borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: confidenceTextColor }}>Confidence: {confidenceLevel}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* AI Detection + Real Indicators */}
          {item.result.ai_detection && (() => {
            const aiConfidence = item.result.ai_detection.confidence * 100;
            const aiLevel = aiConfidence > 70 ? "CRITICAL" : aiConfidence > 50 ? "WARNING" : "NORMAL";
            const aiBgColor = aiLevel === "CRITICAL" ? "rgba(108, 5, 5, 0.2)" : aiLevel === "WARNING" ? "rgba(186, 119, 6, 0.2)" : "rgba(20, 108, 5, 0.2)";
            const aiBorderColor = aiLevel === "CRITICAL" ? "rgba(255, 65, 65, 0.5)" : aiLevel === "WARNING" ? "rgba(245, 158, 11, 0.5)" : "rgba(118, 255, 94, 0.5)";
            const aiScoreColor = aiLevel === "CRITICAL" ? "#FF4141" : aiLevel === "WARNING" ? "#F59E0B" : "#76FF5E";
            return (
              <div style={{ padding: 16, background: "#080808", border: "1px solid rgba(238, 238, 238, 0.2)", borderRadius: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", textAlign: "left" }}>Detailed Breakdown</div>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <img src="/assets/icons/infoIcon.svg" alt="Info" style={{ width: 16, height: 16, cursor: "pointer" }} onMouseEnter={(e) => { const tooltip = e.currentTarget.nextSibling; if (tooltip) { tooltip.style.opacity = "1"; tooltip.style.transform = "translateY(0)"; } }} onMouseLeave={(e) => { const tooltip = e.currentTarget.nextSibling; if (tooltip) { tooltip.style.opacity = "0"; tooltip.style.transform = "translateY(-5px)"; } }} />
                    <div style={{ position: "absolute", top: "20px", right: "-6px", width: "320px", padding: "10px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "2px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", opacity: 0, pointerEvents: "none", transition: "opacity 0.2s ease, transform 0.2s ease", zIndex: 1000, fontSize: "12px", lineHeight: "1.6", color: "#ccc", textAlign: "justify", transform: "translateY(-5px)" }}>
                      <div style={{ position: "absolute", top: "-6px", right: "8px", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #333" }}></div>
                      <div style={{ position: "absolute", top: "-5px", right: "8px", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #1a1a1a" }}></div>
                      The Detailed Breakdown provides a clearer explanation of the AI analysis results. Each indicator highlights visual patterns such as skin texture, lighting, reflections, or facial structure that may suggest possible AI-generated or manipulated content.
                    </div>
                  </div>
                </div>
                <div style={{ padding: 12, background: aiBgColor, borderRadius: 6, border: `1px solid ${aiBorderColor}`, marginBottom: 10, transition: "all 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",alignItems:"center", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>AI Generated Content</span>
                    <span style={{ fontSize: 24 , fontWeight: 700, color: aiScoreColor }}>{aiConfidence.toFixed(0)}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5, textAlign: "justify" }}>
                    {item.result.ai_detection.is_ai_generated ? "Strong indicators of AI-generated content detected." : "Low probability of AI generation."}
                  </div>
                </div>
                {(item.result.detailed_analysis?.items || []).map((indicator, iIdx) => {
                  const level = indicator.score > 70 ? "CRITICAL" : indicator.score > 50 ? "WARNING" : "NORMAL";
                  const bgColor = level === "CRITICAL" ? "rgba(108, 5, 5, 0.2)" : level === "WARNING" ? "rgba(186, 119, 6, 0.2)" : "rgba(20, 108, 5, 0.2)";
                  const borderColor = level === "CRITICAL" ? "rgba(255, 65, 65, 0.5)" : level === "WARNING" ? "rgba(245, 158, 11, 0.5)" : "rgba(118, 255, 94, 0.5)";
                  const scoreColor = level === "CRITICAL" ? "#FF4141" : level === "WARNING" ? "#F59E0B" : "#76FF5E";
                  return (
                    <div key={iIdx} style={{ padding: 12, background: bgColor, borderRadius: 6, border: `1px solid ${borderColor}`, marginBottom: iIdx < 6 ? 10 : 0, transition: "all 0.3s ease" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{indicator.name}</span>
                        <span style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: scoreColor }}>{indicator.score}%</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5, textAlign: "justify" }}>{indicator.description}</div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Detection component
// ─────────────────────────────────────────────────────────────────────────────
export default function Detection({
  onNavigateToHome,
  onNavigateToHistory,
  onNavigateToArticles,
  onNavigateToTerms,
  onNavigateToPrivacy,
  onLogin,
  onLogout,
  user,
  detectionResults,
  setDetectionResults,
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const results = detectionResults || [];
  const setResults = setDetectionResults || (() => {});
  const [dragActive, setDragActive] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedResults, setExpandedResults] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const fileInputRef = useRef(null);

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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const canSubmit = useMemo(() => files.length > 0 && !loading, [files, loading]);

  const onPick = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setError("");
    setResults([]);
    const newFilesArray = Array.from(fileList);
    const totalFiles = files.length + newFilesArray.length;
    if (totalFiles > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed. You're trying to add ${newFilesArray.length} more to ${files.length} existing files.`);
      return;
    }
    const newFiles = newFilesArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
    setResults((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResults([]);
    setError("");
    setExpandedResults({});
  };

  const toggleResultExpanded = (id) => {
    setExpandedResults((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExpanded = {};
    results.forEach((result) => { allExpanded[result.id] = true; });
    setExpandedResults(allExpanded);
  };

  const collapseAll = () => { setExpandedResults({}); };

  const downloadResult = async (item) => {
    if (!item.result) { toast.error("No result to download"); return; }
    const freshItem = results.find((r) => r.id === item.id) || item;
    const loadingToast = toast.loading("Generating PDF report...");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");
      let imageData = null;
      try {
        const response = await fetch(freshItem.preview);
        const blob = await response.blob();
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => { resolve(reader.result.split(",")[1]); };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) { console.warn("Failed to convert image to base64:", err); }
      const detectionData = {
        image_name: freshItem.filename,
        result_label: freshItem.result.label,
        prob_fake: freshItem.result.prob_fake,
        model_name: freshItem.result.model_name,
        created_at: new Date().toISOString(),
        image_data: imageData,
        detailed_analysis: freshItem.result.detailed_analysis,
        ai_detection: freshItem.result.ai_detection,
      };
      const response = await fetch(`${DEFAULT_API_BASE}/detection/export-pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ detection: detectionData }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to generate PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = freshItem.filename.replace(/\.[^/.]+$/, "");
      link.download = `${filename}_detection_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF report downloaded successfully!", { id: loadingToast });
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error(err.message || "Failed to download PDF report", { id: loadingToast });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") { setDragActive(true); }
    else if (e.type === "dragleave") { setDragActive(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { onPick(e.dataTransfer.files); }
  };

  const onSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const newResults = [];
      for (let i = 0; i < files.length; i++) {
        setProcessingIndex(i);
        const fileData = files[i];
        try {
          const form = new FormData();
          form.append("file", fileData.file);
          const token = localStorage.getItem("access_token");
          const headers = {};
          if (token) { headers["Authorization"] = `Bearer ${token}`; }
          const isProduction = DEFAULT_API_BASE.includes("railway.app");
          if (isProduction && i === 0) {
            toast.loading("First detection may take 30-60s as server loads AI model...", { id: "production-loading", duration: 60000 });
          }
          const res = await fetch(`${DEFAULT_API_BASE}/predict`, { method: "POST", headers: headers, body: form });
          if (isProduction && i === 0) { toast.dismiss("production-loading"); }
          const data = await res.json().catch(() => null);
          if (!res.ok) { throw new Error(data && data.detail ? String(data.detail) : `Request failed (${res.status})`); }
          console.log("🔍 Detection Response:", data);
          newResults.push({ id: fileData.id, filename: fileData.file.name, preview: fileData.preview, result: data, error: null, timestamp: new Date().toLocaleString() });
        } catch (err) {
          newResults.push({ id: fileData.id, filename: fileData.file.name, preview: fileData.preview, result: null, error: err?.message || "Unknown error", timestamp: new Date().toLocaleString() });
        }
      }
      setResults(newResults);
    } catch (err) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
      setProcessingIndex(-1);
    }
  };

  // ── Split results ke 2 kolom permanen ──
  // index genap → kolom kiri, index ganjil → kolom kanan
  // Card tidak akan pindah kolom meski expand karena kolom adalah flex column terpisah
  const leftColResults = results.filter((_, idx) => idx % 2 === 0);
  const rightColResults = results.filter((_, idx) => idx % 2 !== 0);

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", color: "#fff", display: "flex", flexDirection: "column", margin: 0, position: "relative" }}>

      {/* ── MOBILE SIDEBAR ── */}
      {isMobile && menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 99998, animation: "fadeIn 0.3s ease-in-out" }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "280px", maxWidth: "80vw", background: "#FF4B25", zIndex: 99999, display: "flex", flexDirection: "column", padding: "20px", boxShadow: "-4px 0 24px rgba(0,0,0,0.3)", animation: "slideInRight 0.3s ease-in-out" }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 30, right: 30, background: "transparent", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaTimes />
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 80 }}>
              <a onClick={() => { onNavigateToHome("about"); setMenuOpen(false); }} style={{ color: "#fff", textDecoration: "none", fontSize: 20, fontWeight: 600, cursor: "pointer" }}>About Us</a>
              <a onClick={() => { onNavigateToHome(); setMenuOpen(false); }} style={{ color: "#fff", textDecoration: "none", fontSize: 20, fontWeight: 600, cursor: "pointer" }}>Service</a>
              <a onClick={() => { onNavigateToArticles(); setMenuOpen(false); }} style={{ color: "#fff", textDecoration: "none", fontSize: 20, fontWeight: 600, cursor: "pointer" }}>Resources</a>
            </div>
            <div style={{ marginTop: "auto", paddingBottom: 40 }}>
              {user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Hi,</span> <span style={{ fontWeight: 600 }}>{user.full_name || user.email}</span>
                  </div>
                  <button onClick={() => { onNavigateToHistory(); setMenuOpen(false); }} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "16px", borderRadius: 4, fontWeight: 600, cursor: "pointer", fontSize: 16, width: "100%" }}>History</button>
                </div>
              ) : (
                <button onClick={() => { onNavigateToHome(); setMenuOpen(false); }} style={{ background: "#1a1a1a", color: "#fff", border: "none", padding: "18px", borderRadius: 4, fontWeight: 600, cursor: "pointer", fontSize: 18, width: "100%" }}>Home</button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── NAVBAR ── */}
      <Navbar
        onNavigateToAbout={onNavigateToHome}
        onNavigateToDetection={onNavigateToHome}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToTerms={() => (window.location.hash = "terms")}
        onNavigateToPrivacy={() => (window.location.hash = "privacy")}
        onNavigateToHome={onNavigateToHome}
        onLogin={onLogin}
        user={user}
        onLogout={onLogout}
        isMobile={isMobile}
        activeLink="detection"
      />

      {/* ── MAIN CONTENT ── */}
      <div style={{ padding: isMobile ? "100px 20px 30px" : "140px 60px 40px", textAlign: "center", flex: 1, position: "relative" }}>
        <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 700, margin: "0 0 12px 0", lineHeight: 1.2 }}>Detect Deepfake Images with AI</h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: "#999", margin: "0 0 40px 0" }}>Upload up to {MAX_FILES} images to verify their authenticity using advanced machine learning</p>

        {/* Disclaimer + View History Row */}
        <div style={{ maxWidth: isMobile ? 1100 : 1400, margin: "0 auto 30px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexDirection: isMobile ? "column" : "row", padding: isMobile ? "0" : "0 20px" }}>
          <div style={{ flex: 1, textAlign: "left", padding: isMobile ? "16px" : "20px", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 2}}>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, margin: "0 0 8px 0", color: "#fff" }}>Disclaimer:</h2>
            <p style={{ fontSize: isMobile ? 12 : 14, color: "#999", lineHeight: 1.6, margin: 0 }}>Detection results may be affected by image quality. This AI model primarily analyzes facial regions, and visual noise or distortions can reduce accuracy.</p>
          </div>
          {user && (
            <button onClick={onNavigateToHistory} style={{ background: "transparent", color: "#fff", border: "1px solid #fff", padding: isMobile ? "12px 24px" : "14px 32px", borderRadius: 4, fontWeight: 600, cursor: "pointer", fontSize: isMobile ? 14 : 15, transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0, width: isMobile ? "100%" : "auto" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}>
              View History
            </button>
          )}
        </div>

        {/* Upload Area + Example Images Row */}
        <div style={{ maxWidth: isMobile ? 1100 : 1400, margin: "0 auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 30 : 40, alignItems: "flex-start", padding: isMobile ? "0" : "0 20px" }}>
          {/* Upload Area */}
          <div style={{ flex: 1, width: "100%", order: isMobile ? 2 : 1 }}>
            <div
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onMouseEnter={(e) => { if (files.length === 0) { e.currentTarget.style.borderColor = "#FF4B25"; e.currentTarget.style.transform = "scale(1.01)"; } }}
              onMouseLeave={(e) => { if (files.length === 0) { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.transform = "scale(1)"; } }}
              style={{ border: dragActive ? "3px dashed #FF4B25" : "3px dashed #444", borderRadius: 2, padding: files.length === 1 ? 0 : 80, height: isMobile ? 280 : 380, textAlign: "center", background: dragActive ? "#2a1a15" : "#0d0d0d", transition: "all 0.3s ease", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: files.length === 0 ? "pointer" : "default" }}
            >
              {files.length === 1 ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer", position: "relative" }}>
                  <img src={files[0].preview} alt="Preview" style={{ width: "100%", height: "auto", maxHeight: 400, objectFit: "contain", display: "block" }} />
                  <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.8)", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Click to add more images</div>
                </div>
              ) : null}
              {results.length === 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(files[0].id);
                  }}
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "#000000",
                    border: "0.1px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    zIndex: 10
                  }}
                >
                  <img src="/assets/icons/closeIcon.png" alt="Close" style={{ width: 20, height: 20 }} />
                </button>
              )}
              {files.length === 0 || files.length > 1 ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <img src="/assets/detection/uploadArea.png" alt="Upload Area" style={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, marginBottom: 20, objectFit: "contain" }} />
                  <div style={{ fontSize: isMobile ? 15 : 16, color: "#fff", marginBottom: 8, fontWeight: 500 }}>Drag & drop images or click</div>
                  <div style={{ fontSize: isMobile ? 11 : 12, color: "#666" }}>PNG, JPG up to 10MB each • Max {MAX_FILES} images</div>
                </div>
              ) : null}
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => onPick(e.target.files)} style={{ display: "none" }} />
            </div>
          </div>

          {/* Example Images Section */}
          <div style={{ flex: 1, width: "100%", position: "relative", borderRadius: 2, overflow: "hidden", border: "2px solid #2a2a2a", order: isMobile ? 1 : 2 }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, position: "relative", minHeight: isMobile ? 200 : 380 }}>
                <img src="/assets/detection/real.png" alt="Real Example" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0, 0, 0, 0.8)", padding: isMobile ? "4px 8px" : "8px 16px", borderRadius: 2, backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: isMobile ? 10 : 14, fontWeight: 600, color: "#76FF5E" }}>Real</div>
                </div>
              </div>
              <div style={{ flex: 1, position: "relative", minHeight: isMobile ? 200 : 380 }}>
                <img src="/assets/detection/fake.png" alt="Fake Example" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0, 0, 0, 0.8)", padding: isMobile ? "4px 8px" : "8px 16px", borderRadius: 2, backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: isMobile ? 10 : 14, fontWeight: 600, color: "#FF4141" }}>Fake</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Images - Full Width */}
        {files.length > 0 && results.length === 0 && (
          <div style={{ width: "100%", marginTop: 40, padding: isMobile ? "0" : "0 40px" }}>
            <div style={{ maxWidth: isMobile ? 1100 : 1600, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ color: "#999", fontSize: 14 }}><strong style={{ color: "#fff" }}>{files.length}</strong> image{files.length > 1 ? "s" : ""} selected</div>
                <button onClick={clearAll} style={{ background: "transparent", color: "#FF4141", border: "1px solid #5b1a2e", padding: "8px 16px", borderRadius: 2, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={(e) => { e.currentTarget.style.background = "#2a1120"; e.currentTarget.style.borderColor = "#FF4141"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#5b1a2e"; }}>Clear All<img src="/assets/detection/closeIconRed.png" alt="Clear" style={{ width: 16, height: 16 }} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {files.map((f, idx) => (
                  <div key={f.id} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#FF4B25"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: processingIndex === idx ? "#2a1a15" : "#0d0d0d", borderRadius: 2, border: "1px solid #2a2a2a", transition: "all 0.2s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                      <img src={f.preview} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <div style={{ color: "#fff", fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{f.file.name}</div>
                        <div style={{ color: "#666", fontSize: 12 }}>{(f.file.size / 1024).toFixed(1)} KB{processingIndex === idx && <span style={{ color: "#FF4B25", marginLeft: 8 }}>● Detecting...</span>}</div>
                      </div>
                    </div>
                    <button onClick={() => removeFile(f.id)} disabled={loading} style={{ background: "transparent", color: "#999", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 24, padding: "4px 8px", marginLeft: 16, transition: "all 0.2s", flexShrink: 0 }} onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.transform = "scale(1.2)"; } }} onMouseLeave={(e) => { e.currentTarget.style.color = "#999"; e.currentTarget.style.transform = "scale(1)"; }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detect Now Button */}
        <div style={{ maxWidth: isMobile ? 1100 : 1100, margin: "40px auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <button onClick={onSubmit} disabled={!canSubmit} style={{ width: isMobile ? "100%" : "auto", minWidth: isMobile ? "100" : 300, background: canSubmit ? "#FF4B25" : "#444", color: "#fff", border: "none", padding: "12px 48px", borderRadius: 2, fontWeight: 600, cursor: canSubmit ? "pointer" : "not-allowed", fontSize: 16, transition: "all 0.3s ease", boxShadow: canSubmit ? "0 4px 12px rgba(233, 78, 27, 0.3)" : "none" }} onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.background = "#d43e0f"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(233, 78, 27, 0.4)"; } }} onMouseLeave={(e) => { if (canSubmit) { e.currentTarget.style.background = "#FF4B25"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(233, 78, 27, 0.3)"; } }}>
            {loading ? `Detecting... (${processingIndex + 1}/${files.length})` : `Detect ${files.length > 1 ? `All (${files.length})` : "Now"}`}
          </button>
          {error && <div style={{ width: "100%", maxWidth: 600, padding: 16, background: "#2a1120", border: "1px solid #5b1a2e", borderRadius: 2, color: "#fecaca", fontSize: 14, textAlign: "center" }}><strong>Error:</strong> {error}</div>}
        </div>

        {/* Single Image Result */}
        {results.length === 1 && results[0] && results[0].result && (
          <div className="animate-fade-in-up" style={{ maxWidth: isMobile ? 1100 : 1400, margin: "40px auto 0", padding: isMobile ? "10px" : "20px", background: "#0E0E0E"}}>
            {/* First section: 50/50 split for image and analysis */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20, marginBottom: 20 }}>
              {/* Image - 50% width */}
              <div className="animate-fade-in-up" style={{ width: isMobile ? "100%" : "50%", animationDelay: "0.1s", display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", transition: "all 0.3s ease" }}>
                  <img src={results[0].preview} alt={results[0].filename} style={{ width: "100%", height: isMobile ? 280 : 460, objectFit: "contain", display: "block" }} />
                </div>
              </div>
              {/* Analysis Summary, Classification Result, Confidence - 50% width */}
              <div className="animate-fade-in-up" style={{ width: isMobile ? "100%" : "50%", animationDelay: "0.2s" }}>
                <div className="animate-fade-in-up" style={{ background: "#080808", border: "1px solid #2a2a2a", borderRadius: 2, padding: 20, height: "100%", animationDelay: "0.3s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", textAlign: "left" }}>Analysis Summary</h3>
                    <button type="button" onClick={(e) => { e.stopPropagation(); if (!user) { toast.error("Please login to download detection results", { duration: 4000, icon: "🔒" }); return; } downloadResult(results[0]); }} style={{ background: "#FF4B25", border: "1px solid #FF4B25", color: "#fff", padding: "6px 10px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#d4431a"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#FF4B25"; }}>
                      <img src="/assets/icons/downloadIcon.svg" alt="Download" style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "#999", margin: "0 0 16px 0", textAlign: "justify" }}>
                    Our advanced AI detection system has analyzed this image across multiple dimensions to determine its authenticity. The analysis reveals strong evidence of AI generation or significant digital manipulation based on several key indicators. Primary concerns include unnatural eye reflections that lack the complex light patterns found in genuine photographs, overly smoothed skin textures that eliminate natural pores and imperfections, and subtle geometric distortions in facial features that are characteristic of AI-generated content. Additionally, inconsistencies in lighting, shadows, and background elements further support the assessment of fabrication. The cumulative evidence from these indicators provides a high-confidence determination of the image's authenticity status.
                  </p>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Classification Result</h4>
                      <div style={{ background: results[0].result.label === "Real" ? "rgba(42, 121, 28, 0.2)" : "rgba(108, 5, 5, 0.2)", color: results[0].result.label === "Real" ? "#76FF5E" : "#FF4141", padding: "4px 10px", borderRadius: 2, fontSize: 14, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", border: `0.2px solid ${results[0].result.label === "Real" ? "#76FF5E" : "#FF4141"}`, display: "flex", alignItems: "center", gap: 4 }}>
                        <img src={results[0].result.label === "Real" ? "/assets/icons/realIcon.svg" : "/assets/icons/fakeIcon.svg"} alt={results[0].result.label} style={{ width: 18, height: 18 }} />
                        {results[0].result.label === "Fake" ? "Fake" : "Real"}
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, color: "#999" }}>Fake Probability</span><span style={{ fontSize: 13, fontWeight: 700, color: "#FF4141" }}>{formatPct(results[0].result.prob_fake)}</span></div>
                      <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden" }}><div style={{ background: "linear-gradient(90deg, #EEEEEE 0%, #F79797 40%, #FF4141 100%)", height: "100%", width: `${(results[0].result.prob_fake * 100).toFixed(2)}%`, transition: "width 0.5s ease", borderRadius: 4 }} /></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 13, color: "#999" }}>Real Probability</span><span style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>{(() => { const probReal = results[0].result.prob_real ?? 1 - results[0].result.prob_fake; return formatPct(probReal); })()}</span></div>
                      <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden" }}><div style={{ background: "linear-gradient(90deg, #EEEEEE 0%, #B2F7A6 40%, #76FF5E 100%)", height: "100%", width: (() => { const probReal = results[0].result.prob_real ?? 1 - results[0].result.prob_fake; return `${(probReal * 100).toFixed(2)}%`; })(), transition: "width 0.5s ease", borderRadius: 4 }} /></div>
                    </div>
                  </div>
                  {/* Confidence Display */}
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                    {(() => {
                      const confidenceLevel = results[0].result.prob_fake > 0.8 || results[0].result.prob_fake < 0.2 ? "High" : results[0].result.prob_fake > 0.6 || results[0].result.prob_fake < 0.4 ? "Medium" : "Low";
                      const confidenceBgColor = confidenceLevel === "High" ? "rgba(20, 108, 5, 0.1)" : confidenceLevel === "Medium" ? "rgba(186, 119, 6, 0.1)" : "rgba(108, 5, 5, 0.1)";
                      const confidenceBorderColor = confidenceLevel === "High" ? "#76FF5E" : confidenceLevel === "Medium" ? "#F59E0B" : "#FF4141";
                      const confidenceTextColor = confidenceLevel === "High" ? "#76FF5E" : confidenceLevel === "Medium" ? "#F59E0B" : "#FF4141";
                      return (
                        <div style={{ padding: "4px 10px", background: confidenceBgColor, border: `0.5px solid ${confidenceBorderColor}`, borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: confidenceTextColor }}>Confidence: {confidenceLevel}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            {/* Second section: Detailed Breakdown - 100% width */}
            <div className="animate-fade-in-up" style={{ background: "#080808", border: "1px solid #2a2a2a", borderRadius: 2, padding: 20, animationDelay: "0.4s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Detailed Breakdown</h3>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <img src="/assets/icons/infoIcon.svg" alt="Info" style={{ width: 24, height: 24, cursor: "pointer" }} onMouseEnter={(e) => { const tooltip = e.currentTarget.nextSibling; if (tooltip) { tooltip.style.opacity = "1"; tooltip.style.transform = "translateY(0)"; } }} onMouseLeave={(e) => { const tooltip = e.currentTarget.nextSibling; if (tooltip) { tooltip.style.opacity = "0"; tooltip.style.transform = "translateY(-5px)"; } }} />
                  <div style={{ position: "absolute", top: "28px", right: "-2px", width: "320px", padding: "16px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "2px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", opacity: 0, pointerEvents: "none", transition: "opacity 0.2s ease, transform 0.2s ease", zIndex: 1000, fontSize: "12px", lineHeight: "1.6", color: "#ccc", textAlign: "justify", transform: "translateY(-5px)" }}>
                    <div style={{ position: "absolute", top: "-6px", right: "8px", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #333" }}></div>
                    <div style={{ position: "absolute", top: "-5px", right: "8px", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderBottom: "6px solid #1a1a1a" }}></div>
                    The Detailed Breakdown provides a clearer explanation of the AI analysis results. Each indicator highlights visual patterns such as skin texture, lighting, reflections, or facial structure that may suggest possible AI-generated or manipulated content.
                  </div>
                </div>
              </div>
              {results[0].result.ai_detection && (() => {
                const aiConfidence = results[0].result.ai_detection.confidence * 100;
                const aiLevel = aiConfidence > 70 ? "CRITICAL" : aiConfidence > 50 ? "WARNING" : "NORMAL";
                const aiBgColor = aiLevel === "CRITICAL" ? "rgba(108, 5, 5, 0.2)" : aiLevel === "WARNING" ? "rgba(186, 119, 6, 0.2)" : "rgba(20, 108, 5, 0.2)";
                const aiBorderColor = aiLevel === "CRITICAL" ? "rgba(255, 65, 65, 0.5)" : aiLevel === "WARNING" ? "rgba(245, 158, 11, 0.5)" : "rgba(118, 255, 94, 0.5)";
                const aiScoreColor = aiLevel === "CRITICAL" ? "#FF4141" : aiLevel === "WARNING" ? "#F59E0B" : "#76FF5E";
                return (
                  <div style={{ marginBottom: 12, padding: 12, background: aiBgColor, borderRadius: 2, border: `1px solid ${aiBorderColor}`, transition: "all 0.3s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: isMobile? 14 : 18, fontWeight: 600, textAlign:"left", color: "#fff" }}>AI Generated Content</span>
                      {/* UPDATED: fontSize 24px */}
                      <span style={{ fontSize: isMobile? 20 : 24, fontWeight: 700, color: aiScoreColor }}>{aiConfidence.toFixed(0)}%</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5, textAlign: "justify" }}>{results[0].result.ai_detection.is_ai_generated ? "Strong indicators of AI-generated content detected. Image shows characteristics typical of synthetic generation." : "Low probability of AI generation. Image appears to be authentic or traditionally edited."}</div>
                  </div>
                );
              })()}
              {(results[0].result.detailed_analysis?.items || []).map((indicator, idx) => {
                const level = indicator.score > 70 ? "CRITICAL" : indicator.score > 50 ? "WARNING" : "NORMAL";
                const bgColor = level === "CRITICAL" ? "rgba(108, 5, 5, 0.2)" : level === "WARNING" ? "rgba(186, 119, 6, 0.2)" : "rgba(20, 108, 5, 0.2)";
                const borderColor = level === "CRITICAL" ? "rgba(255, 65, 65, 0.5)" : level === "WARNING" ? "rgba(245, 158, 11, 0.5)" : "rgba(118, 255, 94, 0.5)";
                const scoreColor = level === "CRITICAL" ? "#FF4141" : level === "WARNING" ? "#F59E0B" : "#76FF5E";
                return (
                  <div key={idx} style={{ marginBottom: idx < 6 ? 12 : 0, padding: 12, background: bgColor, borderRadius: 2, border: `1px solid ${borderColor}`, transition: "all 0.3s ease" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems:"center", marginBottom: 6 }}>
                      <span style={{ fontSize: isMobile? 14 : 18, fontWeight: 600, color: "#fff" }}>{indicator.name}</span>
                      <span style={{ fontSize: isMobile? 20 : 24, fontWeight: 700, color: scoreColor }}>{indicator.score}%</span>
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.5, color: "#999", margin: 0, textAlign: "justify" }}>{indicator.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Single Image Result - Failed */}
        {results.length === 1 && results[0] && results[0].error && (
          <div className="animate-fade-in-up" style={{ maxWidth: isMobile ? 1100 : 1200, margin: "40px auto 0", padding: isMobile ? "0" : "0" }}>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 24 }}>
              <div className="animate-fade-in-up" style={{ flex: "0 0 auto", width: isMobile ? "100%" : "380px", animationDelay: "0.1s" }}>
                <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", border: "1px solid #2a2a2a", transition: "all 0.3s ease" }}>
                  <img src={results[0].preview} alt={results[0].filename} style={{ width: "100%", height: isMobile ? 280 : 380, objectFit: "cover", display: "block", opacity: 0.3 }} />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
                    <div style={{ color: "#FF4141", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Detection Failed</div>
                    <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5, maxWidth: 300 }}>{results[0].error}</div>
                  </div>
                </div>
              </div>
              <div className="animate-fade-in-up" style={{ flex: 1, animationDelay: "0.2s" }}>
                <div className="animate-fade-in-up" style={{ background: "#2a1111", border: "1px solid #FF4141", borderRadius: 2, padding: 20, marginBottom: 16, animationDelay: "0.3s" }}>
                  <h3 style={{ margin: "0 0 12px 0", fontSize: 18, fontWeight: 700, color: "#FF4141" }}>Detection Error</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "#ffffff", margin: "0 0 16px 0", textAlign: "justify" }}>
                    We encountered an error while analyzing this image. This could be due to various reasons such as server issues, invalid image format, or network problems. Please try uploading the image again or contact support if the issue persists.
                  </p>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ background: "#1a1a1a", borderRadius: 2, padding: 12, border: "1px solid #3a1a2e" }}>
                      <div style={{ fontSize: 13, color: "#FF4141", wordBreak: "break-word" }}>{results[0].error}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                    <button onClick={() => { removeFile(results[0].id); }} style={{ background: "#FF4B25", border: "1px solid #FF4B25", color: "#fff", padding: "8px 16px", borderRadius: 2, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#d4431a"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#FF4B25"; }}>
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Results */}
        {results.length > 1 && (
          <div className="animate-fade-in" style={{ maxWidth: isMobile ? 1100 : 1200, margin: "40px auto 0", padding: isMobile ? "0" : "0" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              </div>

              {/* Summary Statistics Container */}
              {(() => {
                const successResults = results.filter((r) => r.result && !r.error);
                const fakeCount = successResults.filter((r) => r.result.label === "Fake").length;
                const realCount = successResults.filter((r) => r.result.label === "Real").length;
                const errorCount = results.filter((r) => r.error).length;
                return (
                  <div style={{ maxWidth: isMobile ? 1100 : 1400, margin: "0 auto 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 20 }}>
                    {isMobile ? (
                      <>
                        {/* Mobile: First div - How it works */}
                        <div style={{ width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 2, padding: "16px" }}>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 0, marginBottom: 8 }}>How it works:</h3>
                          <p style={{ fontSize: 10, color: "#999", lineHeight: 1.6, margin: 0 }}>
                            Our AI analyzes each image and gives a confidence score. If the fake confidence is above 50%, the image is classified as Fake. Otherwise, it's classified as Real.
                          </p>
                        </div>
                        {/* Mobile: Second div - Statistics (Total, Real, Fake) */}
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 16 }}>
                          <div style={{ flex: 1, background: "#0d0d0d", border: "1px solid #2a2a2a", padding: "16px", textAlign: "center" }}>
                            <p style={{ fontSize: 10, color: "#fff", marginBottom: 4, fontWeight: 500 }}>Total Detected:</p>
                            <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{results.length}</span>
                          </div>
                          <div style={{ flex: 1, background: "#0d0d0d", border: "1px solid #2a2a2a", padding: "16px", textAlign: "center" }}>
                            <p style={{ fontSize: 10, color: "#76FF5E", marginBottom: 4, fontWeight: 700 }}>Real Detected:</p>
                            <span style={{ fontSize: 24, fontWeight: 700, color: "#76FF5E" }}>{realCount}</span>
                          </div>
                          <div style={{ flex: 1, background: "#0d0d0d", border: "1px solid #2a2a2a", padding: "16px", textAlign: "center" }}>
                            <p style={{ fontSize: 10, color: "#FF4141", marginBottom: 4, fontWeight: 700 }}>Fake Detected:</p>
                            <span style={{ fontSize: 24, fontWeight: 700, color: "#FF4141" }}>{fakeCount}</span>
                          </div>
                        </div>
                        {/* Mobile: Third div - Buttons with space-between */}
                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <button onClick={() => { const allExpanded = results.every((r) => expandedResults[r.id]); if (allExpanded) { collapseAll(); } else { expandAll(); } }} style={{ background: "#2a2a2a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s", flex: 1 }} onMouseEnter={(e) => { e.currentTarget.style.background = "#3a3a3a"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#2a2a2a"; }}>
                            {results.every((r) => expandedResults[r.id]) ? (<>Collapse All<img src="/assets/icons/chevronIcon.svg" alt="Collapse All" style={{ width: 18, height: 18, transform: "rotate(180deg)", transition: "transform 0.2s" }} /></>) : (<>Expand All<img src="/assets/icons/chevronIcon.svg" alt="Expand All" style={{ width: 18, height: 18, transform: "rotate(0deg)", transition: "transform 0.2s" }} /></>)}
                          </button>
                          <button onClick={clearAll} style={{ background: "transparent", color: "#FF4141", border: "1px solid #5b1a2e", padding: "8px 16px", borderRadius: 2, fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onMouseEnter={(e) => { e.currentTarget.style.background = "#2a1120"; e.currentTarget.style.borderColor = "#FF4141"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#5b1a2e"; }}>
                            Clear All<img src="/assets/detection/closeIconRed.png" alt="Clear" style={{ width: 16, height: 16 }} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Desktop: First div - 4 statistics divs */}
                        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "flex-start", alignItems: "center", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 2, padding: "20px", flexDirection: "row", gap: 10, maxWidth: "85%" }}>
                          {/* How it works */}
                          <div style={{ width: "55%", textAlign: "left", paddingRight: 24, borderRight: "1px solid #2a2a2a" }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 0, marginBottom: 8 }}>How it works:</h3>
                            <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6, margin: 0, maxWidth: "580px" }}>
                              Our AI analyzes each image and gives a confidence score. If the fake confidence is above 50%, the image is classified as Fake. Otherwise, it's classified as Real.
                            </p>
                          </div>
                          {/* Total Detection */}
                          <div style={{ width: "15%", textAlign: "left", paddingLeft: 10, paddingRight: 24, borderRight: "1px solid #2a2a2a" }}>
                            <p style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>Total Detected:</p>
                            <span style={{ fontSize: 36, fontWeight: 600, color: "#fff" }}>{results.length}</span>
                          </div>
                          {/* Real Detection */}
                          <div style={{ width: "15%", textAlign: "left", paddingLeft: 10, paddingRight: 24, borderRight: "1px solid #2a2a2a" }}>
                            <p style={{ fontSize: 14, color: "#76FF5E", fontWeight: 500 }}>Real Detected:</p>
                            <span style={{ fontSize: 36, fontWeight: 700, color: "#76FF5E" }}>{realCount}</span>
                          </div>
                          {/* Fake Detection */}
                          <div style={{ width: "15%", textAlign: "left", paddingLeft: 10 }}>
                            <p style={{ fontSize: 14, color: "#FF4141", fontWeight: 500 }}>Fake Detected:</p>
                            <span style={{ fontSize: 36, fontWeight: 700, color: "#FF4141" }}>{fakeCount}</span>
                          </div>
                        </div>
                        {/* Desktop: Second div - Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", flexShrink: 0 }}>
                          <button onClick={() => { const allExpanded = results.every((r) => expandedResults[r.id]); if (allExpanded) { collapseAll(); } else { expandAll(); } }} style={{ background: "#2a2a2a", color: "#fff", border: "none", padding: "8px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s", width: "140px", height: "40px" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#3a3a3a"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "#2a2a2a"; }}>
                            {results.every((r) => expandedResults[r.id]) ? (<>Collapse All<img src="/assets/icons/chevronIcon.svg" alt="Collapse All" style={{ width: 18, height: 18, transform: "rotate(180deg)", transition: "transform 0.2s" }} /></>) : (<>Expand All<img src="/assets/icons/chevronIcon.svg" alt="Expand All" style={{ width: 18, height: 18, transform: "rotate(0deg)", transition: "transform 0.2s" }} /></>)}
                          </button>
                          <button onClick={clearAll} style={{ background: "transparent", color: "#FF4141", border: "1px solid #5b1a2e", padding: "8px 16px", fontSize: 14, cursor: "pointer", fontWeight: 600, transition: "all 0.2s", width: "140px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onMouseEnter={(e) => { e.currentTarget.style.background = "#2a1120"; e.currentTarget.style.borderColor = "#FF4141"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#5b1a2e"; }}>
                            Clear All<img src="/assets/detection/closeIconRed.png" alt="Clear" style={{ width: 16, height: 16 }} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {isMobile ? (
              // Mobile: 1 kolom, semua card berurutan
              <div style={{ display: "flex", flexDirection: "column" }}>
                {results.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    user={user}
                    onDownload={downloadResult}
                    expandedResults={expandedResults}
                    onToggleExpand={toggleResultExpanded}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            ) : (
              // Desktop: 2 kolom permanen menggunakan flexbox
              <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                {/* Kolom Kiri — index genap (0, 2, 4, 6, ...) */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {leftColResults.map((item) => (
                    <ResultCard
                      key={item.id}
                      item={item}
                      user={user}
                      onDownload={downloadResult}
                      expandedResults={expandedResults}
                      onToggleExpand={toggleResultExpanded}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
                {/* Kolom Kanan — index ganjil (1, 3, 5, 7, ...) */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {rightColResults.map((item) => (
                    <ResultCard
                      key={item.id}
                      item={item}
                      user={user}
                      onDownload={downloadResult}
                      expandedResults={expandedResults}
                      onToggleExpand={toggleResultExpanded}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: isMobile ? 80 : 120 }}>
        <Footer
          onNavigateToHome={() => onNavigateToHome("about")}
          onNavigateToDetection={() => onNavigateToHome()}
          onNavigateToArticles={onNavigateToArticles}
          onNavigateToTerms={() => (window.location.hash = "terms")}
          onNavigateToPrivacy={() => (window.location.hash = "privacy")}
          isMobile={isMobile}
          activeLink="detection"
        />
      </div>

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