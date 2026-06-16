import React from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
}

const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, backgroundImage }) => {
  return (
    <div className="relative h-[300px] md:h-[400px] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt={title} 
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a56bd]/85 via-[#0d62cc]/75 to-[#08489c]/80"></div>
      </div>
      <div className="relative z-10 px-4 max-w-4xl mx-auto animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-green-100 font-medium max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="w-24 h-1 bg-green-400 mx-auto mt-8 rounded-full"></div>
      </div>
    </div>
  );
};

export default PageHero;
