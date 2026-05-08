import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Share2, ArrowLeft, Truck, Shield, Heart, CheckCircle2, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAlert } from '../context/AlertContext';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS } from '../src/constant/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showAlert } = useAlert();
  const [product, setProduct] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetail();
  }, [id]);

  // Define size options based on category
  const getSizeOptions = () => {
    if (!product?.category?.name) return [];

    const categoryName = product.category.name.toLowerCase();

    // Fashion categories
    if (categoryName.includes('fashion') || categoryName.includes('clothing') ||
      categoryName.includes('apparel') || categoryName.includes('wear')) {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    }

    // Electronics/Phone categories
    if (categoryName.includes('electronic') || categoryName.includes('phone') ||
      categoryName.includes('mobile') || categoryName.includes('gadget') ||
      categoryName.includes('computer') || categoryName.includes('laptop')) {
      return ['64GB', '128GB', '256GB', '512GB', '1TB'];
    }

    // Shoes/Footwear
    if (categoryName.includes('shoe') || categoryName.includes('footwear')) {
      return ['6', '7', '8', '9', '10', '11', '12'];
    }

    return [];
  };

  const sizeOptions = getSizeOptions();

  useEffect(() => {
    if (product) {
      if (product.size && sizeOptions.length > 0) {
        setSelectedSize(product.size);
      } else if (sizeOptions.length > 0 && !selectedSize) {
        setSelectedSize(sizeOptions[0]);
      }

      if (product.color) {
        setSelectedColor(product.color);
      }

      if (product.photo_url) {
        setActiveImage(product.photo_url);
      }
    }
  }, [product]);

  // Get available colors from product variants
  const getAvailableColors = () => {
    if (!product) return [];

    const colorMap = new Map();

    // Add current product color
    if (product.color) {
      colorMap.set(product.color.toLowerCase(), {
        color: product.color,
        productId: product.id,
        stock: product.stock
      });
    }

    // Add variant colors
    if (Array.isArray(productVariants)) {
      productVariants.forEach(variant => {
        if (variant.color && !colorMap.has(variant.color.toLowerCase())) {
          colorMap.set(variant.color.toLowerCase(), {
            color: variant.color,
            productId: variant.id,
            stock: variant.stock
          });
        }
      });
    }

    return Array.from(colorMap.values()).sort((a, b) =>
      a.color.toLowerCase().localeCompare(b.color.toLowerCase())
    );
  };

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    const variant = productVariants.find(v =>
      v.color?.toLowerCase() === color.toLowerCase()
    );

    if (variant && variant.id !== product.id) {
      navigate(`/product/${variant.id}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id));
      const result = await response.json();
      const productData = result.data || result;

      if (!productData || !productData.id) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(productData);

      // Fetch all products for variants and related
      const productsResponse = await fetch(API_ENDPOINTS.PRODUCTS);
      const productsResult = await productsResponse.json();
      const allProductsRaw = productsResult.data || productsResult;
      const allProducts = Array.isArray(allProductsRaw) ? allProductsRaw : [];

      const variants = allProducts.filter(p =>
        p.name === productData.name && p.id !== productData.id
      );
      setProductVariants(variants);

      const related = allProducts.filter(p =>
        p.category_id === productData.category_id && p.id !== productData.id
      ).slice(0, 4);

      if (related.length < 4) {
        const others = allProducts.filter(p =>
          p.category_id !== productData.category_id && p.id !== productData.id && p.id !== productData.id
        ).slice(0, 4 - related.length);
        related.push(...others);
      }

      setRelatedProducts(related);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm animate-pulse tracking-widest uppercase">Fetching Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
          <ArrowLeft size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-sm">The product you're looking for might have been moved or is no longer available.</p>
        <Link to="/shop" className="bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert({ type: 'warning', title: 'Login Required', message: 'Please login to add products to cart' });
      window.location.href = '/login';
      return;
    }

    try {
      const addResult = await addToCart(product, selectedSize, selectedColor);

      if (addResult?.alreadyInCart) {
        showAlert({ type: 'info', title: 'Already in Cart', message: 'This product is already in your cart' });
      } else if (addResult?.success) {
        showAlert({ type: 'success', title: 'Added to Cart', message: `${product.name} has been added to your cart` });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cartItem = cart.find(item => item.product_id === product?.id || item.product?.id === product?.id);
  const availableStock = product ? product.stock - (cartItem?.quantity || 0) : 0;

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert({ type: 'warning', title: 'Login Required', message: 'Please login to add products to wishlist' });
      window.location.href = '/login';
      return;
    }
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
      showAlert({ type: 'success', title: 'Removed', message: 'Removed from wishlist' });
    } else {
      const result = await addToWishlist(product);
      if (result?.success) showAlert({ type: 'success', title: 'Saved', message: 'Added to wishlist' });
    }
  };

  const price = Number(product.price) || 0;
  const oldPrice = price * 1.2;

  return (
    <div className="bg-[#fafbfc] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-red-600 transition-colors">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-slate-900 line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group bg-white rounded-[2rem] overflow-hidden aspect-square md:aspect-video shadow-2xl shadow-slate-200/40 border border-slate-100 flex items-center justify-center p-6">
              <img
                src={activeImage || '/image/image.jpg'}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = '/image/image.jpg'; }}
              />

              {/* Floating Status Badges */}
              <div className="absolute top-8 left-8 flex flex-col gap-2">
                <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-xl border border-white">
                  {product.category?.name || 'General'}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl animate-pulse">
                    Limited Stock
                  </span>
                )}
              </div>

              {/* Discount Tag */}
              <div className="absolute top-8 right-8 bg-emerald-500 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center font-black shadow-xl shadow-emerald-500/20 rotate-12">
                <span className="text-lg leading-none">20%</span>
                <span className="text-[10px] uppercase">Off</span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
              {[product.photo_url, ...productVariants.map(v => v.photo_url)].filter(url => url).slice(0, 5).map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(url)}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-2 bg-white shadow-sm ${activeImage === url ? 'border-red-600 scale-105 shadow-lg' : 'border-slate-100 hover:border-red-200 opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={url} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
              {/* Product Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">(12 Reviews)</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-tight mb-3 tracking-tight">
                  {product.name}
                </h1>
                <p className="text-slate-500 font-medium text-xs leading-relaxed">
                  {product.description || 'Elevate your style with our premium selection. Meticulously designed for those who demand both quality and aesthetic excellence.'}
                </p>
              </div>

              {/* Price Area */}
              <div className="flex items-end gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">NPR {price.toLocaleString()}</span>
                    <span className="text-slate-300 text-sm line-through decoration-2 decoration-red-400 font-bold">NPR {oldPrice.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Selection Options */}
              <div className="space-y-8 mb-10">
                {/* Size Selection */}
                {sizeOptions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Size</label>
                      <button className="text-[10px] font-black text-red-600 uppercase border-b border-red-600/30">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-xl font-black text-[11px] transition-all duration-300 ${selectedSize === size
                              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {getAvailableColors().length > 0 && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Available Colors</label>
                    <div className="flex flex-wrap gap-3">
                      {getAvailableColors().map((colorOption) => {
                        const isSelected = selectedColor?.toLowerCase() === colorOption.color.toLowerCase();
                        return (
                          <button
                            key={colorOption.color}
                            onClick={() => handleColorChange(colorOption.color)}
                            className={`px-4 py-2 rounded-xl font-black text-[11px] capitalize transition-all duration-300 ${isSelected
                                ? 'bg-red-600 text-white shadow-lg shadow-red-100 scale-105'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                              }`}
                            disabled={colorOption.stock === 0}
                          >
                            {colorOption.color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Area */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={availableStock <= 0}
                    className={`flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${availableStock <= 0
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-slate-900 hover:shadow-red-200 active:scale-95 shadow-red-600/20'
                      }`}
                  >
                    <ShoppingBag size={16} /> {availableStock <= 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center ${product && isInWishlist(product.id)
                        ? 'bg-rose-50 border-rose-500 text-rose-500'
                        : 'border-slate-100 text-slate-300 hover:border-rose-500 hover:text-rose-500'
                      }`}
                  >
                    <Heart size={18} fill={product && isInWishlist(product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out this ${product.name} at Hamro Commerce!`,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      showAlert({ type: 'info', title: 'Link Copied', message: 'Product link copied to clipboard!' });
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest group"
                >
                  <Share2 size={14} className="group-hover:rotate-12 transition-transform" /> Share with Friends
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Complete Your Style</h2>
                <p className="text-slate-500 font-medium mt-0.5 text-xs">Recommended products based on your interest.</p>
              </div>
              <Link to="/shop" className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-600 hover:text-slate-900 transition-colors">
                View Entire Shop <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
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