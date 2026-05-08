export interface Product {
  id: number;
  name: string;
  price: number;
  category: string | any;
  brand?: any;
  image?: string;
  photo_url?: string;
  shortDescription?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  size?: string;
  color?: string;
}

export interface CartItem extends Product {
  quantity: number;
  cartId?: number; // Backend cart ID for deletion
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum PageRoute {
  HOME = '/',
  SHOP = '/shop',
  ABOUT = '/about',
  PRODUCT = '/product/:id',
  CART = '/cart'
}
