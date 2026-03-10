import React, { useMemo, useState, useRef } from 'react'

const DEFAULT_API_BASE = 'http://localhost:8000'
const MAX_FILES = 10

function formatPct(x) {
  if (typeof x !== 'number' || Number.isNaN(x)) return '-'
  return `${(x * 100).toFixed(2)}%`
}

export default function Detection({ onNavigateToHome }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [processingIndex, setProcessingIndex] = useState(-1)
  const fileInputRef = useRef(null)

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

          const res = await fetch(`${DEFAULT_API_BASE}/predict`, {
            method: 'POST',
            body: form,
          })

          const data = await res.json().catch(() => null)
          if (!res.ok) {
            throw new Error((data && data.detail) ? String(data.detail) : `Request failed (${res.status})`)
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
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff' }}>
      {/* Navbar */}
      <nav style={{ 
        background: '#0d0d0d', 
        padding: '20px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <div 
          onClick={() => onNavigateToHome()}
          style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}
        >
          Fact.it
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
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

      {/* Hero Section */}
      <div style={{ padding: '60px 60px 40px', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: 48, 
          fontWeight: 700, 
          margin: '0 0 16px 0',
          lineHeight: 1.2
        }}>
          Detect Deepfake Images with AI
        </h1>
        <p style={{ fontSize: 16, color: '#999', margin: '0 0 16px 0' }}>
          Upload up to {MAX_FILES} images to verify their authenticity using advanced machine learning
        </p>
        <div style={{ 
          maxWidth: 700, 
          margin: '0 auto 40px auto',
          padding: '12px 20px',
          background: '#0d0d0d',
          borderRadius: 6,
          border: '1px solid #2a2a2a',
          fontSize: 13,
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
          gap: 40,
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
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 14, color: '#fff', marginBottom: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.filename}
                      </div>
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
                          <div style={{ 
                            background: item.result.label === 'Real' ? '#1a2e1a' : '#2e1a1a',
                            padding: '12px',
                            borderRadius: 6,
                            marginBottom: 12,
                            border: `1px solid ${item.result.label === 'Real' ? '#2d5016' : '#5b1a2e'}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontSize: 12, color: '#999' }}>Classification:</span>
                              <strong style={{ 
                                fontSize: 16,
                                color: item.result.label === 'Real' ? '#4ade80' : '#f87171'
                              }}>
                                {item.result.label}
                              </strong>
                            </div>
                            <div style={{ height: 1, background: '#2a2a2a', margin: '8px 0' }}></div>
                            <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#999' }}>Confidence (Fake):</span>
                                <strong style={{ color: '#f87171' }}>{formatPct(item.result.prob_fake)}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#999' }}>Confidence (Real):</span>
                                <strong style={{ color: '#4ade80' }}>{formatPct(1 - item.result.prob_fake)}</strong>
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
                        </div>
                      )}
                    </div>
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
        padding: '40px 60px',
        marginTop: 80,
        borderTop: '1px solid #2a2a2a'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          maxWidth: 1100,
          margin: '0 auto'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Fact.it</div>
          </div>
          <div style={{ display: 'flex', gap: 80 }}>
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
