import React from 'react';
import { AppView } from '../types';
import { IconTicket, IconScan, IconMenu, IconTrophy } from './Icons';

interface BottomNavProps {
  currentView: AppView;
  onChange: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChange }) => {
  const getItemClass = (view: AppView) => 
    currentView === view ? 'text-red-600' : 'text-gray-400 hover:text-red-500';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <button onClick={() => onChange(AppView.HOME)} className={`flex flex-col items-center transition-colors min-w-[4rem] ${getItemClass(AppView.HOME)}`}>
        <IconTicket className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">หน้าแรก</span>
      </button>
      <button onClick={() => onChange(AppView.MY_TICKETS)} className={`flex flex-col items-center transition-colors min-w-[4rem] ${getItemClass(AppView.MY_TICKETS)}`}>
        <IconScan className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">ตั๋วของฉัน</span>
      </button>
      <button onClick={() => onChange(AppView.RESULTS)} className={`flex flex-col items-center transition-colors min-w-[4rem] ${getItemClass(AppView.RESULTS)}`}>
        <IconTrophy className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">ผลรางวัล</span>
      </button>
      <button onClick={() => onChange(AppView.PROFILE)} className={`flex flex-col items-center transition-colors min-w-[4rem] ${getItemClass(AppView.PROFILE)}`}>
        <IconMenu className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">บัญชี</span>
      </button>
    </nav>
  );
};