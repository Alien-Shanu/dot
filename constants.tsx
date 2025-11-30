import { TextItem, CardCategory } from './types';

const BASE_ITEMS: TextItem[] = [
  {
    id: '1',
    title: 'The Clockmaker',
    category: 'story',
    content: "The old clockmaker didn't just fix time; he collected it. In jars lining his dusty shelves, seconds shimmered like gold dust, and lost hours swirled like thick smoke. One day, a young girl entered with a pocket watch that ran backwards...",
    tags: ['fantasy', 'short-story'],
    createdAt: Date.now() - 100000000,
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Cyberpunk Hero',
    category: 'prompt',
    content: "Write a scene where a detective in a neon-lit futuristic city has to interview a vending machine that witnessed a crime. The vending machine is sarcastic and demands credits for every answer.",
    tags: ['sci-fi', 'writing-prompt'],
    createdAt: Date.now() - 80000000,
    updatedAt: Date.now(),
  },
  {
    id: '3',
    title: 'Meeting Notes: Q3',
    category: 'note',
    content: "Key takeaways: \n1. Revenue up by 15%.\n2. Need to hire two new frontend engineers.\n3. Coffee machine is broken again (priority fix).\n\nAction items: Schedule follow-up with marketing team.",
    tags: ['work', 'meeting'],
    createdAt: Date.now() - 60000000,
    updatedAt: Date.now(),
  },
  {
    id: '4',
    title: 'config.json',
    category: 'text',
    content: '{\n  "theme": "dark",\n  "version": "1.0.4",\n  "debug": false,\n  "features": {\n    "beta": true\n  }\n}',
    tags: ['code', 'json'],
    createdAt: Date.now() - 40000000,
    updatedAt: Date.now(),
  },
  {
    id: '5',
    title: 'Grocery List',
    category: 'note',
    content: "- Milk\n- Eggs\n- Bread\n- Sparkling Water\n- Avocados (if ripe)\n- Hot sauce",
    tags: ['personal'],
    createdAt: Date.now() - 20000000,
    updatedAt: Date.now(),
  },
   {
    id: '6',
    title: 'The Lost Key',
    category: 'story',
    content: "It wasn't the door that was locked, but the air around it. She held the key, heavy and cold iron, but every time she reached out, the world seemed to stretch away from her.",
    tags: ['mystery'],
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now(),
  },
];

// Helper to generate filler items to test deck pagination (total > 52)
const generateFillerItems = (startCount: number, totalNeeded: number): TextItem[] => {
    const items: TextItem[] = [];
    const categories: CardCategory[] = ['story', 'prompt', 'note', 'text'];
    const tagsPool = ['idea', 'archive', 'random', 'draft', 'todo', 'snippet'];

    for (let i = 0; i < totalNeeded; i++) {
        const id = (startCount + i + 1).toString();
        const category = categories[i % 4];
        const date = Date.now() - Math.floor(Math.random() * 1000000000);
        
        items.push({
            id: `gen-${id}`,
            title: `Archive Card #${id}`,
            category: category,
            content: `This is automatically generated content for card #${id} to demonstrate the deck splitting functionality. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
            tags: [tagsPool[i % tagsPool.length]],
            createdAt: date,
            updatedAt: date,
        });
    }
    return items;
};

// Generate enough cards to have at least 65 total (One full deck of 52 + 13 in the second deck)
const FILLER_COUNT = 60; 
export const INITIAL_ITEMS: TextItem[] = [...BASE_ITEMS, ...generateFillerItems(BASE_ITEMS.length, FILLER_COUNT)];