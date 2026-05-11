import React, { useMemo, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { FaUpload, FaCheckCircle, FaTimesCircle, FaRobot, FaExclamationTriangle, FaInfoCircle, FaChevronDown, FaChevronUp, FaDownload, FaBars, FaTimes } from 'react-icons/fa'
import { HiPhotograph, HiLightningBolt } from 'react-icons/hi'
import { MdDelete, MdWarning, MdInfo } from 'react-icons/md'
import { BiAnalyse } from 'react-icons/bi'
import Logo from './components/Logo'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const MAX_FILES = 10

function formatPct(x) {
  if (typeof x !== 'number' || Number.isNaN(x)) return '-'
  return `${(x * 100).toFixed(2)}%`
}

export default function Detection({ onNavigateToHome, onNavigateToHistory, onNavigateToArticles, onLogin, user }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [processingIndex, setProcessingIndex] = useState(-1)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [expandedResults, setExpandedResults] = useState({})
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef(null)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const canSubmit = useMemo(() => files.length > 0 && !loading, [files, loading])

  const onPick = (fileList) => {
    if (!fileList || fileList.length === 0) return
    setError('')
    setResults([])
    
    const newFilesArray = Array.from(fileList)
    const totalFiles = files.length + newFilesArray.length
    
    if (totalFiles > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed. You're trying to add ${newFilesArray.length} more to ${files.length} existing files.`)
      return
    }
    
    const newFiles = newFilesArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (id) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id)
      const removed = prev.find(f => f.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return filtered
    })
    setResults(prev => prev.filter(r => r.id !== id))
  }

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview))
    setFiles([])
    setResults([])
    setError('')
    setExpandedResults({})
  }

  const toggleResultExpanded = (id) => {
    setExpandedResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const expandAll = () => {
    const allExpanded = {}
    results.forEach(result => {
      allExpanded[result.id] = true
    })
    setExpandedResults(allExpanded)
  }

  const collapseAll = () => {
    setExpandedResults({})
  }

  const downloadResult = async (item) => {
    if (!item.result) {
      toast.error('No result to download')
      return
    }
    
    // Get fresh data from current results state
    const freshItem = results.find(r => r.id === item.id) || item
    
    console.log('[Download PDF] Original item:', item)
    console.log('[Download PDF] Fresh item:', freshItem)
    console.log('[Download PDF] Fresh detailed analysis:', freshItem.result?.detailed_analysis)
    console.log('[Download PDF] Fresh first item score:', freshItem.result?.detailed_analysis?.items?.[0])
    
    const loadingToast = toast.loading('Generating PDF report...')

    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Prepare detection data for PDF (include image)
      let imageData = null
      try {
        // Convert image to base64 for PDF
        const response = await fetch(freshItem.preview)
        const blob = await response.blob()
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            // Remove data URL prefix, keep only base64
            const base64 = reader.result.split(',')[1]
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (err) {
        console.warn('Failed to convert image to base64:', err)
      }

      const detectionData = {
        image_name: freshItem.filename,
        result_label: freshItem.result.label,
        prob_fake: freshItem.result.prob_fake,
        model_name: freshItem.result.model_name,
        created_at: new Date().toISOString(),
        image_data: imageData, // Include base64 image for PDF
        detailed_analysis: freshItem.result.detailed_analysis, // Include real analysis data
        ai_detection: freshItem.result.ai_detection // Include AI detection data
      }

      console.log('[PDF Export] Detection data:', {
        has_detailed_analysis: !!detectionData.detailed_analysis,
        has_ai_detection: !!detectionData.ai_detection,
        detailed_analysis_items: detectionData.detailed_analysis?.items?.length,
        ai_detection_confidence: detectionData.ai_detection?.confidence,
        first_item_score: detectionData.detailed_analysis?.items?.[0]?.score,
        fresh_vs_original: freshItem === item
      })

      const response = await fetch(`${DEFAULT_API_BASE}/detection/export-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ detection: detectionData })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to generate PDF')
      }

      // Get the PDF blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const filename = freshItem.filename.replace(/\.[^/.]+$/, '') // Remove extension
      link.download = `${filename}_detection_report.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF report downloaded successfully!', { id: loadingToast })
    } catch (err) {
      console.error('PDF download error:', err)
      toast.error(err.message || 'Failed to download PDF report', { id: loadingToast })
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onPick(e.dataTransfer.files)
    }
  }

  const onSubmit = async () => {
    if (files.length === 0) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const newResults = []
      
      for (let i = 0; i < files.length; i++) {
        setProcessingIndex(i)
        const fileData = files[i]
        
        try {
          const form = new FormData()
          form.append('file', fileData.file)

          // Get token for authenticated requests
          const token = localStorage.getItem('access_token')
          const headers = {}
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          // Show helpful message for production
          const isProduction = DEFAULT_API_BASE.includes('railway.app')
          if (isProduction && i === 0) {
            toast.loading('First detection may take 30-60s as server loads AI model...', {
              id: 'production-loading',
              duration: 60000
            })
          }

          const res = await fetch(`${DEFAULT_API_BASE}/predict`, {
            method: 'POST',
            headers: headers,
            body: form,
          })
          
          // Dismiss production loading message
          if (isProduction && i === 0) {
            toast.dismiss('production-loading')
          }

          const data = await res.json().catch(() => null)
          if (!res.ok) {
            throw new Error((data && data.detail) ? String(data.detail) : `Request failed (${res.status})`)
          }
          
          // Log detection response for debugging
          console.log('🔍 Detection Response:', data)
          if (data.saved_to_history) {
            console.log('✅ Saved to history! History ID:', data.history_id)
          } else {
            console.log('ℹ️ Not saved to history (user not logged in or error)')
          }
          
          newResults.push({
            id: fileData.id,
            filename: fileData.file.name,
            preview: fileData.preview,
            result: data,
            error: null,
            timestamp: new Date().toLocaleString()
          })
        } catch (err) {
          newResults.push({
            id: fileData.id,
            filename: fileData.file.name,
            preview: fileData.preview,
            result: null,
            error: err?.message || 'Unknown error',
            timestamp: new Date().toLocaleString()
          })
        }
      }
      
      setResults(newResults)
    } catch (err) {
      setError(err?.message || 'Unknown error')
    } finally {
      setLoading(false)
      setProcessingIndex(-1)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', display: 'flex', flexDirection: 'column', margin: 0, position: 'relative' }}>
      {/* ── MOBILE SIDEBAR: overlay + drawer di ROOT level ── */}
      {isMobile && menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 99998,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '80vw',
              background: '#FF5733',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
              animation: 'slideInRight 0.3s ease-in-out'
            }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'absolute',
                top: 30,
                right: 30,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: 28,
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 32,
                marginTop: 80
              }}
            >
              <a
                onClick={() => {
                  onNavigateToHome('about');
                  setMenuOpen(false);
                }}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                About Us
              </a>
              <a
                onClick={() => {
                  onNavigateToHome();
                  setMenuOpen(false);
                }}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer'
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
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 20,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Resources
              </a>
            </div>
            <div style={{ marginTop: 'auto', paddingBottom: 40 }}>
              {user ? (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Hi,</span>{' '}
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
                      background: '#1a1a1a',
                      color: '#fff',
                      border: 'none',
                      padding: '16px',
                      borderRadius: 4,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 16,
                      width: '100%'
                    }}
                  >
                    History
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigateToHome();
                    setMenuOpen(false);
                  }}
                  style={{
                    background: '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    padding: '18px',
                    borderRadius: 4,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 18,
                    width: '100%'
                  }}
                >
                  Home
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── NAVBAR ── */}
      <Navbar 
        onNavigateToAbout={() => onNavigateToHome('about')}
        onNavigateToDetection={() => onNavigateToHome()}
        onNavigateToArticles={onNavigateToArticles}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToTerms={() => {
          window.location.hash = 'terms'
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToPrivacy={() => {
          window.location.hash = 'privacy'
          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
        }}
        onNavigateToHome={onNavigateToHome}
        onLogin={onLogin}
        user={user}
        onLogout={() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          onNavigateToHome()
        }}
        isMobile={isMobile}
        activeLink="detection"
      />


      {/* Hero Section */}
      <div style={{ padding: isMobile ? '100px 20px 30px' : '140px 60px 40px', textAlign: 'center', flex: 1, position: 'relative' }}>
        <h1 style={{ 
          fontSize: isMobile ? 32 : 48, 
          fontWeight: 700, 
          margin: '0 0 12px 0',
          lineHeight: 1.2
        }}>
          Detect Deepfake Images with AI
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: '#999', margin: '0 0 40px 0' }}>
          Upload up to {MAX_FILES} images to verify their authenticity using advanced machine learning
        </p>

        {/* How it works + View History Row */}
        <div style={{ 
          maxWidth: 1100, 
          margin: '0 auto 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <div 
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#E94E1B';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            style={{ 
              flex: 1, 
              textAlign: 'left',
              padding: isMobile ? '16px' : '20px',
              background: '#0d0d0d',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              transition: 'all 0.3s ease'
            }}>
            <h2 style={{ 
              fontSize: isMobile ? 16 : 18, 
              fontWeight: 700, 
              margin: '0 0 8px 0',
              color: '#fff'
            }}>
              How it works:
            </h2>
            <p style={{ 
              fontSize: isMobile ? 12 : 13, 
              color: '#999', 
              lineHeight: 1.6,
              margin: 0
            }}>
              Our AI analyzes each image and gives a confidence score. If the fake confidence is above 50%, the image is classified as Fake. Otherwise, it's classified as Real.
            </p>
          </div>
          
          {user && (
            <button 
              onClick={onNavigateToHistory}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                padding: isMobile ? '12px 24px' : '14px 32px',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: isMobile ? 14 : 15,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                width: isMobile ? '100%' : 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#fff';
              }}
            >
              View History
            </button>
          )}
        </div>

        {/* Upload Area + Example Images Row */}
        <div style={{ 
          maxWidth: isMobile ? '100%' : 1400, 
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 30 : 40,
          alignItems: 'flex-start',
          padding: isMobile ? 0 : '0 20px'
        }}>
          {/* Upload Area */}
          <div style={{ flex: 1, width: '100%', order: isMobile ? 2 : 1 }}>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onMouseEnter={(e) => {
                if (files.length === 0) {
                  e.currentTarget.style.borderColor = '#E94E1B';
                  e.currentTarget.style.transform = 'scale(1.01)';
                }
              }}
              onMouseLeave={(e) => {
                if (files.length === 0) {
                  e.currentTarget.style.borderColor = '#444';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              style={{
                border: dragActive ? '3px dashed #E94E1B' : '3px dashed #444',
                borderRadius: 8,
                padding: files.length === 1 ? 0 : 80,
                height: isMobile ? 280 : 380,
                textAlign: 'center',
                background: dragActive ? '#2a1a15' : '#0d0d0d',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: files.length === 0 ? 'pointer' : 'default'
              }}
            >
              {files.length === 1 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={files[0].preview} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      maxHeight: 400,
                      objectFit: 'contain',
                      display: 'block'
                    }} 
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    Click to add more images
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Modern Upload Icon */}
                  <svg width={isMobile ? 60 : 80} height={isMobile ? 60 : 80} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 20 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#E94E1B" strokeWidth="1.5" fill="none"/>
                    <path d="M12 8V16M12 8L9 11M12 8L15 11" stroke="#E94E1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="9" stroke="#E94E1B" strokeWidth="0.5" opacity="0.3" fill="none"/>
                  </svg>
                  <div style={{ fontSize: isMobile ? 15 : 16, color: '#fff', marginBottom: 8, fontWeight: 500 }}>
                    Drag & drop images or click
                  </div>
                  <div style={{ fontSize: isMobile ? 11 : 12, color: '#666' }}>PNG, JPG up to 10MB each • Max {MAX_FILES} images</div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPick(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>


            {/* Single Image Result moved below Detect Now button */}
            {false && results.length === 1 && results[0] && (
              <div className="animate-fade-in-up" style={{ marginTop: 30 }}>
                <div style={{ 
                  background: '#0d0d0d',
                  borderRadius: 8,
                  border: '1px solid #2a2a2a',
                  overflow: 'hidden',
                  height: isMobile ? 280 : 380
                }}>
                  <div style={{ position: 'relative', height: '100%' }}>
                    <img
                      src={results[0].preview}
                      alt={results[0].filename}
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover',
                        background: '#000'
                      }}
                    />
                    {results[0].result && (
                      <div style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        background: results[0].result.label === 'Real' ? '#2d5016' : '#5b1a2e',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: 6,
                        fontSize: 16,
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                      }}>
                        {results[0].result.label === 'Fake' ? '🚫 Fake' : '✓ Real'}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#fff' }}>
                      {results[0].filename}
                    </div>
                    {results[0].result && (
                      <>
                        {/* Classification Result */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#E94E1B' }}>Classification Result</div>
                          <div style={{ display: 'grid', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 13, color: '#999' }}>Fake Probability</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#f87171' }}>{formatPct(results[0].result.prob_fake)}</span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${results[0].result.prob_fake * 100}%`, height: '100%', background: '#f87171' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ fontSize: 13, color: '#999' }}>Real Probability</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>{formatPct(1 - results[0].result.prob_fake)}</span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${(1 - results[0].result.prob_fake) * 100}%`, height: '100%', background: '#4ade80' }} />
                            </div>
                          </div>
                        </div>

                        {/* Confidence Badge */}
                        {results[0].result.explanation && (
                          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                            <div style={{ 
                              display: 'inline-block',
                              padding: '8px 16px',
                              borderRadius: 6,
                              background: results[0].result.explanation.confidence_level === 'Very High' || results[0].result.explanation.confidence_level === 'High' ? '#1a2e1a' : '#2e2e1a',
                              border: `1px solid ${results[0].result.explanation.confidence_level === 'Very High' || results[0].result.explanation.confidence_level === 'High' ? '#2d5016' : '#5b5b16'}`,
                              fontSize: 13,
                              fontWeight: 600
                            }}>
                              Confidence: {results[0].result.explanation.confidence_level}
                            </div>
                          </div>
                        )}

                        {/* Detailed Breakdown */}
                        {results[0].result.detailed_analysis && (
                          <div style={{ marginTop: 16, padding: 16, background: '#0a0a0a', borderRadius: 8, border: '1px solid #2a2a2a' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#E94E1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <BiAnalyse size={16} />
                              <span>Detailed Breakdown</span>
                            </div>
                            
                            {/* Percentage Explanation */}
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 12, padding: 10, background: '#141414', borderRadius: 6, border: '1px solid #2a2a2a' }}>
                              <strong style={{ color: '#E94E1B' }}>How to read:</strong> Each indicator shows a <strong>suspicion score (0-100%)</strong>. Higher percentages indicate stronger signs of manipulation. CRITICAL (red) means high concern, WARNING (orange) means moderate concern, NORMAL (gray) means low concern.
                            </div>
                            
                            {/* Analysis Summary */}
                            <div style={{ fontSize: 12, color: '#ccc', marginBottom: 16, lineHeight: 1.6, padding: 12, background: '#141414', borderRadius: 6 }}>
                              {results[0].result.detailed_analysis.summary}
                            </div>

                            {/* AI Generated Percentage */}
                            {results[0].result.ai_detection && (() => {
                              const aiConfidence = results[0].result.ai_detection.confidence * 100;
                              const aiLevel = aiConfidence > 70 ? 'CRITICAL' : aiConfidence > 50 ? 'WARNING' : 'NORMAL';
                              const aiBgColor = aiLevel === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' :
                                                aiLevel === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' :
                                                'rgba(64, 64, 64, 0.1)';
                              const aiBorderColor = aiLevel === 'CRITICAL' ? '#dc2626' :
                                                    aiLevel === 'WARNING' ? '#f59e0b' :
                                                    '#404040';
                              const aiScoreColor = aiLevel === 'CRITICAL' ? '#f87171' :
                                                   aiLevel === 'WARNING' ? '#fbbf24' :
                                                   '#4ade80';
                              
                              return (
                                <div style={{ 
                                  padding: 12, 
                                  background: aiBgColor,
                                  borderRadius: 6,
                                  border: `2px solid ${aiBorderColor}`,
                                  marginBottom: 10,
                                  transition: 'all 0.2s'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                                      AI Generated Content
                                    </span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: aiScoreColor }}>
                                      {aiConfidence.toFixed(0)}%
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5 }}>
                                    {results[0].result.ai_detection.is_ai_generated 
                                      ? 'Strong indicators of AI-generated content detected. Image shows characteristics typical of synthetic generation.'
                                      : 'Low probability of AI generation. Image appears to be authentic or traditionally edited.'}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Analysis Items */}
                            <div style={{ display: 'grid', gap: 10 }}>
                              {results[0].result.detailed_analysis.items.map((analysisItem, idx) => {
                                const bgColor = analysisItem.level === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' :
                                               analysisItem.level === 'WARNING' ? 'rgba(245, 158, 11, 0.1)' :
                                               'rgba(64, 64, 64, 0.1)';
                                const borderColor = analysisItem.level === 'CRITICAL' ? '#dc2626' :
                                                   analysisItem.level === 'WARNING' ? '#f59e0b' :
                                                   '#404040';
                                const scoreColor = analysisItem.level === 'CRITICAL' ? '#f87171' :
                                                  analysisItem.level === 'WARNING' ? '#fbbf24' :
                                                  '#4ade80';
                                
                                return (
                                  <div key={idx} style={{ 
                                    padding: 12, 
                                    background: bgColor,
                                    borderRadius: 6,
                                    border: `2px solid ${borderColor}`,
                                    transition: 'all 0.2s'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                                        {analysisItem.name}
                                      </span>
                                      <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>
                                        {analysisItem.score.toFixed(0)}%
                                      </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5 }}>
                                      {analysisItem.description}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                          <button
                            onClick={() => downloadResult(results[0])}
                            style={{
                              flex: 1,
                              background: '#E94E1B',
                              color: '#fff',
                              border: 'none',
                              padding: '12px 24px',
                              borderRadius: 6,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8
                            }}
                          >
                            <FaDownload size={14} />
                            Download Report
                          </button>
                          <button
                            onClick={clearAll}
                            style={{
                              flex: 1,
                              background: 'transparent',
                              color: '#f87171',
                              border: '1px solid #5b1a2e',
                              padding: '12px 24px',
                              borderRadius: 6,
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8
                            }}
                          >
                            Clear & Upload New
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Example Images Section */}
          <div 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(233, 78, 27, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            style={{ 
              flex: 1,
              width: '100%',
              height: isMobile ? 280 : 380,
              position: 'relative',
              borderRadius: 8,
              overflow: 'hidden',
              border: '2px solid #2a2a2a',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              order: isMobile ? 1 : 2
            }}>
            <div style={{ 
              display: 'flex',
              height: '100%'
            }}>
              {/* Real Example - Left Half */}
              <div style={{ 
                flex: 1,
                position: 'relative',
                height: '100%'
              }}>
                <img 
                  src="/assets/examples/fake example.png"
                  alt="Fake Example"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  background: 'rgba(0, 0, 0, 0.6)',
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  borderRadius: 4,
                  backdropFilter: 'blur(8px)'
                }}>
                  <div style={{ 
                    fontSize: isMobile ? 11 : 12, 
                    fontWeight: 600, 
                    color: '#4ade80'
                  }}>
                    Real
                  </div>
                </div>
              </div>

              {/* Fake Example - Right Half */}
              <div style={{ 
                flex: 1,
                position: 'relative',
                height: '100%'
              }}>
                <img 
                  src="/assets/examples/real example.png"
                  alt="Real Example"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  background: 'rgba(0, 0, 0, 0.6)',
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  borderRadius: 4,
                  backdropFilter: 'blur(8px)'
                }}>
                  <div style={{ 
                    fontSize: isMobile ? 11 : 12, 
                    fontWeight: 600, 
                    color: '#f87171'
                  }}>
                    Fake
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Images - Full Width */}
        {files.length > 0 && results.length === 0 && (
          <div style={{ 
            width: '100%',
            marginTop: 40,
            padding: isMobile ? '0 20px' : '0 40px'
          }}>
            <div style={{ 
              maxWidth: 1600,
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ color: '#999', fontSize: 14 }}>
                  <strong style={{ color: '#fff' }}>{files.length}</strong> image{files.length > 1 ? 's' : ''} selected
                </div>
                <button
                  onClick={clearAll}
                  style={{
                    background: 'transparent',
                    color: '#f87171',
                    border: '1px solid #5b1a2e',
                    padding: '8px 16px',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2a1120';
                    e.currentTarget.style.borderColor = '#f87171';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#5b1a2e';
                  }}
                >
                  Clear All
                </button>
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                {files.map((f, idx) => (
                  <div 
                    key={f.id} 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#E94E1B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a';
                    }}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: processingIndex === idx ? '#2a1a15' : '#0d0d0d',
                      borderRadius: 6,
                      border: '1px solid #2a2a2a',
                      transition: 'all 0.2s ease'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                      <img 
                        src={f.preview} 
                        alt="" 
                        style={{ 
                          width: 60, 
                          height: 60, 
                          objectFit: 'cover', 
                          borderRadius: 4,
                          flexShrink: 0
                        }} 
                      />
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                          {f.file.name}
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          {(f.file.size / 1024).toFixed(1)} KB
                          {processingIndex === idx && <span style={{ color: '#E94E1B', marginLeft: 8 }}>● Processing...</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(f.id)}
                      disabled={loading}
                      style={{
                        background: 'transparent',
                        color: '#999',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: 24,
                        padding: '4px 8px',
                        marginLeft: 16,
                        transition: 'all 0.2s',
                        flexShrink: 0
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.color = '#f87171';
                          e.currentTarget.style.transform = 'scale(1.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#999';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detect Now Button - Centered */}
        <div style={{ 
          maxWidth: 1100, 
          margin: '40px auto 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20
        }}>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? 'auto' : 300,
              background: canSubmit ? '#E94E1B' : '#444',
              color: '#fff',
              border: 'none',
              padding: '16px 48px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontSize: 16,
              transition: 'all 0.3s ease',
              boxShadow: canSubmit ? '0 4px 12px rgba(233, 78, 27, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (canSubmit) {
                e.currentTarget.style.background = '#d43e0f';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(233, 78, 27, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (canSubmit) {
                e.currentTarget.style.background = '#E94E1B';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 78, 27, 0.3)';
              }
            }}
          >
            {loading ? `Detecting... (${processingIndex + 1}/${files.length})` : `Detect ${files.length > 1 ? `All (${files.length})` : 'Now'}`}
          </button>

          {error && (
            <div style={{ 
              width: '100%',
              maxWidth: 600,
              padding: 16, 
              background: '#2a1120', 
              border: '1px solid #5b1a2e',
              borderRadius: 8,
              color: '#fecaca',
              fontSize: 14,
              textAlign: 'center'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Single Image Result - Below Detect Now */}
        {results.length === 1 && results[0] && results[0].result && (
          <div className="animate-fade-in-up" style={{ maxWidth: 1200, margin: '40px auto 0', padding: isMobile ? '0 20px' : '0' }}>
            <div style={{ 
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 24
            }}>
              {/* Left: Image */}
              <div className="animate-fade-in-up" style={{ flex: '0 0 auto', width: isMobile ? '100%' : '380px', animationDelay: '0.1s' }}>
                <div style={{ 
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #2a2a2a',
                  transition: 'all 0.3s ease'
                }}>
                  <img
                    src={results[0].preview}
                    alt={results[0].filename}
                    style={{ 
                      width: '100%', 
                      height: isMobile ? 280 : 380,
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              </div>

              {/* Right: Analysis */}
              <div className="animate-fade-in-up" style={{ flex: 1, animationDelay: '0.2s' }}>
                {/* Analysis Summary */}
                <div className="animate-fade-in-up" style={{ 
                  background: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 16,
                  animationDelay: '0.3s'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                    Analysis Summary
                  </h3>
                  <p style={{ 
                    fontSize: 13, 
                    lineHeight: 1.6, 
                    color: '#999', 
                    margin: '0 0 16px 0',
                    textAlign: 'justify'
                  }}>
                    Our advanced AI detection system has analyzed this image across multiple dimensions to determine its authenticity. The analysis reveals strong evidence of AI generation or significant digital manipulation based on several key indicators. Primary concerns include unnatural eye reflections that lack the complex light patterns found in genuine photographs, overly smoothed skin textures that eliminate natural pores and imperfections, and subtle geometric distortions in facial features that are characteristic of AI-generated content. Additionally, inconsistencies in lighting, shadows, and background elements further support the assessment of fabrication. The cumulative evidence from these indicators provides a high-confidence determination of the image's authenticity status.
                  </p>

                  {/* Classification Result */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 8
                    }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                        Classification Result
                      </h4>
                      <div style={{
                        background: results[0].result.label === 'Real' ? '#1a3a1a' : '#3a1a1a',
                        color: results[0].result.label === 'Real' ? '#4ade80' : '#f87171',
                        padding: '4px 12px',
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 600,
                        border: `1px solid ${results[0].result.label === 'Real' ? '#2d5016' : '#5b1a2e'}`
                      }}>
                        {results[0].result.label === 'Fake' ? '🚫 Fake' : '✓ Real'}
                      </div>
                    </div>

                    {/* Probabilities */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#f87171' }}>Fake Probability</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f87171' }}>
                          {formatPct(results[0].result.prob_fake)}
                        </span>
                      </div>
                      <div style={{ 
                        background: '#1a1a1a',
                        borderRadius: 4,
                        height: 6,
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          background: '#f87171',
                          height: '100%',
                          width: `${(results[0].result.prob_fake * 100).toFixed(2)}%`,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: '#4ade80' }}>Real Probability</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>
                          {(() => {
                            const probReal = results[0].result.prob_real ?? (1 - results[0].result.prob_fake);
                            return formatPct(probReal);
                          })()}
                        </span>
                      </div>
                      <div style={{ 
                        background: '#1a1a1a',
                        borderRadius: 4,
                        height: 6,
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          background: '#4ade80',
                          height: '100%',
                          width: (() => {
                            const probReal = results[0].result.prob_real ?? (1 - results[0].result.prob_fake);
                            return `${(probReal * 100).toFixed(2)}%`;
                          })(),
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Confidence Badge & Download Button */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#1a3a1a',
                      color: '#4ade80',
                      padding: '6px 12px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid #2d5016'
                    }}>
                      Confidence: High
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          toast.error('Please login to download detection results', {
                            duration: 4000,
                            icon: '🔒'
                          });
                          return;
                        }
                        downloadResult(results[0]);
                      }}
                      style={{
                        background: '#E94E1B',
                        border: '1px solid #E94E1B',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#d4431a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#E94E1B';
                      }}
                      title="Download result as JSON"
                    >
                      <FaDownload size={12} />
                      Download Result
                    </button>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="animate-fade-in-up" style={{ 
                  background: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  padding: 20,
                  animationDelay: '0.4s'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 16
                  }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
                      Detailed Breakdown
                    </h3>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <FaInfoCircle 
                        style={{ color: '#666', fontSize: 16, cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const tooltip = e.currentTarget.nextSibling;
                          if (tooltip) tooltip.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          const tooltip = e.currentTarget.nextSibling;
                          if (tooltip) tooltip.style.opacity = '0';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '30px',
                        right: 0,
                        width: '320px',
                        padding: '16px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease',
                        zIndex: 1000,
                        fontSize: '12px',
                        lineHeight: '1.6',
                        color: '#ccc',
                        textAlign: 'justify'
                      }}>
                        The Detailed Breakdown provides a clearer explanation of the AI analysis results. Each indicator highlights visual patterns such as skin texture, lighting, reflections, or facial structure that may suggest possible AI-generated or manipulated content. The percentage shows the AI's confidence level for each indicator.
                      </div>
                    </div>
                  </div>

                  {/* AI Generated Content */}
                  {results[0].result.ai_detection && (() => {
                    const aiConfidence = results[0].result.ai_detection.confidence * 100;
                    const aiLevel = aiConfidence > 70 ? 'CRITICAL' : aiConfidence > 50 ? 'WARNING' : 'NORMAL';
                    const aiBgColor = aiLevel === 'CRITICAL' ? 'rgba(220, 38, 38, 0.05)' :
                                      aiLevel === 'WARNING' ? 'rgba(245, 158, 11, 0.05)' :
                                      'rgba(34, 197, 94, 0.05)';
                    const aiBorderColor = aiLevel === 'CRITICAL' ? 'rgba(91, 26, 46, 0.3)' :
                                          aiLevel === 'WARNING' ? 'rgba(58, 42, 26, 0.3)' :
                                          'rgba(26, 58, 26, 0.3)';
                    const aiScoreColor = aiLevel === 'CRITICAL' ? '#f87171' :
                                         aiLevel === 'WARNING' ? '#fb923c' :
                                         '#4ade80';

                    return (
                      <div style={{ 
                        marginBottom: 12,
                        padding: 12,
                        background: aiBgColor,
                        borderRadius: 6,
                        border: `1px solid ${aiBorderColor}`,
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                            AI Generated Content
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: aiScoreColor }}>
                            {aiConfidence.toFixed(0)}%
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5, textAlign: 'justify' }}>
                          {results[0].result.ai_detection.is_ai_generated 
                            ? 'Strong indicators of AI-generated content detected. Image shows characteristics typical of synthetic generation.'
                            : 'Low probability of AI generation. Image appears to be authentic or traditionally edited.'}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Real detailed indicators from backend */}
                  {(results[0].result.detailed_analysis?.items || []).map((indicator, idx) => {
                    const level = indicator.score > 70 ? 'CRITICAL' : indicator.score > 50 ? 'WARNING' : 'NORMAL';
                    const bgColor = level === 'CRITICAL' ? 'rgba(220, 38, 38, 0.05)' :
                                    level === 'WARNING' ? 'rgba(245, 158, 11, 0.05)' :
                                    'rgba(34, 197, 94, 0.05)';
                    const borderColor = level === 'CRITICAL' ? 'rgba(91, 26, 46, 0.3)' :
                                        level === 'WARNING' ? 'rgba(58, 42, 26, 0.3)' :
                                        'rgba(26, 58, 26, 0.3)';
                    const scoreColor = level === 'CRITICAL' ? '#f87171' :
                                       level === 'WARNING' ? '#fb923c' :
                                       '#4ade80';

                    return (
                      <div key={idx} style={{ 
                        marginBottom: idx < 6 ? 12 : 0,
                        padding: 12,
                        background: bgColor,
                        borderRadius: 6,
                        border: `1px solid ${borderColor}`,
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                            {indicator.name}
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>
                            {indicator.score}%
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: 11, 
                          lineHeight: 1.5, 
                          color: '#999', 
                          margin: 0,
                          textAlign: 'justify'
                        }}>
                          {indicator.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Area - Shown below upload section */}
        {results.length > 0 && results.length > 1 && (
          <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '40px auto 0', padding: isMobile ? '0 20px' : '0' }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Results ({results.length})</h3>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        const allExpanded = results.every(r => expandedResults[r.id])
                        if (allExpanded) {
                          collapseAll()
                        } else {
                          expandAll()
                        }
                      }}
                      style={{
                        background: '#2a2a2a',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {results.every(r => expandedResults[r.id]) ? (
                        <>
                          <FaChevronUp size={12} />
                          Collapse All
                        </>
                      ) : (
                        <>
                          <FaChevronDown size={12} />
                          Expand All
                        </>
                      )}
                    </button>
                    <button
                      onClick={clearAll}
                      style={{
                        background: 'transparent',
                        color: '#f87171',
                        border: '1px solid #5b1a2e',
                        padding: '8px 16px',
                        borderRadius: 4,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Summary Statistics */}
                {(() => {
                  const successResults = results.filter(r => r.result && !r.error)
                  const fakeCount = successResults.filter(r => r.result.label === 'Fake').length
                  const realCount = successResults.filter(r => r.result.label === 'Real').length
                  const errorCount = results.filter(r => r.error).length
                  
                  return (
                    <div style={{ 
                      background: '#0d0d0d',
                      padding: 16,
                      borderRadius: 8,
                      border: '1px solid #2a2a2a',
                      marginBottom: 20,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 16
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#f87171' }}>{fakeCount}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Fake Detected</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#4ade80' }}>{realCount}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Real Detected</div>
                      </div>
                      {errorCount > 0 && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>{errorCount}</div>
                          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Failed</div>
                        </div>
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{results.length}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Total Processed</div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Grid Layout for Results */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(450px, 1fr))',
                gap: 20
              }}>
                {results.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="animate-fade-in-up"
                    style={{ 
                      background: '#0d0d0d',
                      borderRadius: 8,
                      border: '1px solid #2a2a2a',
                      transition: 'all 0.3s ease',
                      animationDelay: `${idx * 0.1}s`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: 280, background: '#000', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
                      <img
                        src={item.preview}
                        alt={item.filename}
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          objectFit: 'contain',
                          opacity: item.error ? 0.3 : 1
                        }}
                      />
                      {item.result && (
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: item.result.label === 'Real' ? '#2d5016' : '#5b1a2e',
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: 4,
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                          border: `1px solid ${item.result.label === 'Real' ? '#4ade80' : '#f87171'}`
                        }}>
                          {item.result.label === 'Fake' ? 'Fake' : 'Real'}
                        </div>
                      )}
                      {item.error && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.85)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 20,
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: 48,
                            marginBottom: 12
                          }}>⚠️</div>
                          <div style={{
                            color: '#f87171',
                            fontSize: 16,
                            fontWeight: 700,
                            marginBottom: 8
                          }}>Detection Failed</div>
                          <div style={{
                            color: '#ccc',
                            fontSize: 13,
                            lineHeight: 1.5,
                            maxWidth: 300
                          }}>{item.error}</div>
                        </div>
                      )}
                    </div>
                    {/* Card Footer */}
                    <div style={{ 
                      padding: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#0a0a0a',
                      borderTop: '1px solid #2a2a2a'
                    }}>
                      <div style={{ 
                        fontSize: 14, 
                        color: '#fff', 
                        fontWeight: 600, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        flex: 1,
                        marginRight: 12
                      }}>
                        {item.filename}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {item.result && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.nativeEvent.stopImmediatePropagation()
                                e.stopPropagation()
                                e.preventDefault()
                                
                                // Immediate check before async call
                                if (!user) {
                                  // Use setTimeout to ensure toast appears before any navigation
                                  setTimeout(() => {
                                    toast.error('Please login to download detection results', {
                                      duration: 4000,
                                      icon: '🔒'
                                    })
                                  }, 0)
                                  return false
                                }
                                downloadResult(item)
                                return false
                              }}
                              style={{
                                background: '#2a2a2a',
                                border: '1px solid #3a3a3a',
                                color: '#fff',
                                padding: '6px 12px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                fontSize: 11,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#E94E1B'
                                e.currentTarget.style.borderColor = '#E94E1B'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#2a2a2a'
                                e.currentTarget.style.borderColor = '#3a3a3a'
                              }}
                              title="Download result as JSON"
                            >
                              <FaDownload size={13} />
                              Download
                            </button>
                            <button
                              onClick={() => toggleResultExpanded(item.id)}
                              style={{
                                background: '#2a2a2a',
                                border: '1px solid #3a3a3a',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: 4,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              {expandedResults[item.id] ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Detailed Breakdown - Expandable */}
                    {expandedResults[item.id] && item.result && (
                      <div style={{ padding: 16, background: '#0a0a0a', borderTop: '1px solid #2a2a2a' }}>
                        {/* Analysis Summary */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#fff' }}>
                            Analysis Summary
                          </div>
                          <p style={{ 
                            fontSize: 12, 
                            lineHeight: 1.6, 
                            color: '#999', 
                            margin: 0,
                            textAlign: 'justify'
                          }}>
                            {item.result.prob_fake > 0.7 
                              ? 'This image shows strong evidence of AI generation or significant manipulation. Key indicators include unnatural eye reflections and overly smoothed skin textures, along with subtle distortions in facial features. The highly improbable scenario or gathering supports the assessment of fabrication.'
                              : item.result.prob_fake > 0.5
                              ? 'This image exhibits characteristic "processed" or "composited" look, where subjects appear to be artificially inserted or heavily altered within a genuine background. Moderate signs of manipulation detected.'
                              : 'This image demonstrates a high degree of authenticity with no discernible signs of AI generation or deepfake manipulation. Key indicators include coherent and legible text, natural facial features, and consistent lighting throughout the scene.'}
                          </p>
                        </div>

                        {/* Probabilities */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#fff' }}>
                            Classification Details
                          </div>
                          <div style={{ display: 'grid', gap: 10 }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#999', fontSize: 12 }}>Fake Probability</span>
                                <strong style={{ color: '#f87171', fontSize: 13 }}>{formatPct(item.result.prob_fake)}</strong>
                              </div>
                              <div style={{ width: '100%', height: 6, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${(item.result.prob_fake * 100).toFixed(2)}%`, height: '100%', background: '#f87171', transition: 'width 0.5s ease' }}></div>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#999', fontSize: 12 }}>Real Probability</span>
                                <strong style={{ color: '#4ade80', fontSize: 13 }}>{formatPct(1 - item.result.prob_fake)}</strong>
                              </div>
                              <div style={{ width: '100%', height: 6, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${((1 - item.result.prob_fake) * 100).toFixed(2)}%`, height: '100%', background: '#4ade80', transition: 'width 0.5s ease' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI Detection */}
                        {item.result.ai_detection && (() => {
                          const aiConfidence = item.result.ai_detection.confidence * 100;
                          const aiLevel = aiConfidence > 70 ? 'CRITICAL' : aiConfidence > 50 ? 'WARNING' : 'NORMAL';
                          const aiBgColor = aiLevel === 'CRITICAL' ? 'rgba(220, 38, 38, 0.05)' :
                                            aiLevel === 'WARNING' ? 'rgba(245, 158, 11, 0.05)' :
                                            'rgba(34, 197, 94, 0.05)';
                          const aiBorderColor = aiLevel === 'CRITICAL' ? 'rgba(91, 26, 46, 0.3)' :
                                                aiLevel === 'WARNING' ? 'rgba(58, 42, 26, 0.3)' :
                                                'rgba(26, 58, 26, 0.3)';
                          const aiScoreColor = aiLevel === 'CRITICAL' ? '#f87171' :
                                               aiLevel === 'WARNING' ? '#fb923c' :
                                               '#4ade80';

                          return (
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#fff' }}>
                                Detailed Breakdown
                              </div>
                              
                              {/* AI Generated Content */}
                              <div style={{ 
                                padding: 12,
                                background: aiBgColor,
                                borderRadius: 6,
                                border: `1px solid ${aiBorderColor}`,
                                marginBottom: 10,
                                transition: 'all 0.3s ease'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>AI Generated Content</span>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: aiScoreColor }}>{aiConfidence.toFixed(0)}%</span>
                                </div>
                                <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5, textAlign: 'justify' }}>
                                  {item.result.ai_detection.is_ai_generated 
                                    ? 'Strong indicators of AI-generated content detected.'
                                    : 'Low probability of AI generation.'}
                                </div>
                              </div>

                              {/* Real Indicators from backend */}
                              {(item.result.detailed_analysis?.items || []).map((indicator, idx) => {
                                const level = indicator.score > 70 ? 'CRITICAL' : indicator.score > 50 ? 'WARNING' : 'NORMAL';
                                const bgColor = level === 'CRITICAL' ? 'rgba(220, 38, 38, 0.05)' :
                                                level === 'WARNING' ? 'rgba(245, 158, 11, 0.05)' :
                                                'rgba(34, 197, 94, 0.05)';
                                const borderColor = level === 'CRITICAL' ? 'rgba(91, 26, 46, 0.3)' :
                                                    level === 'WARNING' ? 'rgba(58, 42, 26, 0.3)' :
                                                    'rgba(26, 58, 26, 0.3)';
                                const scoreColor = level === 'CRITICAL' ? '#f87171' :
                                                   level === 'WARNING' ? '#fb923c' :
                                                   '#4ade80';

                                return (
                                  <div key={idx} style={{ 
                                    padding: 12,
                                    background: bgColor,
                                    borderRadius: 6,
                                    border: `1px solid ${borderColor}`,
                                    marginBottom: idx < 6 ? 10 : 0,
                                    transition: 'all 0.3s ease'
                                  }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{indicator.name}</span>
                                      <span style={{ fontSize: 14, fontWeight: 700, color: scoreColor }}>{indicator.score}%</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5, textAlign: 'justify' }}>
                                      {indicator.description}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
          </div>
        )}
      </div>


      <div style={{ marginTop: isMobile ? 80 : 120 }}>
        <Footer 
          onNavigateToHome={onNavigateToHome}
          onNavigateToDetection={() => onNavigateToHome()}
          onNavigateToArticles={onNavigateToArticles}
          onNavigateToTerms={() => {
            window.location.hash = 'terms'
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
          }}
          onNavigateToPrivacy={() => {
            window.location.hash = 'privacy'
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
          }}
          isMobile={isMobile}
          activeLink="detection"
        />
      </div>
    </div>
  )
}
