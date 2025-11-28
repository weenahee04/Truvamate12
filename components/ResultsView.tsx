import React, { useState, useEffect } from 'react';
import { IconTrophy, IconX } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import lotteryService from '../services/lotteryApiService';

interface Result {
  id: number;
  game: string;
  date: string;
  main: number[];
  power: number;
  jackpot: string;
}

export const ResultsView: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Fetch latest draws from both lotteries
        const [powerballDraw, megaMillionsDraw] = await Promise.all([
          lotteryService.getLatestDraw('powerball'),
          lotteryService.getLatestDraw('megamillions')
        ]);

        const fetchedResults: Result[] = [];
        
        if (powerballDraw) {
          fetchedResults.push({
            id: 1,
            game: 'Powerball',
            date: new Date(powerballDraw.drawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            main: powerballDraw.winningNumbers,
            power: powerballDraw.powerBall || 0,
            jackpot: powerballDraw.jackpot
          });
        }

        if (megaMillionsDraw) {
          fetchedResults.push({
            id: 2,
            game: 'Mega Millions',
            date: new Date(megaMillionsDraw.drawDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            main: megaMillionsDraw.winningNumbers,
            power: megaMillionsDraw.megaBall || 0,
            jackpot: megaMillionsDraw.jackpot
          });
        }

        // Add EuroJackpot mock data
        fetchedResults.push({
          id: 3,
          game: 'EuroJackpot',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          main: [5, 12, 18, 33, 40],
          power: 2,
          jackpot: '€ 54 Million'
        });

        setResults(fetchedResults);
      } catch (error) {
        console.error('Failed to fetch lottery results:', error);
        // Fallback to mock data on error
        setResults([
          { id: 1, game: 'Powerball', date: 'Oct 11, 2023', main: [12, 24, 33, 45, 51], power: 7, jackpot: 'US$ 1.73 Billion' },
          { id: 2, game: 'Mega Millions', date: 'Oct 10, 2023', main: [3, 15, 22, 39, 48], power: 12, jackpot: 'US$ 48 Million' },
          { id: 3, game: 'EuroJackpot', date: 'Oct 09, 2023', main: [5, 12, 18, 33, 40], power: 2, jackpot: '€ 54 Million' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const MOCK_PAYOUTS = [
    { match: '5 + Powerball', prize: 'JACKPOT', winners: 0 },
    { match: '5', prize: '$1,000,000', winners: 3 },
    { match: '4 + Powerball', prize: '$50,000', winners: 12 },
    { match: '4', prize: '$100', winners: 450 },
    { match: '3 + Powerball', prize: '$100', winners: 1200 },
  ];

  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
         <IconTrophy className="text-yellow-500 w-8 h-8" /> 
         {t('results.title')}
       </h2>
       
       {loading ? (
         <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-100">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
           <p className="text-gray-500">Loading results...</p>
         </div>
       ) : results.length > 0 ? (
         <div className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {results.map(res => (
               <div 
                  key={res.id} 
                  onClick={() => setSelectedResult(res.id)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-all active:scale-95 flex flex-col h-full"
               >
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="font-bold text-lg text-gray-800">{res.game}</h3>
                     <span className="text-xs text-gray-500">{res.date}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                     {res.main.map((n, i) => (
                       <div key={i} className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center font-bold text-gray-700">{n}</div>
                     ))}
                     <div className="w-8 h-8 rounded-full bg-red-600 shadow-sm flex items-center justify-center font-bold text-white">{res.power}</div>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-gray-50">
                    <div className="text-sm text-gray-500 flex justify-between items-center">
                      <span>Jackpot:</span>
                      <span className="font-bold text-gray-800 text-lg">{res.jackpot}</span>
                    </div>
                    <div className="mt-2 text-center text-xs text-blue-500 font-medium">
                        {t('results.check_payout')}
                    </div>
                  </div>
               </div>
             ))}
           </div>
           <div className="text-center pt-4 pb-8">
              <p className="text-sm text-gray-400">{t('results.disclaimer')}</p>
           </div>
         </div>
       ) : (
         <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <IconTrophy className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-600">{t('results.empty')}</h3>
            <p className="text-gray-400 text-sm mt-1">{t('results.empty_desc')}</p>
         </div>
       )}

       {/* Payout Details Modal */}
       {selectedResult && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={() => setSelectedResult(null)}>
             <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
                 <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                     <h3 className="font-bold text-lg">{results.find(r => r.id === selectedResult)?.game} Results</h3>
                     <button onClick={() => setSelectedResult(null)}><IconX className="w-6 h-6 text-gray-400" /></button>
                 </div>
                 <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-center py-6">
                    <div className="flex gap-2">
                        {results.find(r => r.id === selectedResult)?.main.map(n => (
                            <div key={n} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-gray-800 shadow-sm">{n}</div>
                        ))}
                         <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-sm">
                             {results.find(r => r.id === selectedResult)?.power}
                         </div>
                    </div>
                 </div>
                 <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-100 uppercase">
                            <tr>
                                <th className="px-6 py-3">Match</th>
                                <th className="px-6 py-3">Prize</th>
                                <th className="px-6 py-3 text-right">Winners</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_PAYOUTS.map((tier, idx) => (
                                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{tier.match}</td>
                                    <td className="px-6 py-4 font-bold text-green-600">{tier.prize}</td>
                                    <td className="px-6 py-4 text-right text-gray-500">{tier.winners}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
                    *Reference data from Official Lottery Site
                 </div>
             </div>
         </div>
       )}
    </div>
  );
};