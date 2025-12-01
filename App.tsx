import React, { useState, useEffect } from 'react';
import { TextItem, ViewMode, CardCategory, DeckStats } from './types';
import { INITIAL_ITEMS } from './constants';
import { generateId, shuffleArray } from './utils';
import DeckView from './components/DeckView';
import DeckBox from './components/DeckBox';
import CardModal from './components/CardModal';
import AuthCard from './components/AuthCard';
import { Plus, LayoutGrid, Layers, Fan, Shuffle, Download, Sun, Moon, LogOut, User } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';
import { api } from './api';

const ITEMS_PER_DECK = 15;

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<any>(null);

  // --- App State ---
  const [items, setItems] = useState<TextItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('fan');
  const [selectedItem, setSelectedItem] = useState<TextItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // --- Load Session & Theme (Run Once) ---
  useEffect(() => {
    // Check for logged in user session (simple persist)
    const sessionUser = localStorage.getItem('deck_of_thoughts_session');
    const token = localStorage.getItem('token');
    
    if (sessionUser && token) {
        setUser(JSON.parse(sessionUser));
    } else {
        // Clear invalid session if any
        localStorage.removeItem('deck_of_thoughts_session');
        localStorage.removeItem('token');
        setUser(null);
    }

    // Theme (Global preference)
    const savedTheme = localStorage.getItem('deck-of-thoughts-theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // --- Load User Data (Run when User changes) ---
  useEffect(() => {
    if (!user) {
        setItems([]); // Clear items if no user
        return;
    }

    // Load from API
    api.getCards()
      .then(fetchedItems => {
        setItems(fetchedItems);
      })
      .catch(err => {
        console.error("Failed to load cards", err);
        // If unauthorized, logout
        if (err.message === 'No token found' || err.message === 'Failed to fetch cards') {
            // Ideally check for 401/403 but generic catch here
            // Let's just be safe: if we can't load cards, maybe we shouldn't just show empty?
            // But for now, if it fails, it might be the token is invalid.
        }
        setItems([]);
      });
  }, [user]);

  // --- Persistence (Run when Items or User changes) ---
  // REMOVED: Automatic persistence to localStorage. 
  // Now handled by individual actions (Add/Update/Delete) calling API directly.

  useEffect(() => {
    localStorage.setItem('deck-of-thoughts-theme', theme);
  }, [theme]);

  // --- Auth Handlers ---
  const handleLogin = (userData: any) => {
      setUser(userData);
      localStorage.setItem('deck_of_thoughts_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
      setUser(null);
      setItems([]); // Clear data from memory immediately
      localStorage.removeItem('deck_of_thoughts_session');
      localStorage.removeItem('token');
  };

  // --- Derived State: Pagination/Decks ---
  const totalDecks = Math.max(1, Math.ceil(items.length / ITEMS_PER_DECK));
  
  // Ensure activeDeckIndex is valid
  useEffect(() => {
    if (activeDeckIndex >= totalDecks) {
        setActiveDeckIndex(Math.max(0, totalDecks - 1));
    }
  }, [totalDecks, activeDeckIndex]);

  const currentDeckItems = items.slice(
    activeDeckIndex * ITEMS_PER_DECK, 
    (activeDeckIndex + 1) * ITEMS_PER_DECK
  );



  // --- Handlers ---
  const handleShuffle = () => {
    // We only shuffle the CURRENT deck
    const currentItems = [...currentDeckItems];
    const shuffledCurrent = shuffleArray(currentItems);
    
    // Reconstruct full list
    const before = items.slice(0, activeDeckIndex * ITEMS_PER_DECK);
    const after = items.slice((activeDeckIndex + 1) * ITEMS_PER_DECK);
    
    setItems([...before, ...shuffledCurrent, ...after]);
  };

  const handleReorder = (oldIndex: number, newIndex: number) => {
    // The indices passed here are relative to the *current deck view*
    // We need to map them to the global indices in the 'items' array
    
    const globalStartIndex = activeDeckIndex * ITEMS_PER_DECK;
    
    // Slice out the current deck
    const currentDeckSlice = items.slice(globalStartIndex, globalStartIndex + ITEMS_PER_DECK);
    
    // Reorder the slice
    const newDeckSlice = arrayMove(currentDeckSlice, oldIndex, newIndex);
    
    // Reconstruct the full items array
    const before = items.slice(0, globalStartIndex);
    const after = items.slice(globalStartIndex + ITEMS_PER_DECK);
    
    setItems([...before, ...newDeckSlice, ...after]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAddItem = async (category: CardCategory = 'note') => {
    const newItem: TextItem = {
      id: generateId(),
      title: 'New Card',
      category,
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    try {
        const createdCard = await api.createCard(newItem);
        // Use ID from server or local logic? Server returns ID.
        // But we need to match what we have.
        // Let's just use the one we sent or what server returns.
        // Server returns same object.
        
        setItems(prev => [createdCard, ...prev]);
        setActiveDeckIndex(0); // Jump to first deck
        
        // Immediately open for editing
        setSelectedItem(createdCard);
        setIsEditingInModal(true);
        setIsModalOpen(true);
    } catch (err) {
        console.error("Failed to create card", err);
        alert("Failed to create card");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to discard this card?")) {
        try {
            await api.deleteCard(id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            console.error("Failed to delete card", err);
            alert("Failed to delete card");
        }
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<TextItem>) => {
    // Optimistic update for UI responsiveness
    setItems(prev => {
        const updatedItems = prev.map(item => item.id === id ? { ...item, ...updates } : item);
        
        if (selectedItem && selectedItem.id === id) {
            setSelectedItem({ ...selectedItem, ...updates });
        }
        
        return updatedItems;
    });

    // API Call
    try {
        await api.updateCard(id, updates);
    } catch (err) {
        console.error("Failed to update card", err);
        // Revert? Ideally yes, but for simplicity we just warn.
    }
  };
  
  const handleExport = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "deck_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  // --- Stats Calculation ---
  const stats: DeckStats = items.reduce((acc, item) => {
      acc.total++;
      if(item.category === 'story') acc.stories++;
      if(item.category === 'prompt') acc.prompts++;
      if(item.category === 'note') acc.notes++;
      if(item.category === 'text') acc.texts++;
      return acc;
  }, { total: 0, stories: 0, prompts: 0, notes: 0, texts: 0 });

  const isDark = theme === 'dark';
  const isScrollableMode = viewMode === 'grid';

  // --- Render Auth Screen if not logged in ---
  if (!user) {
      return (
        <div className={`
            h-screen w-full flex flex-col font-sans overflow-hidden transition-colors duration-500 ease-in-out bg-black
        `}>
             {/* Background Image */}
             <div 
                className={`fixed inset-0 z-0 bg-cover bg-center bg-no-repeat`}
                style={{ backgroundImage: `url(/assets/BG.svg)` }}
             >
             </div>
            
            <div className="relative z-10 w-full h-full flex flex-col">
                <header className="h-[60px] px-[20px] flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md bg-white text-black`}>
                            <span className="text-2xl">♠️</span>
                        </div>
                        <h1 className={`text-xl font-serif font-bold tracking-wide text-white drop-shadow-md`}>
                            <span className="font-western text-2xl">Deck</span> of Thoughts
                        </h1>
                    </div>
                </header>
                <AuthCard onLoginSuccess={handleLogin} />
            </div>
        </div>
      );
  }

  // --- Render Main App ---
  return (
    <div className={`
        h-screen flex flex-col font-sans overflow-hidden transition-colors duration-500 ease-in-out
        ${isDark ? 'bg-slate-900 selection:bg-rose-500' : 'bg-[#d6d3d1] selection:bg-rose-200'}
    `}>
      
      {/* --- Felt Table Texture Overlay --- */}
      <div className={`
        fixed inset-0 pointer-events-none z-0 
        ${isDark ? 'opacity-20 mix-blend-overlay' : 'opacity-10 mix-blend-multiply'}
        bg-[url('https://www.transparenttextures.com/patterns/felt.png')] 
      `}></div>
      
      {/* --- Header / Toolbar (Fixed Top) --- */}
      <header className={`
        flex-none h-[60px] relative z-50 backdrop-blur-md shadow-lg px-[20px] transition-colors duration-500 flex items-center
        ${isDark ? 'bg-white/5 border-b border-white/10' : 'bg-white/60 border-b border-stone-300/50'}
      `}>
        <div className="w-full flex flex-row items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          
          {/* LEFT: Logo & Stats */}
          <div className="flex items-center gap-4 shrink-0">
            <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center shadow-md transition-colors duration-500 shrink-0
                ${isDark ? 'bg-white text-black' : 'bg-slate-800 text-white'}
            `}>
                <span className="text-xl">♠️</span>
            </div>
            <div className="flex flex-col">
                <h1 className={`text-lg font-serif font-bold tracking-wide leading-none transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <span className="font-western text-xl">Deck</span> of Thoughts
                </h1>
                <p className={`text-[10px] font-mono leading-none mt-1 transition-colors duration-500 ${isDark ? 'text-white/50' : 'text-slate-600'}`}>
                    {stats.total} Cards • Deck {activeDeckIndex + 1}/{totalDecks}
                </p>
            </div>
          </div>

          {/* CENTER: Main Controls */}
          <div className="flex flex-row items-center gap-3 shrink-0">
            
            {/* View Modes */}
            <div className={`p-0.5 rounded-lg flex items-center gap-0.5 backdrop-blur-sm transition-colors duration-500 ${isDark ? 'bg-black/40' : 'bg-stone-300/50'}`}>
                <button 
                    onClick={() => setViewMode('fan')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'fan' ? 'bg-white text-gray-900 shadow-md' : (isDark ? 'text-white/70 hover:bg-white/10' : 'text-slate-700 hover:bg-white/40')}`}
                    title="Fan View"
                >
                    <Fan size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-md' : (isDark ? 'text-white/70 hover:bg-white/10' : 'text-slate-700 hover:bg-white/40')}`}
                    title="Grid View"
                >
                    <LayoutGrid size={16} />
                </button>
                <button 
                    onClick={() => setViewMode('stack')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'stack' ? 'bg-white text-gray-900 shadow-md' : (isDark ? 'text-white/70 hover:bg-white/10' : 'text-slate-700 hover:bg-white/40')}`}
                    title="Stack View"
                >
                    <Layers size={16} />
                </button>
            </div>

            <div className={`h-6 w-px mx-0.5 ${isDark ? 'bg-white/20' : 'bg-stone-400/30'}`}></div>

            {/* Actions */}
            <button 
                onClick={handleShuffle}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border font-medium text-xs
                    ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border-white/10' : 'bg-white/60 text-slate-800 hover:bg-white border-stone-300/50'}
                `}
            >
                <Shuffle size={14} /> <span className="hidden lg:inline">Shuffle</span>
            </button>
            
            <button 
                onClick={handleExport}
                className={`
                    p-1.5 rounded-lg transition-colors border
                    ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border-white/10' : 'bg-white/60 text-slate-800 hover:bg-white border-stone-300/50'}
                `}
                title="Export JSON"
            >
                <Download size={16} />
            </button>

             {/* Add Button Dropdown */}
             <div className="flex gap-0.5 ml-0.5">
                 <button 
                    onClick={() => handleAddItem('story')} 
                    className="p-2 bg-[#ce2424] text-white rounded-l-md hover:bg-[#333460] hover:text-white transition-all shadow-lg flex items-center gap-1.5 border-r border-white/20"
                    title="Add Story"
                >
                    <Plus size={14} /> <span className="font-bold text-[10px]">ST</span>
                 </button>
                 <button 
                    onClick={() => handleAddItem('prompt')} 
                    className="p-2 bg-[#ce2424] text-white hover:bg-[#333460] hover:text-white transition-all shadow-lg flex items-center gap-1.5 border-r border-white/20"
                     title="Add Prompt"
                >
                    <span className="font-bold text-[10px]">PR</span>
                 </button>
                  <button 
                    onClick={() => handleAddItem('note')} 
                    className="p-2 bg-[#ce2424] text-white hover:bg-[#333460] hover:text-white transition-all shadow-lg flex items-center gap-1.5 border-r border-white/20"
                     title="Add Note"
                >
                    <span className="font-bold text-[10px]">NT</span>
                 </button>
                  <button 
                    onClick={() => handleAddItem('text')} 
                    className="p-2 bg-[#ce2424] text-white rounded-r-md hover:bg-[#333460] hover:text-white transition-all shadow-lg flex items-center gap-1.5"
                     title="Add File"
                >
                    <span className="font-bold text-[10px]">TX</span>
                 </button>
             </div>
          </div>

          {/* RIGHT: Theme, User & Logout */}
          <div className="flex items-center gap-2 shrink-0">
             
             {/* Theme Toggle */}
             <button
                onClick={toggleTheme}
                className={`
                    p-1.5 rounded-lg transition-colors border
                    ${isDark ? 'bg-white/10 text-white hover:bg-white/20 border-white/10' : 'bg-white/60 text-slate-800 hover:bg-white border-stone-300/50'}
                `}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

             <div className={`
                flex items-center gap-2 px-2.5 py-1.5 rounded-lg border
                ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/50 border-stone-300/50 text-slate-800'}
             `}>
                 <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                    <User size={12} className="text-slate-500"/>
                 </div>
                 <span className="text-[10px] font-bold font-mono">{user?.username}</span>
             </div>

             <button
                onClick={handleLogout}
                className={`
                    p-1.5 rounded-lg transition-colors border border-white/10 text-white hover:bg-[#ce2424] hover:text-white hover:border-[#ce2424]
                `}
                title="Logout"
            >
                <LogOut size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* --- Main Content Area --- */}
      <div className="flex-1 overflow-hidden relative z-10 flex w-full">
        
        {/* --- Left Sidebar for Decks (Visible if > 1 deck) --- */}
        {totalDecks > 1 && (
            <div className="w-24 md:w-32 h-full flex flex-col items-center justify-center gap-4 py-8 pl-2 sm:pl-4 absolute left-0 top-0 z-30 pointer-events-none">
                <div className="flex flex-col gap-6 pointer-events-auto max-h-full overflow-y-auto no-scrollbar p-2 pb-20">
                    {Array.from({ length: totalDecks }).map((_, i) => (
                        <DeckBox 
                            key={i} 
                            index={i} 
                            count={items.slice(i * ITEMS_PER_DECK, (i+1) * ITEMS_PER_DECK).length}
                            isActive={i === activeDeckIndex} 
                            onClick={() => setActiveDeckIndex(i)} 
                        />
                    ))}
                </div>
            </div>
        )}

        {/* --- Main Deck View --- */}
        <main className={`
            flex-1 w-full relative transition-all duration-300
            ${totalDecks > 1 ? 'pl-24 md:pl-36' : ''} 
            ${isScrollableMode ? 'overflow-y-auto' : 'overflow-hidden flex flex-col items-center justify-center'}
        `}>
             {/* Helper Text */}
            <div className={`
                text-center text-sm font-serif italic transition-colors duration-500 
                ${isDark ? 'text-white/40' : 'text-slate-600/70'}
                ${isScrollableMode ? 'mt-8' : 'absolute top-4 left-0 right-0 z-20 pointer-events-none'}
            `}>
                {viewMode === 'fan' && "The cards are fanned out. Drag to reorder, click to view."}
                {viewMode === 'stack' && "A messy desk. Drag to shuffle order."}
                {viewMode === 'grid' && "Drag and drop to organize your thoughts."}
            </div>

            <DeckView 
                items={currentDeckItems} 
                viewMode={viewMode} 
                onCardClick={(item) => {
                    setSelectedItem(item);
                    setIsEditingInModal(false);
                    setIsModalOpen(true);
                }}
                onDeleteCard={handleDeleteItem}
                onEditCard={(item) => {
                    setSelectedItem(item);
                    setIsEditingInModal(true);
                    setIsModalOpen(true);
                }}
                onReorder={handleReorder}
            />
        </main>
      </div>

      {/* --- Footer Bar --- */}
      <footer className={`
        flex-none h-[30px] w-full z-50 flex items-center justify-between px-6 text-[10px] sm:text-xs font-mono
        ${isDark ? 'bg-slate-900/90 border-t border-white/10 text-slate-400' : 'bg-stone-200/90 border-t border-stone-300 text-slate-600'}
      `}>
          {/* Copyright Section */}
          <div className="text-card-red font-bold">
              &copy; {new Date().getFullYear()} <span className="font-western">Deck</span> of Thoughts
          </div>

          {/* Designer Section */}
          <div>
             <span className="mr-1">Designer:</span>
             <a 
                href="https://alienshanu.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-card-red font-bold transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"
             >
                 Alien Shanu
             </a>
          </div>
      </footer>

      {/* --- Modals --- */}
      <CardModal 
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateItem}
        isEditingInitially={isEditingInModal}
      />

    </div>
  );
};

export default App;