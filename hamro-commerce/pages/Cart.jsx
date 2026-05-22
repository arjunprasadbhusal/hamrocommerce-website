import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, ChevronRight, ShieldCheck, Truck, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveImageUrl } from '../src/constant/api';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, cartTotal, fetchCart } = useCart();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [fetchCart, navigate]);

  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems(cart.map(item => item.id));
    }
  }, [cart]);

  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.id));
    }
  };

  const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));
  const selectedTotal = selectedCartItems.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showAlert({
        type: 'warning',
        title: t('noItemsSelected'),
        message: t('selectAtLeastOne')
      });
      return;
    }
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-900 border-t-red-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{t('loadingCart')}</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500">
              <ShoppingBag size={48} strokeWidth={1} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg animate-bounce">0</div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">{t('cartBlankTitle')}</h2>
          <p className="text-slate-400 mb-10 max-w-sm mx-auto text-xs font-medium leading-relaxed">{t('cartBlankDesc')}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full hover:bg-red-600 transition-all duration-500 font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200"
          >
            {t('startShopping')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">

      {/* Premium Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                <Link to="/" className="hover:text-red-600 transition-colors">{t('home')}</Link>
                <ChevronRight size={10} />
                <span className="text-slate-900">{t('yourCart')}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase">
                {t('yourSelection')} <span className="text-red-600">({cart.length})</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-emerald-100">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{t('secureCheckout')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">

            {/* Control Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cart.length}
                    onChange={toggleSelectAll}
                    className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-red-600 checked:border-red-600 transition-all duration-300"
                  />
                  <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white transition-opacity duration-300">
                    <Plus size={12} className="rotate-45" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">
                  {selectedItems.length === cart.length ? t('deselectAll') : t('selectAll')}
                </span>
              </label>
              <button
                onClick={clearCart}
                className="text-slate-400 hover:text-red-600 transition-all flex items-center gap-2 group"
              >
                <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('clearCart')}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-500 overflow-hidden ${selectedItems.includes(item.id)
                    ? 'border-red-100 shadow-lg shadow-slate-200/40 ring-1 ring-red-50'
                    : 'border-slate-100 hover:border-slate-200 hover:shadow-md shadow-sm'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Item Image Section */}
                    <div className="relative w-full sm:w-20 aspect-square sm:aspect-auto bg-slate-50 p-2 flex items-center justify-center overflow-hidden">
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="peer appearance-none w-3 h-3 border-2 border-slate-200 rounded-md checked:bg-red-600 checked:border-red-600 bg-white transition-all duration-300 cursor-pointer shadow-lg"
                        />
                      </div>
                      <img
                        src={resolveImageUrl(item.photo_url || item.image) || '/image/image.jpg'}
                        alt={item.name}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { e.target.src = '/image/image.jpg'; }}
                      />
                    </div>

                    {/* Item Details Section */}
                    <div className="flex-1 p-2.5 md:p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-3 mb-1.5">
                          <div>
                            <span className="text-[6px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest mb-1 inline-block">
                              {item.category?.name || t('handcraftedLabel')}
                            </span>
                            <h3 className="text-[12px] font-bold text-slate-900 leading-tight uppercase tracking-tight group-hover:text-red-600 transition-colors">
                              {item.name}
                            </h3>
                            {(item.color || item.size) && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {item.color && (
                                  <span className="text-[6px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 flex items-center gap-1 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> {t('colorLabel')}: {item.color}
                                  </span>
                                )}
                                {item.size && (
                                  <span className="text-[6px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 uppercase">
                                    {t('sizeLabel')}: {item.size}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-5 h-5 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={7} fill="currentColor" />)}
                          </div>
                          <span className="text-[6px] font-bold text-slate-400 tracking-wider">{t('premiumQuality')}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-3 mt-1.5 pt-1.5 border-t border-slate-50">
                        <div>
                          <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('itemTotal')}</p>
                          <p className="text-[13px] font-bold text-slate-900 tracking-tighter">NPR {(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                        </div>

                        {/* Modern Quantity Controls */}
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-100">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loading}
                            className="w-5 h-5 rounded-sm bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                          >
                            <Minus size={9} />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 1) {
                                updateQuantity(item.id, val);
                              }
                            }}
                            className="text-[10px] font-bold w-5 text-center bg-transparent border-none focus:ring-0 p-0 text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={loading || (item.stock !== undefined && item.quantity >= item.stock)}
                            className="w-5 h-5 rounded-sm bg-white flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Summary Section */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white shadow-2xl shadow-slate-200">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 text-slate-400">{t('orderSummary')}</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center group">
                    <span className="text-[11px] font-medium text-slate-400">{t('subtotal')}</span>
                    <span className="text-xs font-bold tracking-tight">NPR {selectedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-2">
                      <Truck size={12} /> {t('shipping')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('free')}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-[11px] font-medium text-slate-400">{t('estimatedTax')}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('included')}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800 mb-8">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('totalAmount')}</span>
                    <span className="text-xl font-bold tracking-tighter text-white">NPR {selectedTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium leading-none">{t('vatIncluded')}</p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-2 shadow-xl shadow-red-900/20 active:scale-[0.98]"
                >
                  {t('proceedToCheckout')} <ArrowRight size={14} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{t('purchaseProtection')}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{t('dataEncrypted')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Truck size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">{t('expressDelivery')}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">{t('quickShipping')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;