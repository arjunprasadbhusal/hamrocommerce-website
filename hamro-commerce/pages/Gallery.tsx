import React, { useState, useMemo } from 'react';
import PageHero from '../components/PageHero';
import { ZoomIn, Quote } from 'lucide-react';

type CategoryKey = "All" | "Traditional" | "Handmade" | "Spiritual" | "Foods" | "Festive" | "Ethnic" | "Organic" | "Gifts";

interface CategoryInfo {
  label: string;
  tagline: string;
  description: string;
}

const CATEGORY_DATA: Record<CategoryKey, CategoryInfo> = {
  "All": { 
    label: "All Gallery", 
    tagline: "Hamro Nepal, Hamro Gaurav", 
    description: "A glimpse into the heart and soul of Nepal through our products and people." 
  },
  "Traditional": { 
    label: "Traditional & Cultural", 
    tagline: "Hamro pahichaan, hamrai parampara", 
    description: "Products that carry the soul of Nepal: Dhaka topi, Gunyu-cholo, and more." 
  },
  "Handmade": { 
    label: "Handmade & Artisanal", 
    tagline: "Ghar-ghar ko kunai haat ko kalakarita", 
    description: "Products made with love, hard work, and creativity by local artisans." 
  },
  "Spiritual": { 
    label: "Spiritual & Religious", 
    tagline: "Astha, shanti ra dharma ko sparsha", 
    description: "Rudraksha, Singing bowls, and items filled with faith and devotion." 
  },
  "Foods": { 
    label: "Traditional Foods", 
    tagline: "Gau-thalo ko swad, sanskriti ko mithas", 
    description: "The authentic taste of home: Gundruk, Himalayan tea, and local spices." 
  },
  "Festive": { 
    label: "Festive & Rituals", 
    tagline: "Parba-parva le bhitraune samjhina ra utsav", 
    description: "Celebrating Dashain, Tihar, and the vibrant colors of our festivals." 
  },
  "Ethnic": { 
    label: "Ethnic Wear", 
    tagline: "Riti-rivaaj, pahichaan, rangin Nepal", 
    description: "Celebrating Nepal's diversity with Haku patasi, Bakhu, and ethnic jewelry." 
  },
  "Organic": { 
    label: "Organic & Natural", 
    tagline: "Himal ko sampada, prakritiko upahar", 
    description: "Pure products from Nepal's land: Herbal soaps, essential oils, and honey." 
  },
  "Gifts": { 
    label: "Cultural Gifts", 
    tagline: "Hamro sanskriti ko upahaar", 
    description: "Gifts with meaning: Khukuri, wood carvings, and souvenirs." 
  }
};

