import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { HiClock, HiTrash, HiChartBar, HiDownload, HiSearch } from 'react-icons/hi'
import { MdDelete, MdHistory } from 'react-icons/md'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function History({ onNavigateToHome, onNavigateToDetection, user }) {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState('all') // 'all', 'fake', 'real'

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (user) {
      fetchHistory()
      fetchStats()
    }
  }, [user])

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('access_token')
      console.log('Fetching history with token:', token ? 'Token exists' : 'No token')
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }
      
      const response = await fetch(`${DEFAULT_API_BASE}/history?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('History response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('History fetch error:', errorData)
        throw new Error(errorData.detail || 'Failed to fetch history')
      }

      const data = await response.json()
      console.log('History data received:', data)
      setHistory(data.history || [])
    } catch (err) {
      console.error('History fetch error:', err)
      setError(err.message || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        console.log('No token for stats fetch')
        return
      }
      
      const response = await fetch(`${DEFAULT_API_BASE}/history/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Stats response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Stats data received:', data)
        setStats(data)
      } else {
        console.error('Stats fetch failed:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleDelete = async (historyId) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return
    }

    setDeleteLoading(historyId)
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${DEFAULT_API_BASE}/history/${historyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete record')
      }

      // Remove from local state
      setHistory(prev => prev.filter(item => item.id !== historyId))
      
      // Refresh stats
      fetchStats()
    } catch (err) {
      toast.error(err.message || 'Failed to delete record')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDownloadHistory = () => {
    if (history.length === 0) {
      toast.error('No history to download')
      return
    }
    
    toast.success('Downloading history...')

    // Prepare CSV data
    const headers = ['Date', 'Image Name', 'Result', 'Confidence (%)', 'Model', 'Image Size', 'Complexity']
    const rows = history.map(item => [
      new Date(item.created_at).toLocaleString(),
      item.image_name,
      item.result_label,
      (item.prob_fake * 100).toFixed(2),
      item.model_name,
      item.image_size || 'N/A',
      item.complexity_level || 'N/A'
    ])

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `deepfake_detection_history_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL history records? This cannot be undone.')) {
      return
    }

    setLoading(true)
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${DEFAULT_API_BASE}/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete all records')
      }

      setHistory([])
      setStats({
        total_detections: 0,
        fake_count: 0,
        real_count: 0
      })
    } catch (err) {
      toast.error(err.message || 'Failed to delete all records')
    } finally {
      setLoading(false)
    }
  }

  // Filter and search history
  const filteredHistory = history.filter(item => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      item.image_name.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Result filter
    const matchesResult = filterResult === 'all' || 
      (filterResult === 'fake' && item.result_label === 'Fake') ||
      (filterResult === 'real' && item.result_label === 'Real')
    
    return matchesSearch && matchesResult
  })

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, marginBottom: 16 }}>Please Login</h2>
          <p style={{ color: '#999', marginBottom: 24 }}>You need to be logged in to view detection history</p>
          <button onClick={onNavigateToHome} style={{ background: '#E94E1B', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}>
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', margin: 0 }}>
      {/* Navbar */}
      <nav style={{ 
        background: '#0d0d0d', 
        padding: isMobile ? '16px 20px' : '20px 60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a2a2a'
      }}>
        <div onClick={onNavigateToHome} style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>
          Fact.it
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 8 : 16, alignItems: 'center' }}>
          <button onClick={onNavigateToDetection} style={{ background: '#E94E1B', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            New Detection
          </button>
          <button onClick={onNavigateToHome} style={{ background: 'transparent', color: '#fff', border: '1px solid #2a2a2a', padding: '10px 20px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            Home
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: isMobile ? '30px 20px' : '60px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ marginBottom: isMobile ? 30 : 40 }}>
          <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 700, margin: '0 0 12px 0' }}>Detection History</h1>
          <p style={{ fontSize: isMobile ? 14 : 16, color: '#999' }}>View and manage your deepfake detection history</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: isMobile ? 12 : 20, marginBottom: isMobile ? 30 : 40 }}>
            <div style={{ background: '#0d0d0d', padding: 24, borderRadius: 8, border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Total Detections</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.total_detections}</div>
            </div>
            <div style={{ background: '#0d0d0d', padding: 24, borderRadius: 8, border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Fake Detected</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#f87171' }}>{stats.fake_count}</div>
            </div>
            <div style={{ background: '#0d0d0d', padding: 24, borderRadius: 8, border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>Real Detected</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#4ade80' }}>{stats.real_count}</div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {history.length > 0 && (
          <div style={{ 
            marginBottom: 24, 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: 12,
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: isMobile ? 'auto' : '1', maxWidth: isMobile ? '100%' : 400 }}>
              <HiSearch 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#666' 
                }} 
              />
              <input
                type="text"
                placeholder="Search by image name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  borderRadius: 4,
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setFilterResult('all')}
                style={{
                  padding: '10px 16px',
                  background: filterResult === 'all' ? '#E94E1B' : '#2a2a2a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilterResult('fake')}
                style={{
                  padding: '10px 16px',
                  background: filterResult === 'fake' ? '#f87171' : '#2a2a2a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                Fake
              </button>
              <button
                onClick={() => setFilterResult('real')}
                style={{
                  padding: '10px 16px',
                  background: filterResult === 'real' ? '#4ade80' : '#2a2a2a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'background 0.2s'
                }}
              >
                Real
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {history.length > 0 && (
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button 
              onClick={handleDownloadHistory}
              style={{ 
                background: '#16a34a', 
                color: '#fff', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: 4, 
                cursor: 'pointer', 
                fontSize: 14, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <HiDownload size={16} />
              Download History
            </button>
            <button 
              onClick={handleDeleteAll}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Delete All History
            </button>
          </div>
        )}

        {/* History List */}
        {loading ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ 
                background: '#0d0d0d', 
                padding: 24, 
                borderRadius: 8, 
                border: '1px solid #2a2a2a',
                display: 'flex',
                gap: 20
              }}>
                {/* Skeleton Thumbnail */}
                <div style={{
                  width: isMobile ? '80px' : '120px',
                  height: isMobile ? '80px' : '120px',
                  background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: 4
                }}></div>
                
                {/* Skeleton Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{
                    width: '60%',
                    height: 20,
                    background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: 4
                  }}></div>
                  <div style={{
                    width: '40%',
                    height: 16,
                    background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: 4
                  }}></div>
                  <div style={{
                    width: '80%',
                    height: 16,
                    background: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: 4
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 18, color: '#f87171' }}>{error}</div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#0d0d0d', borderRadius: 8, border: '1px solid #2a2a2a' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <HiClock size={64} color="#E94E1B" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              {history.length === 0 ? 'No History Yet' : 'No Results Found'}
            </div>
            <div style={{ fontSize: 16, color: '#999', marginBottom: 24 }}>
              {history.length === 0 ? 'Start detecting images to build your history' : 'Try adjusting your search or filter'}
            </div>
            {history.length === 0 && (
              <button onClick={onNavigateToDetection} style={{ background: '#E94E1B', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
                Start Detection
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredHistory.map((item) => (
              <div key={item.id} style={{ background: '#0d0d0d', padding: 24, borderRadius: 8, border: '1px solid #2a2a2a', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Thumbnail */}
                {item.image_data && (
                  <div style={{ flexShrink: 0 }}>
                    <img 
                      src={item.image_data} 
                      alt={item.image_name}
                      style={{
                        width: isMobile ? '80px' : '120px',
                        height: isMobile ? '80px' : '120px',
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '2px solid #2a2a2a'
                      }}
                    />
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, wordBreak: 'break-word' }}>{item.image_name}</div>
                    <div style={{ 
                      padding: '4px 12px', 
                      borderRadius: 4, 
                      fontSize: 12, 
                      fontWeight: 600,
                      background: item.result_label === 'Fake' ? '#dc262620' : '#4ade8020',
                      color: item.result_label === 'Fake' ? '#f87171' : '#4ade80'
                    }}>
                      {item.result_label}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13, color: '#999' }}>
                    <div>
                      <span style={{ color: '#666' }}>Confidence Fake:</span> <span style={{ color: '#f87171', fontWeight: 600 }}>{(item.prob_fake * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Confidence Real:</span> <span style={{ color: '#4ade80', fontWeight: 600 }}>{((1 - item.prob_fake) * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Model:</span> {item.model_name}
                    </div>
                    {item.image_size && (
                      <div>
                        <span style={{ color: '#666' }}>Size:</span> {item.image_size}
                      </div>
                    )}
                    {item.complexity_level && (
                      <div>
                        <span style={{ color: '#666' }}>Complexity:</span> {item.complexity_level}
                      </div>
                    )}
                    <div>
                      <span style={{ color: '#666' }}>Detection Time:</span> {new Date(item.created_at).toLocaleString('id-ID', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                  {item.model_selection_reason && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                      {item.model_selection_reason}
                    </div>
                  )}
                </div>
                
                <div style={{ flexShrink: 0, alignSelf: 'center' }}>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteLoading === item.id}
                    style={{ 
                      background: 'transparent', 
                      color: '#dc2626', 
                      border: '1px solid #dc2626', 
                      padding: '8px 16px', 
                      borderRadius: 4, 
                      cursor: deleteLoading === item.id ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      opacity: deleteLoading === item.id ? 0.5 : 1,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {deleteLoading === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
