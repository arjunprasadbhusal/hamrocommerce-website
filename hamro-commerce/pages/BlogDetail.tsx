import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';
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

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBlogDetail();
      fetchRelatedBlogs();
    }
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(BLOG_ENDPOINTS.GET_BY_ID(parseInt(id!)));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setBlog(data.data);
      } else {
        setError(t('blogNotFound'));
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      setError(t('blogLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async () => {
    try {
      const response = await fetch(BLOG_ENDPOINTS.GET_ALL);
      const data = await response.json();
      
      if (data.success) {
        const allBlogs = data.data.data || [];
        // Filter out current blog and get 3 random related blogs
        const filtered = allBlogs.filter((b: Blog) => b.id !== parseInt(id!));
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setRelatedBlogs(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch related blogs:', error);
    }
  };

  const getImageUrl = (photopath: string | null) => {
    if (!photopath) return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop';
    return photopath.startsWith('http') ? photopath : `${BASE_URL}/storage/${photopath}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const getExcerpt = (text: string) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    const sentenceEnd = clean.indexOf('. ');
    if (sentenceEnd === -1) return clean.slice(0, 140);
    return clean.slice(0, sentenceEnd + 1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || t('blogNotFound')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('blogNotFoundDesc')}
          </p>
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            {t('backToBlogs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a56bd] via-[#0d62cc] to-[#08489c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            {t('backToBlogs')}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <p className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
                {t('editorialLabel')}
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {blog.title}
              </h1>
              <p className="mt-4 text-slate-200 text-sm md:text-base leading-relaxed opacity-90">
                {getExcerpt(blog.description)}
              </p>
              <div className="mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-3 text-xs md:text-sm text-slate-100">
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                  <Calendar size={15} />
                  {formatDate(blog.created_at)}
                </span>
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                  <Clock size={15} />
                  {calculateReadingTime(blog.description)} {t('minRead')}
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-xl">
                <img
                  src={getImageUrl(blog.photopath)}
                  alt={blog.title}
                  className="w-full h-[260px] md:h-[320px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8">
            <article className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="text-xs uppercase tracking-wide font-bold text-green-600">
                  {t('editorialLabel')}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2 bg-blue-50 text-green-700 px-3 py-1.5 rounded-full border border-blue-100">
                    <Clock size={12} /> {calculateReadingTime(blog.description)} {t('minRead')}
                  </span>
                  <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full border border-slate-100">
                    <Calendar size={12} /> {formatDate(blog.created_at)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-wide text-green-700 font-bold mb-2">{t('keyTakeaway')}</p>
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                    {getExcerpt(blog.description)}
                  </p>
                </div>
                <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg shadow-slate-200/50">
                  <p className="text-xs uppercase tracking-wide text-white/70 font-bold mb-2">{t('readingGuide')}</p>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {t('readingGuideDesc')}
                  </p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="text-slate-700 leading-relaxed text-base md:text-lg space-y-5">
                  {blog.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className={`mb-4 ${index === 0 ? 'first-letter:text-5xl first-letter:font-black first-letter:text-green-600 first-letter:mr-2 first-letter:float-left first-letter:leading-none' : ''}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </article>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Related News */}
              {relatedBlogs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900">{t('moreLikeThis')}</h2>
                    <span className="text-xs text-slate-500">{relatedBlogs.length} {t('picks')}</span>
                  </div>

                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog.id}
                        to={`/blog/${relatedBlog.id}`}
                        className="flex gap-3 group p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(relatedBlog.photopath)}
                            alt={relatedBlog.title}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-green-600 transition-colors">
                            {relatedBlog.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                            <Calendar size={12} />
                            {formatDate(relatedBlog.created_at)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
