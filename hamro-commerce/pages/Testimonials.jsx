import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIAL_ENDPOINTS } from '../src/constants/api/testimonial.js';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith('http')
    ? imagePath
    : `http://192.168.1.64:8000/storage/${imagePath}`;
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(TESTIMONIAL_ENDPOINTS.GET_ALL, {
          headers: { Accept: 'application/json' },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load testimonials');
        }
        setTestimonials(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/40 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 mb-3">
            <Star className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="text-xs font-bold text-red-600 tracking-wide">TESTIMONIALS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">What Our Customers Say</h1>
          <p className="text-slate-500 mt-2">Real feedback from people who shop with us.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <Quote className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Testimonials Yet</h3>
            <p className="text-slate-500 mt-2">Check back later for customer stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100">
                    {item.photopath ? (
                      <img
                        src={getImageUrl(item.photopath)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                        {item.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{item.title}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
