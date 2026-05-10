import { useAppStore } from './store';
import { ProfileSelector } from './components/ProfileSelector';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Row } from './components/Row';
import { ContentModal } from './components/ContentModal';
import { AddContentModal } from './components/AddContentModal';
import { SettingsModal } from './components/SettingsModal';
import { GameModeModal } from './components/GameModeModal';
import { NotificationToast } from './components/NotificationToast';
import { TRENDING_NOW, FOR_YOU, NEW_RELEASES, ContentItem } from './data';
import React, { useMemo, useEffect } from 'react';

// Normalize title to ignore season/episode markers for deduplication
const normalizeTitle = (t: string) => t.toLowerCase().replace(/\s*(?:season|s|episode|ep|e)\.?\s*\d+/gi, '').trim();

export default function App() {
  const { currentProfile, isSearchActive, searchQuery, watchlist, customContent, games, activeModalContent, isAddModalOpen, isSettingsModalOpen, isGameModeModalOpen, lastSeriesEpisode, progress } = useAppStore();

  useEffect(() => {
    if (activeModalContent || isAddModalOpen || isSettingsModalOpen || isGameModeModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [activeModalContent, isAddModalOpen, isSettingsModalOpen, isGameModeModalOpen]);

  // Simple search filter
  const allContent = useMemo(() => {
    const combined = [...customContent, ...TRENDING_NOW, ...FOR_YOU, ...NEW_RELEASES];
    const groups: Map<string, ContentItem[]> = new Map();
    
    combined.forEach(item => {
      const normalizedTitle = normalizeTitle(item.title);
      if (!groups.has(normalizedTitle)) {
        groups.set(normalizedTitle, []);
      }
      groups.get(normalizedTitle)!.push(item);
    });
    
    return Array.from(groups.values()).map(group => {
      // Sort group by season and episode first to ensure consistent order
      group.sort((a, b) => {
        const sA = a.season !== undefined ? a.season : 1;
        const sB = b.season !== undefined ? b.season : 1;
        if (sA !== sB) return sA - sB;
        return (a.episode || 0) - (b.episode || 0);
      });

      const normalizedTitle = normalizeTitle(group[0].title);
      const lastWatchedId = lastSeriesEpisode[normalizedTitle];
      
      if (lastWatchedId) {
        const lastWatchedIndex = group.findIndex(item => item.id === lastWatchedId);
        if (lastWatchedIndex !== -1) {
           const lastWatched = group[lastWatchedIndex];
           const prog = useAppStore.getState().progress[lastWatched.id];
           
           // If mostly finished (>95%) and there's a next episode, return the next one
           if (prog && prog.percentage > 95 && lastWatchedIndex < group.length - 1) {
             return group[lastWatchedIndex + 1];
           }
           return lastWatched;
        }
      }
      
      // Prefer item with seriesThumbnail/seriesDescription, or custom content, or just first
      return group.find(item => !!item.seriesThumbnail || !!item.seriesDescription) || group.find(item => customContent.some(c => c.id === item.id)) || group[0];
    });
  }, [customContent, lastSeriesEpisode, progress]);
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQ = searchQuery.toLowerCase().trim();
    return allContent.filter(item => 
      item.title.toLowerCase().includes(lowerQ) || 
      item.genres.some(g => g.toLowerCase().includes(lowerQ))
    );
  }, [searchQuery, allContent]);

  const watchlistItems = useMemo(() => {
    return allContent.filter(item => watchlist.includes(item.id));
  }, [watchlist, allContent]);

  if (!currentProfile) {
    return <ProfileSelector />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-12 font-sans flex flex-col">
      <NotificationToast />
      <Navbar />
      
      {isSearchActive && searchQuery ? (
        <div className="pt-32 px-12 z-20 relative flex-1">
          <h2 className="text-gray-500 text-xl mb-6">Explore titles related to: <span className="text-white">"{searchQuery}"</span></h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map(item => (
                <SearchResultCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 mt-20 text-center text-lg">
              No matching results found for "{searchQuery}".
            </div>
          )}
        </div>
      ) : (
        <>
          <Hero />
          
          <div className="-mt-8 md:-mt-16 z-20 relative flex flex-col gap-2 md:gap-8 pb-10 flex-1">
            {customContent.filter(i => !i.homeCategories?.length || i.homeCategories.includes('Custom')).length > 0 && (
              <Row title="Your Custom Uploads" items={customContent.filter(i => !i.homeCategories?.length || i.homeCategories.includes('Custom'))} />
            )}
            {games?.length > 0 && (
              <Row title="My Games" items={games} />
            )}
            {watchlistItems.length > 0 && (
              <Row title="My List" items={watchlistItems} />
            )}
            <Row title="Trending Now" items={allContent.filter(i => i.homeCategories?.includes('Trending'))} />
            <Row title="Picked for You" items={allContent.filter(i => i.homeCategories?.includes('Picked'))} />
            <Row title="New Releases" items={allContent.filter(i => i.homeCategories?.includes('New'))} />
            <Row title="Action" items={allContent.filter(i => i.homeCategories?.includes('Action'))} />
            <Row title="Sci-Fi" items={allContent.filter(i => i.homeCategories?.includes('Sci-Fi'))} />
            {currentProfile.isKids && (
               <Row title="Kids & Family" items={allContent.filter(i => i.maturity === 'All' || i.maturity === '7+')} />
            )}
          </div>
        </>
      )}

      <ContentModal />
      <AddContentModal />
      <SettingsModal />
      <GameModeModal />
      
      <footer className="mt-20 flex-col px-12 text-gray-500 text-sm pb-8 border-t border-white/10 pt-12 items-start hidden sm:flex">
        <div className="flex w-full justify-between items-center mb-8">
          <div className="flex gap-4">
             {/* Socials mock */}
             <div className="w-6 h-6 rounded bg-gray-500 hover:bg-white cursor-pointer transition-colors"></div>
             <div className="w-6 h-6 rounded bg-gray-500 hover:bg-white cursor-pointer transition-colors"></div>
             <div className="w-6 h-6 rounded bg-gray-500 hover:bg-white cursor-pointer transition-colors"></div>
          </div>
          <div className="flex items-center space-x-6 text-[10px] uppercase tracking-widest text-gray-500">
            <span>Parental Control: <span className="text-green-500">Active</span></span>
            <span>Offline Mode: <span className="text-white">Ready</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Audio Description</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Help Center</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Gift Cards</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Media Center</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Investor Relations</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Jobs</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Terms of Use</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Privacy</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Legal Notices</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Cookie Preferences</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Corporate Information</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:underline">Contact Us</a>
        </div>
        <div className="mb-4">
          <button className="border border-gray-500 px-2 py-1 text-gray-500 hover:text-white hover:border-white transition-colors">
            Service Code
          </button>
        </div>
        <p>© 2026 RED9, Inc.</p>
      </footer>
    </div>
  );
}

const SearchResultCard: React.FC<{ item: ContentItem }> = (props) => {
  const { item } = props;
  const { setActiveModalContent } = useAppStore();
  return (
    <div 
      className="relative aspect-video rounded-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200"
      onClick={() => setActiveModalContent(item)}
    >
      <img src={item.seriesThumbnail || item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 lg:hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-black/50">
           <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
  );
}