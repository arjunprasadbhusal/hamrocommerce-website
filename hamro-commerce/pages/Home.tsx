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
  ChevronDown,
  Menu,
  Zap,
  Sparkles,
  Star,
  TrendingUp,
  Gift,
  Flame,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

import ProductCard from "../components/ProductCard";
import { API_ENDPOINTS, BASE_URL } from "../src/constant/api";
import { fetchHomeRecommendations } from "../services/recommendationService";

type Banner = {
  id: number;
  title: string;
  image: string;
  status?: "active" | "inactive";
  priority?: number;
};

const getBannerImageUrl = (imagePath: string | undefined | null) => {
  if (!imagePath) return "";
  return imagePath.startsWith("http") ? imagePath : `${BASE_URL}/storage/${imagePath}`;
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [recommendedForYou, setRecommendedForYou] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const heroSlides = [
    {
      tag: "New Collection",
      headline: ["Dress With", "Confidence", "Wear Style"],
      accent: 1,
      discount: "UP TO 70% OFF",
      cta: "Explore Now",
      bg: "from-[#0f0c29] via-[#1a1040] to-[#24243e]",
      accentColor: "#e879f9",
      img: "/image/styles.png",
    },
    {
      tag: "Flash Deal",
      headline: ["Smart Devices", " Smart Life"],
      accent: 1,
      discount: "SAVE $200+",
      cta: "Shop Flash Sale",
      bg: "from-[#0a1628] via-[#0d2040] to-[#0a1628]",
      accentColor: "#38bdf8",
      img: "/image/electric.png",
    },
    {
      tag: "Limited Time",
      headline: ["Premium", "Brands,", "Less Price"],
      accent: 2,
      discount: "FREE SHIPPING",
      cta: "Browse Deals",
      bg: "from-[#1a0a00] via-[#2d1200] to-[#1a0a00]",
      accentColor: "#fb923c",
      img: "/image/women1.png",
    },
  ];

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

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoadingRecommendations(true);
      const data = await fetchHomeRecommendations(8);
      setRecommendedForYou(Array.isArray(data?.recommended_for_you) ? data.recommended_for_you : []);
      setRecentlyViewed(Array.isArray(data?.recently_viewed) ? data.recently_viewed : []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
    fetchBanners();
    fetchRecommendations();
  }, [fetchProducts, fetchCategories, fetchSubcategories, fetchBanners, fetchRecommendations]);

  useEffect(() => {
    if (bannerDismissed || !banners.length) return;
    setActiveBannerIndex(0);
    const t = window.setTimeout(() => setIsBannerOpen(true), 800);
    return () => window.clearTimeout(t);
  }, [banners, bannerDismissed]);

  useEffect(() => {
    if (!isBannerOpen || bannerDismissed || banners.length <= 1) return;
    const r = window.setInterval(() => {
      setActiveBannerIndex((c) => (c + 1 >= banners.length ? 0 : c + 1));
    }, 5000);
    return () => window.clearInterval(r);
  }, [isBannerOpen, banners, bannerDismissed]);

  useEffect(() => {
    const r = window.setInterval(() => {
      setActiveHeroSlide((c) => (c + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(r);
  }, []);

  const closeBanner = () => { setIsBannerOpen(false); setBannerDismissed(true); };
  const nextSlide = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveBannerIndex((c) => (c + 1 >= banners.length ? 0 : c + 1)); };
  const prevSlide = (e?: React.MouseEvent) => { e?.stopPropagation(); setActiveBannerIndex((c) => (c - 1 < 0 ? banners.length - 1 : c - 1)); };
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[activeHeroSlide];

  return (
    <div className="bg-[#F7F6F2] font-['DM_Sans',_system-ui,_sans-serif] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:wght@700;800;900&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }

        .font-display { font-family: 'Playfair Display', Georgia, serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-14px) rotate(-3deg); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-fadeUp { animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-marquee { display: flex; width: max-content; animation: marquee 35s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .animate-slideInLeft { animation: slideInLeft 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }

        .hero-slide-enter { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .hero-slide-img { animation: fadeIn 0.8s ease forwards; }

        .cat-item:hover .cat-arrow { transform: translateX(4px); }
        .cat-arrow { transition: transform 0.2s ease; }

        .product-card-wrap:hover { transform: translateY(-4px); }
        .product-card-wrap { transition: transform 0.25s ease; }

        .ticker-item { display: inline-flex; align-items: center; gap: 16px; padding: 0 40px; }

        .badge-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
  

        .btn-primary {
          display: inline-flex; align-items: center; gap-8px; 
          background: #111; color: #fff; border: none;
          padding: 14px 28px; border-radius: 100px; font-weight: 600;
          font-size: 14px; cursor: pointer; transition: all 0.2s;
          text-decoration: none;
        }
        .btn-primary:hover { background: #222; transform: translateY(-1px); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #fff;
          border: 1.5px solid rgba(255,255,255,0.35);
          padding: 13px 24px; border-radius: 100px; font-weight: 600;
          font-size: 14px; cursor: pointer; transition: all 0.2s;
          text-decoration: none;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.1); }

        .category-link:hover { background: #fef2f2; }

        .shimmer-loading {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
        }

        .countdown-box {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 12px; padding: 10px 16px; min-width: 72px; text-align: center;
        }

        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #dc2626;
          margin-bottom: 12px;
        }

        .section-eyebrow::before {
          content: ''; display: block; width: 24px; height: 2px; background: #dc2626;
        }

        .dot-indicator {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s;
        }
        .dot-indicator.active {
          background: white; width: 24px; border-radius: 4px;
          animation: pulse-dot 2s ease infinite;
        }

        /* Fancy scrollbar for sidebar */
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #fca5a5; border-radius: 2px; }

        /* INCREASED IMAGE SIZES FOR ALL SCREENS */
        .hero-image-large {
          width: clamp(180px, 40vw, 420px) !important;
        }
        .hero-image-large img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        .promo-image-large {
          width: clamp(130px, 35vw, 220px) !important;
        }
        .promo-image-large img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        
        @media (max-width: 640px) {
          .countdown-box { padding: 6px 12px; min-width: 56px; }
          .countdown-box span:first-child { font-size: 1.5rem; }
          .btn-primary, .btn-outline { padding: 10px 20px; font-size: 12px; }
          .hero-image-large { width: clamp(150px, 45vw, 200px) !important; }
          .promo-image-large { width: clamp(110px, 38vw, 160px) !important; }
        }
        @media (min-width: 1024px) {
          .hero-image-large { width: clamp(280px, 35vw, 420px) !important; }
          .promo-image-large { width: clamp(160px, 28vw, 220px) !important; }
        }
      `}</style>

      {/* ─── BANNER POPUP (Mobile Responsive) ─── */}
      {isBannerOpen && banners.length > 0 && !bannerDismissed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', animation: 'fadeIn 0.4s ease' }}
          onClick={closeBanner}
          role="dialog" aria-modal="true"
        >
          <div
            className="relative w-full max-w-[95%] sm:max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards', background: '#0f0a1e' }}
          >
            {/* Decorative ring */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #e879f9, transparent)' }} />

            <button
              type="button"
              onClick={closeBanner}
              className="absolute right-2 top-2 sm:right-4 sm:top-4 z-20 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
              aria-label="Close"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>

            <div className="relative" style={{ aspectRatio: '16/9' }}>
              <img
                key={activeBannerIndex}
                src={getBannerImageUrl(banners[activeBannerIndex]?.image)}
                alt={banners[activeBannerIndex]?.title || "Banner"}
                className="w-full h-full object-cover"
                style={{ animation: 'fadeIn 0.5s ease' }}
                onError={(e: any) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png"; }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />

              <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6">
                <span className="badge-pill mb-2 sm:mb-3 text-[10px] sm:text-xs" style={{ background: 'rgba(232, 121, 249, 0.2)', color: '#e879f9', border: '1px solid rgba(232,121,249,0.35)' }}>
                  <Sparkles size={10} className="sm:w-3 sm:h-3" /> Special Offer
                </span>
                <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight mb-3 sm:mb-4">
                  {banners[activeBannerIndex]?.title}
                </h3>
                <Link
                  to="/shop"
                  onClick={closeBanner}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #e879f9, #c026d3)', color: 'white' }}
                >
                  {t("shopNow") || "Shop Now"} <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                </Link>
              </div>

              {banners.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                    <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={nextSlide} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                    {banners.map((_, i) => (
                      <button key={i} onClick={() => setActiveBannerIndex(i)} className={`dot-indicator w-1.5 h-1.5 sm:w-2 sm:h-2 ${i === activeBannerIndex ? 'active' : ''}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── HOME CONTENT CONTAINER ─── */}
      <div className=" bg-gradient-to-br from-[#F8F7F4] via-[#F1EDE9] to-[#F7F6F2] sm:py-4 lg:py-4">
        {/* ─── HERO + SIDEBAR (Mobile Responsive) ─── */}
        <section className="w-full px-3 sm:px-6 lg:px-8 sm:pt-0 pb-2 sm:pb-4">
        <div className="relative space-y-3">
          {/* Hero Banner (Full Width) */}
          <div className="w-full relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl" style={{ minHeight: '400px', background: `linear-gradient(135deg, ${slide.bg.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')})` }}>
            {/* Animated bg blobs */}
            <div key={activeHeroSlide} className="absolute inset-0" style={{ animation: 'fadeIn 0.6s ease' }}>
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #24243e 100%)` }} />
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-30" style={{ background: `radial-gradient(ellipse at top right, ${slide.accentColor}40, transparent 60%)` }} />
              <div className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-20" style={{ background: `radial-gradient(ellipse at bottom left, ${slide.accentColor}60, transparent 60%)` }} />
              {/* Geometric decoration */}
              <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-24 h-24 sm:w-40 sm:h-40 rounded-full border opacity-10" style={{ borderColor: slide.accentColor, animation: 'spin-slow 20s linear infinite' }} />
              <div className="absolute top-8 right-8 sm:top-16 sm:right-16 w-16 h-16 sm:w-24 sm:h-24 rounded-full border opacity-10" style={{ borderColor: slide.accentColor }} />
            </div>

            <div key={`content-${activeHeroSlide}`} className="relative z-10 flex flex-col sm:flex-row items-center justify-center sm:justify-between h-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 pb-14 sm:pb-16 gap-6 sm:gap-0" style={{ animation: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards' }}>
              <div className="flex-1 flex flex-col items-center text-center sm:items-start sm:text-left">
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-3 sm:mb-5">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-pulse" style={{ background: slide.accentColor }} />
                  <span className="text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.15em] uppercase" style={{ color: slide.accentColor }}>
                    {slide.tag}
                  </span>
                </div>

                {/* Headline */}
                <div className="mb-1 sm:mb-2 w-full">
                  {slide.headline.map((word, i) => (
                    <div key={i} className="overflow-hidden">
                      <span
                        className="font-display block font-black leading-[1]"
                        style={{
                          fontSize: 'clamp(2rem, 5vw, 5.5rem)',
                          color: i === slide.accent ? slide.accentColor : 'white',
                          animationDelay: `${i * 0.08}s`,
                          animation: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
                        }}
                      >
                        {word}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Discount badge */}
                <div className="mt-3 sm:mt-5 mb-4 sm:mb-7 inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${slide.accentColor}50`, backdropFilter: 'blur(8px)' }}>
                  <Tag size={11} className="sm:w-3 sm:h-3" color={slide.accentColor} />
                  <span className="text-white font-bold text-xs sm:text-sm">{slide.discount}</span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}cc)`, boxShadow: `0 4px 12px ${slide.accentColor}40` }}
                  >
                    {slide.cta} <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                  </Link>
                  <Link to="/shop" className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors">
                    View All
                  </Link>
                </div>
              </div>

              {/* Hero Image - INCREASED SIZE for all screens */}
              <div className="hero-image-large flex-shrink-0 flex items-center justify-center sm:ml-4 md:ml-6 lg:ml-8 w-full sm:w-auto">
                <div className="relative animate-float w-full">
                  <div className="absolute inset-0 rounded-full blur-3xl opacity-40" style={{ background: slide.accentColor }} />
                  <img
                    key={activeHeroSlide}
                    src={slide.img}
                    alt="Featured"
                    className="relative w-full h-auto object-contain drop-shadow-2xl hero-slide-img"
                    onError={(e: any) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png"; }}
                  />
                </div>
              </div>
            </div>

            {/* Slide controls */}
            <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-6 lg:left-10 flex items-center gap-2 sm:gap-3 z-10">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setActiveHeroSlide(i)} className={`dot-indicator w-1.5 h-1.5 sm:w-2 sm:h-2 ${i === activeHeroSlide ? 'active' : ''}`} />
              ))}
            </div>

            {/* Value Props Bar - scrollable on mobile */}
            <div className="absolute bottom-0 right-0 left-0 overflow-x-auto" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', WebkitOverflowScrolling: 'touch' }}>
              <div className="flex whitespace-nowrap">
                {[
                  { icon: Truck, label: "Free Shipping", sub: "$50+" },
                  { icon: ShieldCheck, label: "Secure Pay", sub: "100% safe" },
                  { icon: HeadphonesIcon, label: "24/7 Support", sub: "Always on" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
                    <item.icon size={12} className="sm:w-3.5 sm:h-3.5" color={slide.accentColor} />
                    <div>
                      <p className="text-white font-semibold text-[10px] sm:text-xs leading-none">{item.label}</p>
                      <p className="text-white/50 text-[8px] sm:text-[10px] mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TICKER STRIP (Mobile Optimized - Faster animation) ─── */}
      <div className="bg-white border-y border-gray-100 py-3 sm:py-4 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10" />
        <div className="animate-marquee" style={{ animationDuration: '25s' }}>
          {[...Array(2)].map((_, gi) => (
            <div key={gi} className="flex">
              {[
                { icon: Truck, label: "Free Shipping", sub: "On orders $50+" },
                { icon: Zap, label: "Fast Delivery", sub: "2–3 days" },
                { icon: ShieldCheck, label: "Secure Payment", sub: "SSL encrypted" },
                { icon: HeadphonesIcon, label: "24/7 Support", sub: "Live chat" },
                { icon: Gift, label: "Gift Cards", sub: "For every occasion" },
                { icon: TrendingUp, label: "Price Match", sub: "Best price" },
                { icon: Star, label: "Rated 4.9/5", sub: "10k+ reviews" },
              ].map((f, i) => (
                <div key={i} className="ticker-item px-4 sm:px-8">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#FEF2F2' }}>
                    <f.icon size={14} className="sm:w-4 sm:h-4" color="#dc2626" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-bold text-gray-900 text-sm leading-none">{f.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{f.sub}</p>
                  </div>
                  <div className="block sm:hidden">
                    <p className="font-bold text-gray-900 text-xs leading-none">{f.label}</p>
                  </div>
                  <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gray-200 ml-3 sm:ml-4" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── CATEGORY CHIPS (Mobile Scrollable) ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <Link to="/shop" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gray-900 text-white">
            All
          </Link>
          {categories.slice(0, 8).map((cat, i) => {
            const textColors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#ea580c', '#0d9488', '#e11d48'];
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-gray-100 bg-white hover:shadow-sm transition-shadow whitespace-nowrap"
                style={{ color: textColors[i % textColors.length] }}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── FLASH SALE (Mobile Responsive) ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-10" style={{ background: 'linear-gradient(135deg, #1a0505 0%, #3d0000 40%, #7f1d1d 100%)' }}>
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(239,68,68,0.3), transparent 60%)' }} />

          <div className="relative flex flex-col items-center text-center lg:flex-row lg:justify-between lg:text-left gap-4 sm:gap-6">
            {/* Left */}
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.3)' }}>
                  <Flame size={14} className="sm:w-4 sm:h-4" color="#fca5a5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase" style={{ color: '#fca5a5' }}>Flash Sale</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight">
                Today's Best<br className="hidden sm:block" />
                <span style={{ color: '#fca5a5' }}>Deals</span>
              </h2>
              <p className="text-red-200/70 text-xs sm:text-sm mt-1 sm:mt-2 max-w-xs mx-auto lg:mx-0">Don't miss out — these deals expire soon!</p>
            </div>

            {/* Countdown - Centered on mobile */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 my-3 sm:my-4 lg:my-0">
              <div className="countdown-box px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-red-300/70 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider mt-0.5 block">Hours</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-red-400">:</span>
              <div className="countdown-box px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-red-300/70 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider mt-0.5 block">Mins</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-red-400">:</span>
              <div className="countdown-box px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-red-300/70 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider mt-0.5 block">Secs</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 w-full sm:w-auto"
              style={{ background: 'white', color: '#dc2626', fontWeight: '700', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
            >
              Shop Flash Sale <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROMO BANNERS (2-col - Stack on mobile) - INCREASED IMAGE SIZES ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-6 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Promo 1 */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 100%)', minHeight: '220px' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at top right, #818cf8, transparent 60%)' }} />
            <div className="promo-image-large absolute right-0 top-0 bottom-0 w-2/5 flex items-center justify-end pr-3 sm:pr-6">
              <img src="/image/phone.png" alt="Electronics" className="w-full h-auto object-contain drop-shadow-2xl opacity-90"
                onError={(e: any) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png"; }} />
            </div>
            <div className="relative z-10 p-4 sm:p-7">
              <span className="badge-pill mb-2 sm:mb-3 text-[10px] sm:text-xs" style={{ background: 'rgba(129,140,248,0.2)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.3)' }}>
                New Arrivals
              </span>
              <h3 className="font-display text-lg sm:text-2xl font-black text-white leading-tight mt-1 sm:mt-2">
                Latest Tech<br />Gadgets
              </h3>
              <p className="text-indigo-200/70 text-xs sm:text-sm mt-1 sm:mt-2 mb-2 sm:mb-4">Starting from $29</p>
              <Link to="/shop" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold" style={{ background: 'rgba(129,140,248,0.25)', border: '1px solid rgba(129,140,248,0.4)', backdropFilter: 'blur(8px)', color: 'white' }}>
                Shop Electronics <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>
          </div>

          {/* Promo 2 */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl" style={{ background: 'linear-gradient(135deg, #0a1a0a 0%, #14401a 100%)', minHeight: '220px' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at top right, #4ade80, transparent 60%)' }} />
            <div className="promo-image-large absolute right-0 top-0 bottom-0 w-2/5 flex items-center justify-end pr-3 sm:pr-6">
              <img src="/image/clothes.png" alt="Fashion" className="w-full h-auto object-contain drop-shadow-2xl opacity-90"
                onError={(e: any) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png"; }} />
            </div>
            <div className="relative z-10 p-4 sm:p-7">
              <span className="badge-pill mb-2 sm:mb-3 text-[10px] sm:text-xs" style={{ background: 'rgba(74,222,128,0.2)', color: '#86efac', border: '1px solid rgba(74,222,128,0.3)' }}>
                <Sparkles size={10} className="sm:w-2.5 sm:h-2.5" /> Trending
              </span>
              <h3 className="font-display text-lg sm:text-2xl font-black text-white leading-tight mt-1 sm:mt-2">
                Fashion<br />Forward
              </h3>
              <p className="text-green-200/70 text-xs sm:text-sm mt-1 sm:mt-2 mb-2 sm:mb-4">Up to 20% off</p>
              <Link to="/shop" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold" style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.35)', backdropFilter: 'blur(8px)', color: 'white' }}>
                Shop Fashion <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS (Mobile Grid Optimized) ─── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-10 sm:pb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div>
            <div className="section-eyebrow text-xs">
              Bestsellers
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
              Top Picks For You
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Hand-curated products our customers love</p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-gray-900 text-white hover:bg-red-600 transition-colors"
          >
            View All Products <ArrowRight size={14} />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl sm:rounded-2xl overflow-hidden bg-white">
                <div className="shimmer-loading aspect-square" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="shimmer-loading h-3 rounded w-3/4" />
                  <div className="shimmer-loading h-4 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {featuredProducts.map((product: any) => (
              <div key={product.id} className="product-card-wrap">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-100">
              <ShoppingBag size={36} color="#e5e7eb" className="mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-700">No Products Found</h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Check back later for new arrivals!</p>
          </div>
        )}

        <div className="sm:hidden mt-4">
          <Link to="/shop" className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-full font-bold text-sm">
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ─── TRUST STRIP (Mobile Grid) ─── */}
      {(recommendedForYou.length > 0 || loadingRecommendations) && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-10 sm:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div>
              <div className="section-eyebrow text-xs">Recommended</div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                Recommended For You
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Based on your recent activity</p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-gray-900 text-white hover:bg-red-600 transition-colors"
            >
              View More <ArrowRight size={14} />
            </Link>
          </div>

          {loadingRecommendations ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl sm:rounded-2xl overflow-hidden bg-white">
                  <div className="shimmer-loading aspect-square" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="shimmer-loading h-3 rounded w-3/4" />
                    <div className="shimmer-loading h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendedForYou.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
              {recommendedForYou.map((product: any) => (
                <div key={product.id} className="product-card-wrap">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-10 sm:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div>
              <div className="section-eyebrow text-xs">History</div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                Recently Viewed Products
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Pick up where you left off</p>
            </div>
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white text-gray-900 border border-gray-200 hover:bg-red-600 hover:text-white transition-colors"
            >
              Browse More <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {recentlyViewed.map((product: any) => (
              <div key={product.id} className="product-card-wrap">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On all orders above $50", color: "#EFF6FF", accent: "#2563eb" },
              { icon: ShieldCheck, title: "Money Back", desc: "30-day return policy", color: "#F0FDF4", accent: "#16a34a" },
              { icon: HeadphonesIcon, title: "24/7 Support", desc: "Expert help anytime", color: "#FEF2F2", accent: "#dc2626" },
              { icon: Zap, title: "Fast Delivery", desc: "2–3 business days", color: "#FFFBEB", accent: "#d97706" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                  <item.icon size={14} className="sm:w-5 sm:h-5" color={item.accent} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">{item.title}</h4>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 hidden sm:block">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home;
