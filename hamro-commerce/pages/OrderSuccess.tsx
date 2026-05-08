import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Package, Home, ArrowRight, ShieldCheck, Mail, Clock, Download, Printer, Share2, MapPin, AlertCircle } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

const OrderSuccess = () => {
    const location = useLocation();
    const { showAlert } = useAlert();
    const [orderData, setOrderData] = useState(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const receiptRef = useRef(null);

    useEffect(() => {
        // 1. Try to get data from navigation state (highest priority)
        if (location.state && location.state.orderData) {
            console.log('OrderSuccess: Data found in navigation state');
            setOrderData(location.state.orderData);
            localStorage.setItem('hamro_last_order', JSON.stringify(location.state.orderData));
        }
        // 2. Try to recover from local storage
        else {
            const savedData = localStorage.getItem('hamro_last_order');
            if (savedData) {
                console.log('OrderSuccess: Data recovered from localStorage');
                try {
                    setOrderData(JSON.parse(savedData));
                } catch (e) {
                    console.error('Failed to parse saved order data');
                }
            }
        }

        window.scrollTo(0, 0);

        // Load html2pdf script dynamically
        if (!window.html2pdf) {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.async = true;
            script.onload = () => setIsScriptLoaded(true);
            document.body.appendChild(script);
        } else {
            setIsScriptLoaded(true);
        }
    }, [location]);

    const orderId = orderData?.orderId || orderData?.transaction_uuid || 'REF-' + Math.floor(Math.random() * 100000);
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const element = receiptRef.current;
        if (!element || !window.html2pdf) {
            showAlert({
                type: 'info',
                title: 'Please Wait',
                message: 'PDF engine is still loading, please wait a moment...'
            });
            return;
        }

        const opt = {
            margin: 0.3,
            filename: `receipt-${orderId}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
                scale: 3,
                useCORS: true,
                letterRendering: true,
                windowWidth: 800
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        window.html2pdf().from(element).set(opt).save();
    };

    // If no order data is found and we can't recover, show a friendly helper instead of a blank screen
    if (!orderData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <AlertCircle size={40} />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Order Not Found</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                        We couldn't find your recent order information. Don't worry, your order was likely placed successfully.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link to="/shop" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">
                            Continue Shopping
                        </Link>
                        <Link to="/" className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                            Go to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fff7f0] via-[#f9fafb] to-[#fff1f2] flex items-center justify-center py-12 px-4 print:bg-white print:p-0"
            style={{
                ['--ink' as any]: '#0f172a',
                ['--accent' as any]: '#ef4444',
                ['--accent-soft' as any]: '#fde2e2'
            }}
        >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
                .receipt-float { animation: receiptFloat 8s ease-in-out infinite; }
                @keyframes receiptFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            `}</style>

            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#ffedd5] blur-3xl opacity-70"></div>
            <div className="absolute -bottom-28 -right-28 w-72 h-72 rounded-full bg-[#fee2e2] blur-3xl opacity-70"></div>

            <div className="max-w-md w-full relative">
                {/* Header - Hidden on Print */}
                <div className="text-center mb-7 print:hidden">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/80 text-emerald-600 shadow-lg shadow-emerald-200/40 border border-emerald-100">
                        <CheckCircle size={24} strokeWidth={1.5} />
                    </div>
                    <h1 className="mt-4 text-2xl font-['Cinzel'] font-bold text-slate-900 tracking-[0.18em] uppercase">Order Confirmed</h1>
                    <p className="text-[10px] font-['Space_Grotesk'] font-semibold text-slate-500 uppercase tracking-[0.35em]">Receipt below</p>
                </div>

                {/* Compact Receipt */}
                <div
                    ref={receiptRef}
                    className="receipt-float bg-white rounded-3xl border border-white/40 shadow-2xl shadow-rose-100/60 overflow-hidden print:border-none print:shadow-none"
                >
                    <div className="px-6 py-4 bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#111827] text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xs font-['Cinzel'] font-bold uppercase tracking-[0.35em]">Hamro Commerce</h2>
                                <p className="text-[9px] font-['Space_Grotesk'] uppercase tracking-[0.3em] text-white/70">Order Receipt</p>
                            </div>
                            <span className="text-[9px] font-['Space_Grotesk'] bg-white/10 px-2.5 py-1 rounded-full tracking-widest">#{orderId}</span>
                        </div>
                    </div>

                    <div className="px-6 py-5 space-y-5 font-['Space_Grotesk']">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                            <span>{currentDate}</span>
                            <span className="text-slate-500">{orderData?.paymentMethod || 'Confirmed'}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Customer</span>
                            <span className="font-bold text-slate-900">{orderData.customerName || 'Customer'}</span>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Package size={14} className="text-slate-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Items</span>
                            </div>
                            <div className="space-y-2">
                                {orderData?.items && orderData.items.length > 0 ? (
                                    orderData.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-[11px]">
                                            <span className="text-slate-800">{item.name} x{item.quantity}</span>
                                            <span className="font-semibold text-slate-900">NPR {Number(item.price).toLocaleString()}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-800">Items</span>
                                        <span className="font-semibold text-slate-900">NPR {Number(orderData?.totalAmount || 0).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <div className="flex justify-between text-[11px] text-slate-600">
                                <span>Subtotal</span>
                                <span>NPR {Number(orderData?.totalAmount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-600 mt-1">
                                <span>Shipping</span>
                                <span className="text-emerald-600 font-semibold">Free</span>
                            </div>
                            <div className="flex justify-between text-sm font-black text-slate-900 mt-3">
                                <span>Total</span>
                                <span className="text-[#ef4444]">NPR {Number(orderData?.totalAmount || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 text-center bg-white border-t border-slate-100">
                        <p className="text-[9px] text-slate-400 font-['Space_Grotesk'] uppercase tracking-[0.35em]">HAMRO-COMMERCE.COM</p>
                    </div>
                </div>

                {/* Actions - Hidden on Print */}
                <div className="mt-7 flex flex-wrap gap-3 justify-center print:hidden font-['Space_Grotesk']">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        <Printer size={14} /> Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-xl font-semibold text-[10px] uppercase tracking-widest hover:bg-[#ef4444] transition-all"
                    >
                        <Download size={14} /> PDF
                    </button>
                </div>

                <div className="mt-5 text-center print:hidden font-['Space_Grotesk']">
                    <Link
                        to="/"
                        className="bg-white/80 text-slate-700 px-6 py-3 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                        Return to Shop
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;