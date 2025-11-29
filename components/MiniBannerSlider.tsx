import React, { useState, useEffect, useRef } from 'react';
import { IconTicket, IconGift, IconScan, IconX, IconInfo } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import bannerService, { Banner } from '../services/bannerService';

interface DisplayBanner extends Banner {
  icon?: React.ReactNode;
}

interface MiniBannerSliderProps {
  maxBanners?: number;
  className?: string;
}

export const MiniBannerSlider: React.FC<MiniBannerSliderProps> = ({ maxBanners = 3, className = '' }) => {
  const [current, setCurrent] = useState(0);
  const [activeBanner, setActiveBanner] = useState<DisplayBanner | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  // Load banners from service
  useEffect(() => {
    const loadBanners = () => {
      try {
        const activeBanners = bannerService.getActiveBanners().slice(0, maxBanners);
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
  }, [maxBanners]);

  // Add icons to banners
  const getIconForBanner = (id: number): React.ReactNode => {
    switch(id) {
      case 1: return <IconScan className="w-6 h-6 text-white/80" />;
      case 2: return <IconTicket className="w-6 h-6 text-white/80" />;
      case 3: return <IconGift className="w-6 h-6 text-white/80" />;
      default: return <IconTicket className="w-6 h-6 text-white/80" />;
    }
  };

  const BANNERS: DisplayBanner[] = banners.length > 0 
    ? banners.map(b => ({ ...b, icon: getIconForBanner(b.id) }))
    : [];

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (BANNERS.length <= 1) return;
    
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
        setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 4000); // 4 seconds per slide

    return () => resetTimeout();
  }, [current, BANNERS.length]);

  if (BANNERS.length === 0) return null;

  return (
    <div className={`w-full relative mb-4 ${className}`}>
      <div className="overflow-hidden rounded-xl shadow-sm relative h-24">
        <div 
            className="whitespace-nowrap transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(${-current * 100}%)` }}
        >
          {BANNERS.map((banner) => (
            <div 
                key={banner.id} 
                onClick={() => setActiveBanner(banner)}
                className={`inline-block w-full h-full ${banner.color} text-white relative whitespace-normal align-top overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
            >
                {/* Background Image */}
                {banner.bgImage && (
                    <div className="absolute inset-0 opacity-20">
                        <img 
                            src={banner.bgImage} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                
                {/* Content */}
                <div className="p-4 h-full flex items-center relative z-10">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded font-bold uppercase">
                                TruvaMate
                            </span>
                        </div>
                        <h3 className="text-sm font-bold truncate">{banner.title}</h3>
                        <p className="text-xs opacity-80 truncate">{banner.subtitle}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm ml-2 shrink-0">
                        {banner.icon}
                    </div>
                </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        {BANNERS.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-20">
              {BANNERS.map((_, idx) => (
              <div
                  key={idx}
                  className={`transition-all duration-300 rounded-full h-1.5 ${current === idx ? 'bg-white w-3' : 'bg-white/40 w-1.5'}`}
              />
              ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeBanner && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setActiveBanner(null)}>
              <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className={`h-24 ${activeBanner.color} relative overflow-hidden flex items-center justify-center`}>
                      <div className="absolute inset-0 opacity-20 transform scale-150 rotate-12 flex items-center justify-center">
                          {activeBanner.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white relative z-10 drop-shadow-md px-6 text-center">{activeBanner.title}</h3>
                      <button onClick={() => setActiveBanner(null)} className="absolute top-3 right-3 bg-black/20 text-white rounded-full p-1 hover:bg-black/40 backdrop-blur-md">
                          <IconX className="w-4 h-4" />
                      </button>
                  </div>
                  <div className="p-5">
                      <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                              <IconInfo className="w-4 h-4" />
                          </div>
                          <div>
                              <p className="font-bold text-gray-800 mb-1">{activeBanner.subtitle}</p>
                              <p className="text-sm text-gray-500">{activeBanner.description}</p>
                          </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm text-gray-600 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                          {activeBanner.detail}
                      </div>
                      <button 
                          onClick={() => setActiveBanner(null)} 
                          className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-xl font-bold hover:bg-black transition text-sm"
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
