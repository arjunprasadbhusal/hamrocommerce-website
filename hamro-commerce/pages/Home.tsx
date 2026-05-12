import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  HeadphonesIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Zap,
  Mail,
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  Gift,
  Flame,
  ShoppingBag,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

import ProductCard from "../components/ProductCard";
import { API_ENDPOINTS } from "../src/constant/api";

type Banner = {
  id: number;
  title: string;
  image: string;
  status?: "active" | "inactive";
  priority?: number;
};

const getBannerImageUrl = (imagePath: string | undefined | null) => {
  if (!imagePath) return "";
  return imagePath.startsWith("http")
    ? imagePath
    : `http://192.168.1.64:8000/storage/${imagePath}`;
};

const Home = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(API_ENDPOINTS.CATEGORIES);
      const data = await response.json();
      setCategories(data.data || data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SUBCATEGORIES);
      const data = await response.json();
      setSubcategories(data.data || data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BANNERS_ACTIVE);
      const data = await response.json();
      if (data?.success) {
        setBanners(Array.isArray(data.data) ? data.data : []);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
    fetchBanners();
  }, [fetchProducts, fetchCategories, fetchSubcategories, fetchBanners]);

  useEffect(() => {
    if (bannerDismissed) return;
    if (!banners || banners.length === 0) return;

    setActiveBannerIndex(0);
    const openTimer = window.setTimeout(() => {
      setIsBannerOpen(true);
    }, 0);

    return () => window.clearTimeout(openTimer);
  }, [banners, bannerDismissed]);

  useEffect(() => {
    if (!isBannerOpen) return;
    if (bannerDismissed) return;
    if (!banners || banners.length <= 1) return;

    const rotate = window.setInterval(() => {
      setActiveBannerIndex((current) => {
        const next = current + 1;
        return next >= banners.length ? 0 : next;
      });
    }, 5000);

    return () => window.clearInterval(rotate);
  }, [isBannerOpen, banners, bannerDismissed]);

  const closeBanner = () => {
    setIsBannerOpen(false);
    setBannerDismissed(true);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (banners.length <= 1) return;
    setActiveBannerIndex((current) => (current + 1 >= banners.length ? 0 : current + 1));
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (banners.length <= 1) return;
    setActiveBannerIndex((current) => (current - 1 < 0 ? banners.length - 1 : current - 1));
  };

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  // Flash sale countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/40">
      {/* Banner Popup - Premium Design */}
      {isBannerOpen && banners.length > 0 && !bannerDismissed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Promotional banner"
          onClick={closeBanner}
          style={{ animation: 'fadeIn 0.4s ease-out' }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(20px); }
            }
            @keyframes scaleUp {
              from { opacity: 0; transform: scale(0.9) translateY(30px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleUp 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards' }}
          >
            <button
              type="button"
              onClick={closeBanner}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/50 hover:scale-110 active:scale-95"
              aria-label="Close banner"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative group aspect-[4/3] sm:aspect-[16/9] w-full bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
              <img
                key={activeBannerIndex}
                src={getBannerImageUrl(banners[activeBannerIndex]?.image)}
                alt={banners[activeBannerIndex]?.title || "Banner"}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                style={{ animation: 'fadeIn 0.6s ease-out' }}
                onError={(e: any) => {
                  (e.currentTarget as HTMLImageElement).src = "/image/shop.png";
                }}
              />

              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 pointer-events-none">
                <div className="transform transition-all duration-700 translate-y-8 group-hover:translate-y-0">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-black tracking-wider text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("specialOffer") || "Special Offer"}
                  </span>

                  <h3 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl mb-6 max-w-3xl">
                    {banners[activeBannerIndex]?.title}
                  </h3>

                  <div className="flex items-center gap-4 pointer-events-auto">
                    <Link
                      to="/shop"
                      onClick={closeBanner}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-white to-slate-100 text-slate-900 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all shadow-2xl hover:shadow-xl hover:-translate-y-1 active:translate-y-0 group"
                    >
                      {t("shopNow") || "Shop Now"} 
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Indicators */}
              {banners.length > 1 && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBannerIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeBannerIndex
                          ? "w-8 bg-white shadow-lg"
                          : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Premium Categories Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden group">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Menu size={18} />
                  <span className="font-bold text-sm tracking-wider uppercase">All Categories</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
              </div>
              <ul className="divide-y divide-slate-50">
                {categories.slice(0, 10).map((cat) => {
                  const catSubcategories = subcategories.filter(sub => sub.category_id === cat.id);
                  const isExpanded = expandedCategory === cat.id;

                  return (
                    <li key={cat.id} className="relative">
                      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all group">
                        <Link
                          to={`/shop?category=${cat.id}`}
                          className="flex-1 text-sm font-medium text-slate-700 group-hover:text-red-600 transition-colors"
                        >
                          {cat.name}
                        </Link>
                        {catSubcategories.length > 0 && (
                          <button
                            onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                      </div>

                      {catSubcategories.length > 0 && isExpanded && (
                        <div className="bg-gradient-to-r from-slate-50/80 to-transparent px-5 py-3 border-l-2 border-red-400 ml-5">
                          <ul className="space-y-2.5">
                            {catSubcategories.map(sub => (
                              <li key={sub.id}>
                                <Link
                                  to={`/shop?category=${cat.id}&subcategory=${sub.id}`}
                                  className="block text-xs text-slate-500 hover:text-red-600 transition-colors font-medium"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
                <li className="bg-gradient-to-r from-slate-100 to-transparent">
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 text-red-600 font-bold text-xs uppercase hover:bg-red-50 transition-all"
                  >
                    View All Categories <ArrowRight size={12} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Premium Hero Banner */}
          <div className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />
            </div>

            <div className="relative px-6 sm:px-10 py-12 md:py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-white tracking-wide">MEGA SALE</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                    Big
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> Summer</span>
                    <br />
                    Sale
                  </h1>
                  
                  <p className="mt-4 text-slate-300 text-base lg:text-lg max-w-md mx-auto lg:mx-0">
                    Up to 70% off on thousands of products. Limited time offer!
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-3.5 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-red-500/30"
                    >
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-3.5 rounded-full font-bold transition-all border border-white/20"
                    >
                      Explore Deals
                    </Link>
                  </div>
                </div>

                <div className="relative flex justify-center lg:justify-end">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-3xl opacity-40 animate-pulse" />
                    <img
                      src="/image/shop.png"
                      alt="Shopping"
                      className="relative w-64 lg:w-80 h-auto object-contain drop-shadow-2xl"
                      style={{ animation: 'float 3s ease-in-out infinite' }}
                      onError={(e: any) => {
                        (e.currentTarget as HTMLImageElement).src = "/image/phone.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Value Props Bar */}
            <div className="relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {[
                  { icon: Truck, label: "Free Shipping", detail: "On orders $50+" },
                  { icon: ShieldCheck, label: "Secure Payment", detail: "100% protected" },
                  { icon: HeadphonesIcon, label: "24/7 Support", detail: "Live assistance" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 justify-center sm:justify-start hover:bg-white/5 transition-colors">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <item.icon size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Marquee */}
      <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-12">
                {[
                  { icon: <Truck className="w-6 h-6" />, title: "Free Shipping", desc: "On orders $50+" },
                  { icon: <ShieldCheck className="w-6 h-6" />, title: "Secure Payment", desc: "100% protected" },
                  { icon: <HeadphonesIcon className="w-6 h-6" />, title: "24/7 Support", desc: "Live chat" },
                  { icon: <Zap className="w-6 h-6" />, title: "Fast Delivery", desc: "2-3 days" },
                  { icon: <Gift className="w-6 h-6" />, title: "Gift Cards", desc: "For everyone" },
                  { icon: <TrendingUp className="w-6 h-6" />, title: "Best Prices", desc: "Price match" },
                ].map((feature, idx) => (
                  <div key={idx} className="inline-flex items-center gap-4 px-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center text-red-500">
                      {feature.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-slate-800">{feature.title}</h4>
                      <p className="text-xs text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-8">
          <div
            className={`absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-10`}
          />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wide">FLASH SALE</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">Limited Time Offer</h2>
              <p className="text-white/80 mt-2">Grab your favorites before they're gone!</p>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[70px]">
                  <span className="text-3xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Hours</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[70px]">
                  <span className="text-3xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Minutes</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[70px]">
                  <span className="text-3xl font-black text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                </div>
                <p className="text-white/70 text-xs mt-1">Seconds</p>
              </div>
            </div>

            <Link
              to="/shop"
              className="bg-white text-red-600 px-8 py-3 rounded-full font-black hover:bg-slate-100 transition-all transform hover:scale-105 active:scale-95 shadow-xl"
            >
              Shop Flash Sale →
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 min-h-[320px] flex items-center">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 px-8 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between w-full gap-8">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 text-xs font-black tracking-wider text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Limited Time
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Style</span>
              </h2>
              <p className="text-slate-300 mb-6">
                Get up to <span className="text-white font-bold text-2xl">50% OFF</span> on premium fashion
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/image/clothes.png" 
                  alt="Fashion" 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png" }}
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-orange-500 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center font-black shadow-xl animate-bounce">
                <span className="text-2xl">50%</span>
                <span className="text-[10px] uppercase">Off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 mb-3">
              <Star className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-xs font-bold text-red-600 tracking-wide">BESTSELLERS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Top Picks For You
            </h2>
            <p className="text-slate-500 mt-1">Curated just for you based on your preferences</p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-red-600 transition-all group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Products Found</h3>
            <p className="text-slate-500 mt-2">Check back later for new arrivals!</p>
          </div>
        )}

        <div className="sm:hidden mt-6">
          <Link
            to="/shop"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-full font-bold"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-6">
            <Mail className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-slate-300 mb-8 max-w-md mx-auto">
            Get the latest updates on new products and upcoming sales
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white/20 transition-all"
            />
            <button className="px-8 py-3.5 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-red-500/30">
              Subscribe
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-4">
            By subscribing you agree to our Privacy Policy
          </p>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Home;