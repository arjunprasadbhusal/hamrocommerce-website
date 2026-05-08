import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Phone, Heart, ChevronRight, LogIn, Globe, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    // Listen for login/logout events
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
          fetchCart(); // Refresh cart when user logs in
          fetchWishlist(); // Refresh wishlist when user logs in
        } catch (e) {
          console.error('Failed to parse user data');
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchCart, fetchWishlist]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'home', path: '/' },
    { name: 'shop', path: '/shop' },
    { name: 'blog', path: '/blog' },
    { name: 'about', path: '/about' },
    { name: 'contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      {/* Header */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ${isScrolled
        ? 'bg-white shadow-sm py-2 border-b border-slate-200'
        : 'bg-white py-2 border-b border-slate-200'
        }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-15 md:h-18">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group z-50 relative">
                <img
                  src="/image/logo.png"
                  alt="Hamro Commerce"
                  className="h-11 md:h-14 w-auto object-contain transition-all group-hover:scale-[1.02]"
                  onLoad={(e) => {
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.add('hidden');
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="logo-fallback flex items-center gap-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                    <span className="text-white font-black text-xl">H</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-lg md:text-xl text-slate-900 leading-none">Hamro</span>
                    <span className="text-[9px] font-bold text-red-600 tracking-widest uppercase mt-0.5">Commerce</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${location.pathname === link.path
                    ? 'text-red-600 border-red-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                    } text-sm font-semibold px-1 py-2 border-b-2 transition-colors`}
                >
                  {t(link.name)}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 z-50 relative">
              {/* Language Selector - Desktop */}
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                  onBlur={() => setTimeout(() => setIsLangDropdownOpen(false), 200)}
                >
                  <Globe size={18} />
                  <span className="text-xs font-bold tracking-wide">{language === 'en' ? 'EN' : 'ने'}</span>
                </button>
                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setIsLangDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 transition-all flex items-center justify-between group"
                    >
                      <span className="font-semibold text-slate-800">English</span>
                      {language === 'en' && <Check size={16} className="text-red-600" />}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ne');
                        setIsLangDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 transition-all flex items-center justify-between group"
                    >
                      <span className="font-semibold text-slate-800">नेपाली</span>
                      {language === 'ne' && <Check size={16} className="text-red-600" />}
                    </button>
                  </div>
                )}
              </div>



              <Link to="/wishlist" className="hidden sm:flex p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative">
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full ring-2 ring-white shadow-lg">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative">
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full ring-2 ring-white shadow-lg">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="hidden md:flex items-center gap-2.5 px-4 py-2.5 bg-slate-100 rounded-full text-sm border border-slate-200 cursor-pointer">
                  <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs leading-tight">{t('hi')}, {user.name || 'User'}</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                      }}
                      className="text-[10px] text-slate-500 hover:text-red-600 font-semibold text-left"
                    >
                      {t('logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-full text-sm font-black shadow-lg active:scale-95">
                  <User size={17} />
                  <span>{t('login')}</span>
                </Link>
              )}

              <button
                className="md:hidden p-2.5 ml-1 text-slate-800 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Full Screen Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-gradient-to-br from-white via-slate-50 to-red-50 z-40 md:hidden transition-all duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
            }`}
          style={{ top: '0', paddingTop: '88px' }}
        >
          <div className="flex flex-col h-full px-6 pb-8 overflow-y-auto">
            <div className="space-y-2 mt-6">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 ${location.pathname === link.path
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-200 pl-6'
                    : 'text-slate-800 hover:bg-white hover:shadow-lg hover:pl-6 bg-white/50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    transitionDelay: `${idx * 50}ms`,
                    animation: isMobileMenuOpen ? `slideIn 0.3s ease-out ${idx * 50}ms both` : 'none'
                  }}
                >
                  <span>{t(link.name)}</span>
                  {location.pathname === link.path && <ChevronRight size={20} className="animate-pulse" />}
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-4 pt-8">
              {/* Language Selector - Mobile */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-slate-200">
                <div className="flex items-center gap-2.5 mb-4 text-slate-800">
                  <div className="p-2 bg-red-50 rounded-xl">
                    <Globe size={20} className="text-red-600" />
                  </div>
                  <span className="font-bold text-base">Language</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all duration-300 ${language === 'en'
                      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl shadow-red-200 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                      }`}
                  >
                    {language === 'en' && <Check size={16} />}
                    <span className="text-sm">English</span>
                  </button>
                  <button
                    onClick={() => setLanguage('ne')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-bold transition-all duration-300 ${language === 'ne'
                      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-xl shadow-red-200 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                      }`}
                  >
                    {language === 'ne' && <Check size={16} />}
                    <span className="text-sm">नेपाली</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-2.5 p-5 bg-red-50 hover:bg-red-100 rounded-2xl text-slate-800 font-bold shadow-lg border border-red-100 active:scale-95 transition-all relative"
                >
                  <Heart size={24} className="text-red-500" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full ring-2 ring-white shadow-lg">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                  <span className="text-sm">{t('wishlist')}</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-2.5 p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-800 font-bold shadow-lg border border-slate-200 active:scale-95 transition-all"
                >
                  <Phone size={24} className="text-red-600" />
                  <span className="text-sm">{t('support')}</span>
                </Link>
              </div>

              {user ? (
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-5 shadow-xl border border-slate-200">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/20">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900 block text-base">{t('hi')}, {user.name || 'User'}</span>
                      <span className="text-xs text-slate-600 font-medium">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setIsMobileMenuOpen(false);
                      window.location.href = '/login';
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all shadow-xl shadow-red-200 active:scale-95"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-3 w-full px-4 py-6 rounded-2xl bg-red-600 hover:bg-red-700 transition-colors text-white text-lg font-black shadow-2xl shadow-red-600/20 active:scale-95 border border-red-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn size={22} />
                  <span>{t('login')} / {t('signUp')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-300 pt-16 md:pt-20 pb-10 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-white font-bold text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">H</div>
              Hamro Commerce
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Your trusted partner for online shopping in Nepal. We bring authentic local products and global brands right to your doorstep with love and care.
            </p>
            <div className="flex gap-4 pt-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 transition-all duration-300 cursor-pointer flex items-center justify-center text-white text-xs">
                  <span className="sr-only">Social {i}</span>
                  Sc
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 text-lg">{t('shopAndLearn')}</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/shop" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"></span> {t('shopAll')}</Link></li>
              <li><Link to="/blog" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"></span> {t('latestNews')}</Link></li>
              <li><Link to="/about" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"></span> {t('aboutUs')}</Link></li>
              <li><Link to="/contact" className="hover:text-red-500 transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full"></span> {t('support')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 text-lg">{t('contactUs')}</h4>
            <ul className="space-y-6 text-sm">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 text-red-500">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <span className="block text-white font-bold">{t('headOffice')}</span>
                  <span>New Baneshwor, Kathmandu<br />Nepal</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 text-red-500">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="block text-white font-bold">{t('phone')}</span>
                  <span>+977 9800000000</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-8 text-lg">{t('newsletter')}</h4>
            <p className="text-sm mb-6 text-slate-400">{t('subscribeNewsletter')}</p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder={t('yourEmail')}
                className="bg-slate-800/50 border border-slate-700 rounded-xl text-sm px-5 py-3 w-full focus:ring-2 focus:ring-red-600 focus:outline-none text-white placeholder-slate-500 transition-all focus:bg-slate-800"
              />
              <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg">
                {t('subscribeNow')}
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <div>© {new Date().getFullYear()} Hamro Commerce Pvt. Ltd. {t('allRightsReserved')}.</div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <a href="#" className="hover:text-red-500 transition-colors">{t('privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('termsOfService')}</a>
            <a href="#" className="hover:text-red-500 transition-colors">{t('returns')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
