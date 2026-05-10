import { X, Gamepad2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ContentItem } from '../data';

export function GameModeModal() {
  const { isGameModeModalOpen, setIsGameModeModalOpen, addGame, addNotification } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    apkUrl: '',
    developer: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  if (!isGameModeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ContentItem = {
      id: `game-${Date.now()}`,
      title: formData.title || 'Untitled Game',
      description: formData.description || 'No description provided.',
      thumbnail: formData.thumbnail || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
      videoUrl: formData.apkUrl, // Repurposed for APK/Game URL
      duration: 'Game',
      match: Math.floor(Math.random() * 20) + 80,
      year: new Date().getFullYear(),
      maturity: 'E',
      genres: ['Game', formData.developer].filter(Boolean)
    };
    
    addGame(newItem);
    addNotification('New game added successfully!', 'success');
    setIsGameModeModalOpen(false);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      apkUrl: '',
      developer: '',
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-center items-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141414] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md border border-white/10 shadow-2xl shadow-black">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/40 sticky top-0 z-10 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#E50914]" />
            Add Game App (APK/URL)
          </h2>
          <button 
            onClick={() => setIsGameModeModalOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Game Title</label>
              <input 
                required
                type="text" 
                className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Game Title"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm text-gray-400">Thumbnail</label>
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
                  id="game-thumbnail-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadstart = () => setIsUploading(true);
                      reader.onloadend = () => {
                        setFormData({ ...formData, thumbnail: reader.result as string });
                        setIsUploading(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="game-thumbnail-upload"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs py-2 px-3 rounded-sm border border-white/10 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className={`w-3 h-3 ${isUploading ? 'animate-bounce' : ''}`} /> {isUploading ? 'PROCESSING...' : 'UPLOAD PHOTO'}
                </label>
              </div>
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm text-gray-400">Game Content (APK/URL)</label>
              <div className="flex flex-col gap-2">
                <input 
                  required
                  type="text" 
                  className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 text-sm"
                  value={formData.apkUrl}
                  onChange={e => setFormData({ ...formData, apkUrl: e.target.value })}
                  placeholder="Game URL"
                />
                <input 
                  type="file" 
                  accept=".apk,video/*"
                  id="game-file-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadstart = () => setIsUploading(true);
                      reader.onloadend = () => {
                        setFormData({ ...formData, apkUrl: reader.result as string });
                        setIsUploading(false);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor="game-file-upload"
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs py-2 px-3 rounded-sm border border-white/10 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Upload className={`w-3 h-3 ${isUploading ? 'animate-bounce' : ''}`} /> {isUploading ? 'PROCESSING...' : 'UPLOAD GAME/APK'}
                </label>
              </div>
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm text-gray-400">Developer / Studio</label>
              <input 
                type="text" 
                className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50"
                value={formData.developer}
                onChange={e => setFormData({ ...formData, developer: e.target.value })}
                placeholder="Indie Studio"
              />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm text-gray-400">Description</label>
              <textarea 
                required
                className="w-full bg-[#333] text-white px-3 py-2 rounded-sm border-none outline-none focus:ring-1 focus:ring-white/50 min-h-[100px] resize-y"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief summary of the game..."
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 flex-col sm:flex-row shadow-[0_-20px_20px_-15px_rgba(0,0,0,0.3)]">
            <button 
              type="button"
              onClick={() => setIsGameModeModalOpen(false)}
              className="px-6 py-2 border border-gray-500 text-gray-400 hover:text-white hover:border-white rounded-sm font-bold uppercase tracking-widest text-sm transition-colors text-center order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-sm font-bold uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <Upload className="w-4 h-4" />
              Add Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
