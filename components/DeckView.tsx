import React from 'react';
import { TextItem, ViewMode } from '../types';
import Card from './Card';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, TouchSensor, MouseSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DeckViewProps {
  items: TextItem[];
  viewMode: ViewMode;
  onCardClick: (item: TextItem) => void;
  onDeleteCard: (id: string) => void;
  onEditCard: (item: TextItem) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

// Wrapper for Sortable Logic
const SortableCard = ({ 
    item, 
    index, 
    viewMode, 
    total, 
    onCardClick, 
    onDeleteCard, 
    onEditCard,
    wrapperStyle 
}: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    // Compose transforms
    const isAbsolute = viewMode === 'fan' || viewMode === 'stack';
    
    let style: React.CSSProperties = {
        transition,
        zIndex: isDragging ? 9999 : wrapperStyle?.zIndex,
    };

    if (transform) {
        if (isAbsolute && !isDragging) {
             style.transform = CSS.Transform.toString(transform);
        } else {
             style.transform = CSS.Transform.toString(transform);
        }
    }

    // Merge styles logic for Absolute Modes
    if (isAbsolute) {
        if (isDragging) {
            // If dragging, follow mouse strictly (remove fan rotation/arc so it feels like picking up)
            style = {
                ...style,
                position: 'absolute',
                // Keep dimensions so it doesn't collapse
                width: '220px',
                height: '340px',
            };
        } else {
            // Not dragging
            if (transform) {
                style = {
                    ...style,
                    ...wrapperStyle, // Apply base fan pos
                    transform: `${CSS.Transform.toString(transform)} ${wrapperStyle.transform}`,
                };
            } else {
                // Static sitting in fan
                style = {
                    ...style,
                    ...wrapperStyle,
                };
            }
        }
    } else {
        // Grid Mode (Static flow)
        style = {
            ...style,
            transform: CSS.Transform.toString(transform),
        };
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`
                group/wrapper 
                ${isAbsolute ? '' : 'relative'} 
                ${isDragging ? 'z-[9999] opacity-90' : ''}
                animate-in fade-in zoom-in-75 slide-in-from-bottom-4 duration-500 fill-mode-backwards
            `}
        >
             <div className={`
                pointer-events-auto w-full h-full transition-transform duration-300 ease-out 
                ${viewMode === 'fan' && !isDragging ? 'hover:-translate-y-16 hover:scale-110 hover:z-50' : ''}
                ${viewMode !== 'fan' && !isDragging ? 'hover:scale-105 hover:z-50' : ''}
            `}>
                <Card
                    item={item}
                    onClick={() => {
                        // Prevent click if we just dragged (dnd-kit usually handles this, but good safety)
                        if (!isDragging) onCardClick(item);
                    }}
                    onDelete={(e) => { e.stopPropagation(); onDeleteCard(item.id); }}
                    onEdit={(e) => { e.stopPropagation(); onEditCard(item); }}
                    className={`shadow-xl ${isDragging ? 'shadow-2xl ring-4 ring-blue-400/50' : ''}`}
                />
            </div>
        </div>
    );
};


const DeckView: React.FC<DeckViewProps> = ({ items, viewMode, onCardClick, onDeleteCard, onEditCard, onReorder }) => {
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Require 8px movement before drag starts (allows clicks)
        },
    }),
    useSensor(MouseSensor, {
        activationConstraint: {
             distance: 8,
        }
    }),
    useSensor(TouchSensor, {
         activationConstraint: {
            delay: 250,
            tolerance: 5,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  // --- Render Mode: Grid ---
  if (viewMode === 'grid') {
    return (
      <div className="container mx-auto px-4 py-8 animate-in fade-in duration-700">
         <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
         >
            <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap justify-center gap-8 pb-20">
                    {items.map((item) => (
                        <SortableCard 
                            key={item.id}
                            item={item}
                            viewMode="grid"
                            onCardClick={onCardClick}
                            onDeleteCard={onDeleteCard}
                            onEditCard={onEditCard}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
      </div>
    );
  }

  // --- Render Mode: Stack & Fan (Absolute Positioning) ---
  const isFan = viewMode === 'fan';
  const containerHeight = isFan ? 'h-[600px]' : 'h-[500px]';

  return (
    <div className={`
        w-full ${containerHeight} relative flex items-center justify-center overflow-visible perspective-1000 origin-center
        scale-[0.7] sm:scale-90 md:scale-100 transition-transform duration-300
    `}>
      <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
            {items.map((item, index) => {
                let wrapperStyle: React.CSSProperties = {};
                const total = items.length;

                if (isFan) {
                    // --- Dynamic Fan Calculations ---
                    const maxTotalSpreadWidth = 650;
                    const calculatedOffset = total > 1 ? maxTotalSpreadWidth / (total - 1) : 0;
                    const xOffset = Math.min(40, calculatedOffset); 
                    
                    const maxTotalAngle = 60;
                    const calculatedAngle = total > 1 ? maxTotalAngle / (total - 1) : 0;
                    const spreadAngle = Math.min(5, calculatedAngle);

                    const center = (total - 1) / 2;
                    const dist = index - center;
                    
                    const rotate = dist * spreadAngle;
                    const x = dist * xOffset;
                    const y = Math.abs(dist) * (total > 15 ? 3 : 5);

                    wrapperStyle = {
                        transform: `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg)`,
                        zIndex: index,
                        position: 'absolute',
                        transformOrigin: '50% 120%', 
                        width: '220px', 
                        height: '340px',
                    };
                } else {
                    // Stack Calculations
                    const pseudoRandom = (str: string) => {
                        let hash = 0;
                        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
                        return hash;
                    };
                    const hash = pseudoRandom(item.id);
                    
                    const randomRot = (hash % 10) - 5; 
                    const randomX = ((hash >> 1) % 10) - 5;
                    const randomY = ((hash >> 2) % 10) - 5;

                    wrapperStyle = {
                        transform: `translate(${randomX}px, ${randomY}px) rotate(${randomRot}deg)`,
                        zIndex: index,
                        position: 'absolute',
                        width: '220px',
                        height: '340px',
                    };
                }

                return (
                    <SortableCard
                        key={item.id}
                        item={item}
                        index={index}
                        viewMode={viewMode}
                        total={total}
                        onCardClick={onCardClick}
                        onDeleteCard={onDeleteCard}
                        onEditCard={onEditCard}
                        wrapperStyle={wrapperStyle}
                    />
                );
            })}
        </SortableContext>
      </DndContext>
      
      {items.length === 0 && (
        <div className="text-gray-400 font-serif italic text-xl border-2 border-dashed border-gray-300 rounded-xl p-12">
            The deck is empty. Add a card to begin.
        </div>
      )}
    </div>
  );
};

export default DeckView;