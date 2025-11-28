import React from 'react';
import { LotteryGame } from '../types';

interface GameCardProps {
  game: LotteryGame;
  onClick: (game: LotteryGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onClick, isFavorite = false, onToggleFavorite }) => {
  return (
    <div 
      className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-95 relative group"
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 z-30 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center group-hover:scale-110 active:scale-95"
        >
          {isFavorite ? (
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      )}
      
      <div 
        onClick={() => onClick(game)}
        className="cursor-pointer"
      >
        <div className={`h-24 ${game.logoColor} relative p-4 flex flex-col justify-between text-white overflow-hidden`}>
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
              <img 
                  src={game.name.includes('POWERBALL') 
                      ? 'https://www.powerball.com/themes/custom/baseline/images/powerball_ball_texture.jpg'
                      : 'https://www.megamillions.com/images/interface/mm-logo-lg.png'
                  }
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.currentTarget.style.display = 'none'}
              />
          </div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
          
          <div className="font-bold text-xl drop-shadow-md z-10 flex items-center gap-2">
              {(game.name.includes('POWERBALL') || game.name.includes('MEGA MILLIONS')) && (
                <img 
                  src={game.name.includes('POWERBALL') ? '/image/us-powerball.png' : '/image/us-megamillions.png'}
                  alt="US Lottery"
                  className="w-8 h-8 object-contain"
                />
              )}
              {game.name}
          </div>
          <div className="text-sm font-light z-10 opacity-90">Draw: {game.nextDraw}</div>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-xs font-medium mb-1">JACKPOT</p>
          <p className={`text-2xl font-bold ${game.accentColor}`}>{game.jackpot}</p>
          <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded">Messenger Service</span>
              <button className="text-sm font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg">
                  ซื้อตั๋ว
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};