import { Play, Info } from 'lucide-react';
import { useAppStore } from '../store';
import { TRENDING_NOW, FOR_YOU, NEW_RELEASES } from '../data';

export function Hero() {
  const { setActiveModalContent, customContent, lastSeriesEpisode } = useAppStore();
  
  // Get all content sources
  const allAvailable = [...customContent, ...TRENDING_NOW, ...FOR_YOU, ...NEW_RELEASES];
  
  if (allAvailable.length === 0) {
    return (
      <section className="relative h-[40vh] lg:h-[50vh] -mt-16 w-full flex flex-col items-center justify-center bg-zinc-900 border-b border-white/5 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Start your experience</h1>
        <p className="text-gray-400 max-w-md">Add your own movies, shows, or media using the Add button in the top right to build your personal library.</p>
      </section>
    );
  }

  // Use first item as hero feature, preferably one that's "Trending" but any will do
  const initialFeatured = allAvailable.find(i => i.homeCategories?.includes('Trending')) || allAvailable[0];
  
  const featured = (() => {
    const normalize = (t: string) => t.toLowerCase().replace(/\s*(?:season|s|episode|ep|e)\.?\s*\d+/gi, '').trim();
    const normalizedTitle = normalize(initialFeatured.title);
    
    // Check if user was watching this series
    const lastWatchedId = lastSeriesEpisode[normalizedTitle];
    if (lastWatchedId) {
      const match = allAvailable.find(c => c.id === lastWatchedId);
      if (match) return match;
    }
    return initialFeatured;
  })();

  return (
    <section className="relative h-[65vh] lg:h-[70vh] -mt-16 w-full">
      <div className="absolute inset-0">
        <img 
          src={featured.thumbnail} 
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
      </div>
      
      <div className="relative h-full flex flex-col justify-end px-12 pb-20 md:pb-28 w-full md:w-2/3 lg:w-1/2 space-y-4 z-30">
        <div className="flex items-center space-x-2 text-[#E50914] font-bold text-sm tracking-widest">
          <span className="border-2 border-[#E50914] px-1 rounded-sm text-[10px]">R9</span>
          <span>ORIGINAL</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tight leading-none text-white">
          {featured.title}
        </h1>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md line-clamp-3">
          {featured.description}
        </p>
        
        <div className="flex space-x-3 pt-2">
          <button 
            className="px-8 py-2 bg-white text-black font-bold rounded flex items-center hover:bg-gray-200 transition-colors"
            onClick={() => setActiveModalContent(featured, true)}
          >
            <Play className="w-5 h-5 mr-2 fill-black" />
            Play
          </button>
          <button 
            className="px-8 py-2 bg-gray-500/50 text-white font-bold rounded flex items-center backdrop-blur-md hover:bg-gray-500/70 transition-colors"
            onClick={() => setActiveModalContent(featured)}
          >
            <Info className="w-5 h-5 mr-2" />
            More Info
          </button>
        </div>
      </div>
    </section>
  );
}
