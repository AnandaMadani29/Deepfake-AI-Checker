import React, { useMemo, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { FaUpload, FaCheckCircle, FaTimesCircle, FaRobot, FaExclamationTriangle, FaInfoCircle, FaChevronDown, FaChevronUp, FaDownload } from 'react-icons/fa'
import { HiPhotograph, HiLightningBolt } from 'react-icons/hi'
import { MdDelete, MdWarning, MdInfo } from 'react-icons/md'
import { BiAnalyse } from 'react-icons/bi'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const MAX_FILES = 10

function formatPct(x) {
  if (typeof x !== 'number' || Number.isNaN(x)) return '-'
  return `${(x * 100).toFixed(2)}%`
}

export default function Detection({ onNavigateToHome, onNavigateToHistory, user }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [processingIndex, setProcessingIndex] = useState(-1)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [expandedResults, setExpandedResults] = useState({})
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
    
    const loadingToast = toast.loading('Generating PDF report...')

    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Prepare detection data for PDF
      const detectionData = {
        image_name: item.filename,
        result_label: item.result.label,
        prob_fake: item.result.prob_fake,
        model_name: item.result.model_name,
        created_at: new Date().toISOString()
      }

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
      const filename = item.filename.replace(/\.[^/.]+$/, '') // Remove extension
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
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', display: 'flex', flexDirection: 'column', margin: 0 }}>
      {/* Navbar */}
      <nav style={{ 
        background: '#0d0d0d', 
        padding: isMobile ? '16px 20px' : '20px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <div 
          onClick={() => onNavigateToHome()}
          style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}
        >
          Fact.it
        </div>
        <div style={{ display: isMobile ? 'none' : 'flex', gap: 40, alignItems: 'center' }}>
          <a onClick={() => onNavigateToHome('about')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>About us</a>
          <a onClick={() => onNavigateToHome('services')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>Services</a>
          <a onClick={() => onNavigateToHome('how-to-use')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer' }}>How To Use</a>
          <button 
            onClick={() => onNavigateToHome()}
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
            Home
          </button>
        </div>
      </nav>

      {/* History Button - Top Right */}
      {user && (
        <div style={{ 
          position: 'absolute', 
          top: isMobile ? '70px' : '80px', 
          right: isMobile ? '20px' : '60px',
          zIndex: 10
        }}>
          <button 
            onClick={onNavigateToHistory}
            style={{
              background: '#E94E1B',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 14,
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
            View History
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div style={{ padding: isMobile ? '40px 20px 30px' : '60px 60px 40px', textAlign: 'center', flex: 1, position: 'relative' }}>
        <h1 style={{ 
          fontSize: isMobile ? 32 : 48, 
          fontWeight: 700, 
          margin: '0 0 12px 0',
          lineHeight: 1.2
        }}>
          Detect Deepfake Images with AI
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: '#999', margin: '0 0 12px 0' }}>
          Upload up to {MAX_FILES} images to verify their authenticity using advanced machine learning
        </p>
        <div style={{ 
          maxWidth: 700, 
          margin: '0 auto 32px auto',
          padding: isMobile ? '10px 16px' : '12px 20px',
          background: '#0d0d0d',
          borderRadius: 6,
          border: '1px solid #2a2a2a',
          fontSize: isMobile ? 12 : 13,
          color: '#999',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: 600, color: '#E94E1B', marginBottom: 6 }}>ℹ️ How it works:</div>
          Our AI analyzes each image and gives a <strong style={{ color: '#fff' }}>confidence score</strong>. 
          If the Fake confidence is <strong style={{ color: '#fff' }}>above 50%</strong>, the image is classified as <strong style={{ color: '#f87171' }}>Fake</strong>. 
          Otherwise, it's classified as <strong style={{ color: '#4ade80' }}>Real</strong>.
        </div>

        {/* Main Content */}
        <div style={{ 
          maxWidth: 1100, 
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 30 : 40,
          alignItems: 'flex-start'
        }}>
          {/* Upload Area */}
          <div style={{ flex: 1 }}>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: dragActive ? '3px dashed #E94E1B' : '3px dashed #444',
                borderRadius: 8,
                padding: 80,
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? '#2a1a15' : '#0d0d0d',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: 60, marginBottom: 16 }}>☁️</div>
              <div style={{ fontSize: 16, color: '#ccc', marginBottom: 8 }}>
                Drag & drop images or click
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>PNG, JPG up to 10MB each • Max {MAX_FILES} images</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPick(e.target.files)}
                style={{ display: 'none' }}
              />
            </div>

            {files.length > 0 && results.length === 0 && (
              <div style={{ marginTop: 20, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ color: '#999', fontSize: 14 }}>
                    <strong style={{ color: '#fff' }}>{files.length}</strong> image{files.length > 1 ? 's' : ''} selected
                  </div>
                  <button
                    onClick={clearAll}
                    style={{
                      background: 'transparent',
                      color: '#f87171',
                      border: '1px solid #5b1a2e',
                      padding: '6px 12px',
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', display: 'grid', gap: 8 }}>
                  {files.map((f, idx) => (
                    <div key={f.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: processingIndex === idx ? '#2a1a15' : '#0d0d0d',
                      borderRadius: 4,
                      border: '1px solid #2a2a2a'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                        <img src={f.preview} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#fff', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {f.file.name}
                          </div>
                          <div style={{ color: '#666', fontSize: 11 }}>
                            {(f.file.size / 1024).toFixed(1)} KB
                            {processingIndex === idx && <span style={{ color: '#E94E1B', marginLeft: 8 }}>Processing...</span>}
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
                          fontSize: 18,
                          padding: 4
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              style={{
                marginTop: 30,
                width: '100%',
                background: canSubmit ? '#E94E1B' : '#444',
                color: '#fff',
                border: 'none',
                padding: '14px 24px',
                borderRadius: 4,
                fontWeight: 600,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontSize: 16
              }}
            >
              {loading ? `Detecting... (${processingIndex + 1}/${files.length})` : `Detect ${files.length > 1 ? `All (${files.length})` : 'Now'}`}
            </button>

            {error && (
              <div style={{ 
                marginTop: 20, 
                padding: 16, 
                background: '#2a1120', 
                border: '1px solid #5b1a2e',
                borderRadius: 8,
                color: '#fecaca',
                fontSize: 14
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Results Area */}
          {results.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Results ({results.length})</h3>
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
                {/* Expand/Collapse Controls */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 12, 
                  marginBottom: 16 
                }}>
                  <button
                    onClick={expandAll}
                    style={{
                      background: '#2a2a2a',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FaChevronDown size={12} />
                    Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    style={{
                      background: '#2a2a2a',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <FaChevronUp size={12} />
                    Collapse All
                  </button>
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
              <div style={{ maxHeight: 600, overflowY: 'auto', display: 'grid', gap: 20 }}>
                {results.map((item) => (
                  <div key={item.id} style={{ 
                    background: '#0d0d0d',
                    borderRadius: 8,
                    border: '1px solid #2a2a2a',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={item.preview}
                        alt={item.filename}
                        style={{ 
                          width: '100%', 
                          maxHeight: 250,
                          objectFit: 'contain',
                          background: '#000'
                        }}
                      />
                      {item.result && (
                        <div style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 12,
                          background: item.result.label === 'Real' ? '#2d5016' : '#5b1a2e',
                          color: '#fff',
                          padding: '6px 14px',
                          borderRadius: 4,
                          fontSize: 14,
                          fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                        }}>
                          {item.result.label}
                        </div>
                      )}
                    </div>
                    {/* Collapsible Header */}
                    <div 
                      style={{ 
                        padding: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 100%)',
                        borderBottom: expandedResults[item.id] ? '1px solid #2a2a2a' : 'none',
                        transition: 'background 0.3s'
                      }}
                    >
                      <div 
                        onClick={() => toggleResultExpanded(item.id)}
                        style={{ 
                          fontSize: 14, 
                          color: '#fff', 
                          fontWeight: 600, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          flex: 1,
                          cursor: 'pointer'
                        }}
                      >
                        {item.filename}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12,
                        marginLeft: 12
                      }}>
                        {item.result && (
                          <>
                            <div style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 12px',
                              borderRadius: 20,
                              background: item.result.label === 'Real' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                              border: `1px solid ${item.result.label === 'Real' ? '#4ade80' : '#f87171'}`
                            }}>
                              {item.result.label === 'Real' ? (
                                <FaCheckCircle size={12} color="#4ade80" />
                              ) : (
                                <FaTimesCircle size={12} color="#f87171" />
                              )}
                              <span style={{ 
                                fontSize: 12,
                                fontWeight: 600,
                                color: item.result.label === 'Real' ? '#4ade80' : '#f87171'
                              }}>
                                {item.result.label}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                // Immediate check before async call
                                if (!user) {
                                  toast.error('Please login to download detection results', {
                                    duration: 4000,
                                    icon: '🔒'
                                  })
                                  return false
                                }
                                downloadResult(item)
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
                              <FaDownload size={11} />
                              Download
                            </button>
                          </>
                        )}
                        <div 
                          onClick={() => toggleResultExpanded(item.id)}
                          style={{ cursor: 'pointer', padding: '4px' }}
                        >
                          {expandedResults[item.id] ? (
                            <FaChevronUp size={14} color="#999" />
                          ) : (
                            <FaChevronDown size={14} color="#999" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {expandedResults[item.id] && (
                      <div style={{ padding: 16 }}>
                        {item.error ? (
                        <div>
                          <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>
                            ❌ Error: {item.error}
                          </div>
                          <div style={{ fontSize: 11, color: '#666' }}>
                            {item.timestamp}
                          </div>
                        </div>
                      ) : item.result && (
                        <div>
                          {/* Main Classification Card */}
                          <div style={{ 
                            background: `linear-gradient(135deg, ${item.result.label === 'Real' ? '#1a2e1a' : '#2e1a1a'} 0%, ${item.result.label === 'Real' ? '#0f1f0f' : '#1f0f0f'} 100%)`,
                            padding: '16px',
                            borderRadius: 8,
                            marginBottom: 16,
                            border: `2px solid ${item.result.label === 'Real' ? '#2d5016' : '#5b1a2e'}`,
                            boxShadow: `0 4px 12px ${item.result.label === 'Real' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)'}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                              <span style={{ fontSize: 13, color: '#999', fontWeight: 600 }}>Classification Result</span>
                              <div style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 14px',
                                borderRadius: 20,
                                background: item.result.label === 'Real' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                                border: `1px solid ${item.result.label === 'Real' ? '#4ade80' : '#f87171'}`
                              }}>
                                {item.result.label === 'Real' ? (
                                  <FaCheckCircle size={14} color="#4ade80" />
                                ) : (
                                  <FaTimesCircle size={14} color="#f87171" />
                                )}
                                <strong style={{ 
                                  fontSize: 16,
                                  color: item.result.label === 'Real' ? '#4ade80' : '#f87171'
                                }}>
                                  {item.result.label}
                                </strong>
                              </div>
                            </div>
                            
                            {/* Confidence Bars */}
                            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <span style={{ color: '#999', fontSize: 12 }}>Fake Probability</span>
                                  <strong style={{ color: '#f87171', fontSize: 13 }}>{formatPct(item.result.prob_fake)}</strong>
                                </div>
                                <div style={{ 
                                  width: '100%', 
                                  height: 8, 
                                  background: '#1a1a1a', 
                                  borderRadius: 4,
                                  overflow: 'hidden'
                                }}>
                                  <div style={{ 
                                    width: formatPct(item.result.prob_fake),
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #f87171 0%, #dc2626 100%)',
                                    borderRadius: 4,
                                    transition: 'width 0.5s ease'
                                  }}></div>
                                </div>
                              </div>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <span style={{ color: '#999', fontSize: 12 }}>Real Probability</span>
                                  <strong style={{ color: '#4ade80', fontSize: 13 }}>{formatPct(1 - item.result.prob_fake)}</strong>
                                </div>
                                <div style={{ 
                                  width: '100%', 
                                  height: 8, 
                                  background: '#1a1a1a', 
                                  borderRadius: 4,
                                  overflow: 'hidden'
                                }}>
                                  <div style={{ 
                                    width: formatPct(1 - item.result.prob_fake),
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #4ade80 0%, #16a34a 100%)',
                                    borderRadius: 4,
                                    transition: 'width 0.5s ease'
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gap: 6, fontSize: 11, color: '#666' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>AI Model:</span>
                              <span style={{ color: '#999', textTransform: 'uppercase', fontWeight: 600 }}>
                                {item.result.model_name || 'N/A'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span title="Decision threshold: If Fake confidence > 50%, classified as Fake">Decision Threshold:</span>
                              <span style={{ color: '#999' }}>{((item.result.threshold || 0.5) * 100).toFixed(0)}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Processed:</span>
                              <span style={{ color: '#999' }}>{item.timestamp}</span>
                            </div>
                          </div>

                          {/* AI Explanation Section */}
                          {item.result.explanation && (
                            <div style={{ marginTop: 16, padding: 16, background: '#0a0a0a', borderRadius: 8, border: '1px solid #2a2a2a' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#E94E1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaRobot size={16} />
                                <span>AI Analysis & Explanation</span>
                              </div>
                              
                              {/* Summary */}
                              <div style={{ fontSize: 12, color: '#ccc', marginBottom: 12, lineHeight: 1.6 }}>
                                {item.result.explanation.summary}
                              </div>

                              {/* Confidence Badge */}
                              <div style={{ 
                                display: 'inline-block',
                                padding: '4px 10px',
                                borderRadius: 4,
                                background: item.result.explanation.confidence_level === 'Very High' || item.result.explanation.confidence_level === 'High' ? '#1a2e1a' : '#2e2e1a',
                                border: `1px solid ${item.result.explanation.confidence_level === 'Very High' || item.result.explanation.confidence_level === 'High' ? '#2d5016' : '#5b5b16'}`,
                                fontSize: 11,
                                fontWeight: 600,
                                marginBottom: 12
                              }}>
                                Confidence: {item.result.explanation.confidence_level}
                              </div>

                              {/* Detected Patterns */}
                              {item.result.explanation.detected_patterns && item.result.explanation.detected_patterns.length > 0 && (
                                <div style={{ marginTop: 12 }}>
                                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#999' }}>
                                    Detected Patterns:
                                  </div>
                                  <div style={{ display: 'grid', gap: 8 }}>
                                    {item.result.explanation.detected_patterns.map((pattern, idx) => {
                                      const SeverityIcon = pattern.severity === 'high' ? FaExclamationTriangle :
                                                          pattern.severity === 'medium' ? MdWarning :
                                                          pattern.severity === 'warning' ? MdWarning :
                                                          pattern.severity === 'info' ? MdInfo :
                                                          FaCheckCircle;
                                      const iconColor = pattern.severity === 'high' ? '#f87171' :
                                                       pattern.severity === 'medium' ? '#fb923c' :
                                                       pattern.severity === 'warning' ? '#fbbf24' :
                                                       pattern.severity === 'info' ? '#60a5fa' :
                                                       '#4ade80';
                                      
                                      return (
                                        <div key={idx} style={{ 
                                          padding: 10, 
                                          background: '#141414', 
                                          borderRadius: 6,
                                          borderLeft: `3px solid ${iconColor}`,
                                          display: 'flex',
                                          gap: 10
                                        }}>
                                          <div style={{ flexShrink: 0, paddingTop: 2 }}>
                                            <SeverityIcon size={14} color={iconColor} />
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#fff' }}>
                                              {pattern.indicator}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#999', lineHeight: 1.5 }}>
                                              {pattern.description}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Recommendation */}
                              {item.result.explanation.recommendation && (
                                <div style={{ 
                                  marginTop: 12, 
                                  padding: 10, 
                                  background: '#141414', 
                                  borderRadius: 6,
                                  fontSize: 11,
                                  color: '#ccc',
                                  lineHeight: 1.5
                                }}>
                                  <strong style={{ color: '#E94E1B' }}>Recommendation:</strong> {item.result.explanation.recommendation}
                                </div>
                              )}

                              {/* Technical Insights (Collapsible) */}
                              {item.result.explanation.technical_insights && item.result.explanation.technical_insights.length > 0 && (
                                <details style={{ marginTop: 12 }}>
                                  <summary style={{ 
                                    fontSize: 11, 
                                    fontWeight: 600, 
                                    color: '#999', 
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                  }}>
                                    Technical Details ▼
                                  </summary>
                                  <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '2px solid #2a2a2a' }}>
                                    {item.result.explanation.technical_insights.map((insight, idx) => (
                                      <div key={idx} style={{ fontSize: 10, color: '#666', marginBottom: 6, lineHeight: 1.5 }}>
                                        • {insight}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              )}
                            </div>
                          )}

                          {/* Detailed Analysis Breakdown */}
                          {item.result.detailed_analysis && (
                            <div style={{ marginTop: 16, padding: 16, background: '#0a0a0a', borderRadius: 8, border: '1px solid #2a2a2a' }}>
                              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#E94E1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BiAnalyse size={16} />
                                <span>Detailed Breakdown</span>
                              </div>
                              
                              {/* Analysis Summary */}
                              <div style={{ fontSize: 12, color: '#ccc', marginBottom: 16, lineHeight: 1.6, padding: 12, background: '#141414', borderRadius: 6 }}>
                                {item.result.detailed_analysis.summary}
                              </div>

                              {/* Analysis Items */}
                              <div style={{ display: 'grid', gap: 10 }}>
                                {item.result.detailed_analysis.items.map((analysisItem, idx) => {
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                                            {analysisItem.name}
                                          </span>
                                          {analysisItem.level !== 'NORMAL' && (
                                            <span style={{ 
                                              fontSize: 9, 
                                              fontWeight: 700, 
                                              padding: '2px 6px', 
                                              borderRadius: 3,
                                              background: borderColor,
                                              color: '#fff'
                                            }}>
                                              {analysisItem.level}
                                            </span>
                                          )}
                                        </div>
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
                        </div>
                      )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        background: '#0d0d0d', 
        padding: isMobile ? '30px 20px' : '40px 60px',
        marginTop: isMobile ? 40 : 80,
        borderTop: '1px solid #2a2a2a'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          maxWidth: 1100,
          margin: '0 auto',
          gap: isMobile ? 30 : 0
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Fact.it</div>
          </div>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 24 : 80 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>About us</div>
              <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
                <a onClick={() => onNavigateToHome('about')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>About</a>
                <a onClick={() => onNavigateToHome('about')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Mission</a>
                <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Service</div>
              <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
                <a style={{ color: '#E94E1B', textDecoration: 'none', cursor: 'default', fontWeight: 600 }}>Detection</a>
                <a onClick={() => onNavigateToHome('services')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>Services</a>
                <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Enterprise</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Resources</div>
              <div style={{ color: '#666', fontSize: 14, display: 'grid', gap: 8 }}>
                <a onClick={() => onNavigateToHome('how-to-use')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>How To Use</a>
                <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Blog</a>
                <a onClick={() => onNavigateToHome('how-to-use')} style={{ color: '#666', textDecoration: 'none', cursor: 'pointer' }}>FAQ</a>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20 }}>▶️</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20 }}>📷</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#666', fontSize: 20 }}>💼</a>
            </div>
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          marginTop: 40, 
          paddingTop: 20,
          borderTop: '1px solid #2a2a2a',
          color: '#666',
          fontSize: 12
        }}>
          © 2025 Fact.it All rights reserved
        </div>
      </footer>
    </div>
  )
}
