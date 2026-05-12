import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Phone, Heart, ChevronRight, LogIn, Globe, Check, Sparkles, Tag, Truck, Shield, Star, ArrowRight } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }

    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
          fetchCart();
          fetchWishlist();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50/30">
      {/* Top Announcement Bar */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white text-xs py-2.5 overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 skew-y-2"></div>
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-medium">Free Shipping on Orders $50+</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            <span className="font-medium">Up to 40% Off Summer Sale</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-medium">2 Years Warranty</span>
          </div>
        </div>
        <div className="absolute right-4 top-0 bottom-0 hidden lg:flex items-center">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-bold">★</div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-200/50' 
          : 'bg-white border-b border-slate-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img
                  src="/image/logo.png"
                  alt="Hamro Commerce"
                  className="h-10 md:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="logo-fallback hidden items-center gap-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <span className="text-white font-black text-xl">H</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl md:text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">Hamro</span>
                    <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Commerce</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchProducts')}
                  className="w-full pl-12 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all duration-300 text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-slate-500 hover:text-red-600">
                  Search
                </button>
              </form>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full ${
                    location.pathname === link.path
                      ? 'text-red-600 bg-red-50'
                      : 'text-slate-600 hover:text-red-600 hover:bg-red-50/50'
                  }`}
                >
                  {t(link.name)}
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Button */}
              <button 
                className="lg:hidden p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                onClick={() => searchInputRef.current?.focus()}
              >
                <Search size={18} />
              </button>

              {/* Language Selector - Desktop */}
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-300"
                >
                  <Globe size={18} />
                  <span className="text-xs font-bold tracking-wide">{language === 'en' ? 'EN' : 'ने'}</span>
                </button>
                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeInUp">
                    <button
                      onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium text-slate-700">English</span>
                      {language === 'en' && <Check size={16} className="text-red-500" />}
                    </button>
                    <button
                      onClick={() => { setLanguage('ne'); setIsLangDropdownOpen(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium text-slate-700">नेपाली</span>
                      {language === 'ne' && <Check size={16} className="text-red-500" />}
                    </button>
                  </div>
                )}
              </div>

              <Link to="/wishlist" className="hidden sm:flex p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all relative group">
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white shadow-md">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all relative group">
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="hidden md:flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-all cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-xs">{t('hi')}, {user.name?.split(' ')[0] || 'User'}</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                      }}
                      className="text-[10px] text-slate-500 hover:text-red-600 font-medium text-left"
                    >
                      {t('logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all text-white rounded-full text-sm font-semibold shadow-md shadow-red-500/20 hover:shadow-red-500/40 active:scale-95">
                  <User size={16} />
                  <span>{t('login')}</span>
                </Link>
              )}

              <button
                className="md:hidden p-2 text-slate-700 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 bg-white z-40 md:hidden transition-all duration-500 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'
          }`}
          style={{ top: 0, paddingTop: '80px' }}
        >
          <div className="flex flex-col h-full px-6 pb-8 overflow-y-auto">
            {/* Mobile Search Bar */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchProducts')}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </form>
            </div>

            <div className="space-y-1">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between p-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-gradient-to-r from-red-50 to-transparent text-red-600 border-l-4 border-red-500 pl-4'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span>{t(link.name)}</span>
                  {location.pathname === link.path && <ChevronRight size={18} className="text-red-500" />}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-8 space-y-4">
              {/* Language Selector - Mobile */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={18} className="text-red-500" />
                  <span className="font-semibold text-slate-700">Language</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                      language === 'en' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('ne')}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                      language === 'ne' ? 'bg-red-500 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    नेपाली
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 rounded-xl text-slate-700 font-semibold hover:bg-red-50 hover:text-red-600 transition-all relative"
                >
                  <Heart size={18} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                  <span>{t('wishlist')}</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 rounded-xl text-slate-700 font-semibold hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <Phone size={18} />
                  <span>{t('support')}</span>
                </Link>
              </div>

              {user ? (
                <div className="bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{t('hi')}, {user.name || 'User'}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      setIsMobileMenuOpen(false);
                      window.location.href = '/login';
                    }}
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg shadow-red-500/20 active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn size={18} />
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
      <footer className="relative bg-slate-900 text-slate-300 pt-16 pb-10 mt-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                  <span className="text-white font-black text-xl">H</span>
                </div>
                <span className="text-white font-bold text-xl">Hamro Commerce</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your trusted partner for online shopping in Nepal. We bring authentic local products and global brands right to your doorstep.
              </p>
              <div className="flex gap-3">
                {['Fb', 'Ig', 'Tw', 'Ln'].map((social, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110">
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-500 rounded-full"></span>
                {t('shopAndLearn')}
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/shop" className="hover:text-red-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-500 group-hover:bg-red-400 rounded-full transition-colors"></span> {t('shopAll')}</Link></li>
                <li><Link to="/blog" className="hover:text-red-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-500 group-hover:bg-red-400 rounded-full transition-colors"></span> {t('latestNews')}</Link></li>
                <li><Link to="/about" className="hover:text-red-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-500 group-hover:bg-red-400 rounded-full transition-colors"></span> {t('aboutUs')}</Link></li>
                <li><Link to="/contact" className="hover:text-red-400 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-slate-500 group-hover:bg-red-400 rounded-full transition-colors"></span> {t('support')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-500 rounded-full"></span>
                {t('contactUs')}
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-red-400">📍</div>
                  <div>
                    <span className="block text-white text-sm font-medium">New Baneshwor, Kathmandu</span>
                    <span className="text-xs text-slate-400">Nepal</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-red-400"><Phone size={16} /></div>
                  <div>
                    <span className="block text-white text-sm font-medium">+977 9800000000</span>
                    <span className="text-xs text-slate-400">Mon-Fri, 9AM-6PM</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-500 rounded-full"></span>
                {t('newsletter')}
              </h4>
              <p className="text-sm text-slate-400 mb-4">{t('subscribeNewsletter')}</p>
              <form className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder={t('yourEmail')}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl text-sm px-4 py-3 focus:ring-2 focus:ring-red-500/50 focus:outline-none text-white placeholder-slate-500 transition-all"
                  />
                </div>
                <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold flex items-center justify-center gap-2 group">
                  <span>{t('subscribeNow')}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div>© {new Date().getFullYear()} Hamro Commerce Pvt. Ltd. {t('allRightsReserved')}.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-red-400 transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-red-400 transition-colors">{t('termsOfService')}</a>
              <a href="#" className="hover:text-red-400 transition-colors">{t('returns')}</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Layout;