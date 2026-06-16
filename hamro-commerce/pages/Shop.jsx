import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search, X, Grid3x3, LayoutList, ChevronDown } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
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
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(API_ENDPOINTS.PRODUCTS),
        fetch(API_ENDPOINTS.CATEGORIES)
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setProducts(productsData.data || []);
      setCategories(categoriesData.data || []);
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

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('All');
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
        <div>
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
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-50 to-green-50 text-green-700 border border-blue-100">
                      {filteredProducts.length} {t('items') || 'Items'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1">
                    {t('showing') || 'Showing'} {filteredProducts.length} {t('items') || 'items'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Sort Dropdown */}
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none px-4 py-2.5 pr-10 bg-slate-100 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-green-600' : 'text-slate-500'}`}
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-green-600' : 'text-slate-500'}`}
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-green-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 rounded-full text-xs font-medium hover:text-green-600 transition-colors"
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
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-slate-600 font-medium mt-6">{t('loadingProducts') || 'Loading products...'}</div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 md:gap-6"
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
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
