import React, { useState, useMemo } from 'react';
import PageHero from '../components/PageHero';
import { ZoomIn, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type CategoryKey = "All" | "Traditional" | "Handmade" | "Spiritual" | "Foods" | "Festive" | "Ethnic" | "Organic" | "Gifts";

interface CategoryInfo {
  labelKey: string;
  taglineKey: string;
  descriptionKey: string;
}

const CATEGORY_DATA: Record<CategoryKey, CategoryInfo> = {
  "All": { 
    labelKey: "galleryAllLabel",
    taglineKey: "galleryAllTagline",
    descriptionKey: "galleryAllDesc"
  },
  "Traditional": { 
    labelKey: "galleryTraditionalLabel",
    taglineKey: "galleryTraditionalTagline",
    descriptionKey: "galleryTraditionalDesc"
  },
  "Handmade": { 
    labelKey: "galleryHandmadeLabel",
    taglineKey: "galleryHandmadeTagline",
    descriptionKey: "galleryHandmadeDesc"
  },
  "Spiritual": { 
    labelKey: "gallerySpiritualLabel",
    taglineKey: "gallerySpiritualTagline",
    descriptionKey: "gallerySpiritualDesc"
  },
  "Foods": { 
    labelKey: "galleryFoodsLabel",
    taglineKey: "galleryFoodsTagline",
    descriptionKey: "galleryFoodsDesc"
  },
  "Festive": { 
    labelKey: "galleryFestiveLabel",
    taglineKey: "galleryFestiveTagline",
    descriptionKey: "galleryFestiveDesc"
  },
  "Ethnic": { 
    labelKey: "galleryEthnicLabel",
    taglineKey: "galleryEthnicTagline",
    descriptionKey: "galleryEthnicDesc"
  },
  "Organic": { 
    labelKey: "galleryOrganicLabel",
    taglineKey: "galleryOrganicTagline",
    descriptionKey: "galleryOrganicDesc"
  },
  "Gifts": { 
    labelKey: "galleryGiftsLabel",
    taglineKey: "galleryGiftsTagline",
    descriptionKey: "galleryGiftsDesc"
  }
};

const GALLERY_IMAGES = [
  // Traditional
  { id: 1, src: "/images/dhaka.jpg", titleKey: "galleryImageDhakaTopi", category: "Traditional", span: "md:col-span-1 md:row-span-1" },
  { id: 2, src: "/images/Nepali Tradition.jpg", titleKey: "galleryImageNepaliTradition", category: "Traditional", span: "md:col-span-1 md:row-span-2" },
  { id: 3, src: "/images/nepali-architecture.jpg", titleKey: "galleryImageNepaliArchitecture", category: "Traditional", span: "md:col-span-2 md:row-span-1" },
  
  // Handmade
  { id: 4, src: "/images/Wood Carving.jpeg", titleKey: "galleryImageWoodCarving", category: "Handmade", span: "md:col-span-1 md:row-span-1" },
  { id: 5, src: "/images/Himalayan Yak Wool Shawl.jpg", titleKey: "galleryImageYakWoolShawl", category: "Handmade", span: "md:col-span-2 md:row-span-2" },
  
  // Spiritual
  { id: 6, src: "/images/Temple Serenity.jpg", titleKey: "galleryImageTempleSerenity", category: "Spiritual", span: "md:col-span-1 md:row-span-1" },
  { id: 7, src: "/images/Prayer Flags.jpg", titleKey: "galleryImagePrayerFlags", category: "Spiritual", span: "md:col-span-1 md:row-span-1" },
  { id: 8, src: "/images/buddha.jpg", titleKey: "galleryImageBuddhaStatue", category: "Spiritual", span: "md:col-span-1 md:row-span-2" },

  // Foods
  { id: 9, src: "/images/Market Spices.jpg", titleKey: "galleryImageMarketSpices", category: "Foods", span: "md:col-span-1 md:row-span-1" },
  { id: 10, src: "/images/Ilam Tea Garden.jpg", titleKey: "galleryImageIlamTeaGarden", category: "Foods", span: "md:col-span-2 md:row-span-1" },
  { id: 11, src: "/images/honey.jpg", titleKey: "galleryImageHimalayanHoney", category: "Foods", span: "md:col-span-1 md:row-span-1" },

  // Festive
  { id: 12, src: "/images/Dashain Tika.jpg", titleKey: "galleryImageDashainTika", category: "Festive", span: "md:col-span-1 md:row-span-1" },
  { id: 13, src: "/images/festivallight.jpg", titleKey: "galleryImageFestivalLights", category: "Festive", span: "md:col-span-1 md:row-span-2" },

  // Ethnic
  { id: 14, src: "/images/Traditional Attire.jpg", titleKey: "galleryImageTraditionalAttire", category: "Ethnic", span: "md:col-span-1 md:row-span-1" },
  { id: 15, src: "/images/daura.jpg", titleKey: "galleryImageDauraSuruwal", category: "Ethnic", span: "md:col-span-1 md:row-span-1" },
  { id: 16, src: "/images/shop.jpg", titleKey: "galleryImageCulturalMusicians", category: "Ethnic", span: "md:col-span-2 md:row-span-1" },
  
  // Organic
  { id: 17, src: "/images/istockphoto-481095126-612x612.jpg", titleKey: "galleryImageHimalayanHerbs", category: "Organic", span: "md:col-span-1 md:row-span-1" },
  { id: 18, src: "/images/istockphoto-180722392-612x612.jpg", titleKey: "galleryImageOrganicProducts", category: "Organic", span: "md:col-span-1 md:row-span-1" },

  // Gifts
  { id: 19, src: "/images/khukui.jpg", titleKey: "galleryImageKhukuriGift", category: "Gifts", span: "md:col-span-1 md:row-span-1" },
  { id: 20, src: "/images/Souvenir Shop.jpg", titleKey: "galleryImageSouvenirShop", category: "Gifts", span: "md:col-span-2 md:row-span-1" },
  { id: 21, src: "/images/istockphoto-485966046-612x612.jpg", titleKey: "galleryImageCulturalGifts", category: "Gifts", span: "md:col-span-1 md:row-span-1" },
];


const Gallery: React.FC = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("All");
  const [modalImg, setModalImg] = useState<{src: string, titleKey: string} | null>(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === "All") return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter(img => img.category === activeCategory);
  }, [activeCategory]);

  const activeInfo = CATEGORY_DATA[activeCategory];

  return (
    <div className="bg-gradient-to-b from-amber-50 via-rose-50 to-purple-50 min-h-screen">
      <PageHero 
        title={t('galleryTitle')}
        subtitle={t('gallerySubtitle')}
        backgroundImage="https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2000"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Navigation - Horizontal Scroll on Mobile */}
        <div className="mb-12">
           <div className="flex overflow-x-auto pb-4 md:flex-wrap md:justify-center gap-2 md:gap-3 no-scrollbar px-1">
              {(Object.keys(CATEGORY_DATA) as CategoryKey[]).map((key) => (
                  <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border shadow-md ${
                          activeCategory === key
                          ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white border-red-600 shadow-lg shadow-red-200 scale-105'
                          : 'bg-white text-slate-600 border-gray-200 hover:border-red-300 hover:text-red-600'
                      }`}
                  >
                        {t(CATEGORY_DATA[key].labelKey)}
                  </button>
              ))}
           </div>
        </div>

        {/* Active Category Info Banner */}
        <div className="mb-12 text-center max-w-3xl mx-auto animate-fade-in-up px-4">
            <div className="inline-block p-3 rounded-full bg-gradient-to-br from-red-100 to-orange-100 text-red-600 mb-4 shadow">
                <Quote size={24} className="fill-current opacity-50" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 italic font-serif">
                "{t(activeInfo.taglineKey)}"
            </h2>
              <p className="text-slate-500 font-medium">{t(activeInfo.descriptionKey)}</p>
        </div>

        {/* Gallery Grid */}
        <div 
          className={`grid gap-6 ${
            activeCategory === "All" 
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[240px]" 
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[280px]"
          }`}
        >
            {filteredImages.map((img, idx) => (
                <div 
                    key={img.id} 
                    className={`relative group overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100 animate-fade-in-up hover:scale-[1.03] transition-transform duration-300 ${
                        activeCategory === "All" ? img.span : ""
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                >
                    <img 
                        src={img.src} 
                        alt={t(img.titleKey)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onClick={() => setModalImg({src: img.src, titleKey: img.titleKey})}
                        style={{ cursor: 'zoom-in' }}
                    />
                    {/* Overlay - Always visible text on touch/mobile if needed, or keeping hover effect for desktop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-orange-300 text-[10px] font-bold uppercase tracking-wider mb-1 block drop-shadow">
                                {t(CATEGORY_DATA[img.category as CategoryKey].labelKey)}
                            </span>
                            <div className="flex justify-between items-end">
                                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{t(img.titleKey)}</h3>
                                <button 
                                    className="p-2 bg-white/90 rounded-full text-slate-900 hover:bg-red-600 hover:text-white transition-colors shadow-lg border border-slate-100"
                                  title={t('viewLarger')}
                                  onClick={() => setModalImg({src: img.src, titleKey: img.titleKey})}
                                >
                                    <ZoomIn size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {filteredImages.length === 0 && (
            <div className="text-center py-20 text-slate-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <p>{t('galleryEmpty')}</p>
            </div>
        )}
      </div>

      {/* Modal for Image Zoom */}
      {modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="relative max-w-3xl w-full mx-4">
            <img src={modalImg.src} alt={t(modalImg.titleKey)} className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white" />
            <button
              className="absolute top-2 right-2 bg-white/90 hover:bg-red-600 hover:text-white text-slate-900 rounded-full p-2 shadow-lg border border-slate-200 transition-colors"
              onClick={() => setModalImg(null)}
              title={t('close')}
            >
              <span className="text-xl font-bold">&times;</span>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg">
              {t(modalImg.titleKey)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;