import { Search, Bell, User, Settings, LogOut, ChevronDown, Plus, Gamepad2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { CURRENT_USER } from '../data';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentProfile, setCurrentProfile, isSearchActive, setIsSearchActive, searchQuery, setSearchQuery, profiles, setIsAddModalOpen, setIsSettingsModalOpen, setSettingsModalTab } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="h-16 px-8 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div 
            className="text-3xl font-black tracking-tighter text-[#E50914] italic cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            RED9
          </div>
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-white hover:text-white transition-colors">Home</a>
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-white transition-colors">TV Shows</a>
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-white transition-colors">Movies</a>
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-white transition-colors">New & Popular</a>
            <a href="#" onClick={e => e.preventDefault()} className="hover:text-white transition-colors">My Watchlist</a>
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-300">
          <div className="flex items-center gap-2">
            {isSearchActive ? (
              <div className="flex items-center bg-black/40 border border-white/20 rounded-md px-3 py-1.5 w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search titles, people, genres"
                  className="bg-transparent border-none outline-none text-gray-300 text-xs px-2 w-full transition-all placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setIsSearchActive(false)}
                />
              </div>
            ) : (
              <button onClick={() => setIsSearchActive(true)} className="hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button className="hover:text-white transition-colors hidden sm:block">
            <span className="text-sm font-medium">Kids</span>
          </button>
          
          <button 
            className="hover:text-white transition-colors"
            onClick={() => setIsAddModalOpen(true)}
            title="Upload Content"
          >
            <Plus className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
          </button>
          
          <div 
            className="relative"
            ref={notificationRef}
          >
            <button 
              className="hover:text-white transition-colors relative py-2"
              onClick={() => {
                setShowNotifications(!showNotifications);
                const badge = document.getElementById('notif-badge');
                if (badge) badge.style.display = 'none';
              }}
            >
              <Bell className="w-6 h-6 text-gray-300" />
              <div id="notif-badge" className="absolute top-2 right-0 w-2 h-2 bg-[#E50914] rounded-full border-2 border-[#0a0a0a]"></div>
            </button>

            {/* Notifications Dropdown */}
            <div className={`absolute top-full -right-16 md:-right-24 pt-2 w-80 max-w-[calc(100vw-32px)] transition-all duration-200 z-[100] ${showNotifications ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <div className="bg-black/95 border border-white/10 rounded-md py-2 flex flex-col shadow-2xl">
                <div className="px-4 py-3 border-b border-white/10">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <button className="flex gap-4 p-4 hover:bg-white/10 w-full text-left transition-colors border-b border-white/5 last:border-0">
                    <img src="https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=150&q=80" alt="New release" className="w-16 h-12 object-cover rounded-sm" />
                    <div>
                      <p className="text-sm font-medium text-white mb-1 leading-snug">New Arrival</p>
                      <p className="text-xs text-gray-400">The latest big movie just landed. Watch it now.</p>
                      <p className="text-[10px] text-gray-500 mt-2">2 hours ago</p>
                    </div>
                  </button>
                  <button className="flex gap-4 p-4 hover:bg-white/10 w-full text-left transition-colors border-b border-white/5 last:border-0">
                    <div className="w-16 h-12 bg-[#E50914] rounded-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-white">RED9</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white mb-1 leading-snug">Top Pick For You</p>
                      <p className="text-xs text-gray-400">Check out this new show we think you'll love.</p>
                      <p className="text-[10px] text-gray-500 mt-2">Yesterday</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="relative flex items-center gap-2 cursor-pointer py-2"
            ref={dropdownRef}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img 
              src={currentProfile?.avatar || CURRENT_USER.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-md object-contain bg-zinc-900/50"
              referrerPolicy="no-referrer"
            />
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            
            <div className={`absolute top-full right-0 pt-2 w-48 transition-all duration-200 z-[100] ${showDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <div className="bg-black/95 border border-white/10 rounded-md py-2 flex flex-col shadow-2xl">
                <button 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-sm w-full font-bold text-[#E50914] bg-white/5"
                  onClick={() => {
                    useAppStore.getState().setIsGameModeModalOpen(true);
                  }}
                >
                  <Gamepad2 className="w-5 h-5" /> 
                  <span className="tracking-wider">GAME MODE</span>
                </button>
                <div className="h-px bg-white/10 my-2 w-full"></div>
                {profiles.filter(p => p.id !== currentProfile?.id).map(profile => (
                  <button 
                    key={profile.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 w-full"
                    onClick={() => {
                      setCurrentProfile(profile);
                    }}
                  >
                    <img src={profile.avatar} alt={profile.name} className="w-6 h-6 rounded-sm object-contain bg-zinc-900/50" referrerPolicy="no-referrer" />
                    <span className="text-sm">{profile.name}</span>
                  </button>
                ))}
                <div className="h-px bg-white/10 my-2 w-full"></div>
                <button 
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-sm w-full"
                  onClick={() => {
                    useAppStore.getState().setCurrentProfile(null);
                    useAppStore.getState().setIsManagingProfiles(true);
                  }}
                >
                  <User className="w-4 h-4" /> Manage Profiles
                </button>
                <div className="h-px bg-white/10 my-2 w-full"></div>
                <button 
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-sm w-full"
                  onClick={() => {
                    setSettingsModalTab('account');
                    setIsSettingsModalOpen(true);
                  }}
                >
                  <Settings className="w-4 h-4" /> Account
                </button>
                <button 
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-sm w-full"
                  onClick={() => {
                    setSettingsModalTab('parental');
                    setIsSettingsModalOpen(true);
                  }}
                >
                  <Settings className="w-4 h-4" /> Parent Controls
                </button>
                <div className="h-px bg-white/10 my-2 w-full"></div>
                <button 
                  className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 text-sm w-full"
                  onClick={() => setCurrentProfile(null)}
                >
                  <LogOut className="w-4 h-4" /> Sign out of RED9
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
