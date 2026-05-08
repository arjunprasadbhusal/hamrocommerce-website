import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';
import { XCircle, ArrowLeft } from 'lucide-react';

const EsewaFailure = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const hasShownAlert = useRef(false); // Prevent multiple alerts

    useEffect(() => {
        // Prevent multiple alert executions
        if (hasShownAlert.current) {
            return;
        }
        
        hasShownAlert.current = true;
        
        // Clear stored order data
        localStorage.removeItem('esewaOrderData');
        sessionStorage.removeItem('esewaOrderData');
        
        // Show error message
        showAlert({
            type: 'error',
            title: 'Payment Failed',
            message: 'Your eSewa payment was cancelled or failed. Please try again.',
            duration: 5000
        });
    }, []); // Empty dependency array - only run once

    const handleRetry = () => {
        navigate('/checkout');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-red-400 to-red-600 rounded-full p-6 shadow-lg">
                            <XCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Payment Failed
                </h1>
                
                <p className="text-lg text-gray-600 mb-8">
                    Your eSewa payment was not completed. This could be due to:
                </p>

                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8 text-left">
                    <ul className="list-disc list-inside text-sm text-red-800 space-y-2">
                        <li>Payment was cancelled</li>
                        <li>Insufficient balance in eSewa wallet</li>
                        <li>Network connectivity issues</li>
                        <li>Transaction timeout</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleRetry}
                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                    >
                        Try Again
                    </button>
                    
                    <button
                        onClick={() => navigate('/cart')}
                        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Cart
                    </button>
                </div>

                {/* Support Info */}
                <div className="mt-8 text-sm text-gray-600">
                    Need help? Contact us at{' '}
                    <span className="text-red-600 font-semibold">support@hamro-commerce.com</span>
                </div>
            </div>
        </div>
    );
};

export default EsewaFailure;
