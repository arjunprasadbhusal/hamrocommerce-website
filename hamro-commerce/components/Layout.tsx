import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, Phone, Heart, ChevronRight, ChevronDown, LogIn, LogOut, Globe, Check, Sparkles, Tag, Truck, Shield, Star, ArrowRight, Facebook, Instagram, Github, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { API_ENDPOINTS } from '../src/constant/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, fetchCart } = useCart();
  const { wishlistCount, fetchWishlist } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
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
    const fetchCategories = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetch(API_ENDPOINTS.CATEGORIES),
          fetch(API_ENDPOINTS.SUBCATEGORIES),
        ]);
        const categoriesData = await categoriesRes.json();
        const subcategoriesData = await subcategoriesRes.json();

        setCategories(categoriesData.data || categoriesData || []);
        setSubcategories(subcategoriesData.data || subcategoriesData || []);
      } catch (error) {
        console.error('Failed to load layout categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setIsCategoryDropdownOpen(false);
    setIsPagesDropdownOpen(false);
    setIsAccountDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const closeDropdownsOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-layout-dropdown]')) {
        return;
      }

      setIsLangDropdownOpen(false);
      setIsCategoryDropdownOpen(false);
      setIsPagesDropdownOpen(false);
      setIsAccountDropdownOpen(false);
    };

    document.addEventListener('pointerdown', closeDropdownsOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeDropdownsOnOutsideClick);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previousOverflow || '';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const pageLinks = [
    { name: 'shop', path: '/shop' },
    { name: 'blog', path: '/blog' },
    { name: 'about', path: '/about' },
    { name: 'contact', path: '/contact' },
  ];

  const socialLinks = [
    { name: 'WhatsApp', href: 'https://wa.me/9779800000000', icon: MessageCircle },
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'GitHub', href: 'https://github.com', icon: Github },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-green-50/40">
      
      {/* <div className="relative bg-gradient-to-r from-[#0a56bd] via-[#0d62cc] to-[#08489c] text-white text-xs py-2.5 overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 skew-y-2"></div>
        <div className="max-w-7xl mx-auto px-6 flex justify-center items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 animate-pulse text-[#22c55e]" />
            <span className="font-medium">{t('freeShippingTopBar')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#22c55e]" />
            <span className="font-medium">{t('summerSaleTopBar')}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#22c55e]" />
            <span className="font-medium">{t('warrantyTopBar')}</span>
          </div>
        </div>
        <div className="absolute right-4 top-0 bottom-0 hidden lg:flex items-center">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-bold text-[#22c55e]">★</div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-200/50' 
          : 'bg-white border-b border-slate-200/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#0a56bd]/20 to-[#08489c]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img
                  src="/image/logo.png"
                  alt="Hamro Commerce"
                  className="h-9 sm:h-10 md:h-12 w-auto max-w-[150px] sm:max-w-none object-contain transition-all duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="logo-fallback hidden items-center gap-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#0a56bd] to-[#08489c] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white font-black text-xl">H</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-xl md:text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent leading-tight">Hamro</span>
                    <span className="text-[10px] font-bold text-[#22c55e] tracking-widest uppercase">Commerce</span>
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
                  className="w-full pl-12 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a56bd]/30 focus:border-[#0a56bd] transition-all duration-300 text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#22c55e] transition-colors" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-slate-500 hover:text-[#22c55e]">
                  {t('searchBtn')}
                </button>
              </form>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <div className="relative" data-layout-dropdown>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen((open) => !open)}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full flex items-center gap-1.5 ${
                    isCategoryDropdownOpen
                      ? 'text-[#0a56bd] bg-transparent'
                      : 'text-slate-600 hover:text-[#0a56bd] hover:bg-transparent'
                  }`}
                  aria-expanded={isCategoryDropdownOpen}
                >
                  <Menu size={15} />
                  <span>All Categories</span>
                  <ChevronDown size={14} className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-3 w-[520px] max-h-[70vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-fadeInUp">
                    <div className="grid grid-cols-2 divide-x divide-slate-100">
                      {categories.map((cat) => {
                        const subs = subcategories.filter((sub) => sub.category_id === cat.id);
                        const isExpanded = expandedCategory === cat.id;

                        return (
                          <div key={cat.id} className="p-2">
                            <div className="flex items-center justify-between rounded-xl hover:bg-blue-50 transition-colors group">
                              <Link
                                to={`/shop?category=${cat.id}`}
                                className="flex-1 px-3 py-2.5 text-sm font-semibold text-slate-700 group-hover:text-[#0a56bd]"
                              >
                                {cat.name}
                              </Link>
                              {subs.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                                  className="mr-2 p-1.5 rounded-lg text-slate-400 hover:text-[#0a56bd] hover:bg-white"
                                  aria-label={`Toggle ${cat.name} subcategories`}
                                >
                                  <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </button>
                              )}
                            </div>

                            {subs.length > 0 && isExpanded && (
                              <div className="ml-3 mt-1 border-l-2 border-blue-200 pl-3 pb-2 space-y-1">
                                {subs.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    to={`/shop?category=${cat.id}&subcategory=${sub.id}`}
                                    className="block py-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <Link
                      to="/shop"
                      className="flex items-center justify-center gap-2 px-4 py-3 border-t border-slate-100 text-green-600 font-bold text-xs uppercase hover:bg-blue-50 transition-colors"
                    >
                      View All <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>

              <div className="relative" data-layout-dropdown>
                <button
                  type="button"
                  onClick={() => setIsPagesDropdownOpen((open) => !open)}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full flex items-center gap-1.5 ${
                    isPagesDropdownOpen || pageLinks.some((link) => location.pathname === link.path)
                      ? 'text-[#0a56bd] bg-transparent'
                      : 'text-slate-600 hover:text-[#0a56bd] hover:bg-transparent'
                  }`}
                  aria-expanded={isPagesDropdownOpen}
                >
                  <span>Pages</span>
                  <ChevronDown size={14} className={`transition-transform ${isPagesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPagesDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2 z-50 animate-fadeInUp">
                    {pageLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                          location.pathname === link.path
                            ? 'text-[#0a56bd] bg-blue-50'
                            : 'text-slate-700 hover:text-[#0a56bd] hover:bg-blue-50'
                        }`}
                      >
                        {t(link.name)}
                        {location.pathname === link.path && <ChevronRight size={15} />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Button */}
              <button 
                className="lg:hidden p-2 text-slate-600 hover:text-[#0a56bd] hover:bg-blue-50 rounded-full transition-colors"
                onClick={() => searchInputRef.current?.focus()}
              >
                <Search size={18} />
              </button>

              {/* Language Selector - Desktop */}
              <div className="hidden sm:block relative" data-layout-dropdown>
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300"
                >
                  <Globe size={18} />
                  <span className="text-xs font-bold tracking-wide">{language === 'en' ? 'EN' : 'ने'}</span>
                </button>
                {isLangDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeInUp">
                    <button
                      onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium text-slate-700">{t('english')}</span>
                      {language === 'en' && <Check size={16} className="text-green-500" />}
                    </button>
                    <button
                      onClick={() => { setLanguage('ne'); setIsLangDropdownOpen(false); }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 transition-all flex items-center justify-between group"
                    >
                      <span className="font-medium text-slate-700">{t('nepali')}</span>
                      {language === 'ne' && <Check size={16} className="text-green-500" />}
                    </button>
                  </div>
                )}
              </div>

              <Link to="/wishlist" className="hidden sm:flex p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative group">
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white shadow-md">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all relative group">
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full ring-2 ring-white shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="hidden md:flex items-center gap-2 pl-1">
                  <Link
                    to="/account"
                    className="flex items-center gap-2 rounded-full border border-blue-100 bg-white py-1.5 pl-1.5 pr-3 shadow-sm shadow-blue-100/60 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="font-bold text-slate-800 text-xs">{user.name?.split(' ')[0] || t('userLabel')}</span>
                      <span className="mt-1 text-[10px] text-blue-600 font-bold uppercase tracking-wide">My Account</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    aria-label={t('logout')}
                    title={t('logout')}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0a56bd] to-[#22c55e] hover:from-[#08489c] hover:to-[#16a34a] transition-all text-white rounded-full text-sm font-bold shadow-lg shadow-blue-500/20 hover:shadow-green-500/25 hover:-translate-y-0.5 active:scale-95 border border-white/40">
                  <User size={16} />
                  <span>{t('login')}</span>
                </Link>
              )}

              <button
                className="md:hidden p-2 text-slate-700 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all"
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
          <div className="flex flex-col h-full px-4 sm:px-6 pb-8 overflow-y-auto">
            {/* Mobile Search Bar */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchProducts')}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </form>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-2" data-layout-dropdown>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen((open) => !open)}
                className="w-full flex items-center justify-between p-3 rounded-xl text-slate-800 font-bold"
                aria-expanded={isCategoryDropdownOpen}
              >
                <span className="flex items-center gap-2">
                  <Menu size={18} className="text-[#0a56bd]" />
                  All Categories
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="mt-1 max-h-80 overflow-y-auto rounded-xl bg-white border border-slate-100">
                  {categories.map((cat) => {
                    const subs = subcategories.filter((sub) => sub.category_id === cat.id);
                    const isExpanded = expandedCategory === cat.id;

                    return (
                      <div key={cat.id} className="border-b border-slate-50 last:border-b-0">
                        <div className="flex items-center justify-between hover:bg-blue-50 transition-colors">
                          <Link
                            to={`/shop?category=${cat.id}`}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-[#0a56bd]"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {cat.name}
                          </Link>
                          {subs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                              className="mr-3 p-1.5 text-slate-400 hover:text-[#0a56bd]"
                              aria-label={`Toggle ${cat.name} subcategories`}
                            >
                              <ChevronRight size={15} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          )}
                        </div>

                        {subs.length > 0 && isExpanded && (
                          <div className="ml-4 border-l-2 border-blue-200 pl-3 pb-3 space-y-1">
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/shop?category=${cat.id}&subcategory=${sub.id}`}
                                className="block py-1.5 text-xs font-medium text-slate-500 hover:text-blue-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-2 px-4 py-3 text-[#0a56bd] hover:bg-blue-50 font-bold text-xs uppercase transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    View All <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center justify-between p-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                  location.pathname === '/'
                    ? 'bg-gradient-to-r from-blue-50 to-transparent text-[#0a56bd] border-l-4 border-blue-500 pl-4'
                    : 'text-slate-700 hover:text-[#0a56bd] hover:bg-blue-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{t('home')}</span>
                {location.pathname === '/' && <ChevronRight size={18} className="text-[#0a56bd]" />}
              </Link>

              {pageLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between p-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'bg-gradient-to-r from-blue-50 to-transparent text-[#0a56bd] border-l-4 border-blue-500 pl-4'
                      : 'text-slate-700 hover:text-[#0a56bd] hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{t(link.name)}</span>
                  {location.pathname === link.path && <ChevronRight size={18} className="text-[#0a56bd]" />}
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-8 space-y-4">
              {/* Language Selector - Mobile */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={18} className="text-green-500" />
                  <span className="font-semibold text-slate-700">{t('languageLabel')}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                      language === 'en' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {t('english')}
                  </button>
                  <button
                    onClick={() => setLanguage('ne')}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                      language === 'ne' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {t('nepali')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 rounded-xl text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition-all relative"
                >
                  <Heart size={18} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                  <span>{t('wishlist')}</span>
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 rounded-xl text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  <Phone size={18} />
                  <span>{t('support')}</span>
                </Link>
              </div>

              {user ? (
                <div className="bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">{t('hi')}, {user.name || t('userLabel')}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white py-3 font-bold text-blue-600 shadow-sm transition-all hover:bg-blue-50"
                    >
                      <User size={17} />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsMobileMenuOpen(false);
                        window.location.href = '/login';
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700"
                      aria-label={t('logout')}
                      title={t('logout')}
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-[#0a56bd] to-[#22c55e] text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95"
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
      <main className="flex-grow min-w-0 pt-16 md:pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-[#08489c] via-[#0a56bd] to-[#063872] text-blue-50 pt-12 sm:pt-16 pb-8 sm:pb-10 mt-10 sm:mt-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-56 h-56 sm:w-96 sm:h-96 bg-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-96 sm:h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10 sm:mb-12">
            {/* Brand Column */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-black text-xl">H</span>
                </div>
                <span className="text-white font-bold text-lg sm:text-xl break-words">Hamro Commerce</span>
              </div>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                {t('footerTagline')}
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ name, href, icon: Icon }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    title={name}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#0d62cc] flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Icon size={17} strokeWidth={2.2} />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                {t('shopAndLearn')}
              </h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/shop" className="hover:text-green-300 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-200 group-hover:bg-green-300 rounded-full transition-colors"></span> {t('shopAll')}</Link></li>
                <li><Link to="/blog" className="hover:text-green-300 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-200 group-hover:bg-green-300 rounded-full transition-colors"></span> {t('latestNews')}</Link></li>
                <li><Link to="/about" className="hover:text-green-300 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-200 group-hover:bg-green-300 rounded-full transition-colors"></span> {t('aboutUs')}</Link></li>
                <li><Link to="/contact" className="hover:text-green-300 transition-colors flex items-center gap-2 group"><span className="w-1 h-1 bg-blue-200 group-hover:bg-green-300 rounded-full transition-colors"></span> {t('support')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                {t('contactUs')}
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-green-400">📍</div>
                  <div>
                    <span className="block text-white text-sm font-medium">{t('addressLine')}</span>
                    <span className="text-xs text-slate-400">{t('countryNepal')}</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-green-400"><Phone size={16} /></div>
                  <div>
                    <span className="block text-white text-sm font-medium">+977 9800000000</span>
                    <span className="text-xs text-slate-400">{t('officeHours')}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                {t('newsletter')}
              </h4>
              <p className="text-sm text-blue-100/80 mb-4">{t('subscribeNewsletter')}</p>
              <form className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder={t('yourEmail')}
                    className="w-full bg-white/10 border border-white/15 rounded-xl text-sm px-4 py-3 focus:ring-2 focus:ring-green-400/50 focus:outline-none text-white placeholder-blue-100/50 transition-all"
                  />
                </div>
                <button className="bg-gradient-to-r from-[#22c55e] to-[#0d62cc] text-white px-4 py-3 rounded-xl hover:from-[#16a34a] hover:to-[#0a56bd] transition-all font-semibold flex items-center justify-center gap-2 group">
                  <span>{t('subscribeNow')}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-xs text-blue-100/70">
            <div className="max-w-full">© {new Date().getFullYear()} Hamro Commerce Pvt. Ltd. {t('allRightsReserved')}.</div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-5 gap-y-2">
              <a href="#" className="hover:text-green-300 transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-green-300 transition-colors">{t('termsOfService')}</a>
              <a href="#" className="hover:text-green-300 transition-colors">{t('returns')}</a>
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
