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
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            {t('backToBlogs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-[#1c1917]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Sora:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,#fde68a55,transparent_45%),radial-gradient(circle_at_85%_10%,#fb718555,transparent_50%),linear-gradient(140deg,#0f172a,#1e293b)]" />
        <div className="absolute inset-0 opacity-25 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.4),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="text-white max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase font-['Sora']">
                {t('editorialLabel')}
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight font-['Cormorant_Garamond']">
                {blog.title}
              </h1>
              <p className="mt-3 text-white/80 text-sm md:text-base font-['Sora'] leading-relaxed">
                {getExcerpt(blog.description)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-white/80 text-xs md:text-sm font-['Sora']">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {formatDate(blog.created_at)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  {calculateReadingTime(blog.description)} {t('minRead')}
                </span>
              </div>
            </div>

            <div className="w-full lg:w-[360px]">
              <div className="rounded-3xl overflow-hidden border border-white/20 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6)]">
                <img
                  src={getImageUrl(blog.photopath)}
                  alt={blog.title}
                  className="w-full h-[220px] md:h-[240px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8">
            <article className="bg-white rounded-[28px] shadow-lg border border-[#f0e7dc] p-7 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="font-['Sora'] text-xs uppercase tracking-[0.3em] text-amber-700/80">
                  {t('editorialLabel')}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-['Sora']">
                  <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
                    <Clock size={12} /> {calculateReadingTime(blog.description)} {t('minRead')}
                  </span>
                  <span className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1 rounded-full border border-slate-100">
                    <Calendar size={12} /> {formatDate(blog.created_at)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 bg-[#fdf4e7] border border-[#f3e5cf] rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-amber-700/80 font-['Sora'] mb-2">{t('keyTakeaway')}</p>
                  <p className="text-slate-700 text-sm md:text-base font-['Sora'] leading-relaxed">
                    {getExcerpt(blog.description)}
                  </p>
                </div>
                <div className="bg-slate-900 text-white rounded-2xl p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70 font-['Sora'] mb-2">{t('readingGuide')}</p>
                  <p className="text-white/90 text-sm font-['Sora']">
                    {t('readingGuideDesc')}
                  </p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="text-[#3f3f46] leading-relaxed text-[17px] md:text-[18px] space-y-5 font-['Sora']">
                  {blog.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className={`mb-4 ${index === 0 ? 'first-letter:text-5xl first-letter:font-bold first-letter:text-amber-700 first-letter:mr-2 first-letter:float-left first-letter:leading-none' : ''}`}>
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
                <div className="bg-white rounded-[24px] shadow-md border border-[#f0e7dc] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-slate-900 font-['Sora']">{t('moreLikeThis')}</h2>
                    <span className="text-xs text-slate-500 font-['Sora']">{relatedBlogs.length} {t('picks')}</span>
                  </div>

                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog.id}
                        to={`/blog/${relatedBlog.id}`}
                        className="flex gap-3 group p-2.5 rounded-xl hover:bg-[#faf5ef] transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(relatedBlog.photopath)}
                            alt={relatedBlog.title}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors font-['Sora']">
                            {relatedBlog.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-2 font-['Sora']">
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
