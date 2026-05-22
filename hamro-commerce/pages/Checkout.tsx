import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard, MapPin, ShieldCheck, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS, resolveImageUrl } from '../src/constant/api';
import { useLanguage } from '../context/LanguageContext';
import CryptoJS from 'crypto-js';

const Checkout = () => {
  const { cart, clearCart, removeFromCart, fetchCart } = useCart();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCartItems, setSelectedCartItems] = useState([]);
  const initialCheckDone = useRef(false); // Prevent multiple initial checks

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: 'Kathmandu',
    paymentMethod: 'Cash On Delivery'
  });

  useEffect(() => {
    // Prevent multiple executions of initial checks
    if (initialCheckDone.current) {
      // Only update selected items when cart changes
      const selectedIds = JSON.parse(localStorage.getItem('selectedCartItems') || '[]');
      const selected = cart.filter(item => selectedIds.includes(item.id));
      setSelectedCartItems(selected);
      return;
    }

    initialCheckDone.current = true;

    const storedUserRaw = localStorage.getItem('user');
    let storedUser = null;
    if (storedUserRaw) {
      try {
        storedUser = JSON.parse(storedUserRaw);
      } catch (e) {
        console.error('Failed to parse stored user data');
      }
    }
    const savedName = storedUser?.name || localStorage.getItem('userName') || '';
    const savedEmail = storedUser?.email || localStorage.getItem('userEmail') || '';
    const savedPhone = storedUser?.phone || localStorage.getItem('userPhone') || '';

    setFormData(prev => ({
      ...prev,
      name: prev.name || savedName,
      email: prev.email || savedEmail,
      phone: prev.phone || savedPhone,
    }));

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login to proceed with checkout'
      });
      navigate('/login');
      return;
    }

    // Get selected items from localStorage
    const selectedIds = JSON.parse(localStorage.getItem('selectedCartItems') || '[]');
    if (selectedIds.length === 0) {
      // If no items selected, redirect back to cart
      navigate('/cart');
      return;
    }
    // Filter cart to only show selected items
    const selected = cart.filter(item => selectedIds.includes(item.id));
    setSelectedCartItems(selected);
  }, [cart]); // Only depend on cart changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total for selected items only
  const selectedTotal = selectedCartItems.reduce((acc, item) =>
    acc + (parseFloat(item.price) * item.quantity), 0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if at least one item is selected
    if (selectedCartItems.length === 0) {
      setError('No items selected for checkout');
      setLoading(false);
      return;
    }

    try {
      // Get auth token
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to place an order');
        navigate('/login');
        return;
      }

      // Handle eSewa payment
      if (formData.paymentMethod === 'eSewa') {
        // Validate form data before proceeding
        if (!formData.name || !formData.phone || !formData.address) {
          setError('Please fill all required fields');
          setLoading(false);
          return;
        }

        // Generate transaction UUID (simpler format)
        const transaction_uuid = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Calculate amounts - ensure 2 decimal places for eSewa
        const amount = parseFloat(selectedTotal.toFixed(2));
        const tax_amount = 0;
        const total_amount = parseFloat((amount + tax_amount).toFixed(2));
        const product_delivery_charge = 0;
        const product_service_charge = 0;
        const product_code = 'EPAYTEST'; // eSewa merchant code

        // Create the message to sign (exact format required by eSewa)
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const secret = '8gBm/:&EnhH.1/q'; // eSewa secret key for EPAYTEST

        // Generate signature using HMAC SHA256
        const hash = CryptoJS.HmacSHA256(message, secret);
        const signature = CryptoJS.enc.Base64.stringify(hash);

        console.log('eSewa Payment Debug:', {
          message,
          signature,
          transaction_uuid,
          total_amount,
          amount
        });

        // Store order data in localStorage for success page
        const orderData = {
          transaction_uuid,
          orderId: transaction_uuid,
          customerName: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          paymentMethod: 'eSewa',
          totalItems: selectedCartItems.length,
          totalAmount: total_amount,
          items: selectedCartItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            color: item.color || null,
            size: item.size || null
          }))
        };

        console.log('Saving order data to localStorage:', orderData);

        // Store in multiple places for reliability
        try {
          localStorage.setItem('esewaOrderData', JSON.stringify(orderData));
          sessionStorage.setItem('esewaOrderData', JSON.stringify(orderData));

          // Verify data was saved
          const savedData = localStorage.getItem('esewaOrderData');
          if (!savedData) {
            throw new Error('Failed to save order data to localStorage');
          }
          console.log('Order data saved successfully');
        } catch (storageError) {
          console.error('Storage error:', storageError);
          setError('Unable to save order data. Please check your browser settings and allow localStorage.');
          setLoading(false);
          return;
        }

        // Create form and submit to eSewa
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

        const fields = {
          amount: amount.toString(),
          tax_amount: tax_amount.toString(),
          total_amount: total_amount.toString(),
          transaction_uuid: transaction_uuid,
          product_code: product_code,
          product_service_charge: product_service_charge.toString(),
          product_delivery_charge: product_delivery_charge.toString(),
          success_url: `${window.location.origin}/esewa/success`,
          failure_url: `${window.location.origin}/esewa/failure`,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature: signature
        };

        console.log('eSewa Form Fields:', fields);
        console.log('Success URL:', fields.success_url);
        console.log('Failure URL:', fields.failure_url);

        Object.keys(fields).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = fields[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);

        // Add a small delay to ensure localStorage is written before redirect
        console.log('Submitting form to eSewa in 100ms...');
        setTimeout(() => {
          console.log('Submitting form to eSewa now');
          form.submit();
        }, 100);

        return;
      }

      // Handle Cash on Delivery
      const orderPromises = selectedCartItems.map(item =>
        fetch(API_ENDPOINTS.ORDERS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            product_id: item.product_id,
            price: parseFloat(item.price),
            quantity: item.quantity,
            payment_method: formData.paymentMethod,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            district: formData.district,
            payment_status: 'pending',
            color: item.color || null,
            size: item.size || null
          })
        }).then(res => res.json())
      );

      const results = await Promise.all(orderPromises);

      // Check if all orders were successful
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        // Prepare order data to pass to success page
        const orderData = {
          orderId: results[0]?.order?.id || Math.floor(100000 + Math.random() * 900000),
          customerName: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          paymentMethod: formData.paymentMethod,
          totalItems: selectedCartItems.length,
          totalAmount: selectedTotal,
          items: selectedCartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price)
          }))
        };

        // Remove ordered items from cart
        const removalPromises = selectedCartItems.map(item => removeFromCart(item.id));
        await Promise.all(removalPromises);

        // Refresh cart from backend to get updated data
        if (typeof fetchCart === 'function') {
          await fetchCart();
        }

        // Clear selected items from localStorage
        localStorage.removeItem('selectedCartItems');

        showAlert({
          type: 'success',
          title: 'Order Placed Successfully!',
          message: `Your order of ${selectedCartItems.length} item(s) has been placed successfully.`,
          duration: 3000
        });

        // Show bill as modal/popup by navigating to success page
        navigate('/order-success', { state: { orderData, showAsModal: true } });
      } else {
        setError('Some orders failed. Please try again.');
        showAlert({
          type: 'error',
          title: 'Order Failed',
          message: 'Some orders failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
      showAlert({
        type: 'error',
        title: 'Order Failed',
        message: error.message || 'Failed to place order. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/20">
      {/* Attractive Header Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">
                {t('checkoutTitle')}
              </h1>
              <p className="text-slate-300 text-sm md:text-base">Complete your order securely in just a few steps</p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-green-500/20 px-4 py-3 rounded-xl border border-green-400/30">
              <ShieldCheck className="text-green-400" size={24} />
              <div>
                <p className="text-xs text-green-300 font-medium">Secure Checkout</p>
                <p className="text-xs text-green-200">SSL Encrypted</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50">
                <CheckCircle size={20} />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">Step 1</p>
                <p className="text-sm font-semibold">Cart</p>
              </div>
            </div>

            <div className="flex-1 max-w-[100px] h-1 bg-gradient-to-r from-green-500 to-red-500 rounded-full"></div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center font-bold shadow-lg shadow-red-500/50 animate-pulse">
                2
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">Step 2</p>
                <p className="text-sm font-semibold text-red-400">Checkout</p>
              </div>
            </div>

            <div className="flex-1 max-w-[100px] h-1 bg-slate-700 rounded-full"></div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold border-2 border-slate-600">
                3
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-400">Step 3</p>
                <p className="text-sm font-semibold text-slate-400">Complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Info */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><MapPin size={24} /></div>
                <h2 className="text-xl font-bold text-slate-900">{t('shippingInformation')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('fullName')}</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('phoneNo')}</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">{t('address')}</label>
                  <input
                    required
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('city')}</label>
                  <input
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('district')}</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                  >
                    <option>Kathmandu</option>
                    <option>Lalitpur</option>
                    <option>Bhaktapur</option>
                    <option>Pokhara</option>
                    <option>Chitwan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard size={24} /></div>
                <h2 className="text-xl font-bold text-slate-900">{t('paymentMethod')}</h2>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{
                    borderColor: formData.paymentMethod === 'Cash On Delivery' ? '#dc2626' : '#e5e7eb',
                    backgroundColor: formData.paymentMethod === 'Cash On Delivery' ? '#fef2f2' : 'transparent'
                  }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash On Delivery"
                    checked={formData.paymentMethod === 'Cash On Delivery'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-600"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">{t('cashOnDelivery')}</span>
                    <span className="text-sm text-slate-500">Pay with cash when your order arrives.</span>
                  </div>
                  <Truck className="text-red-600" />
                </label>

                <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md"
                  style={{
                    borderColor: formData.paymentMethod === 'eSewa' ? '#60a917' : '#e5e7eb',
                    backgroundColor: formData.paymentMethod === 'eSewa' ? '#f0fdf4' : 'transparent'
                  }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="eSewa"
                    checked={formData.paymentMethod === 'eSewa'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">eSewa Mobile Wallet</span>
                    <span className="text-sm text-slate-500">Pay securely with eSewa digital wallet</span>
                  </div>
                  <svg className="w-8 h-8" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="55" fill="#60a917" />
                    <text x="60" y="75" fontSize="48" fontWeight="bold" fill="white" textAnchor="middle">e</text>
                  </svg>
                </label>

                <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition-all opacity-60">
                  <input type="radio" name="payment" className="w-5 h-5 text-purple-600" disabled />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 block">Khalti Digital Wallet</span>
                    <span className="text-sm text-slate-500">Coming soon...</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 sticky top-24 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-900">{t('orderSummaryTitle')}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {selectedCartItems.length} {selectedCartItems.length !== 1 ? t('items') : t('items').slice(0, -1)}
                </span>
              </div>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {selectedCartItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="flex-1 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden">
                          <img
                            src={resolveImageUrl(item.photo_url || item.image) || '/image/image.jpg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-slate-900 font-medium block">{item.name}</span>
                          {(item.color || item.size) && (
                            <span className="text-slate-500 text-xs block">
                              {item.color && `${item.color}`}
                              {item.color && item.size && ' • '}
                              {item.size && `${item.size}`}
                            </span>
                          )}
                          <span className="text-slate-500 text-xs">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="text-slate-900 font-semibold">
                        NPR {(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>{t('subtotal')} ({selectedCartItems.length} {selectedCartItems.length !== 1 ? t('items') : t('items').slice(0, -1)})</span>
                  <span>NPR {selectedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('shipping')}</span>
                  <span className="text-green-600 font-medium">{t('free')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-lg border-t border-dashed border-gray-200 pt-4">
                  <span>{t('total')}</span>
                  <span>NPR {selectedTotal.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                disabled={loading || selectedCartItems.length === 0}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? t('processing') : `${t('placeOrderBtn')} (${selectedCartItems.length} ${selectedCartItems.length !== 1 ? t('items') : t('items').slice(0, -1)})`}
              </button>

              <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                <ShieldCheck size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p>Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;