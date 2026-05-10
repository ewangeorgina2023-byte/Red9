import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp, ChevronDown, Check, Edit, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ContentItem } from '../data';
import { useAppStore } from '../store';

interface RowProps {
  title: string;
  items: ContentItem[];
}

export function Row({ title, items }: RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  const { setActiveModalContent, watchlist, toggleWatchlist, progress, customContent, setEditingContent, setIsAddModalOpen, deleteCustomContent, addNotification, lastSeriesEpisode } = useAppStore();

  const displayedItems = (() => {
    const titleGroups: Record<string, ContentItem[]> = {};
    const normalize = (t: string) => t.toLowerCase().replace(/\s*(?:season|s|episode|ep|e)\.?\s*\d+/gi, '').trim();
    
    items.forEach(item => {
      const normalizedTitle = normalize(item.title);
      if (!titleGroups[normalizedTitle]) {
        titleGroups[normalizedTitle] = [];
      }
      titleGroups[normalizedTitle].push(item);
    });

    return Object.values(titleGroups).map(group => {
      const normalizedTitle = normalize(group[0].title);
      const lastWatchedId = lastSeriesEpisode[normalizedTitle];
      
      if (lastWatchedId) {
        const lastWatched = group.find(item => item.id === lastWatchedId);
        if (lastWatched) return lastWatched;
      }

      // Prefer item with seriesThumbnail/seriesDescription, or custom content, or just the first item
      return group.find(item => !!item.seriesThumbnail || !!item.seriesDescription) || group.find(item => customContent.some(c => c.id === item.id)) || group[0];
    });
  })();

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 200 : scrollLeft + clientWidth - 200;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/row z-10 px-8 my-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold tracking-tight text-white hover:text-gray-300 transition-colors cursor-pointer group-hover/row:translate-x-1 duration-300">
          {title}
        </h2>
        <span className="text-xs text-gray-500 font-medium cursor-pointer uppercase tracking-tighter hover:text-white transition-colors opacity-0 group-hover/row:opacity-100 duration-300 hidden md:block">View All</span>
      </div>
      
      <div className="relative group/carousel">
        {isMoved && (
          <button 
            className="absolute left-0 top-0 bottom-0 w-12 bg-zinc-950/70 opacity-0 group-hover/carousel:opacity-100 hover:bg-zinc-950/90 transition-all z-20 flex items-center justify-center cursor-pointer backdrop-blur-sm"
            onClick={() => handleClick('left')}
          >
            <ChevronLeft className="w-8 h-8 text-white group-hover:scale-125 transition-transform" />
          </button>
        )}
        
        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-4 px-1"
        >
          {displayedItems.map((item) => {
            const inWatchlist = watchlist.includes(item.id);
            const itemProgress = progress[item.id];
            const isCustom = customContent.some(c => c.id === item.id);
            
            return (
              <div 
                key={item.id} 
                className="relative min-w-[240px] md:min-w-[260px] h-[135px] md:h-[146px] rounded-md transition-all duration-300 transform hover:scale-105 hover:z-30 cursor-pointer group/item"
                onClick={() => {
                  const titleNormalized = item.title.trim().toLowerCase();
                  const relatedCustom = customContent.filter(c => c.title.trim().toLowerCase() === titleNormalized);
                  const isItemCustom = customContent.some(c => c.id === item.id);
                  // It's a series if there's more than one instance of this title total
                  const totalEpisodes = isItemCustom ? relatedCustom.length : relatedCustom.length + 1;
                  const isSeries = totalEpisodes > 1;
                  // Always autoplay as requested
                  setActiveModalContent(item, true);
                }}
              >
                <img 
                  src={item.seriesThumbnail || item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover rounded-md shadow-lg"
                />
                
                {itemProgress && itemProgress.percentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50 rounded-b-md overflow-hidden">
                    <div 
                      className="h-full bg-[#E50914]" 
                      style={{ width: `${itemProgress.percentage}%` }}
                    />
                  </div>
                )}
                
                {/* Hover Card Data */}
                <div className="absolute top-full left-0 right-0 bg-zinc-900 z-40 rounded-b-md shadow-2xl opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 mt-2 p-4 scale-0 group-hover/item:scale-100 origin-top border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                      <button 
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-300 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalContent(item, true);
                        }}
                      >
                        <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-white/50 flex items-center justify-center hover:border-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(item.id);
                        }}
                      >
                        {inWatchlist ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                      </button>
                      
                      {isCustom && (
                        <>
                          <button 
                            className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-white/50 flex items-center justify-center hover:border-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingContent(item);
                              setIsAddModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          <button 
                            className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-red-500/50 flex items-center justify-center hover:border-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomContent(item.id);
                              addNotification("Content deleted", "success");
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}

                      {!isCustom && (
                        <button 
                          className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-white/50 flex items-center justify-center hover:border-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Mock rate
                          }}
                        >
                          <ThumbsUp className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                    <button 
                      className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-white/50 flex items-center justify-center hover:border-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalContent(item);
                      }}
                    >
                      <ChevronDown className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="text-[#E50914] text-[10px] bg-[#E50914]/10 border border-[#E50914]/20 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">{item.match}% Match</span>
                    <span className="border border-zinc-600 px-1 py-0.5 rounded text-white">{item.maturity}</span>
                    <span className="text-gray-300">{item.duration}</span>
                    <span className="border border-zinc-600 px-1 py-0.5 rounded text-gray-300 text-[10px]">HD</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {item.genres.map((genre, i) => (
                      <span key={genre} className="flex items-center">
                        {genre} {i < item.genres.length - 1 && <span className="w-1 h-1 bg-gray-600 rounded-full mx-1 inline-block"></span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <button 
          className="absolute right-0 top-0 bottom-0 w-12 bg-zinc-950/70 opacity-0 group-hover/carousel:opacity-100 hover:bg-zinc-950/90 transition-all z-20 flex items-center justify-center cursor-pointer backdrop-blur-sm"
          onClick={() => handleClick('right')}
        >
          <ChevronRight className="w-8 h-8 text-white group-hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
}
