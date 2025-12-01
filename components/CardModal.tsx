import React, { useState, useEffect } from 'react';
import { TextItem } from '../types';
import CategoryIcon, { CATEGORY_CONFIG } from './CategoryIcon';
import { X, Save, Calendar, Tag } from 'lucide-react';
import { formatDate } from '../utils';

interface CardModalProps {
  item: TextItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<TextItem>) => void;
  isEditingInitially?: boolean;
}

const CardModal: React.FC<CardModalProps> = ({ item, isOpen, onClose, onSave, isEditingInitially = false }) => {
  const [isEditing, setIsEditing] = useState(isEditingInitially);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen && item) {
      setEditedTitle(item.title);
      setEditedContent(item.content);
      setEditedTags(item.tags || []);
      setIsEditing(isEditingInitially);
      setTagInput('');
    }
  }, [isOpen, item, isEditingInitially]);

  if (!isOpen || !item) return null;

  const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.text;

  const handleSave = () => {
    onSave(item.id, {
      title: editedTitle,
      content: editedContent,
      tags: editedTags,
      updatedAt: Date.now()
    });
    setIsEditing(false);
    onClose(); // Close the modal immediately after saving
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !editedTags.includes(val)) {
        setEditedTags([...editedTags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(t => t !== tagToRemove));
  };

  // Determine which tags to display in footer (live preview vs stored)
  const displayTags = isEditing ? editedTags : item.tags;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className={`
        relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl 
        border-[8px] border-white ring-1 ring-gray-300
        flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300
      `}>
        {/* --- Modal Header / Card Top --- */}
        <div className="relative h-24 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
             {/* Left Corner */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center leading-none">
                    <span className={`text-3xl font-serif font-bold ${config.colorClass}`}>
                        {config.abbr}
                    </span>
                    <CategoryIcon category={item.category} size={24} />
                </div>
                <div className="h-10 w-px bg-gray-200 mx-2" />
                <div>
                     <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">{config.label}</span>
                     <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Calendar size={12} />
                        <span>Created {formatDate(item.createdAt)}</span>
                     </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-medium text-sm shadow-md"
                    >
                        <Save size={16} /> Save
                    </button>
                ) : (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                        Edit
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* --- Scrollable Body --- */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 relative bg-white">
            {/* Watermark */}
            <div className="absolute top-10 right-10 opacity-[0.05] pointer-events-none">
                <CategoryIcon category={item.category} size={300} />
            </div>

            {isEditing ? (
                <div className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Title</label>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="w-full text-3xl font-serif font-bold text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2 bg-transparent"
                            placeholder="Card Title"
                        />
                    </div>
                    
                    {/* Tags Input Section */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {editedTags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-100">
                                    #{tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-blue-900 bg-blue-100 rounded-full p-0.5">
                                        <X size={10}/>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="w-full text-base text-gray-700 border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2 bg-transparent placeholder:italic"
                            placeholder="Type a tag and press Enter..."
                        />
                    </div>

                    <div>
                         <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Content</label>
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full h-[300px] text-lg text-gray-700 font-serif leading-relaxed border-none resize-none focus:ring-0 outline-none bg-transparent"
                            placeholder="Write your thoughts..."
                        />
                    </div>
                </div>
            ) : (
                <div className="relative z-10">
                    <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8 leading-tight">
                        {item.title}
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 font-serif whitespace-pre-wrap leading-loose">
                        {item.content}
                    </div>
                </div>
            )}
        </div>

        {/* --- Footer --- */}
        <div className="h-16 bg-gray-50 border-t border-gray-100 flex items-center px-8 shrink-0">
             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                 <Tag size={14} className="text-gray-400 shrink-0" />
                 {displayTags.length > 0 ? (
                     displayTags.map(tag => (
                         <span key={tag} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 shadow-sm whitespace-nowrap">
                             #{tag}
                         </span>
                     ))
                 ) : (
                     <span className="text-xs text-gray-400 italic">No tags</span>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;