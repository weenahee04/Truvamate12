import React, { useState, useEffect } from 'react';
import { TicketType, LotteryLine, LotteryGame, AppView, PurchasedTicket } from './types';
import { IconTicket, IconCart, IconMenu, IconScan, IconCreditCard, IconQrCode, IconInfo, IconX, IconWise, IconOmise, IconAlipay, IconBank } from './components/Icons';
import { GameCard } from './components/GameCard';
import { TicketLine } from './components/TicketLine';
import { NumberSelector } from './components/NumberSelector';
import { BannerSlider } from './components/BannerSlider';
import { BottomNav } from './components/BottomNav';
import { MyTicketsView } from './components/MyTicketsView';
import { ResultsView } from './components/ResultsView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { AdminBannerManager } from './components/AdminBannerManager';
import { AdminPanel } from './components/AdminPanel';
import { HowToPlayView } from './components/HowToPlayView';
import { Footer } from './components/Footer';
import { useLanguage } from './contexts/LanguageContext';
import lotteryService from './services/lotteryApiService';
import { PaymentProcessor } from './components/PaymentProcessor';
import { PromptPayQR } from './components/PromptPayQR';
import { BankTransfer } from './components/BankTransfer';
import { TrueMoneyPayment } from './components/TrueMoneyPayment';
import { WisePayment } from './components/WisePayment';
import { AlipayPayment } from './components/AlipayPayment';
import { WeChatPayment } from './components/WeChatPayment';
import { OmisePayment } from './components/OmisePayment';
import stripePaymentService, { PaymentResult } from './services/stripePaymentService';

// Mock Data (will be replaced with real API data)
const MOCK_GAMES: LotteryGame[] = [
  { 
    id: 'powerball', 
    name: 'POWERBALL®', 
    jackpot: 'Loading...', 
    nextDraw: 'Loading...', 
    logoColor: 'bg-gradient-to-br from-red-600 to-red-500', 
    accentColor: 'text-red-600'
  },
  { 
    id: 'megamillions', 
    name: 'MEGA MILLIONS', 
    jackpot: 'Loading...', 
    nextDraw: 'Loading...', 
    logoColor: 'bg-gradient-to-br from-blue-600 to-blue-500',
    accentColor: 'text-blue-600'
  },
  { 
    id: 'eurojackpot', 
    name: 'EUROJACKPOT', 
    jackpot: '€ 120 Million', 
    nextDraw: '3 วัน 08:00:00', 
    logoColor: 'bg-gradient-to-br from-yellow-500 to-amber-500', 
    accentColor: 'text-amber-600'
  }
];

const INITIAL_LINES: LotteryLine[] = [
  { id: '1', mainNumbers: [], powerNumber: null, isQuickPick: false },
  { id: '2', mainNumbers: [], powerNumber: null, isQuickPick: false },
  { id: '3', mainNumbers: [], powerNumber: null, isQuickPick: false },
];

