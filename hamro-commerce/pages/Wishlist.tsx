import React, { useEffect } from 'react';
import { Trash2, ShoppingCart, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveImageUrl } from '../src/constant/api';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showAlert } = useAlert();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [fetchWishlist, navigate]);

  const handleAddToCart = async (product: any) => {
    const result = await addToCart(product, product.size, product.color);
    if (result?.success) {
      showAlert({
        type: 'success',
        title: t('addedToCartTitle'),
        message: `${product.name} ${t('addedToCartMessageSuffix')}`
      });
    } else if (result?.alreadyInCart) {
      showAlert({
        type: 'info',
        title: t('alreadyInCartTitle'),
        message: t('alreadyInCartMessage')
      });
    } else {
      showAlert({
        type: 'error',
        title: t('errorTitle'),
        message: result?.message || t('addToCartFailedMessage')
      });
    }
  };

  const handleRemove = async (productId: number, productName: string) => {
    await removeFromWishlist(productId);
    showAlert({
      type: 'success',
      title: t('removedFromWishlistTitle'),
      message: `${productName} ${t('removedFromWishlistMessageSuffix')}`
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f4f1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-700 font-semibold tracking-wide">{t('wishlistLoading')}</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f4f1] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');`}</style>
          <div className="w-28 h-28 bg-[radial-gradient(circle_at_30%_30%,#bbf7d0,transparent_55%),radial-gradient(circle_at_70%_70%,#bfdbfe,transparent_60%)] rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <Heart size={50} strokeWidth={1.5} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-['Playfair_Display'] font-bold text-slate-900 mb-3">{t('wishlistEmptyTitle')}</h2>
          <p className="text-slate-600 mb-8 font-['Space_Grotesk']">
            {t('wishlistEmptyDesc')}
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-600 text-white px-8 py-4 rounded-full hover:from-green-700 hover:to-green-700 transition-all font-semibold shadow-lg">
            {t('startShopping')} <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/shop" className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-700">
                <ArrowLeft size={22} />
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-bold text-slate-900">
                  {t('myWishlist')}
                </h1>
                <p className="text-sm text-slate-600 mt-2 flex items-center gap-2 font-['Space_Grotesk']">
                  <Heart size={16} className="text-green-500" fill="currentColor" />
                  {wishlist.length} {wishlist.length === 1 ? t('item') : t('items')} {t('itemsSavedForYou')}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <Heart size={20} className="text-green-500" fill="currentColor" />
              <div>
                <p className="text-xs text-slate-900 font-semibold font-['Space_Grotesk']">{t('yourFavorites')}</p>
                <p className="text-xs text-slate-500 font-['Space_Grotesk']">{t('curatedPicks')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-5 gap-2">
          {wishlist.map((item) => (
            <div key={item.id} className="group bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:-translate-y-1">
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                <img
                  src={resolveImageUrl(item.product.photo_url) || '/image/image.jpg'}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/image/image.jpg';
                  }}
                />
                {item.product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-white text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold shadow-xl font-['Space_Grotesk']">
                      {t('outOfStock')}
                    </span>
                  </div>
                )}
                {/* Premium Remove Button */}
                <button
                  onClick={() => handleRemove(item.product.id, item.product.name)}
                  className="absolute top-1.5 right-1.5 p-1 bg-white/95 backdrop-blur-md text-green-600 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-md hover:scale-105"
                >
                  <Trash2 size={11} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-2 font-['Space_Grotesk']">
                <div className="mb-1">
                  <span className="inline-block text-[7px] font-bold text-green-600 bg-blue-50 px-1.5 py-0.5 rounded-full mb-1 border border-blue-100">
                    {item.product.category?.name || t('product')}
                  </span>
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="font-bold text-[11px] text-slate-900 line-clamp-2 hover:text-green-600 transition-colors leading-tight">
                      {item.product.name}
                    </h3>
                  </Link>
                </div>

                <div className="mb-2">
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-[13px] font-bold text-slate-900">
                      NPR {Number(item.product.price).toLocaleString()}
                    </span>
                  </div>
                  {item.product.stock > 0 ? (
                    <div className="flex items-center gap-1 text-[7px] text-emerald-700 bg-emerald-50 font-semibold px-1.5 py-0.5 rounded-md border border-emerald-200">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item.product.stock} {t('unitsAvailable')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[7px] text-green-700 bg-blue-50 font-semibold px-1.5 py-0.5 rounded-md border border-blue-200">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {t('currentlyUnavailable')}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    disabled={item.product.stock <= 0}
                    className={`flex-1 py-1.5 rounded-md font-bold text-[9px] tracking-wide transition-all duration-300 flex items-center justify-center gap-1 ${item.product.stock <= 0
                      ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:-translate-y-0.5'
                      }`}
                  >
                    <ShoppingCart size={12} strokeWidth={2.5} />
                    {item.product.stock <= 0 ? t('outShort') : t('addShort')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center font-['Space_Grotesk']">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-slate-900 text-white font-bold px-8 py-4 rounded-full hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
