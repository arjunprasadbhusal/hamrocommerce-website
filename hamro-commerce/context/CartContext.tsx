import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { API_ENDPOINTS } from '../src/constant/api';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => Promise<{ success: boolean; message: string; alreadyInCart?: boolean; newQuantity?: number } | undefined>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.MY_CART, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.carts) {
        // Transform backend cart format to frontend format
        const transformedCart = data.carts.map((item: any) => ({
          id: item.id, // This is the cart ID, not product ID
          product_id: item.product.id,
          name: item.product.name,
          price: parseFloat(item.product.price),
          photo_url: item.product.photo_url,
          image: item.product.photo_url,
          stock: item.product.stock,
          quantity: item.quantity,
          category: item.product.category,
          brand: item.product.brand,
          description: item.product.description,
          size: item.size || item.product.size,
          color: item.color || item.product.color
        }));
        setCart(transformedCart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart();
    } else {
      // Clear cart if not logged in
      setCart([]);
    }
  }, [fetchCart]);

  // Listen for login/logout changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        fetchCart();
      } else {
        setCart([]);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchCart]);

  const addToCart = async (product: Product, size?: string, color?: string, quantity = 1) => {
    const token = localStorage.getItem('token');
    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;
      if (existingItem.stock !== undefined && newQuantity > existingItem.stock) {
        return { success: false, message: `Only ${existingItem.stock} items available` };
      }

      await updateQuantity(existingItem.id, newQuantity);
      return {
        success: true,
        message: 'Cart quantity updated',
        alreadyInCart: true,
        newQuantity
      };
    }

    // Logged-in users: use API
    try {
      setLoading(true);
      const requestBody: any = {
        product_id: product.id,
        quantity: requestedQuantity
      };
      
      if (size) requestBody.size = size;
      if (color) requestBody.color = color;
      
      const response = await fetch(API_ENDPOINTS.CART, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh cart from backend to get updated data
        await fetchCart();
        console.log('Item added to cart via API');
        return { success: true, message: data.message };
      } else {
        console.error('API returned error:', data.message);
        return { success: false, message: data.message || 'Failed to add product to cart' };
      }
    } catch (error) {
      console.error('Error adding to cart via API:', error);
      return { success: false, message: 'Failed to add product to cart. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    
    // Optimistic Update: Remove from local state immediately
    const previousCart = [...cart];
    setCart((prev) => prev.filter((item) => item.id !== productId && item.product_id !== productId));

    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.CART, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          dataid: productId // This is the cart ID
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to remove item:', data.message);
        setCart(previousCart); // Revert on failure
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCart(previousCart); // Revert on failure
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    const token = localStorage.getItem('token');
    
    // Optimistic Update: Update local state immediately
    setCart((prev) =>
      prev.map((item) => {
        // If logged in, match by cart item ID (item.id). If guest, match by product_id
        const isMatch = token ? item.id === productId : item.product_id === productId;
        
        if (isMatch) {
          if (item.stock !== undefined && quantity > item.stock) {
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );

    if (!token) return;

    try {
      const response = await fetch(API_ENDPOINTS.CART_UPDATE(productId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to update quantity:', data.message);
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity via API:', error);
      await fetchCart();
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setCart([]);
      return;
    }

    // For logged-in users, delete all cart items
    try {
      setLoading(true);
      for (const item of cart) {
        await fetch(API_ENDPOINTS.CART, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ dataid: item.id })
        });
      }
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart, fetchCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
