import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAlert } from '../context/AlertContext';
import { API_ENDPOINTS } from '../src/constant/api';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showAlert } = useAlert();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Handle both API and mock data formats
  const productImage = product.photo_url || product.image || '/image/image.jpg';
  const productPrice = parseFloat(product.price) || 0;

  const handleAddToCart = useCallback(async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login to add products to cart'
      });
      window.location.href = '/login';
      return;
    }

    try {
      setIsAddingToCart(true);
      // Fetch fresh product data to get current stock
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(product.id));
      const result = await response.json();
      const freshProduct = result.data || result;

      // Add to cart with fresh stock data and product's size/color
      const addResult = await addToCart(freshProduct, freshProduct.size, freshProduct.color);

      if (addResult?.alreadyInCart) {
        showAlert({
          type: 'info',
          title: 'Already in Cart',
          message: 'This product is already in your cart'
        });
      } else if (addResult?.success) {
        showAlert({
          type: 'success',
          title: 'Added to Cart',
          message: `${product.name} has been added to your cart`
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Error',
          message: addResult?.message || 'Failed to add product to cart'
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to add product to cart. Please try again.'
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [product.id, product.name, addToCart, showAlert]);

  const handleToggleWishlist = useCallback(async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login to manage your wishlist'
      });
      window.location.href = '/login';
      return;
    }

    try {
      setIsTogglingWishlist(true);

      if (isInWishlist(product.id)) {
        // Remove from wishlist
        await removeFromWishlist(product.id);
        showAlert({
          type: 'success',
          title: 'Removed from Wishlist',
          message: `${product.name} has been removed from your wishlist`
        });
      } else {
        // Add to wishlist
        const result = await addToWishlist(product);
        if (result?.success) {
          showAlert({
            type: 'success',
            title: 'Added to Wishlist',
            message: `${product.name} has been added to your wishlist`
          });
        } else if (result?.alreadyInWishlist) {
          showAlert({
            type: 'info',
            title: 'Already in Wishlist',
            message: 'This product is already in your wishlist'
          });
        } else {
          showAlert({
            type: 'error',
            title: 'Error',
            message: result?.message || 'Failed to add product to wishlist'
          });
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Failed to update wishlist. Please try again.'
      });
    } finally {
      setIsTogglingWishlist(false);
    }
  }, [product, addToWishlist, removeFromWishlist, isInWishlist, showAlert]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <Link to={`/product/${product.id}`} className="block h-full w-full bg-white">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/image/image.jpg';
            }}
          />
        </Link>

        {/* Quick Action Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-1.5">
          <Link
            to={`/product/${product.id}`}
            className="bg-white text-slate-900 hover:bg-slate-900 hover:text-white p-1.5 rounded-full shadow-lg transition-colors"
            title="View Details"
          >
            <Eye size={14} />
          </Link>
          <button
            onClick={handleToggleWishlist}
            className={`p-1.5 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isInWishlist(product.id)
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-slate-900 hover:bg-red-600 hover:text-white'
              }`}
            title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            disabled={isTogglingWishlist}
          >
            <Heart size={14} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleAddToCart}
            className="bg-white text-slate-900 hover:bg-red-600 hover:text-white p-1.5 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add to Cart"
            disabled={!product.stock || product.stock === 0 || isAddingToCart}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>

      <div className="p-1.5 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="block mb-1.5">
          <h3 className="font-semibold text-slate-900 text-xs leading-snug hover:text-red-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-1.5">
            {product.description}
          </p>
        )}

        {/* Star Rating */}
        <div className="flex items-center gap-1 mb-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={`${star <= Math.round(product.rating || 4.5)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                  }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">
            ({product.reviews || 0})
          </span>
        </div>

        {/* Stock Status */}
        <div className="mb-1.5">
          {product.stock && product.stock > 0 ? (
            <span className={`text-xs font-medium ${product.stock > 10
                ? 'text-green-600'
                : product.stock > 5
                  ? 'text-orange-500'
                  : 'text-red-600'
              }`}>
              {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">Out of Stock</span>
          )}
        </div>

        <div className="mt-auto">
          <span className="text-xs font-bold text-slate-900">
            NPR {productPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
