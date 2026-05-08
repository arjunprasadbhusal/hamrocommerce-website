import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, Clock, ShieldCheck, Globe, ArrowRight, Truck, HeadphonesIcon, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../src/constant/api';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          subject: 'General Inquiry',
          message: ''
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Clean Hero Section */}
      <section className="bg-slate-900 text-white py-10 md:py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="max-w-xl">
              <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] mb-3">Get In Touch</p>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Contact Our Team
              </h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6">
                Have questions about our products or services? We're here to help. Reach out to us through any of the channels below.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Support" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  <span className="text-white font-bold">24/7</span> Online Support
                </p>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -inset-4 bg-red-600/10 blur-2xl rounded-full"></div>
              <div className="relative w-full max-w-sm bg-slate-800 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <img 
                  src="/image/shop.png" 
                  alt="Contact Hero" 
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?q=80&w=1000&auto=format&fit=crop" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Contact Information</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-base font-bold text-slate-900">+977 9800000000</p>
                    <p className="text-xs text-slate-500">Sun - Fri, 10am - 6pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-base font-bold text-slate-900">support@hamro.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-base font-bold text-slate-900">Kawasoti, Nawalpur</p>
                    <p className="text-xs text-slate-500">Main Market Area</p>
                  </div>
                </div>
              </div>

              {/* Simple Map */}
              <div className="mt-10 rounded-xl overflow-hidden border border-slate-200 h-48">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14141.516086705624!2d84.1165158!3d27.6437199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399451996726e6d1%3A0x64369e82103a8d11!2sKawasoti!5e0!3m2!1sen!2snp!4v1714631234567!5m2!1sen!2snp" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  title="Kawasoti Map"
                ></iframe>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex gap-4">
                  {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                    <a key={idx} href="#" className="text-slate-400 hover:text-red-600 transition-colors">
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Send Us a Message</h3>
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">First Name</label>
                    <input 
                      type="text" 
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white focus:ring-0 text-slate-900 transition-all outline-none text-sm font-medium" 
                      placeholder="John" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Last Name</label>
                    <input 
                      type="text" 
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white focus:ring-0 text-slate-900 transition-all outline-none text-sm font-medium" 
                      placeholder="Doe" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white focus:ring-0 text-slate-900 transition-all outline-none text-sm font-medium" 
                    placeholder="john@example.com" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Subject</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white focus:ring-0 text-slate-900 transition-all outline-none text-sm font-medium cursor-pointer"
                  >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order Status">Order Status</option>
                      <option value="Returns & Refund">Returns & Refund</option>
                      <option value="Business Partnership">Business Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Message</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5} 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white focus:ring-0 text-slate-900 transition-all outline-none text-sm font-medium resize-none" 
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-10 py-4 bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:bg-slate-400 disabled:shadow-none flex items-center justify-center gap-2"
                >
                    {loading ? 'Sending...' : 'Send Message'} <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Support Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Clock, title: 'Quick Response', desc: 'Replies within 24 hours' },
            { icon: ShieldCheck, title: 'Secure Communication', desc: 'Your data is protected' },
            { icon: Globe, title: 'Nationwide Support', desc: 'Serving all of Nepal' },
            { icon: HeadphonesIcon, title: 'Expert Guidance', desc: 'Dedicated support team' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4">
                <item.icon size={24} />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">© 2026 Hamro Commerce • Kawasoti, Nawalpur</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;