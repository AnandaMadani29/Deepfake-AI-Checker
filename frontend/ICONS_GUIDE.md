# 🎨 Icon Usage Guide

## Overview
Project ini menggunakan **react-icons** untuk icon yang profesional dan konsisten. Library ini menyediakan ribuan icon dari berbagai collections populer.

## Installation
```bash
npm install react-icons
```

## Available Icon Collections

### 1. Font Awesome (FA)
```javascript
import { FaShieldAlt, FaCheckCircle, FaRobot } from 'react-icons/fa'
```
- Best for: General purpose icons
- Style: Solid, recognizable

### 2. Material Design (MD)
```javascript
import { MdVerified, MdSecurity, MdAnalytics } from 'react-icons/md'
```
- Best for: Modern, clean UI
- Style: Google Material Design

### 3. Heroicons (HI)
```javascript
import { HiShieldCheck, HiPhotograph } from 'react-icons/hi'
```
- Best for: Minimalist, elegant
- Style: Tailwind CSS design

### 4. Ant Design (AI)
```javascript
import { AiOutlineRobot, AiOutlineEye } from 'react-icons/ai'
```
- Best for: Enterprise UI
- Style: Clean outlines

### 5. BoxIcons (BI)
```javascript
import { BiAnalyse, BiBrain } from 'react-icons/bi'
```
- Best for: Diverse options
- Style: Versatile

### 6. Ionicons (IO)
```javascript
import { IoShieldCheckmark, IoWarning } from 'react-icons/io5'
```
- Best for: Mobile-first design
- Style: iOS inspired

## Custom Icon Components

Kami sudah membuat wrapper components di `src/components/Icons.jsx`:

### Basic Usage
```javascript
import { ShieldIcon, RobotIcon, VerifiedIcon } from './components/Icons'

function MyComponent() {
  return (
    <div>
      <ShieldIcon size={24} color="#E94E1B" />
      <RobotIcon size={32} />
      <VerifiedIcon size={20} color="#4ade80" />
    </div>
  )
}
```

### Severity Icons (Auto-colored)
```javascript
import { SeverityIcon } from './components/Icons'

<SeverityIcon severity="high" size={20} />    // Red warning
<SeverityIcon severity="medium" size={20} />  // Orange warning
<SeverityIcon severity="warning" size={20} /> // Yellow warning
<SeverityIcon severity="info" size={20} />    // Blue info
<SeverityIcon severity="low" size={20} />     // Green check
```

### Result Icons
```javascript
import { ResultIcon } from './components/Icons'

<ResultIcon isFake={true} size={32} />   // Red X for fake
<ResultIcon isFake={false} size={32} />  // Green check for real
```

### Confidence Level Icons
```javascript
import { ConfidenceIcon } from './components/Icons'

<ConfidenceIcon level="Very High" size={20} />  // Green shield
<ConfidenceIcon level="High" size={20} />       // Blue shield
<ConfidenceIcon level="Medium" size={20} />     // Yellow alert
<ConfidenceIcon level="Low" size={20} />        // Orange warning
```

## Icon Recommendations by Feature

### Detection Results
- **Fake Result**: `FaTimesCircle` (red)
- **Real Result**: `FaCheckCircle` (green)
- **Processing**: `AiOutlineRobot` (orange)

### UI Elements
- **Upload**: `FaUpload`, `HiPhotograph`
- **History**: `HiClock`, `FaHistory`
- **Analysis**: `BiAnalyse`, `BiBrain`
- **Security**: `FaShieldAlt`, `MdSecurity`

### Status Indicators
- **Success**: `MdVerified`, `IoCheckmarkDone`
- **Warning**: `IoWarning`, `MdWarning`
- **Error**: `FaTimesCircle`, `AiOutlineCloseCircle`
- **Info**: `MdInfo`, `FaInfoCircle`

### AI Features
- **AI Robot**: `AiOutlineRobot`, `FaRobot`
- **Brain/Intelligence**: `BiBrain`
- **Eye/Detection**: `AiOutlineEye`, `FaEye`
- **Lightning/Fast**: `HiLightningBolt`

## Color Palette

### Brand Colors
- **Primary Orange**: `#E94E1B`
- **Dark Background**: `#0d0d0d`
- **Light Gray**: `#999`

### Status Colors
- **Success/Real**: `#4ade80` (green)
- **Error/Fake**: `#f87171` (red)
- **Warning**: `#fbbf24` (yellow)
- **Info**: `#60a5fa` (blue)
- **Medium Alert**: `#fb923c` (orange)

## Examples

### Navigation Button with Icon
```javascript
import { FaHistory } from 'react-icons/fa'

<button onClick={onNavigateToHistory}>
  <FaHistory size={20} style={{ marginRight: 8 }} />
  View History
</button>
```

### Status Badge with Icon
```javascript
import { MdVerified } from 'react-icons/md'

<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <MdVerified size={16} color="#4ade80" />
  <span>Verified Authentic</span>
</div>
```

### Icon in Card Header
```javascript
import { BiBrain } from 'react-icons/bi'

<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <BiBrain size={24} color="#E94E1B" />
  <h3>AI Analysis</h3>
</div>
```

## Tips

1. **Consistent Sizing**: Use standard sizes (16, 20, 24, 32, 48)
2. **Color Harmony**: Stick to the defined color palette
3. **Accessibility**: Ensure sufficient contrast
4. **Performance**: Import only icons you need
5. **Semantic**: Choose icons that match their function

## Browse More Icons

Visit [react-icons.github.io/react-icons](https://react-icons.github.io/react-icons) to browse all available icons.

## Alternative: Flaticon SVG

If you prefer custom icons from Flaticon:

1. Download SVG from [flaticon.com](https://flaticon.com)
2. Save to `frontend/public/icons/`
3. Use in React:
```javascript
<img src="/icons/your-icon.svg" alt="Icon" style={{ width: 24, height: 24 }} />
```

Or inline SVG:
```javascript
<svg width="24" height="24" viewBox="0 0 24 24">
  {/* SVG content */}
</svg>
```
