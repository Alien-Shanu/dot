import React from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface DeckBoxProps {
  index: number;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const DeckBox: React.FC<DeckBoxProps> = ({ index, count, isActive, onClick }) => {
  // Cycle through suits for visual variety
  const suits = [Heart, Club, Diamond, Spade];
  const SuitIcon = suits[index % 4];
  
  // Cycle through Face Card letters (K, Q, J, A)
  const ranks = ['K', 'Q', 'J', 'A'];
  const rank = ranks[index % 4];

  // Base colors
  const isRed = index % 2 === 0; // Alternate red/black visually
  const colorClass = isRed ? 'text-card-red' : 'text-card-black';
  const bgColor = 'bg-[#e3dac9]'; // Parchment color

  if (isActive) return null; 

  return (
    <div 
      onClick={onClick}
      // Updated size to w-20 (80px) and h-[110px] as requested
      className="group relative w-20 h-[110px] cursor-pointer transition-transform duration-300 hover:scale-105 hover:-translate-y-2 z-40 shrink-0"
      style={{ perspective: '1000px' }}
      title={`Open Deck ${index + 1} (${count} cards)`}
    >
      <div className="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-[-15deg]">
        
        {/* --- Spine (Left Side visible as box side) --- */}
        <div className={`
            absolute top-0 left-0 w-8 h-full origin-left rotate-y-90
            ${bgColor} border-2 border-amber-900/40 
            flex flex-col items-center justify-center gap-1 py-2
            shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]
        `}>
            {/* Rotated Text */}
            <div className="rotate-90 text-[8px] font-serif font-bold text-amber-900/60 whitespace-nowrap tracking-widest">
                DECK {index + 1}
            </div>
            <div className="w-px h-4 bg-amber-900/20" />
            <SuitIcon size={10} className="text-amber-900/40" />
        </div>

        {/* --- Front Cover --- */}
        <div className={`
            absolute inset-0 ${bgColor} rounded-r-md border-y-2 border-r-2 border-l border-amber-900/60
            flex flex-col items-center justify-between p-1.5
            shadow-xl
            bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]
        `}>
             {/* Weathering effect */}
            <div className="absolute inset-0 bg-amber-500/10 mix-blend-multiply pointer-events-none" />
            
            {/* Top Rank */}
            <div className={`font-serif font-bold text-base ${colorClass} leading-none`}>
                {rank}
            </div>

            {/* Center Art - Resized to fit 110px height */}
            <div className={`
                w-8 h-8 border-2 border-double ${isRed ? 'border-red-900/30' : 'border-slate-900/30'} 
                flex items-center justify-center bg-white/40 rounded-sm
            `}>
                <SuitIcon size={16} className={colorClass} fill="currentColor" />
            </div>

            {/* Bottom Rank */}
            <div className={`font-serif font-bold text-base ${colorClass} rotate-180 leading-none`}>
                {rank}
            </div>
            
            {/* Count Badge */}
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-md border border-white z-10">
                {count}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBox;