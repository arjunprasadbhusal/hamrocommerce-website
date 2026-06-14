import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Star, Share2, ArrowLeft, Truck, Shield, 
  CheckCircle2, ChevronRight, Zap, ArrowRight, Minus, Plus,
  Sparkles, Package, RotateCcw, MessageCircle, CreditCard,
  Award, ThumbsUp, Facebook, Twitter, Instagram, Mail, Clock,
  MapPin, Calendar, Box, Tag, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAlert } from '../context/AlertContext';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS, resolveImageUrl } from '../src/constant/api';

const SIZE_CATEGORIES = {
  fashion: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  electronics: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  footwear: ['6', '7', '8', '9', '10', '11', '12']
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showAlert } = useAlert();
  
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (id && allProducts.length > 0) {
      const foundProduct = allProducts.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        initializeProductOptions(foundProduct);
      }
    }
  }, [id, allProducts]);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      const result = await response.json();
      const products = result.data || result;
      
      if (Array.isArray(products)) {
        setAllProducts(products);
        const currentProduct = products.find(p => p.id === parseInt(id));
        if (currentProduct) {
          setProduct(currentProduct);
          initializeProductOptions(currentProduct);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const initializeProductOptions = (product) => {
    if (product.color) setSelectedColor(product.color);
    if (product.photo_url) setActiveImage(resolveImageUrl(product.photo_url));
    
    const related = allProducts.filter(p => 
      p.category_id === product.category_id && p.id !== product.id
    ).slice(0, 8);
    
    setRelatedProducts(related);
  };

  const getSizeOptions = useCallback(() => {
    if (!product?.category?.name) return [];
    const categoryName = product.category.name.toLowerCase();
    
    if (categoryName.includes('fashion') || categoryName.includes('clothing')) 
      return SIZE_CATEGORIES.fashion;
    if (categoryName.includes('electronic') || categoryName.includes('phone'))
      return SIZE_CATEGORIES.electronics;
    if (categoryName.includes('shoe') || categoryName.includes('footwear'))
      return SIZE_CATEGORIES.footwear;
    
    return [];
  }, [product]);

  const sizeOptions = useMemo(() => getSizeOptions(), [getSizeOptions]);

  const colorVariants = useMemo(() => {
    if (!product || !allProducts.length) return [];
    
    const variants = allProducts.filter(p => 
      p.name === product.name && p.color && p.color.trim() !== ''
    );
    
    if (product.color && !variants.some(v => v.id === product.id)) {
      variants.unshift(product);
    }
    
    const uniqueColors = new Map();
    variants.forEach(variant => {
      if (variant.color && !uniqueColors.has(variant.color.toLowerCase())) {
        uniqueColors.set(variant.color.toLowerCase(), variant);
      }
    });
    
    return Array.from(uniqueColors.values());
  }, [product, allProducts]);

  const handleColorChange = (colorVariant) => {
    if (colorVariant.id === product.id) return;
    
    navigate(`/product/${colorVariant.id}`, { replace: true });
    setProduct(colorVariant);
    setSelectedColor(colorVariant.color);
    setActiveImage(resolveImageUrl(colorVariant.photo_url));
    setSelectedSize(colorVariant.size || sizeOptions[0] || '');
    setQuantity(1);
    
    showAlert({ 
      type: 'success', 
      title: 'Color Changed', 
      message: `Switched to ${colorVariant.color} variant` 
    });
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert({ type: 'warning', title: 'Login Required', message: 'Please login to add products to cart' });
      navigate('/login');
      return;
    }
    
    const cartItem = cart.find(item => item.product_id === product?.id || item.product?.id === product?.id);
    const availableStock = product ? product.stock - (cartItem?.quantity || 0) : 0;
    
    if (availableStock < quantity) {
      showAlert({ type: 'error', title: 'Insufficient Stock', message: `Only ${availableStock} items available` });
      return;
    }
    
    try {
      const result = await addToCart(product, selectedSize, selectedColor, quantity);
      
      if (result?.alreadyInCart) {
        showAlert({ type: 'info', title: 'Cart Updated', message: `Quantity increased to ${result.newQuantity}` });
      } else if (result?.success) {
        showAlert({ type: 'success', title: 'Added to Cart', message: `${quantity}x ${product.name} added to cart` });
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert({ type: 'error', title: 'Error', message: 'Failed to add to cart' });
    }
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `Check out ${product.name} at Hamro Commerce!`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(text + '\n\n' + url)}`
    };
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: product.name, text, url });
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          showAlert({ type: 'info', title: 'Link Copied', message: 'Product link copied!' });
        }
      }
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    } else {
      navigator.clipboard.writeText(url);
      showAlert({ type: 'info', title: 'Link Copied', message: 'Product link copied!' });
    }
  };

  const cartItem = cart.find(item => item.product_id === product?.id || item.product?.id === product?.id);
  const availableStock = product ? product.stock - (cartItem?.quantity || 0) : 0;
  const price = Number(product?.price) || 0;
  const oldPrice = price * 1.2;
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  const averageRating = 4.8;
  const reviewCount = 128;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-red-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Loading amazing products...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-rose-50 rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-6 max-w-md text-sm">The product you're looking for isn't available. Let's find something amazing for you!</p>
        <Link to="/shop" className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Simple Breadcrumb */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Link to="/" className="text-slate-500 hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight size={10} className="text-slate-400" />
            <Link to="/shop" className="text-slate-500 hover:text-red-600 transition-colors">Shop</Link>
            <ChevronRight size={10} className="text-slate-400" />
            <span className="text-slate-900 font-semibold truncate max-w-[200px] text-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* LEFT COLUMN - Compact Gallery Section */}
          <div className="space-y-2">
            {/* Main Image - Much Smaller, Positioned 17% from top */}
            <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
            
                <img
                  src={activeImage || '/image/image.jpg'}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain align-top mx-auto my-4"
                  style={{ maxHeight: '300px', width: '240px' }}
                  onError={(e) => { e.currentTarget.src = '/image/image.jpg'; }}
                />
              
              
              {/* Minimal Status Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shadow-lg">
                    🔥 Limited
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shadow-lg">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Color Variants - Clean Grid */}
            {colorVariants.length > 1 && (
              <div className="bg-white rounded-xl p-3 shadow-lg shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {colorVariants.length} Colors Available
                  </span>
                  <span className="text-[9px] text-slate-400">Click to change</span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {colorVariants.map((variant) => {
                    const isActive = variant.id === product.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleColorChange(variant)}
                        className={`group relative rounded-lg overflow-hidden transition-all duration-200
                          ${isActive ? 'ring-2 ring-red-600 ring-offset-1 shadow-md' : 'hover:shadow-md'}`}
                      >
                        <div className="aspect-square bg-gradient-to-br from-slate-50 to-white p-1.5">
                          <img
                            src={resolveImageUrl(variant.photo_url) || '/image/image.jpg'}
                            alt={variant.color}
                            className="w-full h-full object-contain"
                            style={{ maxHeight: '60px' }}
                          />
                        </div>
                        <div className={`text-center py-0.5 text-[8px] font-medium uppercase truncate px-1
                          ${isActive ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {variant.color?.substring(0, 8) || 'Color'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Product Info - Clean & Attractive */}
          <div className="space-y-4">
            {/* Product Header */}
            <div className="bg-white rounded-xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={`${i < Math.floor(averageRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600">{averageRating}</span>
                <span className="text-[10px] text-slate-400">({reviewCount})</span>
                <span className="w-px h-3 bg-slate-200" />
                <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  In Stock
                </span>
              </div>
              
              <h1 className="text-lg md:text-xl font-black text-slate-900 leading-tight mb-2">
                {product.name}
              </h1>
              
              <p className="text-slate-500 text-xs leading-relaxed">
                {product.description?.substring(0, 120) || 'Premium quality product with exceptional design and craftsmanship.'}
              </p>
            </div>

            {/* Price Section - Bold & Clean */}
            <div className="bg-white rounded-xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl font-black text-slate-900">
                  NPR {price.toLocaleString()}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-slate-400 text-sm line-through">
                      NPR {oldPrice.toFixed(0)}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Save NPR {(oldPrice - price).toFixed(0)}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Truck size={10} /> Free Shipping
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Tax included</span>
              </div>
            </div>

            {/* Size Selection - If available */}
            {sizeOptions.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Size</span>
                  <button className="text-[9px] font-bold text-red-600 uppercase">Size Chart</button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition-all duration-200
                        ${selectedSize === size
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="bg-white rounded-xl p-4 shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Qty</span>
                  <div className="flex items-center bg-slate-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      disabled={quantity >= availableStock}
                      className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">
                    {availableStock > 0 ? (
                      <span className="text-emerald-600 font-medium">{availableStock} left</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of stock</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                    ${availableStock <= 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-95'
                    }`}
                >
                  <ShoppingBag size={14} /> 
                  {availableStock <= 0 ? 'Sold Out' : `Add • NPR ${(price * quantity).toLocaleString()}`}
                </button>
                
                {availableStock > 0 && (
                  <button 
                    onClick={() => {
                      handleAddToCart();
                      setTimeout(() => navigate('/cart'), 300);
                    }}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-slate-800 transition-all duration-300 flex items-center gap-1.5"
                  >
                    <Zap size={14} />
                    Buy
                  </button>
                )}
              </div>
            </div>

            {/* Features Icons - Clean Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white rounded-lg p-2 shadow-md border border-slate-100 text-center">
                <Truck className="w-3.5 h-3.5 text-red-600 mx-auto mb-1" />
                <p className="text-[8px] font-bold text-slate-700">Free Delivery</p>
                <p className="text-[7px] text-slate-400">₹5000+</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-md border border-slate-100 text-center">
                <RotateCcw className="w-3.5 h-3.5 text-red-600 mx-auto mb-1" />
                <p className="text-[8px] font-bold text-slate-700">Easy Return</p>
                <p className="text-[7px] text-slate-400">30 days</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-md border border-slate-100 text-center">
                <Shield className="w-3.5 h-3.5 text-red-600 mx-auto mb-1" />
                <p className="text-[8px] font-bold text-slate-700">Secure</p>
                <p className="text-[7px] text-slate-400">Payment</p>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-md border border-slate-100 text-center">
                <Award className="w-3.5 h-3.5 text-red-600 mx-auto mb-1" />
                <p className="text-[8px] font-bold text-slate-700">Premium</p>
                <p className="text-[7px] text-slate-400">Quality</p>
              </div>
            </div>

            {/* Share Button - Simple */}
            <div className="flex gap-2">
              <button
                onClick={() => handleShare('native')}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-red-500 hover:text-red-500 transition-all duration-300 flex items-center justify-center gap-1.5 text-[11px] font-medium"
              >
                <Share2 size={12} />
                Share
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                <Facebook size={14} />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="py-2 px-3 rounded-lg border border-slate-200 text-slate-600 hover:border-sky-500 hover:text-sky-600 transition-all duration-300"
              >
                <Twitter size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs - Clean & Minimal */}
        <div className="mt-8 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 px-2 pt-2">
            <div className="flex gap-1">
              {['Description', 'Specs', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2 rounded-t-lg font-bold text-xs transition-all duration-300
                    ${activeTab === tab.toLowerCase()
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4">
            {activeTab === 'description' && (
              <p className="text-slate-600 leading-relaxed text-sm">
                {product.description || 'No description available for this product.'}
              </p>
            )}
            
            {activeTab === 'specs' && (
              <div className="space-y-2 text-sm">
                <div className="flex py-1.5 border-b border-slate-100">
                  <span className="w-24 font-bold text-slate-900 text-xs">Category</span>
                  <span className="text-slate-600 text-xs">{product.category?.name || 'General'}</span>
                </div>
                <div className="flex py-1.5 border-b border-slate-100">
                  <span className="w-24 font-bold text-slate-900 text-xs">Stock</span>
                  <span className={`text-xs font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                  </span>
                </div>
                {selectedSize && (
                  <div className="flex py-1.5 border-b border-slate-100">
                    <span className="w-24 font-bold text-slate-900 text-xs">Size</span>
                    <span className="text-slate-600 text-xs">{selectedSize}</span>
                  </div>
                )}
                {selectedColor && (
                  <div className="flex py-1.5">
                    <span className="w-24 font-bold text-slate-900 text-xs">Color</span>
                    <span className="text-slate-600 text-xs capitalize">{selectedColor}</span>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="text-center py-6">
                <MessageCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No reviews yet</p>
                <button className="mt-2 px-4 py-1.5 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 transition-colors">
                  Write Review
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products - Compact Grid */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  You May Also Like
                </h2>
                <p className="text-slate-500 text-[10px] mt-0.5">Complete your style</p>
              </div>
              <Link to="/shop" className="text-[10px] font-bold text-red-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                View All <ArrowRight size={10} />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;