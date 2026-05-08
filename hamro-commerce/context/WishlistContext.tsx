import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { API_ENDPOINTS } from '../src/constant/api';

interface WishlistItem {
  id: number;
  product_id: number;
  product: Product;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (product: Product) => Promise<{ success: boolean; message: string; alreadyInWishlist?: boolean } | undefined>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
  clearWishlist: () => void;
  fetchWishlist: () => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.MY_WISHLIST, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.wishlists) {
        setWishlist(data.wishlists);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wishlist on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [fetchWishlist]);

  // Listen for login/logout changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchWishlist();
      } else {
        setWishlist([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchWishlist]);

  const addToWishlist = async (product: Product) => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Check if product already in wishlist
    const existingItem = wishlist.find(item => item.product.id === product.id);
    if (existingItem) {
      return { success: false, message: 'Product already in wishlist', alreadyInWishlist: true };
    }

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.WISHLIST, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: product.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchWishlist();
        console.log('Item added to wishlist');
        return { success: true, message: data.message };
      } else {
        console.error('API returned error:', data.message);
        return { success: false, message: data.message || 'Failed to add product to wishlist' };
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, message: 'Failed to add product to wishlist. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.WISHLIST_DELETE_BY_PRODUCT(productId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        await fetchWishlist();
        console.log('Item removed from wishlist');
      } else {
        console.error('Failed to remove item:', data.message);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlist.some(item => item.product.id === productId);
  };

  const clearWishlist = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      for (const item of wishlist) {
        await fetch(API_ENDPOINTS.WISHLIST_DELETE(item.id), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
      }
      await fetchWishlist();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      wishlistCount,
      clearWishlist,
      fetchWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
