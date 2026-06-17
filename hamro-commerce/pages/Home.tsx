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
      bg: "linear-gradient(135deg, #0a56bd 0%, #0d62cc 50%, #08489c 100%)",
      accentColor: "#22c55e",
      img: "/image/styles.png",
    },
    {
      tag: "Flash Deal",
      headline: ["Smart Devices", " Smart Life"],
      accent: 1,
      discount: "SAVE $200+",
      cta: "Shop Flash Sale",
      bg: "linear-gradient(135deg, #08489c 0%, #0a56bd 50%, #0a56bd 100%)",
      accentColor: "#22c55e",
      img: "/image/electric.png",
    },
    {
      tag: "Limited Time",
      headline: ["Premium", "Brands,", "Less Price"],
      accent: 2,
      discount: "FREE SHIPPING",
      cta: "Browse Deals",
      bg: "linear-gradient(135deg, #0a56bd 0%, #08489c 50%, #0a56bd 100%)",
      accentColor: "#22c55e",
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
  const featuredProducts = useMemo(() => products.slice(0, 6), [products]);

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
    <div className="bg-[#F3F8FF] font-['DM_Sans',_system-ui,_sans-serif] overflow-x-hidden">
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
        .btn-primary:hover { background: #0a56bd; transform: translateY(-1px); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #fff;
          border: 1.5px solid rgba(255,255,255,0.35);
          padding: 13px 24px; border-radius: 100px; font-weight: 600;
          font-size: 14px; cursor: pointer; transition: all 0.2s;
          text-decoration: none;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.1); }

        .category-link:hover { background: #eff6ff; }

        .shimmer-loading {
          background: linear-gradient(90deg, #eff6ff 25%, #dbeafe 50%, #eff6ff 75%);
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
          text-transform: uppercase; color: #0a56bd;
          margin-bottom: 12px;
        }

        .section-eyebrow::before {
          content: ''; display: block; width: 24px; height: 2px; background: #0a56bd;
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
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #86efac; border-radius: 2px; }

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
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />

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
                <span className="badge-pill mb-2 sm:mb-3 text-[10px] sm:text-xs" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)' }}>
                  <Sparkles size={10} className="sm:w-3 sm:h-3" /> Special Offer
                </span>
                <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight mb-3 sm:mb-4">
                  {banners[activeBannerIndex]?.title}
                </h3>
                <Link
                  to="/shop"
                  onClick={closeBanner}
                  className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #22c55e, #0a56bd)', color: 'white' }}
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
      <div className=" bg-gradient-to-br from-[#F8FBFF] via-[#EFF6FF] to-[#F0FDF4] pb-4 sm:pb-6 lg:pb-8">
        {/* ─── HERO + SIDEBAR (Mobile Responsive) ─── */}
        <section className="w-full sm:pt-0 pb-2 sm:pb-4">
        <div className="relative space-y-3">
          {/* Hero Banner (Full Width) */}
          <div className="w-full relative overflow-hidden h-[360px] sm:h-[350px] md:h-[380px]">
            {heroSlides.map((s, index) => {
              const isActive = index === activeHeroSlide;
              return (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                  style={{
                    background: s.bg
                  }}
                >
                  {/* Animated bg blobs */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0" style={{ background: s.bg }} />
                    {/* Yellow/orange circle in top right (matches screenshot) */}
                    <div className="absolute -top-20 -right-20 w-56 h-56 sm:w-80 sm:h-80 rounded-full opacity-90" style={{ background: `radial-gradient(circle, ${s.accentColor} 0%, ${s.accentColor}dd 70%, transparent 100%)` }} />
                    {/* Yellow/orange circle in bottom right (matches screenshot) */}
                    <div className="absolute -bottom-16 right-12 w-36 h-36 sm:w-52 sm:h-52 rounded-full opacity-90" style={{ background: `radial-gradient(circle, ${s.accentColor} 0%, ${s.accentColor}dd 70%, transparent 100%)` }} />
                    {/* Concentric white lines (matches screenshot) */}
                    <div className="absolute -top-28 -right-28 w-72 h-72 sm:w-[400px] sm:h-[400px] rounded-full border border-white/20 pointer-events-none" />
                    <div className="absolute -top-36 -right-36 w-88 h-88 sm:w-[480px] sm:h-[480px] rounded-full border border-white/10 pointer-events-none" />
                    <div className="absolute -top-44 -right-44 w-104 h-104 sm:w-[560px] sm:h-[560px] rounded-full border border-white/5 pointer-events-none" />
                  </div>

                  <div className="relative z-10 flex h-full items-stretch justify-between pl-4 sm:pl-6 lg:pl-10 pr-0 pt-6 sm:pt-8 lg:pt-10 pb-0 gap-0">
                    <div className="relative z-20 flex-none w-[58%] sm:flex-1 sm:w-1/2 flex flex-col items-start text-left">
                      {/* Eyebrow */}
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-pulse" style={{ background: s.accentColor }} />
                        <span className="text-[9px] sm:text-xs font-bold tracking-[0.08em] sm:tracking-[0.15em] uppercase" style={{ color: s.accentColor }}>
                          {s.tag}
                        </span>
                      </div>

                      {/* Headline */}
                      <div className="mb-1 sm:mb-2 w-full">
                        {s.headline.map((word, i) => (
                          <div key={i} className="overflow-hidden">
                            <span
                              className="font-display block font-black leading-[1] text-[2rem] sm:text-[2.75rem] lg:text-[4.5rem]"
                              style={{
                                color: i === s.accent ? s.accentColor : 'white',
                              }}
                            >
                              {word}
                            </span>
                          </div>
                        ))}
                      </div>


                      {/* CTA Buttons */}
                      <div className="flex flex-wrap justify-start gap-2 sm:gap-3">
                        <Link
                          to="/shop"
                          className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                          style={{ background: `linear-gradient(135deg, ${s.accentColor}, ${s.accentColor}cc)`, boxShadow: `0 4px 12px ${s.accentColor}40` }}
                        >
                          {s.cta} <ArrowRight size={12} className="sm:w-4 sm:h-4" />
                        </Link>
                        <Link to="/shop" className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-[1.02]">
                          View All
                        </Link>
                      </div>
                    </div>

                    {/* Hero Image - equal layout */}
                    <div className="flex-1 min-w-0 w-[42%] sm:w-1/2 flex items-end justify-end h-full">
                      <div className="relative animate-float w-full h-full flex items-end justify-end">
                        <div className="absolute inset-0 rounded-full blur-3xl opacity-40" style={{ background: s.accentColor }} />
                        <img
                          src={s.img}
                          alt="Featured"
                          className="relative w-[130%] max-w-none sm:w-full h-[76%] sm:h-[90%] object-contain object-bottom drop-shadow-2xl hero-slide-img"
                          onError={(e: any) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png"; }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Slide controls */}
            <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-6 lg:left-10 flex items-center gap-2 sm:gap-3 z-20">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setActiveHeroSlide(i)} className={`dot-indicator w-1.5 h-1.5 sm:w-2 sm:h-2 ${i === activeHeroSlide ? 'active' : ''}`} />
              ))}
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
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
                    <f.icon size={14} className="sm:w-4 sm:h-4" color="#0a56bd" />
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
      <section className="w-full pl-4 sm:pl-6 lg:pl-10 pr-4 sm:pr-6 lg:pr-10 py-4 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <Link to="/shop" className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-gray-900 text-white">
            All
          </Link>
          {categories.slice(0, 8).map((cat, i) => {
            const textColors = ['#0a56bd', '#2563eb', '#16a34a', '#16a34a', '#0a56bd', '#16a34a', '#0d9488', '#0a56bd'];
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
      <section className="w-full pl-4 sm:pl-6 lg:pl-10 pr-4 sm:pr-6 lg:pr-10 pb-6 sm:pb-10">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-10" style={{ background: 'linear-gradient(135deg, #0a56bd 0%, #08489c 50%, #0a56bd 100%)' }}>
          {/* Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`
          }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(34,197,94,0.3), transparent 60%)' }} />

          <div className="relative flex flex-col items-center text-center lg:flex-row lg:justify-between lg:text-left gap-4 sm:gap-6">
            {/* Left */}
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.3)' }}>
                  <Flame size={14} className="sm:w-4 sm:h-4" color="#22c55e" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase" style={{ color: '#22c55e' }}>Flash Sale</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight">
                Today's Best<br className="hidden sm:block" />
                <span style={{ color: '#22c55e' }}>Deals</span>
              </h2>
              <p className="text-green-100/70 text-xs sm:text-sm mt-1 sm:mt-2 max-w-xs mx-auto lg:mx-0">Don't miss out — these deals expire soon!</p>
            </div>

            {/* Countdown - Centered on mobile */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 my-3 sm:my-4 lg:my-0">
              <div className="countdown-box px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-green-200/70 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider mt-0.5 block">Hours</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-green-400">:</span>
              <div className="countdown-box px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-green-200/70 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider mt-0.5 block">Mins</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-green-400">:</span>
              <div className="countdown-box px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="block text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-green-200/70 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider mt-0.5 block">Secs</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 w-full sm:w-auto"
              style={{ background: 'white', color: '#0a56bd', fontWeight: '700', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
            >
              Shop Flash Sale <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROMO BANNERS (2-col - Stack on mobile) - INCREASED IMAGE SIZES ─── */}
      <section className="w-full pl-4 sm:pl-6 lg:pl-10 pr-4 sm:pr-6 lg:pr-10 pb-6 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Promo 1 */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl" style={{ background: 'linear-gradient(135deg, #0a56bd 0%, #08489c 100%)', minHeight: '220px' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at top right, #22c55e, transparent 60%)' }} />
            <div className="promo-image-large absolute right-0 top-0 bottom-0 w-2/5 flex items-center justify-end pr-3 sm:pr-6">
              <img src="/image/phone.png" alt="Electronics" className="w-full h-auto object-contain drop-shadow-2xl opacity-90"
                onError={(e: any) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png"; }} />
            </div>
            <div className="relative z-10 p-4 sm:p-7">
              <span className="badge-pill mb-2 sm:mb-3 text-[10px] sm:text-xs" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                New Arrivals
              </span>
              <h3 className="font-display text-lg sm:text-2xl font-black text-white leading-tight mt-1 sm:mt-2">
                Latest Tech<br />Gadgets
              </h3>
              <p className="text-green-100/70 text-xs sm:text-sm mt-1 sm:mt-2 mb-2 sm:mb-4">Starting from $29</p>
              <Link to="/shop" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.25)', border: '1px solid rgba(34,197,94,0.4)', backdropFilter: 'blur(8px)', color: 'white' }}>
                Shop Electronics <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>
          </div>

          {/* Promo 2 */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl" style={{ background: 'linear-gradient(135deg, #08489c 0%, #0a56bd 100%)', minHeight: '220px' }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at top right, #22c55e, transparent 60%)' }} />
            <div className="promo-image-large absolute right-0 top-0 bottom-0 w-2/5 flex items-center justify-end pr-3 sm:pr-6">
              <img src="/image/clothes.png" alt="Fashion" className="w-full h-auto object-contain drop-shadow-2xl opacity-90"
                onError={(e: any) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png"; }} />
            </div>
            <div className="relative z-10 p-4 sm:p-7">
              <span className="badge-pill mb-2 sm:mb-3 text-[10px] sm:text-xs" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Sparkles size={10} className="sm:w-2.5 sm:h-2.5" /> Trending
              </span>
              <h3 className="font-display text-lg sm:text-2xl font-black text-white leading-tight mt-1 sm:mt-2">
                Fashion<br />Forward
              </h3>
              <p className="text-green-100/70 text-xs sm:text-sm mt-1 sm:mt-2 mb-2 sm:mb-4">Up to 20% off</p>
              <Link to="/shop" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.25)', border: '1px solid rgba(34,197,94,0.4)', backdropFilter: 'blur(8px)', color: 'white' }}>
                Shop Fashion <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS (Mobile Grid Optimized) ─── */}
      <section className="w-full pl-4 sm:pl-6 lg:pl-10 pr-4 sm:pr-6 lg:pr-10 pb-10 sm:pb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
          <div>
            <div className="section-eyebrow text-xs">
              Bestsellers
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight uppercase tracking-wide">
              TOP PICKS FOR YOU
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Hand-curated products our customers love</p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-gray-900 text-white hover:bg-blue-600 transition-colors"
          >
            View All Products <ArrowRight size={14} />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
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
        <section className="w-full pl-4 sm:pl-6 lg:pl-10 pr-4 sm:pr-6 lg:pr-10 pb-10 sm:pb-14">
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
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-gray-900 text-white hover:bg-blue-600 transition-colors"
            >
              View More <ArrowRight size={14} />
            </Link>
          </div>

          {loadingRecommendations ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
              {recommendedForYou.slice(0, 6).map((product: any) => (
                <div key={product.id} className="product-card-wrap">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="w-full pl-4 sm:pl-6 lg:pl-10 pr-4 sm:pr-6 lg:pr-10 pb-10 sm:pb-14">
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
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white text-gray-900 border border-gray-200 hover:bg-blue-600 hover:text-white transition-colors"
            >
              Browse More <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
            {recentlyViewed.slice(0, 6).map((product: any) => (
              <div key={product.id} className="product-card-wrap">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-gray-100 bg-white">
        <div className="w-full pl-4 sm:pl-6 lg:pl-10 pr-4 sm:pr-6 lg:pr-10 py-5 sm:py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On all orders above $50", color: "#EFF6FF", accent: "#2563eb" },
              { icon: ShieldCheck, title: "Money Back", desc: "30-day return policy", color: "#F0FDF4", accent: "#16a34a" },
              { icon: HeadphonesIcon, title: "24/7 Support", desc: "Expert help anytime", color: "#EFF6FF", accent: "#0a56bd" },
              { icon: Zap, title: "Fast Delivery", desc: "2–3 business days", color: "#FFFBEB", accent: "#16a34a" },
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
