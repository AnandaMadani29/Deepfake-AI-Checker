import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { HiClock, HiTrash, HiChartBar, HiDownload, HiSearch } from 'react-icons/hi'
import Logo from './components/Logo'
import { MdDelete, MdHistory } from 'react-icons/md'
import { FaCheckCircle, FaTimesCircle, FaBars, FaTimes } from 'react-icons/fa'

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function History({ onNavigateToHome, onNavigateToDetection, onNavigateToArticles, user }) {
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState('all') // 'all', 'fake', 'real'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState([])
  const [selectMode, setSelectMode] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemsPerPage = 10

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

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredHistory.map(item => item.id))
    }
  }

  const handleDownloadHistory = async () => {
    const itemsToDownload = selectMode && selectedItems.length > 0
      ? history.filter(item => selectedItems.includes(item.id))
      : history

    if (itemsToDownload.length === 0) {
      toast.error(selectMode ? 'No items selected' : 'No history to download')
      return
    }
    
    const loadingToast = toast.loading(`Generating PDF report for ${itemsToDownload.length} item(s)...`)

    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Get IDs of items to download
      const historyIds = selectMode && selectedItems.length > 0 
        ? selectedItems 
        : null

      const requestBody = historyIds ? { history_ids: historyIds } : {}
      
      const response = await fetch(`${DEFAULT_API_BASE}/history/export-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
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
      link.download = `deepfake_detection_report_${new Date().toISOString().split('T')[0]}.pdf`
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

  const handleDeleteAll = async () => {
    // If items are selected, delete only selected items
    if (selectedItems.length > 0) {
      if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)? This cannot be undone.`)) {
        return
      }

      setLoading(true)
      try {
        const token = localStorage.getItem('access_token')
        
        // Delete each selected item
        for (const id of selectedItems) {
          const response = await fetch(`${DEFAULT_API_BASE}/history/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to delete item ${id}`)
          }
        }

        // Remove deleted items from state
        setHistory(prev => prev.filter(item => !selectedItems.includes(item.id)))
        setSelectedItems([])
        
        // Update stats
        const deletedFakeCount = history.filter(item => selectedItems.includes(item.id) && item.result_label === 'Fake').length
        const deletedRealCount = history.filter(item => selectedItems.includes(item.id) && item.result_label === 'Real').length
        
        setStats(prev => ({
          total_count: prev.total_count - selectedItems.length,
          fake_count: prev.fake_count - deletedFakeCount,
          real_count: prev.real_count - deletedRealCount
        }))
        
        toast.success(`${selectedItems.length} item(s) deleted successfully`)
      } catch (err) {
        toast.error(err.message || 'Failed to delete selected items')
      } finally {
        setLoading(false)
      }
    } else {
      // Delete all items
      if (!window.confirm('Are you sure you want to delete ALL history records? This cannot be undone.')) {
        return
      }

      setLoading(true)
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${DEFAULT_API_BASE}/history/delete-all`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to delete all records')
        }

        setHistory([])
        setSelectedItems([])
        setStats({
          total_count: 0,
          fake_count: 0,
          real_count: 0
        })
        
        toast.success('All history deleted successfully')
      } catch (err) {
        toast.error(err.message || 'Failed to delete all records')
      } finally {
        setLoading(false)
      }
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

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterResult])

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
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', margin: 0, position: 'relative' }}>
      {/* Logo - Fixed on Page */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 30 : 40,
        left: isMobile ? 20 : 60,
        zIndex: 1001
      }}>
        <Logo onClick={() => onNavigateToHome()} isMobile={isMobile} variant="header" />
      </div>

      {/* Navbar - Floating Design */}
      <nav style={{ 
        position: 'absolute',
        top: isMobile ? 30 : 20,
        right: isMobile ? 20 : 60,
        width: 'auto',
        background: isMobile ? 'transparent' : 'rgba(13, 13, 13, 0.8)',
        backdropFilter: isMobile ? 'none' : 'blur(10px)',
        padding: isMobile ? '0' : '12px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 24,
        borderRadius: isMobile ? 0 : 8,
        border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isMobile ? 'none' : '0 4px 24px rgba(0, 0, 0, 0.4)',
        zIndex: 1000
      }}>
        {isMobile ? (
          // Mobile Menu
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(13, 13, 13, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
              }}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
            {menuOpen && (
              <>
                <div 
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                    animation: 'fadeIn 0.3s ease-in-out'
                  }}
                />
                <div style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '280px',
                  maxWidth: '80vw',
                  background: '#FF5733',
                  zIndex: 9999,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px',
                  boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
                  animation: 'slideInRight 0.3s ease-in-out'
                }}>
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
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 32,
                    marginTop: 80
                  }}>
                    <a onClick={() => { onNavigateToHome('about'); setMenuOpen(false); }} style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 600, cursor: 'pointer' }}>About Us</a>
                    <a onClick={() => { onNavigateToDetection(); setMenuOpen(false); }} style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 600, cursor: 'pointer' }}>Service</a>
                    <a onClick={() => { onNavigateToArticles(); setMenuOpen(false); }} style={{ color: '#fff', textDecoration: 'none', fontSize: 20, fontWeight: 600, cursor: 'pointer' }}>Resources</a>
                  </div>
                  <div style={{ marginTop: 'auto', paddingBottom: 40 }}>
                    {user ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ color: '#fff', fontSize: 16, marginBottom: 8 }}>
                          <span style={{ fontWeight: 600 }}>Hi,</span> <span style={{ fontWeight: 600 }}>{user.full_name || user.email}</span>
                        </div>
                        <button onClick={() => { onLogout(); setMenuOpen(false); }} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '16px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 16, width: '100%' }}>Logout</button>
                      </div>
                    ) : (
                      <button onClick={() => { onNavigateToLogin(); setMenuOpen(false); }} style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '18px', borderRadius: 4, fontWeight: 600, cursor: 'pointer', fontSize: 18, width: '100%' }}>Log in</button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          // Desktop Menu
          <>
            <a onClick={() => onNavigateToHome('about')} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>About us</a>
            <a onClick={onNavigateToDetection} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>Services</a>
            <a onClick={onNavigateToArticles} style={{ color: '#999', textDecoration: 'none', fontSize: 14, cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#999'}>Resources</a>
            <button 
              onClick={onNavigateToHome}
              style={{
                background: '#E94E1B',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#d43e0f'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#E94E1B'}
            >
              Home
            </button>
          </>
        )}
      </nav>

      {/* Content */}
      <div style={{ padding: isMobile ? '100px 20px 30px' : '140px 60px 60px', maxWidth: 1400, margin: '0 auto' }}>
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

        {/* Search Input */}
        {history.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ position: 'relative', maxWidth: isMobile ? '100%' : 400 }}>
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
          </div>
        )}


        {/* Filter and Actions - Single Row */}
        {history.length > 0 && (
          <div style={{ 
            marginBottom: 24, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: 12, 
            flexWrap: 'wrap' 
          }}>
            {/* Filter Dropdown and Clear Button */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  style={{
                    padding: '10px 16px',
                    background: '#2a2a2a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 120
                  }}
                >
                  {filterResult === 'all' ? 'All' : filterResult === 'fake' ? 'Fake' : 'Real'}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ transform: filterDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              {filterDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: 4,
                  background: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  borderRadius: 4,
                  overflow: 'hidden',
                  zIndex: 10,
                  minWidth: 120
                }}>
                  <button
                    onClick={() => {
                      setFilterResult('all')
                      setFilterDropdownOpen(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: filterResult === 'all' ? '#E94E1B' : 'transparent',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setFilterResult('fake')
                      setFilterDropdownOpen(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: filterResult === 'fake' ? '#f87171' : 'transparent',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    Fake
                  </button>
                  <button
                    onClick={() => {
                      setFilterResult('real')
                      setFilterDropdownOpen(false)
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: filterResult === 'real' ? '#4ade80' : 'transparent',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    Real
                  </button>
                </div>
              )}
              </div>
              
              {/* Clear Selection Button */}
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setSelectedItems([])}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  Clear ({selectedItems.length})
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button 
                onClick={handleDownloadHistory}
                style={{ 
                  background: '#E94E1B', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px 24px', 
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
                {selectedItems.length > 0 
                  ? `Download (${selectedItems.length})` 
                  : 'Download All'}
              </button>
              <button 
                onClick={handleDeleteAll}
                style={{ 
                  background: '#dc2626', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: 4, 
                  cursor: 'pointer', 
                  fontSize: 14, 
                  fontWeight: 600 
                }}
              >
                {selectedItems.length > 0 
                  ? `Delete (${selectedItems.length})` 
                  : 'Delete All'}
              </button>
            </div>
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
            {paginatedHistory.map((item, index) => (
              <div key={item.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 6)}`} style={{ background: '#0d0d0d', padding: 24, borderRadius: 8, border: selectedItems.includes(item.id) ? '2px solid #3b82f6' : '1px solid #2a2a2a', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* Checkbox (Always visible) */}
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    style={{
                      width: 20,
                      height: 20,
                      cursor: 'pointer',
                      accentColor: '#3b82f6'
                    }}
                  />
                </div>
                
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
                
                <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  {/* Badge - Top Right */}
                  <div style={{ 
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    padding: '4px 12px', 
                    borderRadius: 4, 
                    fontSize: 12, 
                    fontWeight: 600,
                    background: item.result_label === 'Fake' ? '#dc262620' : '#4ade8020',
                    color: item.result_label === 'Fake' ? '#f87171' : '#4ade80'
                  }}>
                    {item.result_label}
                  </div>
                  
                  {/* Filename */}
                  <div style={{ fontSize: 18, fontWeight: 600, wordBreak: 'break-word', marginBottom: 8, paddingRight: 80 }}>{item.image_name}</div>
                  
                  {/* Probabilities */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: 13, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: '#666' }}>Real Probability:</span> <span style={{ color: '#4ade80', fontWeight: 600 }}>{((1 - item.prob_fake) * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Fake Probability:</span> <span style={{ color: '#f87171', fontWeight: 600 }}>{(item.prob_fake * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  {item.detailed_analysis?.summary && (
                    <div style={{ 
                      fontSize: 13, 
                      color: '#999', 
                      marginBottom: 8,
                      lineHeight: 1.5
                    }}>
                      {item.detailed_analysis.summary}
                    </div>
                  )}
                  
                  {/* Detection Time */}
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Detection time: {new Date(item.created_at).toLocaleString('id-ID', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredHistory.length > 0 && (
          <div style={{ 
            marginTop: 40, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                background: currentPage === 1 ? '#1a1a1a' : '#E94E1B',
                color: currentPage === 1 ? '#666' : '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 6,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || 
                                page === totalPages || 
                                (page >= currentPage - 1 && page <= currentPage + 1)
                
                if (!showPage && page === currentPage - 2) {
                  return <span key={page} style={{ color: '#666' }}>...</span>
                }
                if (!showPage && page === currentPage + 2) {
                  return <span key={page} style={{ color: '#666' }}>...</span>
                }
                if (!showPage) return null

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      background: currentPage === page ? '#E94E1B' : '#1a1a1a',
                      color: '#fff',
                      border: currentPage === page ? 'none' : '1px solid #2a2a2a',
                      padding: '8px 14px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: currentPage === page ? 600 : 400,
                      minWidth: 40
                    }}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                background: currentPage === totalPages ? '#1a1a1a' : '#E94E1B',
                color: currentPage === totalPages ? '#666' : '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 6,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: 14,
                fontWeight: 600,
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
            </button>

            <div style={{ 
              marginLeft: 16, 
              fontSize: 14, 
              color: '#999',
              whiteSpace: 'nowrap'
            }}>
              Page {currentPage} of {totalPages} ({filteredHistory.length} items)
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ 
        background: '#E94E1B',
        padding: isMobile ? '40px 20px' : '50px 60px',
        marginTop: isMobile ? 80 : 120,
        borderTop: 'none'
      }}>
        <div style={{ 
          maxWidth: 1400,
          margin: '0 auto'
        }}>
          {/* Main Footer Content */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
            gap: isMobile ? 24 : 0,
            paddingBottom: isMobile ? 24 : 30,
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            marginBottom: isMobile ? 24 : 30
          }}>
            {/* Logo - Larger */}
            <Logo onClick={() => onNavigateToHome()} isMobile={isMobile} variant="footer" />
            
            {/* Links Section - Aligned with logo center */}
            <div style={{ 
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 12 : 48,
              alignItems: isMobile ? 'flex-start' : 'center'
            }}>
              <a onClick={() => onNavigateToHome('about')} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>About Us</a>
              <a onClick={onNavigateToDetection} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Service</a>
              <a onClick={onNavigateToArticles} style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Resources</a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Terms</a>
              <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'opacity 0.2s', textTransform: 'uppercase' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>Privacy Policy</a>
            </div>
          </div>

          {/* Bottom Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? 8 : 0
          }}>
            <div style={{ color: '#fff', fontSize: 13 }}>
              © 2025 Fact.it All rights reserved
            </div>
            <div style={{ color: '#fff', fontSize: 13 }}>
              factit.support@gmail.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
