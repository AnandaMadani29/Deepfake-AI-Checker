/**
 * Icon Components for Deepfake Detection App
 * Using react-icons for professional, consistent icons
 */

import { 
  FaShieldAlt, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimesCircle,
  FaRobot,
  FaEye,
  FaHistory,
  FaUpload,
  FaImage,
  FaChartLine,
  FaLightbulb,
  FaCog,
  FaInfoCircle
} from 'react-icons/fa'

import { 
  MdVerified, 
  MdWarning, 
  MdInfo,
  MdSecurity,
  MdAnalytics,
  MdPhotoCamera
} from 'react-icons/md'

import { 
  HiShieldCheck, 
  HiPhotograph,
  HiLightningBolt,
  HiClock
} from 'react-icons/hi'

import { 
  AiOutlineRobot, 
  AiOutlineEye,
  AiOutlineSafety,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle
} from 'react-icons/ai'

import { 
  BiAnalyse, 
  BiImageAlt,
  BiBrain,
  BiShield
} from 'react-icons/bi'

import { 
  IoShieldCheckmark, 
  IoWarning,
  IoCheckmarkDone,
  IoAlertCircle
} from 'react-icons/io5'

// Reusable Icon Components with consistent styling

export const ShieldIcon = ({ size = 24, color = '#E94E1B' }) => (
  <FaShieldAlt size={size} color={color} />
)

export const VerifiedIcon = ({ size = 24, color = '#4ade80' }) => (
  <MdVerified size={size} color={color} />
)

export const WarningIcon = ({ size = 24, color = '#fbbf24' }) => (
  <IoWarning size={size} color={color} />
)

export const ErrorIcon = ({ size = 24, color = '#f87171' }) => (
  <FaTimesCircle size={size} color={color} />
)

export const RobotIcon = ({ size = 24, color = '#E94E1B' }) => (
  <AiOutlineRobot size={size} color={color} />
)

export const AnalysisIcon = ({ size = 24, color = '#60a5fa' }) => (
  <BiAnalyse size={size} color={color} />
)

export const HistoryIcon = ({ size = 24, color = '#E94E1B' }) => (
  <HiClock size={size} color={color} />
)

export const UploadIcon = ({ size = 24, color = '#999' }) => (
  <FaUpload size={size} color={color} />
)

export const ImageIcon = ({ size = 24, color = '#999' }) => (
  <BiImageAlt size={size} color={color} />
)

export const BrainIcon = ({ size = 24, color = '#E94E1B' }) => (
  <BiBrain size={size} color={color} />
)

export const LightbulbIcon = ({ size = 24, color = '#fbbf24' }) => (
  <FaLightbulb size={size} color={color} />
)

export const SecurityIcon = ({ size = 24, color = '#E94E1B' }) => (
  <MdSecurity size={size} color={color} />
)

export const CheckCircleIcon = ({ size = 24, color = '#4ade80' }) => (
  <AiOutlineCheckCircle size={size} color={color} />
)

export const CloseCircleIcon = ({ size = 24, color = '#f87171' }) => (
  <AiOutlineCloseCircle size={size} color={color} />
)

export const InfoIcon = ({ size = 24, color = '#60a5fa' }) => (
  <MdInfo size={size} color={color} />
)

export const ChartIcon = ({ size = 24, color = '#E94E1B' }) => (
  <FaChartLine size={size} color={color} />
)

export const LightningIcon = ({ size = 24, color = '#fbbf24' }) => (
  <HiLightningBolt size={size} color={color} />
)

// Severity-based icons for patterns
export const SeverityIcon = ({ severity, size = 20 }) => {
  const iconProps = { size }
  
  switch(severity) {
    case 'high':
      return <FaExclamationTriangle {...iconProps} color="#f87171" />
    case 'medium':
      return <IoWarning {...iconProps} color="#fb923c" />
    case 'warning':
      return <MdWarning {...iconProps} color="#fbbf24" />
    case 'info':
      return <MdInfo {...iconProps} color="#60a5fa" />
    case 'low':
    default:
      return <FaCheckCircle {...iconProps} color="#4ade80" />
  }
}

// Result badge icon
export const ResultIcon = ({ isFake, size = 32 }) => {
  if (isFake) {
    return <FaTimesCircle size={size} color="#f87171" />
  }
  return <FaCheckCircle size={size} color="#4ade80" />
}

// Confidence level icon
export const ConfidenceIcon = ({ level, size = 20 }) => {
  const iconProps = { size }
  
  switch(level) {
    case 'Very High':
      return <IoShieldCheckmark {...iconProps} color="#4ade80" />
    case 'High':
      return <HiShieldCheck {...iconProps} color="#60a5fa" />
    case 'Medium':
      return <IoAlertCircle {...iconProps} color="#fbbf24" />
    case 'Low':
    default:
      return <IoWarning {...iconProps} color="#fb923c" />
  }
}

export default {
  ShieldIcon,
  VerifiedIcon,
  WarningIcon,
  ErrorIcon,
  RobotIcon,
  AnalysisIcon,
  HistoryIcon,
  UploadIcon,
  ImageIcon,
  BrainIcon,
  LightbulbIcon,
  SecurityIcon,
  CheckCircleIcon,
  CloseCircleIcon,
  InfoIcon,
  ChartIcon,
  LightningIcon,
  SeverityIcon,
  ResultIcon,
  ConfidenceIcon
}
