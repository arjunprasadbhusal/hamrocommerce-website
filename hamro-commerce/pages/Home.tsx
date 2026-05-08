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
  CreditCard,
  Zap,
  Mail,
  CheckCircle2,
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
  const topCategories = useMemo(() => categories.slice(0, 8), [categories]);

  const getCategoryImage = (categoryName: string | undefined, index: number) => {
    if (!categoryName) {
      // Cycle through images if no name
      const images = ['/image/phone.png', '/image/clothes.png', '/image/chair.png', '/image/headphone.png'];
      return images[index % images.length];
    }

    // Try to match category name with available images
    const name = categoryName.toLowerCase();
    if (name.includes('electronic') || name.includes('phone') || name.includes('mobile')) return '/image/phone.png';
    if (name.includes('cloth') || name.includes('fashion') || name.includes('apparel')) return '/image/clothes.png';
    if (name.includes('furniture') || name.includes('chair') || name.includes('home')) return '/image/chair.png';
    if (name.includes('audio') || name.includes('headphone') || name.includes('music')) return '/image/headphone.png';

    // If no match, cycle through images based on index
    const images = ['/image/phone.png', '/image/clothes.png', '/image/chair.png', '/image/headphone.png'];
    return images[index % images.length];
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Banner Popup */}
      {isBannerOpen && banners.length > 0 && !bannerDismissed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Promotional banner"
          onClick={closeBanner}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(12px); }
            }
            @keyframes scaleUp {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/20"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={closeBanner}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40 hover:scale-110 active:scale-95"
              aria-label="Close banner"
            >
              <X className="h-5 w-5" />
            </button>

              <div className="relative group aspect-[4/3] sm:aspect-[16/9] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                <img
                  key={activeBannerIndex} // Forces re-render for smooth image transition
                  src={getBannerImageUrl(banners[activeBannerIndex]?.image)}
                  alt={banners[activeBannerIndex]?.title || "Banner"}
                  className="max-w-full max-h-full object-contain transition-transform duration-1000 ease-out group-hover:scale-105"
                style={{ animation: 'fadeIn 0.5s ease-out' }}
                onError={(e: any) => {
                  (e.currentTarget as HTMLImageElement).src = "/image/shop.png";
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 pointer-events-none">
                <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-white uppercase bg-red-600 rounded-full shadow-lg shadow-red-600/30">
                    {t("specialOffer") || "Special Offer"}
                  </span>

                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-md mb-6 max-w-2xl">
                    {banners[activeBannerIndex]?.title}
                  </h3>

                  <div className="flex items-center gap-4 pointer-events-auto">
                    <Link
                      to="/shop"
                      onClick={closeBanner}
                      className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {t("shopNow") || "Shop Now"} <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Slider Arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Banner Indicators */}
              {banners.length > 1 && (
                <div className="absolute top-6 left-0 w-full flex justify-center gap-2 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBannerIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeBannerIndex
                        ? "w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                        : "w-2 bg-white/40 hover:bg-white/80"
                        }`}
                      aria-label={`Go to banner ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area: Sidebar + Hero */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Categories Sidebar (Left) */}
          <div className="hidden lg:block w-64 flex-shrink-0 z-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="bg-[#cc3333] text-white px-5 py-4 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wider uppercase">All Categories</span>
                <Menu size={18} />
              </div>
              <ul className="flex flex-col flex-1">
                {categories.slice(0, 10).map((cat) => {
                  const catSubcategories = subcategories.filter(sub => sub.category_id === cat.id);
                  const isExpanded = expandedCategory === cat.id;

                  return (
                    <li key={cat.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <Link
                          to={`/shop?category=${cat.id}`}
                          className="flex-1 text-sm text-gray-500 hover:text-[#cc3333]"
                        >
                          <span className="uppercase font-medium text-[11px] tracking-widest">{cat.name}</span>
                        </Link>
                        {catSubcategories.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setExpandedCategory(isExpanded ? null : cat.id);
                            }}
                            className="p-1 -mr-1 rounded-md text-gray-400 hover:text-[#cc3333] hover:bg-gray-200 transition-all"
                            aria-label="Toggle subcategories"
                          >
                            <ChevronRight size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Subcategory Accordion */}
                      {catSubcategories.length > 0 && isExpanded && (
                        <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
                          <ul className="flex flex-col space-y-3">
                            {catSubcategories.map(sub => (
                              <li key={sub.id}>
                                <Link
                                  to={`/shop?category=${cat.id}&subcategory=${sub.id}`}
                                  className="block text-[11px] text-gray-500 hover:text-[#cc3333] uppercase tracking-widest font-medium transition-colors"
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
                {categories.length > 0 && (
                  <li className="bg-gray-50 mt-auto border-t border-gray-100">
                    <Link
                      to="/shop"
                      className="block text-center px-5 py-3 text-[#cc3333] font-bold text-xs uppercase hover:underline"
                    >
                      View All
                    </Link>
                  </li>
                )}
                {categories.length === 0 && !loadingCategories && (
                  <li className="px-5 py-4 text-sm text-gray-500 text-center">No categories found</li>
                )}
              </ul>
            </div>
          </div>

          {/* Hero Content (Right) */}
          <div className="flex-1 flex flex-col relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white shadow-xl">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
              <div className="absolute -bottom-40 -left-28 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
            </div>

            <div className="relative flex-1 px-6 sm:px-10 py-12 md:py-16 flex items-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
                <div className="text-center md:text-left">
                  <p className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                    {t("megaSale")}
                  </p>
                  <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                    {t("specialOffer")}
                  </h1>
                  <p className="mt-3 text-slate-200 text-sm md:text-base leading-relaxed max-w-md mx-auto md:mx-0">
                    {t("exploreProducts")}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                    <Link
                      to="/shop"
                      className="inline-flex items-center justify-center gap-2 bg-[#cc3333] hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg shadow-red-600/20 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
                    >
                      {t("shopNow")} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/shop"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 px-6 py-3 rounded-full font-bold text-sm transition-all border border-white/15 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {t("viewAllProducts")} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center md:justify-end">
                  <div className="w-full max-w-[280px] lg:max-w-sm">
                    <img
                      src="/image/shop.png"
                      alt="Shop"
                      className="w-full h-auto object-contain drop-shadow-2xl"
                      onError={(e: any) => {
                        (e.currentTarget as HTMLImageElement).src = "/image/phone.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick value props inside Hero */}
            <div className="relative mt-auto border-t border-white/10 bg-black/20 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                {[
                  { icon: Truck, title: "fastDelivery", desc: "freeShipping" },
                  { icon: ShieldCheck, title: "secureShoppingTitle", desc: "secureShoppingDesc" },
                  { icon: HeadphonesIcon, title: "customerSupportTitle", desc: "customerSupportDesc" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 justify-center sm:justify-start">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t(item.title)}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{t(item.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar - Animated Marquee */}
      <section className="py-10 bg-white border-y border-slate-100 overflow-hidden group">
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 40s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="animate-marquee gap-8 md:gap-16">
          {/* Render the features twice for seamless looping */}
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-8 md:gap-16 px-4 md:px-8">
              {[
                { icon: <Truck className="w-6 h-6" />, title: "Free Shipping", desc: "On orders over NPR 5000", color: "bg-blue-50 text-blue-600" },
                { icon: <ShieldCheck className="w-6 h-6" />, title: "Secure Payment", desc: "100% safe transactions", color: "bg-green-50 text-green-600" },
                { icon: <HeadphonesIcon className="w-6 h-6" />, title: "24/7 Support", desc: "Online support all day", color: "bg-purple-50 text-purple-600" },
                { icon: <Zap className="w-6 h-6" />, title: "Flash Deals", desc: "Daily new discounts", color: "bg-orange-50 text-orange-600" }
              ].map((feature, idx) => (
                <div key={`${setIdx}-${idx}`} className="flex items-center gap-5 min-w-[280px] p-6 rounded-3xl hover:bg-slate-50 transition-colors cursor-default">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight">{feature.title}</h3>
                    <p className="text-xs text-slate-500 font-medium whitespace-nowrap">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 py-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 min-h-[300px] flex items-center">
          {/* Decorative Gradients */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/30 blur-[100px] rounded-full" />
          
          <div className="relative z-10 px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between w-full gap-8">
            <div className="max-w-xl text-center md:text-left">
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.2em] text-white uppercase bg-red-600 rounded-full">
                Limited Time Only
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6">
                Level up your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Style.</span>
              </h2>
              <p className="text-lg text-slate-300 mb-8 font-medium">
                Get up to <span className="text-white font-bold">50% OFF</span> on our premium fashion collection. Don't miss out on the season's hottest trends.
              </p>
              <Link to="/shop" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                Shop the Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="w-[400px] h-[300px] bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl rotate-3 transform hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/image/clothes.png" 
                  alt="Promo" 
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/image/shop.png" }}
                />
              </div>
              <div className="absolute -top-6 -left-6 bg-red-600 text-white w-20 h-20 rounded-full flex flex-col items-center justify-center font-black animate-bounce shadow-lg">
                <span className="text-lg leading-none">50%</span>
                <span className="text-[10px] uppercase">Off</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 pb-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {t("topPicks")}
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-1">
              {t("exploreProducts")}
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
          >
            {t("viewAllProducts")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <h3 className="text-lg font-bold text-slate-900">{t("noProducts")}</h3>
            <p className="text-slate-600 mt-2">{t("tryDifferentFilter")}</p>
          </div>
        )}

        <div className="sm:hidden mt-6">
          <Link
            to="/shop"
            className="w-full inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-red-300 text-slate-800 px-6 py-3 rounded-full font-bold text-sm transition-colors"
          >
            {t("viewAllProducts")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>



    </div>
  );
};

export default Home;