const GALLERY_IMAGES = [
  // Traditional
  { id: 1, src: "/images/dhaka.jpg", title: "Classic Dhaka Topi", category: "Traditional", span: "md:col-span-1 md:row-span-1" },
  { id: 2, src: "/images/Nepali Tradition.jpg", title: "Nepali Tradition", category: "Traditional", span: "md:col-span-1 md:row-span-2" },
  { id: 3, src: "/images/nepali-architecture.jpg", title: "Nepali Architecture", category: "Traditional", span: "md:col-span-2 md:row-span-1" },
  
  // Handmade
  { id: 4, src: "/images/Wood Carving.jpeg", title: "Wood Carving", category: "Handmade", span: "md:col-span-1 md:row-span-1" },
  { id: 5, src: "/images/Himalayan Yak Wool Shawl.jpg", title: "Yak Wool Shawl", category: "Handmade", span: "md:col-span-2 md:row-span-2" },
  
  // Spiritual
  { id: 6, src: "/images/Temple Serenity.jpg", title: "Temple Serenity", category: "Spiritual", span: "md:col-span-1 md:row-span-1" },
  { id: 7, src: "/images/Prayer Flags.jpg", title: "Prayer Flags", category: "Spiritual", span: "md:col-span-1 md:row-span-1" },
  { id: 8, src: "/images/buddha.jpg", title: "Buddha Statue", category: "Spiritual", span: "md:col-span-1 md:row-span-2" },

  // Foods
  { id: 9, src: "/images/Market Spices.jpg", title: "Market Spices", category: "Foods", span: "md:col-span-1 md:row-span-1" },
  { id: 10, src: "/images/Ilam Tea Garden.jpg", title: "Ilam Tea Garden", category: "Foods", span: "md:col-span-2 md:row-span-1" },
  { id: 11, src: "/images/honey.jpg", title: "Himalayan Honey", category: "Foods", span: "md:col-span-1 md:row-span-1" },

  // Festive
  { id: 12, src: "/images/Dashain Tika.jpg", title: "Dashain Tika", category: "Festive", span: "md:col-span-1 md:row-span-1" },
  { id: 13, src: "/images/festivallight.jpg", title: "Festival Lights", category: "Festive", span: "md:col-span-1 md:row-span-2" },

  // Ethnic
  { id: 14, src: "/images/Traditional Attire.jpg", title: "Traditional Attire", category: "Ethnic", span: "md:col-span-1 md:row-span-1" },
  { id: 15, src: "/images/daura.jpg", title: "Daura Suruwal", category: "Ethnic", span: "md:col-span-1 md:row-span-1" },
  { id: 16, src: "/images/shop.jpg", title: "Cultural Musicians", category: "Ethnic", span: "md:col-span-2 md:row-span-1" },
  
  // Organic
  { id: 17, src: "/images/istockphoto-481095126-612x612.jpg", title: "Himalayan Herbs", category: "Organic", span: "md:col-span-1 md:row-span-1" },
  { id: 18, src: "/images/istockphoto-180722392-612x612.jpg", title: "Organic Products", category: "Organic", span: "md:col-span-1 md:row-span-1" },

  // Gifts
  { id: 19, src: "/images/khukui.jpg", title: "Khukuri Gift", category: "Gifts", span: "md:col-span-1 md:row-span-1" },
  { id: 20, src: "/images/Souvenir Shop.jpg", title: "Souvenir Shop", category: "Gifts", span: "md:col-span-2 md:row-span-1" },
  { id: 21, src: "/images/istockphoto-485966046-612x612.jpg", title: "Cultural Gifts", category: "Gifts", span: "md:col-span-1 md:row-span-1" },
];


const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("All");
  const [modalImg, setModalImg] = useState<{src: string, title: string} | null>(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === "All") return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter(img => img.category === activeCategory);
  }, [activeCategory]);

  const activeInfo = CATEGORY_DATA[activeCategory];

  return (
    <div className="bg-gradient-to-b from-amber-50 via-rose-50 to-purple-50 min-h-screen">
      <PageHero 
        title="Our Gallery" 
        subtitle="Visual stories from the land of Himalayas."
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
                      {CATEGORY_DATA[key].label}
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
                "{activeInfo.tagline}"
            </h2>
            <p className="text-slate-500 font-medium">{activeInfo.description}</p>
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
                        alt={img.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onClick={() => setModalImg({src: img.src, title: img.title})}
                        style={{ cursor: 'zoom-in' }}
                    />
                    {/* Overlay - Always visible text on touch/mobile if needed, or keeping hover effect for desktop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-orange-300 text-[10px] font-bold uppercase tracking-wider mb-1 block drop-shadow">
                                {CATEGORY_DATA[img.category as CategoryKey].label}
                            </span>
                            <div className="flex justify-between items-end">
                                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{img.title}</h3>
                                <button 
                                    className="p-2 bg-white/90 rounded-full text-slate-900 hover:bg-red-600 hover:text-white transition-colors shadow-lg border border-slate-100"
                                    title="View Larger"
                                    onClick={() => setModalImg({src: img.src, title: img.title})}
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
                <p>More images coming soon to this category.</p>
            </div>
        )}
      </div>

      {/* Modal for Image Zoom */}
      {modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="relative max-w-3xl w-full mx-4">
            <img src={modalImg.src} alt={modalImg.title} className="w-full h-auto rounded-2xl shadow-2xl border-4 border-white" />
            <button
              className="absolute top-2 right-2 bg-white/90 hover:bg-red-600 hover:text-white text-slate-900 rounded-full p-2 shadow-lg border border-slate-200 transition-colors"
              onClick={() => setModalImg(null)}
              title="Close"
            >
              <span className="text-xl font-bold">&times;</span>
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg">
              {modalImg.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;