import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BLOG_ENDPOINTS } from '../src/constants/api/blog';
import LoadingSpinner from '../components/LoadingSpinner';
import { BASE_URL } from '../src/constant/api';

interface Blog {
  id: number;
  title: string;
  description: string;
  photopath: string | null;
  created_at: string;
}

const Blog: React.FC = () => {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(BLOG_ENDPOINTS.GET_ALL);
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (photopath: string | null) => {
    if (!photopath) return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop';
    return photopath.startsWith('http') ? photopath : `${BASE_URL}/storage/${photopath}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="bg-slate-50">
      {/* Hero (matches Home/Shop styling) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <p className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                {t('ourBlog')}
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                {t('storiesFromNepal')}
              </h1>
              <div className="mt-6 flex justify-center lg:justify-start">
                <a
                  href="#blogs"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold text-sm md:text-base transition-colors shadow-lg"
                >
                  {t('readMore')} <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-3xl overflow-hidden border border-white/10 bg-white/5">
                <img
                  src="/image/blog.jpg"
                  alt={t('ourBlog')}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/image/image.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="blogs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{t('blogsEmptyTitle')}</p>
            <p className="text-gray-400 text-sm mt-2">{t('blogsEmptyDesc')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={getImageUrl(blog.photopath)} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {truncateText(blog.description, 150)}
                    </p>
                    
                    <Link 
                      to={`/blog/${blog.id}`}
                      className="flex items-center gap-2 text-red-600 font-bold text-sm hover:gap-3 transition-all mt-auto"
                    >
                      {t('readMore')} <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;