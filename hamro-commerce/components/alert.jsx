import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Alert = ({ 
  type = 'info', 
  message, 
  title, 
  onClose, 
  autoClose = false, 
  duration = 5000,
  position = 'top-right' 
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const alertStyles = {
    success: {
      container: 'bg-green-50 border-green-500 text-green-800',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      title: 'Success',
    },
    error: {
      container: 'bg-red-50 border-red-500 text-red-800',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      title: 'Error',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-500 text-yellow-800',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
      title: 'Warning',
    },
    info: {
      container: 'bg-blue-50 border-blue-500 text-blue-800',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
      title: 'Information',
    },
  };

  const positionStyles = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  };

  const currentStyle = alertStyles[type] || alertStyles.info;

  return (
    <div 
      className={`${positionStyles[position]} max-w-md w-full animate-slide-in-right`}
      role="alert"
    >
      <div className={`border-l-4 p-4 rounded-lg shadow-lg ${currentStyle.container}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {currentStyle.icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">
              {title || currentStyle.title}
            </h3>
            {message && (
              <div className="mt-1 text-sm">
                {message}
              </div>
            )}
          </div>
          {onClose && (
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={onClose}
                className="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Toast notification component for stacking alerts
export const Toast = ({ alerts = [], removeAlert }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert, index) => (
        <div
          key={alert.id || index}
          className="animate-slide-in-right"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => removeAlert(alert.id || index)}
            autoClose={alert.autoClose !== false}
            duration={alert.duration || 5000}
          />
        </div>
      ))}
    </div>
  );
};

// Inline Alert component (not floating)
export const InlineAlert = ({ type = 'info', message, title, onClose, className = '' }) => {
  const alertStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      title: 'Success',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      title: 'Error',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
      title: 'Warning',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
      title: 'Information',
    },
  };

  const currentStyle = alertStyles[type] || alertStyles.info;

  return (
    <div className={`border rounded-lg p-4 ${currentStyle.container} ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {currentStyle.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {title || currentStyle.title}
          </h3>
          {message && (
            <div className="mt-1 text-sm">
              {message}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
