import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  isDarkMode: boolean;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 3000,
  isDarkMode 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: isDarkMode ? 'bg-emerald-900/90' : 'bg-emerald-50',
          border: 'border-emerald-500',
          text: isDarkMode ? 'text-emerald-300' : 'text-emerald-800',
          icon: (
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'error':
        return {
          bg: isDarkMode ? 'bg-red-900/90' : 'bg-red-50',
          border: 'border-red-500',
          text: isDarkMode ? 'text-red-300' : 'text-red-800',
          icon: (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'warning':
        return {
          bg: isDarkMode ? 'bg-amber-900/90' : 'bg-amber-50',
          border: 'border-amber-500',
          text: isDarkMode ? 'text-amber-300' : 'text-amber-800',
          icon: (
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'info':
      default:
        return {
          bg: isDarkMode ? 'bg-blue-900/90' : 'bg-blue-50',
          border: 'border-blue-500',
          text: isDarkMode ? 'text-blue-300' : 'text-blue-800',
          icon: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div
        className={`${styles.bg} ${styles.text} backdrop-blur-md border-l-4 ${styles.border} rounded-xl shadow-2xl px-5 py-4 flex items-center space-x-3 min-w-[320px] max-w-md`}
      >
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        <p className="flex-1 text-sm font-medium leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 rounded-lg p-1 transition-colors ${
            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
