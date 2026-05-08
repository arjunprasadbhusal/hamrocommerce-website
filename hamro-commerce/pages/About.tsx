import React from 'react';
import { Target, Heart, Users, ArrowRight, Truck, ShieldCheck, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const About: React.FC = () => {
  const { t } = useLanguage();
  
  return (
        <div className="bg-slate-50">
            {/* Hero (matches Home/Shop styling) */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="text-center lg:text-left">
                            <p className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                                {t('aboutUs')}
                            </p>
                            <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                                {t('connectingCraftsmanship')}
                            </h1>
                            <p className="mt-2 text-slate-200 text-sm md:text-base leading-relaxed opacity-90">
                                {t('buildingFuture')}
                            </p>
                            <div className="mt-5 flex justify-center lg:justify-start">
                                <a
                                    href="#about"
                                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-colors shadow-lg"
                                >
                                    {t('ourStory')} <ArrowRight size={16} />
                                </a>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl">
                                <img
                                    src="/image/about.jpg"
                                    alt={t('aboutUs')}
                                    className="w-full h-auto object-cover opacity-90"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = '/image/image.jpg';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick value props */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: Truck, title: 'fastDelivery', desc: 'freeShipping' },
                            { icon: ShieldCheck, title: 'secureShoppingTitle', desc: 'secureShoppingDesc' },
                            { icon: HeadphonesIcon, title: 'customerSupportTitle', desc: 'customerSupportDesc' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-xl">
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{t(item.title)}</p>
                                        <p className="text-xs text-slate-200 mt-0.5">{t(item.desc)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center mb-16 md:mb-24">
            <div className="relative order-2 lg:order-1">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <img 
                    src="/image/about1.jpg" 
                    alt="Our Team" 
                    className="relative rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 z-10 border-4 border-white w-full"
                />
            </div>
            
            <div className="space-y-6 order-1 lg:order-2">
                <span className="text-red-600 font-bold uppercase tracking-wider text-sm">{t('ourStory')}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{t('buildingFuture')}</h2>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                    {t('aboutStoryText1')}
                </p>
                <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                    {t('aboutStoryText2')}
                </p>
                
                <div className="grid grid-cols-2 gap-6 pt-6">
                    <div className="border-l-4 border-red-600 pl-4">
                        <span className="block text-2xl md:text-3xl font-bold text-slate-900">5k+</span>
                        <span className="text-slate-500 text-sm">{t('happyCustomers')}</span>
                    </div>
                    <div className="border-l-4 border-slate-900 pl-4">
                        <span className="block text-2xl md:text-3xl font-bold text-slate-900">100+</span>
                        <span className="text-slate-500 text-sm">{t('localBrands')}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Values Grid */}
        <div className="mb-16 md:mb-24">
            <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{t('whyChooseUs')}</h2>
                <p className="text-slate-600">{t('whyChooseUsDesc')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                        <Target size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{t('missionDriven')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{t('missionDesc')}</p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                        <Heart size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{t('customerFirst')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{t('customerFirstDesc')}</p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6">
                        <Users size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{t('communityFocused')}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{t('communityDesc')}</p>
                </div>
            </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-3xl p-8 md:p-16 border border-gray-100 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 md:mb-12 text-center">{t('meetLeadership')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    {name: "Aarav Sharma", role: "CEO & Founder", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400"},
                    {name: "Priya Gurung", role: "Head of Operations", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400"},
                    {name: "Bijay Thapa", role: "Tech Lead", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400"},
                    {name: "Sunita Rai", role: "Customer Success", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400"}
                ].map((member, idx) => (
                    <div key={idx} className="text-center group">
                        <div className="mb-4 relative mx-auto w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full border-4 border-white shadow-lg">
                            <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                        <p className="text-red-600 text-sm font-medium">{member.role}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default About;