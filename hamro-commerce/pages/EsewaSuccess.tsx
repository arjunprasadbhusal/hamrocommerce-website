import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAlert } from '../context/AlertContext';
import { API_ENDPOINTS } from '../src/constant/api';
import { Loader2 } from 'lucide-react';

const EsewaSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { removeFromCart, fetchCart } = useCart();
    const { showAlert } = useAlert();
    const [processing, setProcessing] = useState(true);
    const hasProcessed = useRef(false); // Prevent multiple executions

    useEffect(() => {
        // Prevent multiple executions
        if (hasProcessed.current) {
            console.log('Payment already processed, skipping...');
            return;
        }

        const verifyPayment = async () => {
            hasProcessed.current = true; // Mark as processed immediately
            
            try {
                // Get payment data from URL params
                const data = searchParams.get('data');
                
                console.log('eSewa callback received');
                console.log('URL params:', Object.fromEntries(searchParams.entries()));
                console.log('Current URL:', window.location.href);
                
                if (!data) {
                    throw new Error('No payment data received from eSewa');
                }

                // Decode the base64 data from eSewa
                let decodedData;
                try {
                    decodedData = JSON.parse(atob(data));
                    console.log('eSewa Response Data:', decodedData);
                } catch (e) {
                    console.error('Failed to decode eSewa response:', e);
                    throw new Error('Invalid payment data format');
                }
                
                // Get stored order data - try multiple sources
                console.log('Checking localStorage...');
                let orderDataStr = localStorage.getItem('esewaOrderData');
                console.log('localStorage data:', orderDataStr ? 'Found' : 'Not found');
                
                if (!orderDataStr) {
                    console.log('Checking sessionStorage...');
                    orderDataStr = sessionStorage.getItem('esewaOrderData');
                    console.log('sessionStorage data:', orderDataStr ? 'Found' : 'Not found');
                }
                
                if (!orderDataStr) {
                    console.error('Order data not found in storage');
                    console.error('Available localStorage keys:', Object.keys(localStorage));
                    console.error('Available sessionStorage keys:', Object.keys(sessionStorage));
                    
                    // Try to recover from URL params if transaction UUID is available
                    if (decodedData.transaction_uuid) {
                        console.log('Attempting to recover order from transaction UUID...');
                        showAlert({
                            type: 'warning',
                            title: 'Recovering Order',
                            message: 'Attempting to recover your order information...',
                            duration: 3000
                        });
                        
                        // Redirect to a recovery page or handle differently
                        throw new Error('Order data not found. Your payment was successful but we need additional information. Please contact support with transaction ID: ' + decodedData.transaction_uuid);
                    }
                    
                    throw new Error('Order data not found. Please try placing order again.');
                }
                
                const orderData = JSON.parse(orderDataStr);
                console.log('Stored Order Data:', orderData);
                
                const token = localStorage.getItem('token');

                if (!token) {
                    throw new Error('Please login to continue');
                }

                // Test API connectivity before proceeding
                console.log('Testing API connectivity...');
                console.log('API Endpoint:', API_ENDPOINTS.ORDERS);
                
                try {
                    const testResponse = await fetch(`${API_ENDPOINTS.ORDERS}/../products`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (!testResponse.ok) {
                        throw new Error(`API server returned status ${testResponse.status}`);
                    }
                    console.log('API connectivity test: Success');
                } catch (apiError) {
                    console.error('API connectivity test failed:', apiError);
                    throw new Error('Cannot connect to backend API server at http://192.168.1.64:8000. Please ensure the Laravel server is running.');
                }

                // Verify payment status
                if (decodedData.status !== 'COMPLETE') {
                    console.error('Payment not completed. Status:', decodedData.status);
                    throw new Error(`Payment was not completed. Status: ${decodedData.status}`);
                }

                // Verify transaction UUID matches
                if (decodedData.transaction_uuid !== orderData.transaction_uuid) {
                    console.error('Transaction UUID mismatch');
                    console.error('Expected:', orderData.transaction_uuid);
                    console.error('Received:', decodedData.transaction_uuid);
                    throw new Error('Transaction verification failed');
                }

                console.log('Payment verified successfully');

                // Create orders for each cart item
                console.log('Creating orders for', orderData.items.length, 'items');
                
                const orderPromises = orderData.items.map(async (item, index) => {
                    console.log(`Creating order ${index + 1}:`, {
                        product_id: item.product_id,
                        price: item.price,
                        quantity: item.quantity,
                        name: item.name
                    });
                    
                    try {
                        const response = await fetch(API_ENDPOINTS.ORDERS, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                product_id: item.product_id,
                                price: item.price,
                                quantity: item.quantity,
                                payment_method: 'eSewa',
                                name: orderData.customerName,
                                phone: orderData.phone,
                                address: orderData.address,
                                city: orderData.city,
                                district: orderData.district,
                                cart_id: item.id,
                                transaction_id: decodedData.transaction_code || decodedData.transaction_uuid,
                                transaction_uuid: orderData.transaction_uuid,
                                payment_status: 'completed',
                                color: item.color || null,
                                size: item.size || null
                            })
                        });

                        // Check if response is ok
                        if (!response.ok) {
                            console.error(`Order ${index + 1} failed with status:`, response.status);
                            const text = await response.text();
                            console.error('Response text:', text);
                            throw new Error(`Failed to create order: ${response.status} - ${text.substring(0, 100)}`);
                        }

                        // Check content type before parsing JSON
                        const contentType = response.headers.get('content-type');
                        if (!contentType || !contentType.includes('application/json')) {
                            const text = await response.text();
                            console.error('Non-JSON response received:', text.substring(0, 200));
                            throw new Error('Backend returned invalid response. Please ensure the API server is running properly.');
                        }

                        return await response.json();
                    } catch (error) {
                        console.error(`Error creating order ${index + 1}:`, error);
                        throw error;
                    }
                });

                const results = await Promise.all(orderPromises);
                console.log('Order creation results:', results);

                // Check if all orders were successful
                const allSuccessful = results.every(result => result.success);

                if (!allSuccessful) {
                    const failedOrders = results.filter(r => !r.success);
                    console.error('Failed orders:', failedOrders);
                    throw new Error('Failed to create some orders. Please contact support.');
                }

                // Remove ordered items from cart
                console.log('Removing items from cart...');
                try {
                    const removalPromises = orderData.items.map(item => removeFromCart(item.id));
                    await Promise.all(removalPromises);
                    console.log('Cart items removed successfully');
                } catch (error) {
                    console.error('Error removing cart items:', error);
                    // Continue even if cart removal fails
                }

                // Refresh cart
                if (typeof fetchCart === 'function') {
                    try {
                        await fetchCart();
                        console.log('Cart refreshed successfully');
                    } catch (error) {
                        console.error('Error refreshing cart:', error);
                    }
                }

                // Clear stored data
                localStorage.removeItem('esewaOrderData');
                sessionStorage.removeItem('esewaOrderData');
                localStorage.removeItem('selectedCartItems');
                console.log('Cleared temporary data');

                // Show success message
                showAlert({
                    type: 'success',
                    title: 'Payment Successful!',
                    message: 'Your order has been placed successfully with eSewa payment.',
                    duration: 3000
                });

                // Navigate to success page
                console.log('Navigating to order success page');
                navigate('/order-success', { 
                    state: { 
                        orderData: {
                            ...orderData,
                            orderId: results[0]?.order?.id || orderData.orderId,
                            transactionCode: decodedData.transaction_code
                        }
                    } 
                });

            } catch (error) {
                console.error('Payment verification error:', error);
                
                // Provide more specific error messages
                let errorMessage = error.message || 'Failed to verify payment';
                
                if (errorMessage.includes('Cannot connect to backend') || errorMessage.includes('Failed to fetch')) {
                    errorMessage = 'Cannot connect to the backend server. Please contact support with your transaction details.';
                }
                
                showAlert({
                    type: 'error',
                    title: 'Payment Failed',
                    message: errorMessage,
                    duration: 8000
                });
                
                // Clear stored data
                localStorage.removeItem('esewaOrderData');
                sessionStorage.removeItem('esewaOrderData');
                
                // Navigate back to checkout
                navigate('/checkout');
            } finally {
                setProcessing(false);
            }
        };

        verifyPayment();
    }, [searchParams]); // Only depend on searchParams to prevent multiple executions

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
                <div className="mb-6">
                    <Loader2 className="w-16 h-16 mx-auto text-green-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verifying Payment
                </h2>
                <p className="text-gray-600">
                    Please wait while we verify your eSewa payment...
                </p>
            </div>
        </div>
    );
};

export default EsewaSuccess;
