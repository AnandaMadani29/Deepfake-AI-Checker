import React, { useState } from 'react'
import Home from './Home.jsx'
import Detection from './Detection.jsx'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [targetSection, setTargetSection] = useState(null)

  const navigateToHome = (sectionId = null) => {
    setTargetSection(sectionId)
    setCurrentPage('home')
  }

  if (currentPage === 'detection') {
    return <Detection onNavigateToHome={navigateToHome} />
  }

  return <Home 
    onNavigateToDetection={() => setCurrentPage('detection')} 
    targetSection={targetSection}
    onSectionScrolled={() => setTargetSection(null)}
  />
}
