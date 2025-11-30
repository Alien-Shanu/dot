import React from 'react';
import { TextItem } from '../types';
import CategoryIcon, { CATEGORY_CONFIG } from './CategoryIcon';
import { formatDate } from '../utils';
import { Maximize2, Trash2, Edit } from 'lucide-react';

interface CardProps {
  item: TextItem;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

const Card: React.FC<CardProps> = ({ item, onClick, onDelete, onEdit, style, className = '' }) => {
  const config = CATEGORY_CONFIG[item.category];

  return (
    <div
      onClick={onClick}
      style={style}
      className={`
        group relative w-[220px] h-[340px] bg-white rounded-2xl shadow-card 
        border-[6px] border-white ring-1 ring-gray-300
        flex flex-col overflow-hidden select-none cursor-pointer
        transition-all duration-500 ease-out 
        ${className}
      `}
    >
      {/* --- Card Face Decoration (Inner Border) --- */}
      <div className="absolute inset-2 border border-gray-200 rounded-xl pointer-events-none z-0" />
      
      {/* --- Top Left Corner --- */}
      <div className="absolute top-4 left-4 flex flex-col items-center z-10 leading-none">
        <span className={`text-2xl font-serif font-bold ${config.colorClass}`}>
          {config.abbr}
        </span>
        <CategoryIcon category={item.category} size={18} className="mt-1" />
      </div>

      {/* --- Bottom Right Corner (Inverted) --- */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center z-10 leading-none rotate-180">
        <span className={`text-2xl font-serif font-bold ${config.colorClass}`}>
          {config.abbr}
        </span>
        <CategoryIcon category={item.category} size={18} className="mt-1" />
      </div>

      {/* --- Background Watermark --- */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <CategoryIcon category={item.category} size={180} />
      </div>

      {/* --- Card Content Body --- */}
      <div className="flex-1 flex flex-col p-6 pt-16 pb-12 z-10 overflow-hidden">
        <h3 className="font-serif font-bold text-xl leading-tight mb-2 text-gray-900 line-clamp-2">
            {item.title}
        </h3>
        
        <div className="relative flex-1">
             <p className="text-sm text-gray-600 font-serif leading-relaxed line-clamp-[6] whitespace-pre-wrap">
                {item.content}
             </p>
             {/* Gradient fade at bottom of text */}
             <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
        </div>
      </div>

      {/* --- Footer Meta & Actions --- */}
      <div className="absolute bottom-12 left-0 right-0 px-6 flex justify-between items-end z-20">
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                {formatDate(item.createdAt)}
            </span>
            <div className="flex gap-1 mt-1 flex-wrap max-w-[120px]">
                {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
      </div>

      {/* --- Hover Actions (appear on hover) --- */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
        <button 
            onClick={onEdit}
            className="p-1.5 bg-white shadow-md border border-gray-100 rounded-full hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
            title="Edit"
        >
            <Edit size={14} />
        </button>
        <button 
            onClick={onDelete}
            className="p-1.5 bg-white shadow-md border border-gray-100 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete"
        >
            <Trash2 size={14} />
        </button>
      </div>
      
      {/* Center expand icon on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl border border-gray-100 transform scale-75 group-hover:scale-100">
            <Maximize2 className="text-gray-800" size={24} />
          </div>
      </div>

    </div>
  );
};

export default Card;