const MOCK_PURCHASED_TICKETS: PurchasedTicket[] = [
  {
    id: 'TR-8829-102',
    gameId: 'powerball',
    gameName: 'Powerball',
    drawDate: 'Oct 05, 2023',
    status: 'SCANNED',
    totalAmount: 'US$ 15.00',
    purchaseDate: '2023-10-03',
    lines: [
       { id: 'x1', mainNumbers: [5, 12, 33, 41, 58], powerNumber: 12, isQuickPick: true },
       { id: 'x2', mainNumbers: [2, 18, 21, 39, 40], powerNumber: 5, isQuickPick: false }
    ]
  },
  {
    id: 'TR-7551-099',
    gameId: 'megamillions',
    gameName: 'MEGA MILLIONS',
    drawDate: 'Sep 25, 2023',
    status: 'LOSE',
    totalAmount: 'US$ 10.00',
    purchaseDate: '2023-09-24',
    lines: [
       { id: 'm1', mainNumbers: [10, 15, 25, 30, 45], powerNumber: 8, isQuickPick: true },
       { id: 'm2', mainNumbers: [4, 18, 29, 41, 55], powerNumber: 3, isQuickPick: true }
    ]
  },
  {
    id: 'TR-6200-112',
    gameId: 'powerball',
    gameName: 'Powerball',
    drawDate: 'Sep 10, 2023',
    status: 'WIN',
    totalAmount: 'US$ 5.00',
    purchaseDate: '2023-09-08',
    lines: [
       { id: 'w1', mainNumbers: [11, 22, 33, 44, 55], powerNumber: 12, isQuickPick: false }
    ]
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedGame, setSelectedGame] = useState<LotteryGame | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lines, setLines] = useState<LotteryLine[]>(INITIAL_LINES);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [ticketType, setTicketType] = useState<TicketType>(TicketType.STANDARD);
  const [hasMultiplier, setHasMultiplier] = useState(false);
  
  // Popups & Filters
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [homeGameFilter, setHomeGameFilter] = useState<'ALL' | 'HOT' | 'FAVORITES'>('ALL');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
  const [showRepeatConfirm, setShowRepeatConfirm] = useState(false);
  const [repeatTicket, setRepeatTicket] = useState<PurchasedTicket | null>(null);

  // Global State for Purchased Tickets
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>(MOCK_PURCHASED_TICKETS);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CARD' | 'PROMPTPAY' | 'TRUEMONEY' | 'BANK' | 'WISE' | 'ALIPAY' | 'WECHAT' | 'OMISE'>('CARD');
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  
  // Payment Card Management
  const [hasLinkedCard, setHasLinkedCard] = useState(false);
  const [showLinkCardModal, setShowLinkCardModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [linkedCards, setLinkedCards] = useState<Array<{
    id: string;
    type: 'VISA' | 'MASTERCARD' | 'AMEX';
    last4: string;
    expiry: string;
    isDefault: boolean;
  }>>([]);
  
  // Form states for linking card
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const { language, setLanguage, t } = useLanguage();

  const isAuthView = currentView === AppView.LOGIN || currentView === AppView.REGISTER;

  // Fetch real lottery data on mount
  const [games, setGames] = useState<LotteryGame[]>([
    { 
      id: 'powerball', 
      name: 'POWERBALL®', 
      jackpot: 'US$ 719 Million', 
      nextDraw: '1 วัน 21:07:20', 
      logoColor: 'bg-gradient-to-br from-red-600 to-red-500', 
      accentColor: 'text-red-600'
    },
    { 
      id: 'megamillions', 
      name: 'MEGA MILLIONS', 
      jackpot: 'US$ 480 Million', 
      nextDraw: '2 วัน 14:00:00', 
      logoColor: 'bg-gradient-to-br from-blue-600 to-blue-500',
      accentColor: 'text-blue-600'
    },
    { 
      id: 'eurojackpot', 
      name: 'EUROJACKPOT', 
      jackpot: '€ 120 Million', 
      nextDraw: '3 วัน 08:00:00', 
      logoColor: 'bg-gradient-to-br from-yellow-500 to-amber-500', 
      accentColor: 'text-amber-600'
    }
  ]);

  // Fetch jackpot data on mount
  useEffect(() => {
    const fetchLotteryData = async () => {
      try {
        const jackpots = await lotteryService.getAllJackpots();
        
        setGames(prevGames => prevGames.map(game => {
          const jackpotData = jackpots.find(j => j.game === game.id);
          if (jackpotData && game.id !== 'eurojackpot') {
            return {
              ...game,
              jackpot: `US$ ${jackpotData.amount.toLocaleString()} Million`,
            };
          }
          return game;
        }));
      } catch (error) {
        console.error('Failed to fetch lottery data:', error);
      }
    };

    // Fetch immediately
    fetchLotteryData();
    
    // Refresh jackpots every 5 minutes
    const interval = setInterval(fetchLotteryData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      setGames(prevGames => prevGames.map(game => {
        if (game.id === 'powerball' || game.id === 'megamillions') {
          return {
            ...game,
            nextDraw: lotteryService.getCountdown(game.id)
          };
        }
        return game;
      }));
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to get random numbers
  const generateQuickPick = (): { main: number[], power: number } => {
    const main = new Set<number>();
    while(main.size < 5) main.add(Math.floor(Math.random() * 69) + 1);
    return {
      main: Array.from(main).sort((a, b) => a - b),
      power: Math.floor(Math.random() * 26) + 1
    };
  };

  const handleQuickPick = (id: string) => {
    const picked = generateQuickPick();
    setLines(lines.map(line => 
      line.id === id ? { ...line, mainNumbers: picked.main, powerNumber: picked.power, isQuickPick: true } : line
    ));
  };

  const handleUpdateLine = (id: string, main: number[], power: number | null) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, mainNumbers: main, powerNumber: power, isQuickPick: false } : line
    ));
    setIsSelectorOpen(false);
    setActiveLineId(null);
  };

  const handleSetLinesCount = (count: number) => {
    const currentCount = lines.length;
    if (count > currentCount) {
        const newLines = Array.from({ length: count - currentCount }, (_, i) => ({
            id: Date.now().toString() + i,
            mainNumbers: [],
            powerNumber: null,
            isQuickPick: false
        }));
        setLines([...lines, ...newLines]);
    } else {
        setLines(lines.slice(0, count));
    }
  };

  const getPrice = () => {
    const filledLines = lines.filter(l => l.mainNumbers.length === 5 && l.powerNumber !== null).length;
    let basePrice = 5.00;
    if (ticketType === TicketType.SYNDICATE) basePrice = 15.00;
    if (ticketType === TicketType.BUNDLE) basePrice = 25.00;
    
    const multiplierCost = hasMultiplier ? filledLines * 1 : 0; // $1 per line for multiplier
    return (filledLines * basePrice + multiplierCost).toFixed(2);
  };

  const isValidOrder = () => {
      return lines.some(l => l.mainNumbers.length === 5 && l.powerNumber !== null);
  };

  const handleConfirmOrder = () => {
    if (isValidOrder()) {
        setCurrentView(AppView.PAYMENT);
    }
  };

  const handlePaymentSuccess = () => {
     setProcessingPayment(true);
     // Simulate API call
     setTimeout(() => {
        const newTicket: PurchasedTicket = {
            id: `TR-${Math.floor(Math.random() * 10000)}`,
            gameId: selectedGame?.id || 'unknown',
            gameName: selectedGame?.name || 'Unknown',
            drawDate: selectedGame?.nextDraw.split(' ')[0] + ' day(s)',
            status: 'PENDING',
            purchaseDate: new Date().toISOString().split('T')[0],
            totalAmount: `US$ ${getPrice()}`,
            lines: lines.filter(l => l.mainNumbers.length === 5 && l.powerNumber !== null)
        };
        
        setPurchasedTickets([newTicket, ...purchasedTickets]);
        setProcessingPayment(false);
        setCurrentView(AppView.SUCCESS);
     }, 2000);
  };
  
  const toggleFavorite = (gameId: string) => {
    setFavoriteGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const getVisibleGames = () => {
    if (homeGameFilter === 'HOT') {
        return games.filter(g => g.id === 'powerball'); // Hot filter
    }
    if (homeGameFilter === 'FAVORITES') {
        return games.filter(g => favoriteGames.includes(g.id));
    }
    return games;
  };

  // Helper for Game Rules
  const getGameRules = (gameId: string) => {
    switch(gameId) {
        case 'megamillions':
            return { 
                mainRange: '1-70', 
                powerRange: '1-25', 
                powerLabel: 'Mega Ball', 
                days: 'อังคาร, ศุกร์',
                odds: '1 ใน 302 ล้าน'
            };
        case 'eurojackpot':
            return { 
                mainRange: '1-50', 
                powerRange: '1-12', 
                powerLabel: 'Euro Number', 
                days: 'อังคาร, ศุกร์',
                odds: '1 ใน 140 ล้าน'
            };
        default: // powerball
            return { 
                mainRange: '1-69', 
                powerRange: '1-26', 
                powerLabel: 'Powerball', 
                days: 'จันทร์, พุธ, เสาร์',
                odds: '1 ใน 292 ล้าน'
            };
    }
  };

  // --- Render Header ---
  const renderHeader = () => (
    <header className="bg-white sticky top-0 z-40 shadow-sm border-b border-gray-100 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView(AppView.HOME)}>
             {/* Mobile: Back Button logic */}
             <div className="md:hidden">
                {currentView !== AppView.HOME ? (
                    <div className="flex items-center gap-1 text-gray-800 -ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="font-semibold text-lg">
                           {currentView === AppView.SUCCESS ? t('nav.home') : t('nav.back')}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-red-200 shadow-md">T</div>
                        <h1 className="font-bold text-xl tracking-tight text-gray-900">TruvaMate</h1>
                    </div>
                )}
             </div>

             {/* Desktop: Always Logo */}
             <div className="hidden md:flex items-center gap-2">
                 <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-red-200 shadow-md">T</div>
                 <h1 className="font-bold text-xl tracking-tight text-gray-900">TruvaMate</h1>
             </div>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
             <button onClick={() => setCurrentView(AppView.HOME)} className={`hover:text-red-600 transition ${currentView === AppView.HOME ? 'text-red-600' : ''}`}>{t('nav.home')}</button>
             <button onClick={() => setCurrentView(AppView.MY_TICKETS)} className={`hover:text-red-600 transition ${currentView === AppView.MY_TICKETS ? 'text-red-600' : ''}`}>{t('nav.my_tickets')}</button>
             <button onClick={() => setCurrentView(AppView.RESULTS)} className={`hover:text-red-600 transition ${currentView === AppView.RESULTS ? 'text-red-600' : ''}`}>{t('nav.results')}</button>
             <button onClick={() => setCurrentView(AppView.HOW_TO_PLAY)} className={`hover:text-red-600 transition ${currentView === AppView.HOW_TO_PLAY ? 'text-red-600' : ''}`}>How to Play</button>
             <button onClick={() => setCurrentView(AppView.PROFILE)} className={`hover:text-red-600 transition ${currentView === AppView.PROFILE ? 'text-red-600' : ''}`}>{t('nav.profile')}</button>
          </div>

          <div className="flex gap-3 md:gap-4 text-gray-600 items-center">
             {/* Language Switcher */}
             <button 
                onClick={() => setShowLanguageModal(true)} 
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-bold transition-colors"
             >
                {language === 'TH' ? '🇹🇭 TH' : '🇺🇸 EN'}
             </button>

             {isLoggedIn ? (
               <>
                 <div className="hidden md:block text-sm mr-2 pl-2 border-l border-gray-200">
                    <span className="text-gray-400">Hi,</span> <span className="font-bold text-gray-800">Win</span>
                 </div>
                 <div className="relative hover:text-red-600 cursor-pointer transition p-1">
                    <IconCart className="w-6 h-6" />
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm border-2 border-white">0</span>
                 </div>
               </>
             ) : (
               <button 
                  onClick={() => setCurrentView(AppView.LOGIN)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
               >
                  เข้าสู่ระบบ
               </button>
             )}
          </div>
      </div>
    </header>
  );

  // --- CONTENT RENDERING ---

  const renderContent = () => {
      switch(currentView) {
        case AppView.LOGIN:
            return <LoginView onLoginSuccess={() => { setIsLoggedIn(true); setCurrentView(AppView.HOME); }} onGoToRegister={() => setCurrentView(AppView.REGISTER)} />;
        
        case AppView.REGISTER:
            return <RegisterView onRegisterSuccess={() => { setIsLoggedIn(true); setCurrentView(AppView.HOME); }} onGoToLogin={() => setCurrentView(AppView.LOGIN)} />;

        case AppView.HOME:
            return (
                <>
                <div className="mb-6 md:mb-12">
                    <BannerSlider />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="md:col-span-3 bg-blue-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg shadow-blue-100 relative overflow-hidden gap-4">
                        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                            <IconTicket className="w-40 h-40" />
                        </div>
                        <div className="relative z-10">
                            <p className="font-bold text-2xl mb-1">{t('home.promo.title')}</p>
                            <p className="text-blue-100">{t('home.promo.desc')}</p>
                        </div>
                        <button 
                            onClick={() => {
                                const pb = games.find(g => g.id === 'powerball');
                                if(pb) { setSelectedGame(pb); setLines(INITIAL_LINES); setCurrentView(AppView.GAME_DETAILS); }
                            }}
                            className="relative z-10 w-full md:w-auto bg-white text-blue-600 text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow-sm text-center"
                        >
                            {t('home.promo.button')}
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg md:text-xl text-gray-800 flex items-center gap-2">
                            {t('home.jackpot_title')} <span className="text-red-500 text-sm bg-red-50 px-2 py-0.5 rounded-full">🔥 Hot</span>
                        </h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setHomeGameFilter('ALL')}
                                className={`text-xs md:text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                                    homeGameFilter === 'ALL' 
                                    ? 'bg-red-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            <button 
                                onClick={() => setHomeGameFilter('HOT')}
                                className={`text-xs md:text-sm px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                                    homeGameFilter === 'HOT' 
                                    ? 'bg-red-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                🔥 Hot
                            </button>
                            <button 
                                onClick={() => setHomeGameFilter('FAVORITES')}
                                className={`text-xs md:text-sm px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 ${
                                    homeGameFilter === 'FAVORITES' 
                                    ? 'bg-red-600 text-white shadow-sm' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                ❤️ Favorites {favoriteGames.length > 0 && `(${favoriteGames.length})`}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {getVisibleGames().map(game => (
                            <div key={game.id} className="transform hover:-translate-y-1 transition duration-300">
                                <GameCard 
                                    game={game} 
                                    isFavorite={favoriteGames.includes(game.id)}
                                    onToggleFavorite={() => toggleFavorite(game.id)}
                                    onClick={(g) => { setSelectedGame(g); setLines(INITIAL_LINES); setCurrentView(AppView.GAME_DETAILS); }} 
                                />
                            </div>
                        ))}
                    </div>
                    {homeGameFilter === 'FAVORITES' && favoriteGames.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">❤️</span>
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">No Favorites Yet</h3>
                            <p className="text-gray-500 text-sm">Add games to your favorites by clicking the heart icon</p>
                        </div>
                    )}
                </div>
                </>
            );

        case AppView.GAME_DETAILS:
            return (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 space-y-6">
                        {/* Game Header */}
                        <div className={`${selectedGame?.logoColor} text-white rounded-2xl p-5 md:p-6 shadow-lg relative overflow-hidden transition-all`}>
                             <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
                                <IconTicket className="w-48 h-48 md:w-64 md:h-64" />
                             </div>
                             
                             {/* Info Button */}
                             <button onClick={() => setShowGameInfo(true)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-md transition z-20">
                                 <IconInfo className="w-5 h-5 text-white" />
                             </button>

                             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold drop-shadow-md mb-2">{selectedGame?.name}</h2>
                                    <p className="text-white/95 text-xl md:text-2xl font-bold mb-3 tracking-wide">{selectedGame?.jackpot}</p>
                                    <p className="text-xs md:text-sm bg-black/20 inline-flex items-center px-3 py-1.5 rounded-full text-white/90 backdrop-blur-md border border-white/10">
                                        ⏱ {t('common.close_in')}: {selectedGame?.nextDraw}
                                    </p>
                                </div>
                                <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md flex md:flex-col lg:flex-row overflow-x-auto hide-scrollbar whitespace-nowrap">
                                    {[TicketType.STANDARD, TicketType.SYNDICATE, TicketType.BUNDLE].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setTicketType(type)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 md:flex-none
                                                ${ticketType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-white/70 hover:bg-white/10'}`}
                                        >
                                            {type === TicketType.STANDARD ? 'ทั่วไป' : type === TicketType.SYNDICATE ? 'กลุ่ม' : 'แพ็กเกจ'}
                                        </button>
                                    ))}
                                </div>
                             </div>
                        </div>

                        {/* Ticket Lines */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                            <div className="mb-6 md:mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-gray-700 font-bold flex items-center gap-2">
                                        <IconTicket className="w-5 h-5 text-gray-400" />
                                        {t('common.select_lines')}
                                    </p>
                                    <span className="text-[10px] md:text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">Recommended 5 Lines</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[3, 5, 7, 10, 15, 20].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => handleSetLinesCount(num)}
                                            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 font-bold text-sm md:text-lg transition-all flex items-center justify-center
                                                ${lines.length === num 
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200 shadow-lg transform scale-105' 
                                                    : 'border-gray-100 text-gray-500 bg-white hover:border-gray-300'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Power Play / Megaplier Option */}
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-2.5 rounded-xl shadow-md text-white shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm md:text-base font-bold text-gray-800">
                                                    {selectedGame?.id === 'powerball' ? 'Power Play' : selectedGame?.id === 'megamillions' ? 'Megaplier' : 'Multiplier'}
                                                </h4>
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">+$1/line</span>
                                            </div>
                                            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                                Multiply non-jackpot prizes by <span className="font-bold text-amber-600">2x, 3x, 4x, 5x, or 10x</span>! 
                                                Increase your winnings on all prize tiers.
                                            </p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                                <span className="bg-white px-2 py-1 rounded border border-yellow-200 font-medium">2x</span>
                                                <span className="bg-white px-2 py-1 rounded border border-yellow-200 font-medium">3x</span>
                                                <span className="bg-white px-2 py-1 rounded border border-yellow-200 font-medium">4x</span>
                                                <span className="bg-white px-2 py-1 rounded border border-yellow-200 font-medium">5x</span>
                                                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded font-bold shadow-sm">10x</span>
                                            </div>
                                        </div>
                                    </div>
                                    <label className="flex items-center cursor-pointer shrink-0">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                checked={hasMultiplier}
                                                onChange={(e) => setHasMultiplier(e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-yellow-400 peer-checked:to-amber-500 transition-all shadow-inner"></div>
                                            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all peer-checked:translate-x-6 flex items-center justify-center">
                                                {hasMultiplier && (
                                                    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-100 rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 mb-6">
                                <div className="bg-white p-2 rounded-full shadow-sm text-red-500 shrink-0">
                                    <IconTicket className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-red-800 font-bold">Special Offer</p>
                                    <p className="text-[10px] md:text-xs text-red-600 leading-tight">Get 25% cashback on 3+ lines</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {lines.map((line, idx) => (
                                    <TicketLine 
                                        key={line.id} 
                                        index={idx} 
                                        line={line}
                                        isActive={activeLineId === line.id}
                                        onDelete={() => setLines(lines.filter(l => l.id !== line.id))}
                                        onEdit={() => { setActiveLineId(line.id); setIsSelectorOpen(true); }}
                                        onQuickPick={() => handleQuickPick(line.id)}
                                    />
                                ))}
                                <button 
                                    onClick={() => handleSetLinesCount(lines.length + 1)}
                                    className="w-full h-full min-h-[70px] md:min-h-[100px] border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium text-xs md:text-sm flex flex-col items-center justify-center hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all gap-1 md:gap-2 active:bg-gray-50"
                                >
                                    <span className="text-xl md:text-2xl">+</span>
                                    {t('common.add_line')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Summary) */}
                    <div className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-4 text-lg">{t('common.summary')}</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Lottery</span>
                                        <span>{selectedGame?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Type</span>
                                        <span>{ticketType}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Lines</span>
                                        <span>{lines.length} x ${ticketType === TicketType.STANDARD ? '5.00' : ticketType === TicketType.SYNDICATE ? '15.00' : '25.00'}</span>
                                    </div>
                                    {hasMultiplier && (
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Multiplier
                                            </span>
                                            <span>{lines.length} x $1.00</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Service Fee</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                    <div className="h-px bg-gray-100 my-2"></div>
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-gray-800">Total</span>
                                        <span className="font-bold text-2xl text-red-600">US$ {getPrice()}</span>
                                    </div>
                                </div>
                                <button 
                                  onClick={handleConfirmOrder}
                                  disabled={!isValidOrder()}
                                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                                    ${isValidOrder() ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                                >
                                    <IconCart className="w-5 h-5" />
                                    {t('common.checkout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case AppView.PAYMENT:
            const orderId = currentOrderId || `TR-${Date.now().toString().slice(-8)}`;
            const priceAmount = parseFloat(getPrice());
            
            // If payment processor is open, show the selected payment component
            if (showPaymentProcessor) {
              const handlePaymentComplete = (transactionId: string) => {
                const newTicket: PurchasedTicket = {
                  id: orderId,
                  gameId: selectedGame?.id || '',
                  gameName: selectedGame?.name || '',
                  drawDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                  status: 'PENDING',
                  totalAmount: `US$ ${getPrice()}`,
                  purchaseDate: new Date().toISOString().split('T')[0],
                  lines: lines.filter(l => l.mainNumbers.length > 0)
                };
                setPurchasedTickets([newTicket, ...purchasedTickets]);
                setShowPaymentProcessor(false);
                setCurrentView(AppView.SUCCESS);
              };
              
              const handlePaymentCancel = () => {
                setShowPaymentProcessor(false);
              };
              
              return (
                <div className="max-w-md mx-auto">
                  <button
                    onClick={handlePaymentCancel}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    กลับ
                  </button>
                  
                  {selectedPaymentMethod === 'CARD' && (
                    <PaymentProcessor
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={(result) => {
                        if (result.transactionId) {
                          handlePaymentComplete(result.transactionId);
                        }
                      }}
                      onError={(error) => alert(error)}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'PROMPTPAY' && (
                    <PromptPayQR
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'TRUEMONEY' && (
                    <TrueMoneyPayment
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'BANK' && (
                    <BankTransfer
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'WISE' && (
                    <WisePayment
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'ALIPAY' && (
                    <AlipayPayment
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'WECHAT' && (
                    <WeChatPayment
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                  
                  {selectedPaymentMethod === 'OMISE' && (
                    <OmisePayment
                      amount={priceAmount}
                      orderId={orderId}
                      gameId={selectedGame?.id || ''}
                      gameName={selectedGame?.name || ''}
                      onSuccess={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}
                </div>
              );
            }
            
            return (
                <div className="max-w-xl mx-auto space-y-6">
                     <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('payment.title')}</h2>
                     
                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                         <h3 className="font-bold text-lg mb-4">{t('payment.total')}: <span className="text-red-600">US$ {getPrice()}</span></h3>
                         
                         <div className="space-y-3">
                             {/* Credit/Debit Card */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'CARD' 
                                 ? 'border-blue-500 bg-blue-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-blue-600" 
                                     checked={selectedPaymentMethod === 'CARD'}
                                     onChange={() => setSelectedPaymentMethod('CARD')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <IconCreditCard className="w-6 h-6 text-blue-600" />
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">Credit / Debit Card</span>
                                         <span className="text-xs text-gray-500">Visa, Mastercard, AMEX</span>
                                     </div>
                                 </div>
                             </label>

                             {/* PromptPay (Thailand) */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'PROMPTPAY' 
                                 ? 'border-blue-500 bg-blue-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-blue-600" 
                                     checked={selectedPaymentMethod === 'PROMPTPAY'}
                                     onChange={() => setSelectedPaymentMethod('PROMPTPAY')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <IconQrCode className="w-6 h-6 text-blue-600" />
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">PromptPay QR</span>
                                         <span className="text-xs text-gray-500">สแกน QR ผ่านแอปธนาคาร</span>
                                     </div>
                                 </div>
                             </label>

                             {/* TrueMoney Wallet */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'TRUEMONEY' 
                                 ? 'border-orange-500 bg-orange-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-orange-600" 
                                     checked={selectedPaymentMethod === 'TRUEMONEY'}
                                     onChange={() => setSelectedPaymentMethod('TRUEMONEY')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <span className="text-xl">💰</span>
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">TrueMoney Wallet</span>
                                         <span className="text-xs text-gray-500">ชำระผ่าน TrueMoney</span>
                                     </div>
                                 </div>
                             </label>

                             {/* Bank Transfer */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'BANK' 
                                 ? 'border-green-500 bg-green-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-green-600" 
                                     checked={selectedPaymentMethod === 'BANK'}
                                     onChange={() => setSelectedPaymentMethod('BANK')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <IconBank className="w-6 h-6 text-green-600" />
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">โอนเงินผ่านธนาคาร</span>
                                         <span className="text-xs text-gray-500">โอนเงินแล้วอัพโหลดสลิป</span>
                                     </div>
                                 </div>
                             </label>

                             {/* Wise Transfer */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'WISE' 
                                 ? 'border-teal-500 bg-teal-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-teal-600" 
                                     checked={selectedPaymentMethod === 'WISE'}
                                     onChange={() => setSelectedPaymentMethod('WISE')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <IconWise className="w-6 h-6 text-teal-600" />
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">Wise Transfer</span>
                                         <span className="text-xs text-gray-500">International bank transfer</span>
                                     </div>
                                 </div>
                             </label>

                             {/* Alipay */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'ALIPAY' 
                                 ? 'border-blue-400 bg-blue-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-blue-500" 
                                     checked={selectedPaymentMethod === 'ALIPAY'}
                                     onChange={() => setSelectedPaymentMethod('ALIPAY')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <IconAlipay className="w-6 h-6 text-blue-500" />
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">Alipay 支付宝</span>
                                         <span className="text-xs text-gray-500">Chinese wallet payment</span>
                                     </div>
                                 </div>
                             </label>

                             {/* WeChat Pay */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'WECHAT' 
                                 ? 'border-green-500 bg-green-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-green-500" 
                                     checked={selectedPaymentMethod === 'WECHAT'}
                                     onChange={() => setSelectedPaymentMethod('WECHAT')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                             <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
                                         </svg>
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">WeChat Pay 微信支付</span>
                                         <span className="text-xs text-gray-500">Chinese mobile payment</span>
                                     </div>
                                 </div>
                             </label>

                             {/* Omise */}
                             <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                 selectedPaymentMethod === 'OMISE' 
                                 ? 'border-indigo-500 bg-indigo-50' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}>
                                 <input 
                                     type="radio" 
                                     name="payment" 
                                     className="w-5 h-5 text-indigo-600" 
                                     checked={selectedPaymentMethod === 'OMISE'}
                                     onChange={() => setSelectedPaymentMethod('OMISE')}
                                 />
                                 <div className="flex-1 flex items-center gap-3">
                                     <div className="p-2 bg-white rounded-lg shadow-sm">
                                         <IconOmise className="w-6 h-6 text-indigo-600" />
                                     </div>
                                     <div>
                                         <span className="font-bold text-gray-800 block">Omise</span>
                                         <span className="text-xs text-gray-500">PromptPay, TrueMoney, LINE Pay</span>
                                     </div>
                                 </div>
                             </label>
                         </div>

                         {/* Payment Info Box */}
                         <div className="mt-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
                             {selectedPaymentMethod === 'CARD' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">💳 Secure Card Payment</p>
                                     <p>3D Secure authentication • SSL encrypted</p>
                                 </div>
                             )}
                             {selectedPaymentMethod === 'PROMPTPAY' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">📱 PromptPay QR Payment</p>
                                     <p>สแกน QR Code ผ่านแอปธนาคาร • ยืนยันอัตโนมัติ</p>
                                 </div>
                             )}
                             {selectedPaymentMethod === 'TRUEMONEY' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">💰 TrueMoney Wallet</p>
                                     <p>ชำระผ่าน TrueMoney Wallet • ยืนยันด้วย OTP</p>
                                 </div>
                             )}
                             {selectedPaymentMethod === 'BANK' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">🏦 Bank Transfer</p>
                                     <p>โอนเงินผ่านธนาคาร • อัพโหลดสลิปยืนยัน</p>
                                 </div>
                             )}
                             {selectedPaymentMethod === 'WISE' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">🌍 Wise International Transfer</p>
                                     <p>Low fees • Real exchange rate • FCA regulated</p>
                                 </div>
                             )}
                             {selectedPaymentMethod === 'ALIPAY' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">🇨🇳 支付宝 Alipay</p>
                                     <p>扫码支付 • 蚂蚁金服安全保障</p>
                                 </div>
                             )}
                             {selectedPaymentMethod === 'WECHAT' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">💬 微信支付 WeChat Pay</p>
                                     <p>扫码支付 • 财付通安全保障</p>
                                 </div>
                             )}
                             {selectedPaymentMethod === 'OMISE' && (
                                 <div className="text-xs text-gray-600 space-y-1">
                                     <p className="font-medium text-gray-700">🇹🇭 Omise Thailand Gateway</p>
                                     <p>PromptPay • TrueMoney • LINE Pay • บัตรเครดิต</p>
                                 </div>
                             )}
                         </div>
                     </div>

                     <div className="flex gap-3">
                         <button 
                            onClick={() => setCurrentView(AppView.GAME_DETAILS)}
                            className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
                         >
                            Cancel
                         </button>
                         <button 
                            onClick={() => {
                              setCurrentOrderId(`TR-${Date.now().toString().slice(-8)}`);
                              setShowPaymentProcessor(true);
                            }}
                            disabled={processingPayment}
                            className="flex-1 bg-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-red-200 shadow-lg hover:bg-red-700 transition-all flex justify-center items-center disabled:opacity-70"
                         >
                            {processingPayment ? (
                               <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Processing...
                               </>
                            ) : t('payment.confirm')}
                         </button>
                     </div>
                </div>
            );

        case AppView.SUCCESS:
            return (
                <div className="flex flex-col items-center justify-center pt-10 px-4 text-center space-y-6 animate-fade-in-up">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">{t('success.title')}</h2>
                    <p className="text-gray-500 max-w-sm">
                        {t('success.desc')}
                    </p>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-sm">
                         <div className="flex justify-between text-sm mb-2">
                             <span className="text-gray-500">Status:</span>
                             <span className="text-yellow-600 font-bold bg-yellow-50 px-2 rounded">Processing</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Estimated Ticket Time:</span>
                             <span className="text-gray-800 font-medium">Within 24 Hours</span>
                         </div>
                    </div>
                    <button 
                        onClick={() => setCurrentView(AppView.MY_TICKETS)}
                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition w-full max-w-sm"
                    >
                        {t('success.button')}
                    </button>
                </div>
            );

        case AppView.MY_TICKETS:
            return <MyTicketsView 
              tickets={purchasedTickets} 
              onGoShopping={() => setCurrentView(AppView.HOME)}
              onRepeatOrder={(ticket) => {
                setRepeatTicket(ticket);
                setShowRepeatConfirm(true);
              }}
            />;
        
        case AppView.RESULTS:
            return <ResultsView />;

        case AppView.PROFILE:
            return <ProfileView 
              onGoToHistory={() => { setCurrentView(AppView.MY_TICKETS); }} 
              onGoToResults={() => { setCurrentView(AppView.RESULTS); }}
              onGoToHowToPlay={() => { setCurrentView(AppView.HOW_TO_PLAY); }}
              onLogout={() => { setIsLoggedIn(false); setCurrentView(AppView.HOME); }}
              onManageBanners={() => setCurrentView(AppView.ADMIN_PANEL)}
            />;

        case AppView.HOW_TO_PLAY:
            return <HowToPlayView />;

        case AppView.ADMIN_BANNERS:
            return <AdminBannerManager />;

        case AppView.ADMIN_PANEL:
            return <AdminPanel />;
      }
  };

  const gameRules = selectedGame ? getGameRules(selectedGame.id) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
        {!isAuthView && renderHeader()}

        <main className={`${isAuthView ? 'w-full' : 'flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10 md:py-10'} ${currentView === AppView.GAME_DETAILS ? 'pb-48' : ''}`}>
             {renderContent()}
        </main>

        {/* Footer - Show on all pages except auth, game details, payment, success */}
        {!isAuthView && currentView !== AppView.GAME_DETAILS && currentView !== AppView.PAYMENT && currentView !== AppView.SUCCESS && (
            <Footer />
        )}
        
        {/* Mobile Fixed Bottom Bar (Specific to Checkout) */}
        {currentView === AppView.GAME_DETAILS && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <div className="flex justify-between items-center mb-3 text-sm">
                    <span className="text-gray-500">Total ({ticketType}):</span>
                    <span className="font-bold text-xl text-gray-900">US$ {getPrice()}</span>
                </div>
                <button 
                    onClick={handleConfirmOrder}
                    disabled={!isValidOrder()}
                    className={`w-full text-white py-3.5 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all active:scale-95
                    ${isValidOrder() ? 'bg-red-600 shadow-red-200 hover:bg-red-700' : 'bg-gray-300 shadow-none cursor-not-allowed'}`}
                >
                    {t('common.buy')} ({lines.filter(l => l.mainNumbers.length === 5 && l.powerNumber !== null).length} Lines)
                </button>
            </div>
        )}

        {/* Global Bottom Nav (Mobile) */}
        {!isAuthView && currentView !== AppView.GAME_DETAILS && currentView !== AppView.PAYMENT && currentView !== AppView.SUCCESS && (
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <BottomNav currentView={currentView} onChange={setCurrentView} />
            </div>
        )}

        {/* Modal for Number Selection */}
        {isSelectorOpen && activeLineId && (
            <NumberSelector 
                lineIndex={lines.findIndex(l => l.id === activeLineId)}
                totalLines={lines.length}
                currentMain={lines.find(l => l.id === activeLineId)?.mainNumbers || []}
                currentPower={lines.find(l => l.id === activeLineId)?.powerNumber || null}
                onSelect={(main, power) => handleUpdateLine(activeLineId, main, power)}
                onCancel={() => setIsSelectorOpen(false)}
            />
        )}

        {/* Link Card Modal */}
        {showLinkCardModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowLinkCardModal(false)}>
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl">Link Payment Card</h3>
                                <p className="text-sm text-blue-100 mt-1">Add your card to continue</p>
                            </div>
                            <button onClick={() => setShowLinkCardModal(false)}>
                                <IconX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {/* Card Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                            <input 
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\s/g, '');
                                    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                    setCardNumber(formatted);
                                }}
                                maxLength={19}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        
                        {/* Cardholder Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                            <input 
                                type="text"
                                placeholder="JOHN DOE"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        
                        {/* Expiry & CVV */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                <input 
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length >= 2) {
                                            val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                        }
                                        setCardExpiry(val);
                                    }}
                                    maxLength={5}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                                <input 
                                    type="text"
                                    placeholder="123"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                    maxLength={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        
                        {/* Security Badge */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                            <div className="text-2xl">🔒</div>
                            <div className="text-xs text-gray-600">
                                <p className="font-medium text-gray-800 mb-1">Secure Payment</p>
                                <p>Your card information is encrypted and secure. We use industry-standard SSL encryption.</p>
                            </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setShowLinkCardModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    if (cardNumber.replace(/\s/g, '').length >= 13 && cardName && cardExpiry.length === 5 && cardCvv.length >= 3) {
                                        const cardType = cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MASTERCARD' : 'AMEX';
                                        const newCard = {
                                            id: Date.now().toString(),
                                            type: cardType as 'VISA' | 'MASTERCARD' | 'AMEX',
                                            last4: cardNumber.replace(/\s/g, '').slice(-4),
                                            expiry: cardExpiry,
                                            isDefault: linkedCards.length === 0
                                        };
                                        setLinkedCards([...linkedCards, newCard]);
                                        setShowLinkCardModal(false);
                                        setShowPaymentDetailsModal(true);
                                        // Reset form
                                        setCardNumber('');
                                        setCardName('');
                                        setCardExpiry('');
                                        setCardCvv('');
                                    }
                                }}
                                disabled={cardNumber.replace(/\s/g, '').length < 13 || !cardName || cardExpiry.length < 5 || cardCvv.length < 3}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Card
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Payment Details Modal */}
        {showPaymentDetailsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowPaymentDetailsModal(false)}>
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl">Confirm Payment</h3>
                                <p className="text-sm text-red-100 mt-1">Review your order</p>
                            </div>
                            <button onClick={() => setShowPaymentDetailsModal(false)}>
                                <IconX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {/* Order Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <h4 className="font-bold text-gray-800">Order Summary</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Lottery</span>
                                <span className="font-medium text-gray-800">{selectedGame?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Lines</span>
                                <span className="font-medium text-gray-800">{lines.length} Lines</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ticket Type</span>
                                <span className="font-medium text-gray-800">{ticketType}</span>
                            </div>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800">Total Amount</span>
                                <span className="font-bold text-2xl text-red-600">US$ {getPrice()}</span>
                            </div>
                        </div>
                        
                        {/* Payment Method */}
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="font-bold text-gray-800 mb-3">Payment Method</h4>
                            {selectedPaymentMethod === 'CARD' && linkedCards.length > 0 ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                                        {linkedCards[0].type === 'VISA' ? 'VISA' : linkedCards[0].type === 'MASTERCARD' ? 'MC' : 'AMEX'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">•••• •••• •••• {linkedCards[0].last4}</p>
                                        <p className="text-xs text-gray-500">Expires {linkedCards[0].expiry}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded flex items-center justify-center">
                                        {selectedPaymentMethod === 'OMISE' && <IconOmise className="w-6 h-6 text-white" />}
                                        {selectedPaymentMethod === 'WISE' && <IconWise className="w-6 h-6 text-white" />}
                                        {selectedPaymentMethod === 'ALIPAY' && <IconAlipay className="w-6 h-6 text-white" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {selectedPaymentMethod === 'OMISE' && 'Omise Payment'}
                                            {selectedPaymentMethod === 'WISE' && 'Wise Transfer'}
                                            {selectedPaymentMethod === 'ALIPAY' && 'Alipay'}
                                        </p>
                                        <p className="text-xs text-gray-500">Instant payment</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Terms */}
                        <div className="text-xs text-gray-500 text-center">
                            By proceeding, you agree to our Terms & Conditions and confirm that you are 18+ years old.
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setShowPaymentDetailsModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowPaymentDetailsModal(false);
                                    handlePaymentSuccess();
                                }}
                                disabled={processingPayment}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex justify-center items-center disabled:opacity-70"
                            >
                                {processingPayment ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Repeat Order Confirmation Modal */}
        {showRepeatConfirm && repeatTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowRepeatConfirm(false)}>
                <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl">Repeat Order</h3>
                                <p className="text-sm text-blue-100 mt-1">Play the same numbers again</p>
                            </div>
                            <button onClick={() => setShowRepeatConfirm(false)}>
                                <IconX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {repeatTicket.gameName.substring(0, 1)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{repeatTicket.gameName}</h4>
                                    <p className="text-xs text-gray-500">Order #{repeatTicket.id}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {repeatTicket.lines.map((line, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 font-mono w-6">#{idx + 1}</span>
                                        <div className="flex gap-1.5">
                                            {line.mainNumbers.map((n, i) => (
                                                <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center text-xs font-bold text-gray-700">
                                                    {n}
                                                </div>
                                            ))}
                                            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white">
                                                {line.powerNumber}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Lines</span>
                                <span className="font-medium text-gray-800">{repeatTicket.lines.length} Lines</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Previous Total</span>
                                <span className="font-medium text-gray-800">{repeatTicket.totalAmount}</span>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="font-medium text-yellow-800 mb-1">⚡ Same Numbers, New Draw</p>
                            <p>Your numbers will be applied to the next available draw</p>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => {
                                    setShowRepeatConfirm(false);
                                    setRepeatTicket(null);
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    const game = games.find(g => g.id === repeatTicket.gameId);
                                    if (game) {
                                        setSelectedGame(game);
                                        setLines(repeatTicket.lines);
                                        setShowRepeatConfirm(false);
                                        setRepeatTicket(null);
                                        setCurrentView(AppView.GAME_DETAILS);
                                    }
                                }}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Language Selection Modal */}
        {showLanguageModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowLanguageModal(false)}>
                <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-lg mb-4 text-center">Select Language / เลือกภาษา</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={() => { setLanguage('TH'); setShowLanguageModal(false); }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${language === 'TH' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                            <span className="font-bold flex items-center gap-3 text-lg">🇹🇭 ภาษาไทย</span>
                            {language === 'TH' && <span className="text-red-600 font-bold">✓</span>}
                        </button>
                        <button 
                            onClick={() => { setLanguage('EN'); setShowLanguageModal(false); }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${language === 'EN' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                            <span className="font-bold flex items-center gap-3 text-lg">🇺🇸 English</span>
                            {language === 'EN' && <span className="text-red-600 font-bold">✓</span>}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Game Info Modal */}
        {showGameInfo && selectedGame && gameRules && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowGameInfo(false)}>
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setShowGameInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <IconX className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${selectedGame.logoColor}`}>
                             <IconTicket className="w-6 h-6" />
                         </div>
                         <div>
                             <h3 className="font-bold text-lg text-gray-800">{selectedGame.name}</h3>
                             <p className="text-xs text-gray-500">Game Rules</p>
                         </div>
                    </div>
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="font-bold text-gray-800 block mb-1">🎯 How to Pick</span>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Select 5 Main Numbers ({gameRules.mainRange})</li>
                                <li>Select 1 {gameRules.powerLabel} ({gameRules.powerRange})</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="font-bold text-gray-800 block mb-1">💰 How to Win</span>
                            <p>Match all 6 numbers to win the Jackpot!</p>
                            <p className="mt-2 text-xs text-gray-400 font-medium">Odds: {gameRules.odds}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="font-bold text-gray-800 block mb-1">⏰ Draw Days</span>
                            <p>{gameRules.days}</p>
                            <p className="mt-1 text-xs text-red-500">Sales close 2 hours before draw.</p>
                        </div>
                    </div>
                    <button onClick={() => setShowGameInfo(false)} className="w-full mt-6 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">
                        Got it
                    </button>
                </div>
             </div>
        )}

        {/* Login Required Modal for Payment */}
        {showLoginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}>
                <div className="bg-white w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">กรุณาเข้าสู่ระบบ</h3>
                        <p className="text-gray-500 text-sm">คุณต้องเข้าสู่ระบบก่อนทำการชำระเงิน</p>
                    </div>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => {
                                setShowLoginModal(false);
                                setCurrentView(AppView.LOGIN);
                            }}
                            className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                        >
                            เข้าสู่ระบบ
                        </button>
                        <button 
                            onClick={() => {
                                setShowLoginModal(false);
                                setCurrentView(AppView.REGISTER);
                            }}
                            className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
                        >
                            สมัครสมาชิก
                        </button>
                        <button 
                            onClick={() => setShowLoginModal(false)}
                            className="w-full text-gray-500 py-2 font-medium hover:text-gray-700 transition-all"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;