import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        {/* Simple Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 text-sm font-medium">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
