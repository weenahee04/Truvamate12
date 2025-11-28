import React from 'react';
import { LotteryLine } from '../types';
import { IconSparkles, IconCheck } from './Icons';

interface TicketLineProps {
  line: LotteryLine;
  index: number;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onQuickPick: () => void;
}

export const TicketLine: React.FC<TicketLineProps> = ({ line, index, isActive, onEdit, onDelete, onQuickPick }) => {
  const isComplete = line.mainNumbers.length === 5 && line.powerNumber !== null;

  return (
    <div className={`border rounded-xl p-3 md:p-3 mb-3 md:mb-0 transition-all ${isActive ? 'border-red-500 bg-red-50 ring-1 ring-red-100' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-700 text-sm md:text-base">แถวที่ {index + 1}</span>
        <div className="flex gap-2">
          {!isComplete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onQuickPick(); }}
              className="text-xs flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-medium hover:bg-blue-100 transition-colors"
            >
              <IconSparkles className="w-3 h-3" /> <span className="hidden xs:inline">สุ่มเร็ว</span><span className="xs:hidden">สุ่ม</span>
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-400 hover:text-red-500 p-1">
            &times;
          </button>
        </div>
      </div>

      <div 
        onClick={onEdit}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="flex-1 flex flex-nowrap overflow-x-auto hide-scrollbar gap-1.5 md:gap-2 pr-2 items-center">
          {Array.from({ length: 5 }).map((_, i) => {
            const num = line.mainNumbers[i];
            return (
              <div 
                key={i} 
                className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border 
                  ${num 
                    ? 'bg-white border-gray-300 text-gray-800 shadow-sm' 
                    : 'bg-gray-50 border-dashed border-gray-300 text-gray-300'}`}
              >
                {num || '?'}
              </div>
            );
          })}
          <div className="flex-shrink-0 w-px h-6 md:h-8 bg-gray-200 mx-0.5 md:mx-1 self-center"></div>
          <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border 
             ${line.powerNumber 
                ? 'bg-red-500 border-red-600 text-white shadow-sm' 
                : 'bg-red-50 border-dashed border-red-200 text-red-200'}`}
          >
            {line.powerNumber || 'P'}
          </div>
        </div>
        
        {isComplete && (
            <div className="text-green-500 animate-pulse-once">
                <IconCheck className="w-4 h-4 md:w-5 md:h-5" />
            </div>
        )}
      </div>
    </div>
  );
};