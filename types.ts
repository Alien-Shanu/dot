import React from 'react';

export type CardCategory = 'story' | 'prompt' | 'note' | 'text';

export type ViewMode = 'fan' | 'grid' | 'stack';

export interface TextItem {
  id: string;
  title: string;
  category: CardCategory;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CardStyleConfig {
    abbr: string;
    icon: React.ComponentType<any>;
    colorClass: string;
    subColorClass: string;
    label: string;
}

export interface DeckStats {
    total: number;
    stories: number;
    prompts: number;
    notes: number;
    texts: number;
}