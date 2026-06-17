import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { resolveImageUrl } from '../src/constant/api';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product }) => {
  const { t } = useLanguage();

  // Handle both API and mock data formats
  const productImage = resolveImageUrl(product.photo_url || product.image) || '/image/image.jpg';
  const productPrice = parseFloat(product.price) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-1 transition-all duration-300 group flex aspect-square flex-col">
      <div className="relative overflow-hidden h-[52%] shrink-0 bg-gradient-to-br from-slate-50 to-white">
        <Link to={`/product/${product.id}`} className="block h-full w-full p-2 sm:p-3">
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
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-1.5 p-2.5">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-bold text-slate-900 text-[11px] sm:text-xs leading-snug hover:text-green-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>


        {/* Stock Status */}
        <div>
          {product.stock && product.stock > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-[10px] font-bold text-green-700">
              {product.stock > 10 ? t('inStock') : `${t('only')} ${product.stock} ${t('left')}`}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{t('outOfStock')}</span>
          )}
        </div>

        <div>
          <span className="text-sm font-black text-slate-900">
            NPR {productPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
