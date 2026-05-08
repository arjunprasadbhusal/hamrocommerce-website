import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, HeadphonesIcon, Search, Menu, ChevronRight } from 'lucide-react';
import { API_ENDPOINTS } from '../src/constant/api';
import { useLanguage } from '../context/LanguageContext';

const Shop = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return params.get('category') || 'All';
  });
  const [selectedSubCategory, setSelectedSubCategory] = useState(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return params.get('subcategory') || 'All';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedCategory(params.get('category') || 'All');
    setSelectedSubCategory(params.get('subcategory') || 'All');
  }, [location.search]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        fetch(API_ENDPOINTS.PRODUCTS),
        fetch(API_ENDPOINTS.CATEGORIES),
        fetch(API_ENDPOINTS.SUBCATEGORIES)
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const subcategoriesData = await subcategoriesRes.json();

      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
      setSubcategories(subcategoriesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category_id === parseInt(selectedCategory);
      const matchesSubCategory = selectedSubCategory === 'All' || product.subcategory_id === parseInt(selectedSubCategory);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSubCategory && matchesSearch;
    });
  }, [products, selectedCategory, selectedSubCategory, searchQuery]);

  // Filter subcategories based on selected category
  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === 'All') {
      return subcategories;
    }
    return subcategories.filter(sub => sub.category_id === parseInt(selectedCategory));
  }, [subcategories, selectedCategory]);

  // Reset subcategory when category changes
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('All');
  }, []);

  return (
    <div className="bg-slate-50">


      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar (Left) */}
          <div className="hidden lg:block w-64 flex-shrink-0 z-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit flex flex-col sticky top-24">
              <div className="bg-[#cc3333] text-white px-5 py-4 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wider uppercase">{t('categories') || "All Categories"}</span>
                <Menu size={18} />
              </div>
              <ul className="flex flex-col flex-1">
                <li className="border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleCategoryChange('All')}>
                    <span className={`uppercase font-medium text-[11px] tracking-widest ${selectedCategory === 'All' ? 'text-[#cc3333] font-bold' : 'text-gray-500'}`}>
                      {t('allProducts')}
                    </span>
                  </div>
                </li>
                {categories.map((cat) => {
                  const catSubcategories = subcategories.filter(sub => sub.category_id === cat.id);
                  const isExpanded = expandedCategory === cat.id;

                  return (
                    <li key={cat.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                        <button
                          onClick={() => handleCategoryChange(cat.id.toString())}
                          className={`flex-1 text-left text-sm hover:text-[#cc3333] ${selectedCategory === cat.id.toString() ? 'text-[#cc3333] font-bold' : 'text-gray-500'}`}
                        >
                          <span className="uppercase font-medium text-[11px] tracking-widest">{cat.name}</span>
                        </button>
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
                            <li>
                              <button
                                onClick={() => {
                                  handleCategoryChange(cat.id.toString());
                                  setSelectedSubCategory('All');
                                }}
                                className={`block text-[11px] hover:text-[#cc3333] uppercase tracking-widest font-medium transition-colors w-full text-left ${selectedSubCategory === 'All' && selectedCategory === cat.id.toString() ? 'text-[#cc3333] font-bold' : 'text-gray-500'}`}
                              >
                                All {cat.name}
                              </button>
                            </li>
                            {catSubcategories.map(sub => (
                              <li key={sub.id}>
                                <button
                                  onClick={() => {
                                    handleCategoryChange(cat.id.toString());
                                    setSelectedSubCategory(sub.id.toString());
                                  }}
                                  className={`block text-[11px] hover:text-[#cc3333] uppercase tracking-widest font-medium transition-colors w-full text-left ${selectedSubCategory === sub.id.toString() ? 'text-[#cc3333] font-bold' : 'text-gray-500'}`}
                                >
                                  {sub.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Main Products Area */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
                <div className="text-slate-600 font-medium mt-4">{t('loadingProducts')}</div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-900 truncate">
                          {selectedCategory === 'All'
                            ? t('allProducts')
                            : categories.find(c => c.id === parseInt(selectedCategory))?.name}
                        </h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                          {filteredProducts.length} {t('items')}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">
                        {t('showing')} {filteredProducts.length} {t('items')}
                      </p>
                    </div>

                    <div className="w-full md:w-auto">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          placeholder={t('searchProducts')}
                          className="pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-slate-50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 w-full md:w-80"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                    <h3 className="text-xl font-medium text-slate-900">{t('noProducts')}</h3>
                    <p className="text-slate-500 mt-2">{t('tryDifferentFilter')}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;