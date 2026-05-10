import { X, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ContentItem } from '../data';

export function AddContentModal() {
  const { isAddModalOpen, setIsAddModalOpen, addCustomContent, editingContent, setEditingContent, updateCustomContent, addNotification, toggleWatchlist, watchlist } = useAppStore();
  
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    title: '',
    description: '',
    thumbnail: '',
    videoUrl: '',
    year: new Date().getFullYear(),
    maturity: '12+',
    duration: '2h 00m',
    season: 1,
    episode: 1,
    releaseDate: new Date().toISOString().split('T')[0],
    seriesThumbnail: '',
    seriesDescription: '',
    homeCategories: ['Custom'],
  });

  const [addToMyList, setAddToMyList] = useState(false);
  
  const [genreInput, setGenreInput] = useState('Action, Sci-Fi');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingSeries, setIsUploadingSeries] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  React.useEffect(() => {
    if (editingContent) {
      setFormData({
        ...editingContent,
        seriesThumbnail: editingContent.seriesThumbnail || '',
        seriesDescription: editingContent.seriesDescription || '',
        homeCategories: editingContent.homeCategories || ['Custom'],
      });
      setGenreInput(editingContent.genres?.join(', ') || '');
      setAddToMyList(watchlist.includes(editingContent.id));
    } else {
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        videoUrl: '',
        year: new Date().getFullYear(),
        maturity: '12+',
        duration: '2h 00m',
        season: 1,
        episode: 1,
        releaseDate: new Date().toISOString().split('T')[0],
        seriesThumbnail: '',
        seriesDescription: '',
        homeCategories: ['Custom'],
      });
      setGenreInput('Action, Sci-Fi');
      setAddToMyList(false);
    }
  }, [editingContent, watchlist]);

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingContent?.id || Date.now().toString();
    const newItem: ContentItem = {
      id,
      title: formData.title?.trim() || 'Untitled',
      description: formData.description || 'No description provided.',
      thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&w=800&q=80',
      videoUrl: formData.videoUrl,
      duration: formData.duration || '2h 00m',
      match: editingContent?.match || Math.floor(Math.random() * 20) + 80,
      year: formData.year || new Date().getFullYear(),
      maturity: formData.maturity || '12+',
      genres: genreInput.split(',').map(g => g.trim()).filter(Boolean),
      season: formData.season,
      episode: formData.episode,
      releaseDate: formData.releaseDate,
      seriesThumbnail: formData.seriesThumbnail,
      seriesDescription: formData.seriesDescription,
      homeCategories: formData.homeCategories || ['Custom'],
    };
    
    if (editingContent?.id) {
      updateCustomContent(newItem);
      setEditingContent(null);
      addNotification('Content updated successfully!', 'success');
    } else {
      addCustomContent(newItem);
      addNotification('New content added successfully!', 'success');
    }

    // Sync watchlist
    const isInWatchlist = watchlist.includes(id);
    if (addToMyList && !isInWatchlist) {
      toggleWatchlist(id);
    } else if (!addToMyList && isInWatchlist) {
      toggleWatchlist(id);
    }
    
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-center items-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141414] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md border border-white/10 shadow-2xl overflow-hidden shadow-black">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-[#E50914]" />
            {editingContent ? 'Edit Content' : 'Add Custom Content'}
          </h2>
          <button 
            onClick={() => {
              setIsAddModalOpen(false);
              setEditingContent(null);
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Title</label>
              <input 
                required
                type="text" 
                className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Movie or Show Title"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Episode Thumbnail</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.thumbnail}
                  onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="Image URL"
                />
                <input 
                  type="file" 
                  accept="image/*"
                  id="thumbnail-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadstart = () => setIsUploadingThumbnail(true);
                      reader.onloadend = () => {
                        setFormData({ ...formData, thumbnail: reader.result as string });
                        setIsUploadingThumbnail(false);
                        addNotification('Episode photo processed!', 'success');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="thumbnail-upload"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] py-2 px-3 rounded-sm border border-white/10 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className={`w-3 h-3 ${isUploadingThumbnail ? 'animate-bounce' : ''}`} /> {isUploadingThumbnail ? 'PROCESSING...' : 'UPLOAD EPISODE PHOTO'}
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-bold text-white flex items-center gap-2">
                Series Card Image 
                <span className="text-[10px] font-normal text-gray-500 uppercase tracking-tighter">(Homepage Logo)</span>
              </label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.seriesThumbnail}
                  onChange={e => setFormData({ ...formData, seriesThumbnail: e.target.value })}
                  placeholder="Series Image URL (Optional)"
                />
                <input 
                  type="file" 
                  accept="image/*"
                  id="series-thumbnail-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadstart = () => setIsUploadingSeries(true);
                      reader.onloadend = () => {
                        setFormData({ ...formData, seriesThumbnail: reader.result as string });
                        setIsUploadingSeries(false);
                        addNotification('Series photo processed!', 'success');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="series-thumbnail-upload"
                  className="flex items-center justify-center gap-2 bg-[#E50914]/10 hover:bg-[#E50914]/20 text-[#E50914] text-[10px] py-2 px-3 rounded-sm border border-[#E50914]/20 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className={`w-3 h-3 ${isUploadingSeries ? 'animate-bounce' : ''}`} /> {isUploadingSeries ? 'PROCESSING...' : 'UPLOAD SERIES PHOTO'}
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-400 font-bold text-white flex items-center gap-2">
                Series Description
                <span className="text-[10px] font-normal text-gray-500 uppercase tracking-tighter">(Homepage Blurb)</span>
              </label>
              <textarea 
                className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm h-20 resize-none"
                value={formData.seriesDescription}
                onChange={e => setFormData({ ...formData, seriesDescription: e.target.value })}
                placeholder="Overall series summary... (Visible on homepage selection)"
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-bold text-white flex items-center gap-2">
                  Home Categories
                  <span className="text-[10px] font-normal text-gray-500 uppercase tracking-tighter">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#333]/30 p-4 rounded-sm border border-white/5">
                  {[
                    { id: 'Custom', label: 'Custom Uploads' },
                    { id: 'Trending', label: 'Trending Now' },
                    { id: 'Picked', label: 'Picked for You' },
                    { id: 'New', label: 'New Releases' },
                    { id: 'Action', label: 'Action' },
                    { id: 'Sci-Fi', label: 'Sci-Fi' }
                  ].map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id={`cat-${cat.id}`}
                        className="w-4 h-4 rounded border-gray-600 bg-zinc-800 text-[#E50914] focus:ring-[#E50914]"
                        checked={formData.homeCategories?.includes(cat.id)}
                        onChange={(e) => {
                          const currentCats = formData.homeCategories || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, homeCategories: [...currentCats, cat.id] });
                          } else {
                            setFormData({ ...formData, homeCategories: currentCats.filter(c => c !== cat.id) });
                          }
                        }}
                      />
                      <label htmlFor={`cat-${cat.id}`} className="text-xs text-white cursor-pointer select-none">
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input 
                  type="checkbox" 
                  id="add-to-watchlist"
                  className="w-5 h-5 rounded border-gray-600 bg-zinc-800 text-[#E50914] focus:ring-[#E50914]"
                  checked={addToMyList}
                  onChange={e => setAddToMyList(e.target.checked)}
                />
                <label htmlFor="add-to-watchlist" className="text-sm text-white font-medium cursor-pointer">
                  Add to My List
                </label>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Video Content</label>
              <div className="flex flex-col gap-2">
                <input 
                  type="text" 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.videoUrl}
                  onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="Video URL"
                />
                <input 
                  type="file" 
                  accept="video/*"
                  id="video-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadstart = () => setIsUploadingVideo(true);
                      reader.onloadend = () => {
                        setFormData({ ...formData, videoUrl: reader.result as string });
                        setIsUploadingVideo(false);
                        addNotification('Video content processed!', 'success');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="video-upload"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] py-2 px-3 rounded-sm border border-white/10 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className={`w-3 h-3 ${isUploadingVideo ? 'animate-bounce' : ''}`} /> {isUploadingVideo ? 'PROCESSING...' : 'UPLOAD VIDEO'}
                </label>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Genres (comma separated)</label>
              <input 
                type="text" 
                className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50"
                value={genreInput}
                onChange={e => setGenreInput(e.target.value)}
                placeholder="Action, Sci-Fi, Drama"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 md:col-span-2">
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Year</label>
                <input 
                  type="number" 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Duration</label>
                <input 
                  type="text" 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="2h 15m"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Maturity</label>
                <select 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 appearance-none text-sm"
                  value={formData.maturity}
                  onChange={e => setFormData({ ...formData, maturity: e.target.value })}
                >
                  <option value="All">All</option>
                  <option value="7+">7+</option>
                  <option value="12+">12+</option>
                  <option value="16+">16+</option>
                  <option value="18+">18+</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Season</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.season}
                  onChange={e => setFormData({ ...formData, season: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Episode</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.episode}
                  onChange={e => setFormData({ ...formData, episode: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-400">Air Date</label>
                <input 
                  type="date" 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm appearance-none"
                  value={formData.releaseDate}
                  onChange={e => setFormData({ ...formData, releaseDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm text-gray-400">Description</label>
              <textarea 
                required
                className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 min-h-[100px] resize-y"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief plot summary..."
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 flex-col sm:flex-row shadow-[0_-20px_20px_-15px_rgba(0,0,0,0.3)]">
            <button 
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingContent(null);
              }}
              className="px-6 py-2 border border-gray-500 text-gray-400 hover:text-white hover:border-white rounded-sm font-bold uppercase tracking-widest text-sm transition-colors text-center order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-sm font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <Upload className="w-4 h-4" />
              {editingContent ? 'Save Changes' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
