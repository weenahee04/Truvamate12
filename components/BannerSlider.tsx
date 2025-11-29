import React, { useState, useEffect, useRef } from 'react';
import { IconTicket, IconGift, IconScan, IconX, IconInfo } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import bannerService, { Banner } from '../services/bannerService';

interface DisplayBanner extends Banner {
  icon?: React.ReactNode;
  pattern?: string;
}

export const BannerSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [activeBanner, setActiveBanner] = useState<DisplayBanner | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  // Load banners from service
  useEffect(() => {
    const loadBanners = () => {
      try {
        const activeBanners = bannerService.getActiveBanners();
        setBanners(activeBanners);
        setCurrent(0);
      } catch (error) {
        console.error('Error loading banners:', error);
        setBanners([]);
      }
    };

    loadBanners();

    const handleBannersUpdate = () => {
      loadBanners();
    };

    window.addEventListener('bannersUpdated', handleBannersUpdate);
    return () => {
      window.removeEventListener('bannersUpdated', handleBannersUpdate);
    };
  }, []);

  // Add icons to banners
  const getIconForBanner = (id: number): React.ReactNode => {
    switch(id) {
      case 1: return <IconScan className="w-10 h-10 md:w-16 md:h-16 text-white/80" />;
      case 2: return <IconTicket className="w-10 h-10 md:w-16 md:h-16 text-white/80" />;
      case 3: return <IconGift className="w-10 h-10 md:w-16 md:h-16 text-white/80" />;
      default: return <IconTicket className="w-10 h-10 md:w-16 md:h-16 text-white/80" />;
    }
  };

  const BANNERS: DisplayBanner[] = banners.length > 0 
    ? banners.map(b => ({ ...b, icon: getIconForBanner(b.id), pattern: 'opacity-20' }))
    : [
        {
          id: 1,
          title: t('banner.guide.title'),
          subtitle: t('banner.guide.subtitle'),
          description: t('banner.guide.desc'),
          color: "bg-black",
          bgImage: "https://www.powerball.com/themes/custom/baseline/images/home_hero.png",
          detail: t('banner.guide.detail'),
          width: 1200,
          height: 400,
          isActive: true,
          order: 1,
          icon: <IconScan className="w-10 h-10 md:w-16 md:h-16 text-white/80" />,
          pattern: 'opacity-20'
        }
      ];

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
        setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 seconds per slide

    return () => resetTimeout();
  }, [current, BANNERS.length]);

  return (
    <div className="w-full relative mb-6 md:mb-10 group">
      <div className="overflow-hidden rounded-2xl shadow-xl relative h-48 md:h-80 lg:h-96">
        <div 
            className="whitespace-nowrap transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] h-full"
            style={{ transform: `translateX(${-current * 100}%)` }}
        >
          {BANNERS.map((banner) => (
            <div 
                key={banner.id} 
                className={`inline-block w-full h-full ${banner.color} text-white relative whitespace-normal align-top overflow-hidden`}
            >
                {/* Background Image */}
                {banner.bgImage && (
                    <div className="absolute inset-0 opacity-30">
                        <img 
                            src={banner.bgImage} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                
                {/* Background Pattern */}
                <div className={`absolute -right-4 -top-8 ${banner.pattern || 'opacity-20'} pointer-events-none`}>
                     <div className="transform rotate-12 scale-[2.5] md:scale-[4]">
                        {banner.icon || <IconTicket className="w-10 h-10 md:w-16 md:h-16 text-white/80" />}
                     </div>
                </div>
                
                <div className="p-5 md:p-12 h-full flex flex-col justify-center relative z-10 max-w-[85%] md:max-w-2xl lg:max-w-3xl">
                    <div className="inline-flex items-center gap-2 mb-1.5 md:mb-2 bg-white/20 backdrop-blur-sm self-start px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm">
                        <span>TruvaMate</span>
                        {banner.id === 1 && <span className="bg-yellow-400 text-black px-1 rounded-[2px]">GUIDE</span>}
                        {banner.id === 2 && <span className="bg-red-600 text-white px-1 rounded-[2px]">HOT</span>}
                        {banner.id === 3 && <span className="bg-blue-500 text-white px-1 rounded-[2px]">PROMO</span>}
                    </div>
                    <h2 className="text-xl md:text-5xl font-bold mb-1 md:mb-4 leading-tight drop-shadow-md">{banner.title}</h2>
                    <p className="text-sm md:text-xl font-medium opacity-95 mb-1 md:mb-2">{banner.subtitle}</p>
                    <p className="text-xs md:text-base opacity-75">{banner.description}</p>
                    
                    {/* Desktop Button */}
                    <button 
                        onClick={() => setActiveBanner(banner)}
                        className="hidden md:inline-block mt-6 bg-white text-gray-900 px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition self-start shadow-lg"
                    >
                        {t('common.details')}
                    </button>
                    {/* Mobile Invisible Click Area for Details */}
                    <button 
                        onClick={() => setActiveBanner(banner)}
                        className="md:hidden absolute inset-0 z-10 w-full h-full cursor-pointer"
                        aria-label="View details"
                    ></button>
                </div>

                {/* Main Icon Bottom Right (Hidden on small mobile to avoid clutter, visible on larger) */}
                <div className="absolute right-3 bottom-3 md:right-10 md:bottom-10 bg-white/10 p-2 md:p-5 rounded-full backdrop-blur-md shadow-inner border border-white/10 scale-75 md:scale-100 pointer-events-none">
                    {banner.icon || <IconTicket className="w-10 h-10 md:w-16 md:h-16 text-white/80" />}
                </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator - Inside container for mobile to save space */}
        <div className="absolute bottom-3 md:bottom-4 md:left-10 md:right-auto md:justify-start left-0 right-0 flex justify-center gap-1.5 md:gap-2 z-20 pointer-events-none">
            {BANNERS.map((_, idx) => (
            <div
                key={idx}
                className={`transition-all duration-300 rounded-full h-1 md:h-2 shadow-sm ${current === idx ? 'bg-white w-5 md:w-8' : 'bg-white/40 w-1 md:w-2'}`}
            />
            ))}
        </div>
      </div>

      {/* Detail Modal */}
      {activeBanner && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setActiveBanner(null)}>
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className={`h-32 ${activeBanner.color} relative overflow-hidden flex items-center justify-center`}>
                      <div className="absolute inset-0 opacity-20 transform scale-150 rotate-12 flex items-center justify-center">
                          {activeBanner.icon || <IconTicket className="w-10 h-10 md:w-16 md:h-16 text-white/80" />}
                      </div>
                      <h3 className="text-2xl font-bold text-white relative z-10 drop-shadow-md px-6 text-center">{activeBanner.title}</h3>
                      <button onClick={() => setActiveBanner(null)} className="absolute top-4 right-4 bg-black/20 text-white rounded-full p-1 hover:bg-black/40 backdrop-blur-md">
                          <IconX className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-1">
                              <IconInfo className="w-5 h-5" />
                          </div>
                          <div>
                              <p className="font-bold text-gray-800 text-lg mb-1">{activeBanner.subtitle}</p>
                              <p className="text-sm text-gray-500">{activeBanner.description}</p>
                          </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                          {activeBanner.detail}
                      </div>
                      <button 
                          onClick={() => setActiveBanner(null)} 
                          className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition"
                      >
                          {t('common.ok')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};