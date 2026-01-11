import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Minus,
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreVertical,
  Grid3X3,
  List,
  Layout,
  Zap,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Activity,
  Clock,
  Calendar,
  User,
  Users,
  Folder,
  File,
  Star,
  Heart,
  Share,
  Link,
  ExternalLink,
  RefreshCw,
  RotateCw,
  Maximize2,
  Minimize2,
  Fullscreen,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Key,
  Database,
  Cloud,
  Server,
  GitBranch,
  GitMerge,
  GitPull,
  GitPush,
  Terminal,
  Code,
  FileText,
  Image,
  Video,
  Music,
  Volume2,
  Bell,
  HelpCircle,
  LogIn,
  LogOut,
  UserPlus,
  Settings2,
  Menu,
  Home,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';

// Enhanced Button Component
interface EnhancedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'full' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  tooltip?: string;
  badge?: string | number;
}

export function EnhancedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = 'md',
  onClick,
  className = '',
  tooltip,
  badge
}: EnhancedButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md'}
    ${fullWidth ? 'w-full' : ''}
    ${iconPosition === 'right' ? 'flex-row-reverse' : ''}
  `;

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  return (
    <motion.button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        ${isHovered ? 'transform scale-105' : ''}
        ${loading ? 'cursor-wait' : 'cursor-pointer'}
      `.trim()}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex items-center gap-2">
          {iconPosition === 'right' ? children : icon}
          {iconPosition === 'left' ? icon : children}
        </span>
      ) : (
        children
      )}
      
      {badge && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </motion.button>
  );
}

// Enhanced Input Component
interface EnhancedInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EnhancedInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  label,
  error,
  helper,
  disabled = false,
  required = false,
  icon,
  loading = false,
  className = '',
  size = 'md'
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${required ? 'required' : ''}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            ${sizeClasses[size]}
            ${icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
            ${isFocused ? 'ring-2 ring-blue-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            border-2 rounded-lg
            w-full
            transition-all duration-200 ease-in-out
            focus:outline-none
            ${loading ? 'cursor-wait' : ''}
          `.trim()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
      
      {helper && (
        <p className="text-gray-500 text-sm mt-1">{helper}</p>
      )}
    </div>
  );
}

// Enhanced Card Component
interface EnhancedCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export function EnhancedCard({
  children,
  title,
  description,
  icon,
  actions,
  variant = 'default',
  hover = true,
  className = '',
  padding = 'md'
}: EnhancedCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-200 shadow-lg hover:shadow-xl',
    outlined: 'bg-white border-2 border-gray-300',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  return (
    <motion.div
      className={`
        ${variantClasses[variant]}
        ${hover ? 'hover:shadow-xl transition-all duration-300 ease-in-out' : ''}
        ${isHovered ? 'transform scale-105' : ''}
        rounded-xl
        ${className}
      `.trim()}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {(title || icon || actions) && (
        <div className={`flex items-center justify-between mb-4 ${paddingClasses[padding]}`}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="text-gray-600 text-sm mt-1">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </motion.div>
  );
}

// Enhanced Modal Component
interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

export function EnhancedModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true
}: EnhancedModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeOnBackdrop ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`
              ${sizeClasses[size]}
              w-full
              bg-white
              rounded-xl
              shadow-2xl
              max-h-[90vh]
              overflow-y-auto
            `.trim()}
            onClick={(e) => e.stopPropagation()}
          >
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b">
                {title && (
                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>
            )}
            
            <div className={title || showCloseButton ? 'p-6' : 'p-6 pt-6'}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Enhanced Sidebar Component
interface EnhancedSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export function EnhancedSidebar({
  children,
  isOpen,
  onClose,
  title,
  position = 'left',
  width = 'md'
}: EnhancedSidebarProps) {
  const widthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-112'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ x: position === 'left' ? -320 : 320 }}
            animate={{ x: 0 }}
            exit={{ x: position === 'left' ? -320 : 320 }}
            className={`fixed top-0 ${position}-0 h-full z-40 ${widthClasses[width]} bg-white shadow-2xl`}
          >
            {title && (
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50"
          />
        </>
      )}
    </AnimatePresence>
  );
}

// Enhanced Loading Component
interface EnhancedLoadingProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function EnhancedLoading({
  type = 'spinner',
  size = 'md',
  text,
  className = ''
}: EnhancedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (type === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className={`bg-gray-200 rounded ${sizeClasses[size]}`} />
        {text && <p className="text-gray-500 text-sm mt-2">{text}</p>}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`bg-blue-500 rounded-full ${sizeClasses[size]}`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.2 }}
          />
        ))}
        {text && <p className="text-gray-500 text-sm mt-2">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className={`text-blue-500 animate-spin ${sizeClasses[size]}`} />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}

// Enhanced Notification Component
interface EnhancedNotificationProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export function EnhancedNotification({
  type = 'info',
  title,
  message,
  duration = 5000,
  action,
  onClose
}: EnhancedNotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      bgColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    }
  };

  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-80
        ${config.bgColor}
        ${config.borderColor}
        border-2 rounded-lg shadow-lg
        p-4
      `.trim()}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.textColor}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${config.textColor} hover:opacity-75 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// Enhanced Dropdown Component
interface EnhancedDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EnhancedDropdown({
  trigger,
  children,
  align = 'left',
  width = 'md',
  className = ''
}: EnhancedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const widthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80'
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {trigger}
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`
              absolute top-full mt-2
              ${align === 'right' ? 'right-0' : 'left-0'}
              ${widthClasses[width]}
              bg-white
              border border-gray-200
              rounded-md
              shadow-lg
              z-50
              overflow-hidden
            `.trim()}
          >
            <div className="py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Progress Component
interface EnhancedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function EnhancedProgress({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'blue',
  size = 'md',
  animated = true
}: EnhancedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValue && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className="relative bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0 }}
        />
      </div>
    </div>
  );
}

// Enhanced Badge Component
interface EnhancedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function EnhancedBadge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}: EnhancedBadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <div className={`
      inline-flex items-center
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      rounded-full
      font-medium
      ${className}
    `.trim()}>
      {dot && (
        <div className="w-2 h-2 bg-current rounded-full mr-2" />
      )}
      {children}
    </div>
  );
}

// Enhanced Tooltip Component
interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function EnhancedTooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className = ''
}: EnhancedTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              absolute z-50 px-3 py-2 text-sm
              bg-gray-900 text-white
              rounded-lg shadow-lg
              max-w-xs
              ${position === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' : ''}
              ${position === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' : ''}
              ${position === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' : ''}
              ${position === 'right' ? 'left-full ml-2 top-1/2 transform -translate-y-1/2' : ''}
            `.trim()}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Tabs Component
interface EnhancedTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function EnhancedTabs({
  tabs,
  defaultTab,
  onTabChange,
  className = '',
  variant = 'default'
}: EnhancedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const variantClasses = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 rounded-lg p-1',
    underline: 'border-b-2 border-transparent'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className={`flex space-x-1 ${variantClasses[variant]}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium
              transition-all duration-200 ease-in-out
              ${activeTab === tab.id 
                ? variant === 'default' 
                  ? 'text-blue-600 border-blue-600 border-b-2'
                  : variant === 'pills'
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-600 border-blue-600 border-b-2'
                : 'text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }
            `.trim()}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <AnimatePresence key={tab.id}>
            {activeTab === tab.id ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                {tab.content}
              </motion.div>
            ) : (
              <div className="hidden">
                {tab.content}
              </div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}
