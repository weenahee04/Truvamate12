import React, { useState } from 'react';
import { generateLuckyNumbers } from '../services/geminiService';
import { IconSparkles } from './Icons';

interface NumberSelectorProps {
  lineIndex: number;
  totalLines: number;
  onSelect: (main: number[], power: number | null) => void;
  onCancel: () => void;
  currentMain: number[];
  currentPower: number | null;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({ 
  lineIndex, 
  totalLines, 
  onSelect, 
  onCancel, 
  currentMain, 
  currentPower 
}) => {
  const [selectedMain, setSelectedMain] = useState<number[]>(currentMain);
  const [selectedPower, setSelectedPower] = useState<number | null>(currentPower);
  const [dreamContext, setDreamContext] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiReason, setAiReason] = useState('');

  const toggleMain = (num: number) => {
    if (selectedMain.includes(num)) {
      setSelectedMain(selectedMain.filter(n => n !== num));
    } else {
      if (selectedMain.length < 5) {
        setSelectedMain([...selectedMain, num].sort((a, b) => a - b));
      }
    }
  };

  const togglePower = (num: number) => {
    setSelectedPower(selectedPower === num ? null : num);
  };

  const handleQuickPick = () => {
    const main = new Set<number>();
    while(main.size < 5) main.add(Math.floor(Math.random() * 69) + 1);
    setSelectedMain(Array.from(main).sort((a, b) => a - b));
    setSelectedPower(Math.floor(Math.random() * 26) + 1);
  };

  const handleConfirm = () => {
    onSelect(selectedMain, selectedPower);
  };

  const handleAiPick = async () => {
    if (!dreamContext.trim()) return;
    setIsThinking(true);
    setAiReason('');
    
    const result = await generateLuckyNumbers(dreamContext);
    
    setSelectedMain(result.main.sort((a, b) => a - b));
    setSelectedPower(result.power);
    setAiReason(result.reason);
    setIsThinking(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-100/50 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm animate-fade-in-up">
      <div className="bg-white w-full max-w-md h-[95vh] sm:h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header - The Lotter Style */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 z-10">
          <div className="flex flex-col">
            <h3 className="font-bold text-xl text-gray-800">Line: {lineIndex + 1}/{totalLines}</h3>
            <span className="text-[10px] text-gray-400 font-light">TruvaMate Secure Selection</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleQuickPick}
              className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold hover:bg-blue-100 transition-colors"
            >
              Quick Pick
            </button>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-5 pb-32">
            
            {/* Truva AI Section (Collapsible/Compact) */}
            <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-100">
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={dreamContext}
                   onChange={(e) => setDreamContext(e.target.value)}
                   placeholder="พิมพ์ความฝันให้ AI ช่วยตีเลข..."
                   className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                 />
                 <button 
                   onClick={handleAiPick}
                   disabled={isThinking || !dreamContext}
                   className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                 >
                   {isThinking ? <IconSparkles className="animate-spin w-5 h-5"/> : <IconSparkles className="w-5 h-5"/>}
                 </button>
               </div>
               {aiReason && (
                 <p className="mt-2 text-xs text-gray-600 italic border-l-2 border-purple-400 pl-2">
                   "{aiReason}"
                 </p>
               )}
            </div>

            {/* Main Numbers Grid - Constrained Width for Compactness */}
            <div className="mb-8">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">+</span> Choose 5
                <span className={`ml-auto text-xs font-normal px-2 py-1 rounded-full ${selectedMain.length === 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {selectedMain.length}/5 selected
                </span>
              </h4>
              <div className="grid grid-cols-7 gap-2 max-w-[340px] mx-auto">
                {Array.from({ length: 69 }, (_, i) => i + 1).map(num => {
                    const isSelected = selectedMain.includes(num);
                    return (
                        <button
                            key={`main-${num}`}
                            onClick={() => toggleMain(num)}
                            className={`
                                h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 border
                                ${isSelected 
                                    ? 'bg-[#0047AB] border-[#0047AB] text-white shadow-md transform scale-105' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                                }
                            `}
                        >
                            {num}
                        </button>
                    );
                })}
              </div>
            </div>

            <hr className="border-dashed border-gray-200 my-6" />

            {/* Powerball Grid - Constrained Width */}
            <div className="mb-6">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">+</span> Choose 1 <span className="text-red-500 text-sm">(Powerball)</span>
                <span className={`ml-auto text-xs font-normal px-2 py-1 rounded-full ${selectedPower ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {selectedPower ? '1' : '0'}/1 selected
                </span>
              </h4>
              <div className="grid grid-cols-7 gap-2 max-w-[340px] mx-auto">
                {Array.from({ length: 26 }, (_, i) => i + 1).map(num => {
                    const isSelected = selectedPower === num;
                    return (
                        <button
                            key={`power-${num}`}
                            onClick={() => togglePower(num)}
                            className={`
                                h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 border
                                ${isSelected 
                                    ? 'bg-[#E31837] border-[#E31837] text-white shadow-md transform scale-105' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                                }
                            `}
                        >
                            {num}
                        </button>
                    );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 bg-white p-4 shadow-xl z-20" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <button 
            onClick={handleConfirm}
            className={`
                w-full py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg active:scale-95
                ${(selectedMain.length === 5 && selectedPower !== null)
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }
            `}
            disabled={selectedMain.length !== 5 || selectedPower === null}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};