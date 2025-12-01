import React from 'react';
import { Heart, Club, Diamond, Spade } from 'lucide-react';
import { CardCategory, CardStyleConfig } from '../types';

interface CategoryIconProps {
  category: CardCategory;
  className?: string;
  size?: number;
}

export const CATEGORY_CONFIG: Record<CardCategory, CardStyleConfig> = {
  story: {
    abbr: 'ST',
    icon: Heart,
    colorClass: 'text-card-red',
    subColorClass: 'text-rose-200',
    label: 'Story'
  },
  prompt: {
    abbr: 'PR',
    icon: Club,
    colorClass: 'text-card-black',
    subColorClass: 'text-slate-300',
    label: 'Prompt'
  },
  note: {
    abbr: 'NT',
    icon: Diamond,
    colorClass: 'text-card-red',
    subColorClass: 'text-rose-200',
    label: 'Note'
  },
  text: {
    abbr: 'TX',
    icon: Spade,
    colorClass: 'text-card-black',
    subColorClass: 'text-slate-300',
    label: 'File'
  }
};

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "", size = 24 }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.text;
  const IconComponent = config.icon;

  return <IconComponent size={size} className={`${config.colorClass} ${className}`} fill="currentColor" />;
};

export default CategoryIcon;