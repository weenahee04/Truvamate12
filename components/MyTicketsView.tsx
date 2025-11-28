import React, { useState } from 'react';
import { PurchasedTicket, TicketStatus } from '../types';
import { IconScan, IconClock, IconCheckCircle, IconTicket, IconFilter, IconSortAsc, IconSortDesc, IconChevronRight, IconTrophy } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface MyTicketsViewProps {
  tickets: PurchasedTicket[];
  onGoShopping?: () => void;
  onRepeatOrder?: (ticket: PurchasedTicket) => void;
}

const ConfettiExplosion = () => {
  // Create an array of 30 particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100, // 0-100%
    delay: Math.random() * 0.5, // 0-0.5s delay
    duration: Math.random() * 1 + 1.5, // 1.5-2.5s fall duration
    char: ['🎉', '💰', '✨', '💵', '🏆'][Math.floor(Math.random() * 5)]
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 rounded-2xl">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-xl animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  );
};

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({ tickets, onGoShopping, onRepeatOrder }) => {
  const [selectedTicket, setSelectedTicket] = useState<PurchasedTicket | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [expandedTicketIds, setExpandedTicketIds] = useState<Set<string>>(new Set());
  
  // Filter & Sort States
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'DATE_DESC' | 'DATE_ASC' | 'DRAW_DESC' | 'DRAW_ASC'>('DATE_DESC');

  const { t } = useLanguage();

  // Toggle Expansion Logic
  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedTicketIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedTicketIds(newSet);
  };

  // 1. Filter tickets based on Tab
  let filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'ACTIVE') {
      return ['PENDING', 'PURCHASED', 'SCANNED'].includes(ticket.status);
    } else {
      return ['WIN', 'LOSE'].includes(ticket.status);
    }
  });

  // 2. Filter by Game ID
  if (selectedGameFilter !== 'ALL') {
    filteredTickets = filteredTickets.filter(t => t.gameId === selectedGameFilter);
  }

  // 3. Sort Logic
  filteredTickets.sort((a, b) => {
    const dateA = new Date(a.purchaseDate).getTime();
    const dateB = new Date(b.purchaseDate).getTime();
    
    // Attempt to parse draw date (e.g. "Oct 05, 2023") or fallback to purchase date
    const drawA = new Date(a.drawDate).getTime() || dateA;
    const drawB = new Date(b.drawDate).getTime() || dateB;

    switch (sortOption) {
        case 'DATE_ASC': return dateA - dateB;
        case 'DATE_DESC': return dateB - dateA;
        case 'DRAW_ASC': return drawA - drawB;
        case 'DRAW_DESC': return drawB - drawA;
        default: return 0;
    }
  });

  // Extract unique games for filter dropdown
  const uniqueGames = Array.from(new Set(tickets.map(t => JSON.stringify({ id: t.gameId, name: t.gameName }))))
    .map(s => JSON.parse(s));

  const getStatusBadge = (status: TicketStatus) => {
    switch(status) {
      case 'PENDING':
        return <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px] md:text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium"><IconClock className="w-3 h-3"/> {t('status.pending')}</span>;
      case 'PURCHASED':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><IconCheckCircle className="w-3 h-3"/> {t('status.purchased')}</span>;
      case 'SCANNED':
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"><IconScan className="w-3 h-3"/> {t('status.scanned')}</span>;
      case 'WIN':
        return <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border border-yellow-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold shadow-sm animate-pulse"><IconTrophy className="w-3.5 h-3.5 text-white"/> {t('status.win')}</span>;
      case 'LOSE':
        return <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">{t('status.lose')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Animation Styles */}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{t('tickets.title')}</h2>
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button 
            onClick={() => { setActiveTab('ACTIVE'); setSelectedGameFilter('ALL'); }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'ACTIVE' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            {t('tickets.tab.active')}
          </button>
          <button 
            onClick={() => { setActiveTab('HISTORY'); setSelectedGameFilter('ALL'); }}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${activeTab === 'HISTORY' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            {t('tickets.tab.history')}
          </button>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      {(tickets.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 overflow-x-auto hide-scrollbar flex items-center gap-2 pb-1">
                <button 
                    onClick={() => setSelectedGameFilter('ALL')}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1
                    ${selectedGameFilter === 'ALL' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                    <IconFilter className="w-3 h-3" /> {t('common.all')}
                </button>
                {uniqueGames.map((g: any) => (
                    <button 
                        key={g.id}
                        onClick={() => setSelectedGameFilter(g.id)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                        ${selectedGameFilter === g.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                    >
                        {g.name}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                    <select 
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="DATE_DESC">{t('tickets.sort.date_desc')}</option>
                        <option value="DATE_ASC">{t('tickets.sort.date_asc')}</option>
                        <option value="DRAW_DESC">{t('tickets.sort.draw_desc')}</option>
                        <option value="DRAW_ASC">{t('tickets.sort.draw_asc')}</option>
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                        {sortOption.includes('ASC') ? <IconSortAsc className="w-3 h-3" /> : <IconSortDesc className="w-3 h-3" />}
                    </div>
                </div>
            </div>
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-center animate-fade-in-up">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm transition-colors duration-500
             ${activeTab === 'ACTIVE' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400'}`}>
              {activeTab === 'ACTIVE' ? <IconTicket className="w-10 h-10" /> : <IconClock className="w-10 h-10" />}
           </div>
           
           <h3 className="text-xl font-bold text-gray-800 mb-2">
             {activeTab === 'ACTIVE' 
                ? (selectedGameFilter !== 'ALL' ? t('tickets.empty.filtered') : t('tickets.empty.active')) 
                : t('tickets.empty.history')}
           </h3>
           
           <p className="text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed text-sm">
             {activeTab === 'ACTIVE' 
               ? t('tickets.empty.active_desc')
               : t('tickets.empty.history_desc')}
           </p>

           {activeTab === 'ACTIVE' && onGoShopping && (
             <button 
               onClick={onGoShopping}
               className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-transform active:scale-95 flex items-center gap-2"
             >
               {t('tickets.empty.button')}
             </button>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => {
             const isExpanded = expandedTicketIds.has(ticket.id);
             const isWinner = ticket.status === 'WIN';

             return (
                <div 
                key={ticket.id}
                onClick={() => toggleExpand(ticket.id)}
                className={`rounded-2xl shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all duration-300 relative overflow-hidden
                    ${isWinner 
                        ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-200' 
                        : 'border-gray-100 bg-white'
                    }
                    ${isExpanded && !isWinner ? 'ring-2 ring-blue-50 border-blue-100' : ''}`}
                >
                {/* Celebratory Confetti for Winning Ticket */}
                {isExpanded && isWinner && <ConfettiExplosion />}

                <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors
                            ${isWinner 
                                ? 'bg-yellow-500 text-white' 
                                : isExpanded ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'}`}>
                        {ticket.gameName.substring(0, 1)}
                        </div>
                        <div>
                        <h3 className="font-bold text-gray-800">{ticket.gameName}</h3>
                        <p className="text-xs text-gray-500">Draw: {ticket.drawDate}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                         {getStatusBadge(ticket.status)}
                         <IconChevronRight className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                    </div>
                </div>

                <div className={`rounded-xl p-3 mb-3 transition-colors duration-300 relative z-10
                    ${isWinner ? 'bg-white/60 border border-yellow-200' : 'bg-gray-50'}`}>
                     
                     {/* Always show Line 1 */}
                     <div className="flex items-center gap-2">
                        {isExpanded && <span className="text-xs text-gray-400 font-mono w-4">1.</span>}
                        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                            {ticket.lines[0].mainNumbers.map((n, i) => (
                                <div key={i} className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold 
                                    ${isWinner ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                                    {n}
                                </div>
                            ))}
                            <div className="w-6 h-6 rounded-full bg-red-500 border border-red-500 flex items-center justify-center text-xs font-bold text-white">{ticket.lines[0].powerNumber}</div>
                        </div>
                     </div>

                    {/* Smooth Expandable Section for Additional Lines & Details */}
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        <div className="overflow-hidden">
                             <div className="pt-2 space-y-2">
                                {ticket.lines.slice(1).map((line, idx) => (
                                    <div key={idx} className="flex items-center gap-2 animate-fade-in">
                                        <span className="text-xs text-gray-400 font-mono w-4">{idx + 2}.</span>
                                        <div className="flex gap-2">
                                            {line.mainNumbers.map((n, i) => (
                                                <div key={i} className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold 
                                                    ${isWinner ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-200 text-gray-700'}`}>
                                                    {n}
                                                </div>
                                            ))}
                                            <div className="w-6 h-6 rounded-full bg-red-500 border border-red-500 flex items-center justify-center text-xs font-bold text-white">{line.powerNumber}</div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="mt-4 pt-3 border-t border-gray-200/50 flex flex-col gap-1 text-xs text-gray-500">
                                    {isWinner && (
                                        <div className="bg-yellow-100 text-yellow-800 font-bold p-2 rounded text-center mb-2 animate-pulse">
                                            🏆 WINNER! Check scanned ticket for details.
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>{t('tickets.purchase_date')}:</span>
                                        <span className="font-medium text-gray-800">{ticket.purchaseDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Order ID:</span>
                                        <span className="font-mono">{ticket.id}</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Show Summary Hint if Collapsed and has more lines */}
                    {!isExpanded && ticket.lines.length > 1 && (
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
                            <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">+{ticket.lines.length - 1}</span>
                            {t('tickets.more_lines')}
                        </p>
                    )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-50/50 mt-2 relative z-10">
                    <div className="flex flex-col text-xs text-gray-500">
                        <span className="font-medium text-gray-900 mt-0.5 text-sm">{ticket.totalAmount}</span>
                        <span className="text-[10px]">Total Price</span>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* Repeat Order Button */}
                        {onRepeatOrder && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRepeatOrder(ticket); }}
                                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors transform active:scale-95 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Buy Again
                            </button>
                        )}
                        
                        {/* Explicit Scan Button */}
                        {['SCANNED', 'WIN', 'LOSE'].includes(ticket.status) && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}
                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors transform active:scale-95
                                    ${isWinner ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-900 text-white hover:bg-black'}`}
                            >
                                <IconScan className="w-3 h-3" />
                                {t('tickets.view_scan')}
                            </button>
                        )}
                    </div>
                </div>
                </div>
             );
          })}
        </div>
      )}

      {/* Scanned Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTicket(null)}>
           <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-800">
                    {['WIN', 'LOSE'].includes(selectedTicket.status) ? t('tickets.modal.result') : t('tickets.modal.scanned')}
                 </h3>
                 <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
              </div>
              <div className="p-0 bg-gray-100 relative">
                 {/* Logic to show scanned ticket or simple detail based on status */}
                 {(selectedTicket.status === 'SCANNED' || selectedTicket.status === 'WIN' || selectedTicket.status === 'LOSE') ? (
                   <div className="aspect-[3/4] bg-white p-4 flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Realistic Ticket Look */}
                      <div className={`w-full h-full border-2 rounded p-4 flex flex-col items-center shadow-inner font-mono text-sm bg-[#fffdf0]
                         ${selectedTicket.status === 'WIN' ? 'border-green-400' : 'border-gray-300'}`}>
                          <div className="w-full text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                            <h2 className="text-2xl font-bold uppercase tracking-widest">{selectedTicket.gameName}</h2>
                            <p className="text-xs text-gray-500 mt-1">OFFICIAL TICKET</p>
                          </div>
                          
                          <div className="flex-1 w-full space-y-4 overflow-y-auto hide-scrollbar">
                             {selectedTicket.lines.map((line, idx) => (
                               <div key={idx} className="flex justify-between font-bold text-lg text-gray-800 tracking-wider">
                                  <span>{String.fromCharCode(65 + idx)}.</span>
                                  <span>{line.mainNumbers.map(n => n.toString().padStart(2, '0')).join(' ')}</span>
                                  <span className="text-red-600">{line.powerNumber}</span>
                               </div>
                             ))}
                          </div>

                          {selectedTicket.status === 'WIN' && (
                             <div className="my-2 border-2 border-green-500 text-green-600 px-4 py-1 font-bold rounded uppercase transform -rotate-2">
                                 WINNER
                             </div>
                          )}

                          <div className="w-full text-center border-t-2 border-dashed border-gray-300 pt-4 mt-4 text-[10px] text-gray-400">
                             <div className="h-8 bg-black w-3/4 mx-auto mb-2 opacity-80"></div>
                             {selectedTicket.id}
                          </div>
                      </div>
                      
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                         <span className="text-6xl font-bold -rotate-45">TRUVAMATE</span>
                      </div>
                   </div>
                 ) : (
                   <div className="aspect-[3/4] flex flex-col items-center justify-center p-8 text-center text-gray-400">
                      <IconClock className="w-16 h-16 mb-4 text-gray-300" />
                      <p className="font-bold text-gray-600">{t('tickets.modal.processing')}</p>
                      <p className="text-sm mt-2">{t('tickets.modal.processing_desc')}</p>
                   </div>
                 )}
              </div>
              <div className="p-4 text-center">
                 <p className="text-xs text-gray-400">{t('tickets.modal.disclaimer')}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};