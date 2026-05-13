import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { 
  ArrowRight, Truck, ShieldCheck, HeadphonesIcon, Search, Menu, ChevronRight, 
  Filter, X, Grid3x3, LayoutList, SortAsc, TrendingUp, Sparkles, 
  Star, Clock, Zap, Gift, ChevronDown
} from 'lucide-react';
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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

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
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category_id === parseInt(selectedCategory);
      const matchesSubCategory = selectedSubCategory === 'All' || product.subcategory_id === parseInt(selectedSubCategory);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSubCategory && matchesSearch;
    });

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // newest first
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  }, [products, selectedCategory, selectedSubCategory, searchQuery, sortBy]);

  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === 'All') {
      return subcategories;
    }
    return subcategories.filter(sub => sub.category_id === parseInt(selectedCategory));
  }, [subcategories, selectedCategory]);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('All');
    setIsMobileFilterOpen(false);
  }, []);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSearchQuery('');
    setSortBy('newest');
  };

  const getCategoryName = () => {
    if (selectedCategory === 'All') return t('allProducts');
    const category = categories.find(c => c.id === parseInt(selectedCategory));
    return category?.name || t('products');
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/40 min-h-screen">
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Menu size={18} />
                  <span className="font-bold text-sm tracking-wider uppercase">{t('categories') || "All Categories"}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={14} />
                </div>
              </div>
              
              <ul className="divide-y divide-slate-50">
                <li className="border-b border-gray-100">
                  <button
                    onClick={() => handleCategoryChange('All')}
                    className={`w-full text-left px-5 py-3.5 transition-all ${
                      selectedCategory === 'All' 
                        ? 'bg-gradient-to-r from-red-50 to-transparent text-red-600 font-bold' 
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="uppercase font-medium text-xs tracking-wider">
                      {t('allProducts') || 'All Products'}
                    </span>
                  </button>
                </li>
                
                {categories.map((cat) => {
                  const catSubcategories = subcategories.filter(sub => sub.category_id === cat.id);
                  const isExpanded = expandedCategory === cat.id;

                  return (
                    <li key={cat.id} className="border-b border-gray-100">
                      <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-all group">
                        <button
                          onClick={() => handleCategoryChange(cat.id.toString())}
                          className={`flex-1 text-left text-sm transition-colors ${
                            selectedCategory === cat.id.toString() 
                              ? 'text-red-600 font-bold' 
                              : 'text-slate-600 group-hover:text-red-600'
                          }`}
                        >
                          <span className="uppercase font-medium text-xs tracking-wider">{cat.name}</span>
                        </button>
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
                            <li>
                              <button
                                onClick={() => {
                                  handleCategoryChange(cat.id.toString());
                                  setSelectedSubCategory('All');
                                }}
                                className={`text-xs hover:text-red-600 transition-colors w-full text-left ${
                                  selectedSubCategory === 'All' && selectedCategory === cat.id.toString() 
                                    ? 'text-red-600 font-bold' 
                                    : 'text-slate-500'
                                }`}
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
                                  className={`text-xs hover:text-red-600 transition-colors w-full text-left ${
                                    selectedSubCategory === sub.id.toString() 
                                      ? 'text-red-600 font-bold' 
                                      : 'text-slate-500'
                                  }`}
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
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 md:p-5 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 truncate">
                      {getCategoryName()}
                    </h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-100">
                      {filteredProducts.length} {t('items') || 'Items'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    {t('showing') || 'Showing'} {filteredProducts.length} {t('items') || 'items'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors"
                  >
                    <Filter size={16} />
                    Filter
                  </button>

                  {/* Sort Dropdown */}
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none px-4 py-2.5 pr-10 bg-slate-100 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-red-600' : 'text-slate-500'}`}
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-red-600' : 'text-slate-500'}`}
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== 'All' || searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => handleCategoryChange('All')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      {categories.find(c => c.id === parseInt(selectedCategory))?.name}
                      <X size={12} />
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium hover:bg-slate-200 transition-colors"
                    >
                      Search: {searchQuery}
                      <X size={12} />
                    </button>
                  )}
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 rounded-full text-xs font-medium hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-red-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-slate-600 font-medium mt-6">{t('loadingProducts') || 'Loading products...'}</div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                : "space-y-4"
              }>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">{t('noProducts') || 'No Products Found'}</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {t('tryDifferentFilter') || 'Try adjusting your filters or search criteria'}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden shadow-2xl animate-slideIn">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-red-600 to-red-700 text-white">
              <div className="flex items-center gap-2">
                <Filter size={20} />
                <span className="font-bold">Filters</span>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto h-[calc(100%-80px)]">
              <div className="mb-6">
                <h4 className="font-bold text-slate-800 mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('All')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedCategory === 'All' 
                        ? 'bg-red-50 text-red-600 font-bold' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id.toString())}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        selectedCategory === cat.id.toString() 
                          ? 'bg-red-50 text-red-600 font-bold' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={clearFilters}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Shop;