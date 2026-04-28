import React from 'react'

export default function Logo({ 
  onClick, 
  isMobile = false, 
  variant = 'header', // 'header' or 'footer'
  style = {} 
}) {
  const baseStyle = {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 800,
    color: '#fff',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease',
    userSelect: 'none'
  }

  const variantStyles = {
    header: {
      fontSize: isMobile ? 28 : 32,
      letterSpacing: 1.5
    },
    footer: {
      fontSize: isMobile ? 36 : 56,
      letterSpacing: 2,
      lineHeight: 1
    }
  }

  const combinedStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style
  }

  return (
    <div
      onClick={onClick}
      style={combinedStyle}
      onMouseEnter={(e) => {
        if (onClick && !isMobile) {
          e.currentTarget.style.color = '#E94E1B'
          if (variant === 'header') {
            e.currentTarget.style.transform = 'scale(1.05)'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.color = '#fff'
          if (variant === 'header') {
            e.currentTarget.style.transform = 'scale(1)'
          }
        }
      }}
    >
      FACT.IT
    </div>
  )
}
