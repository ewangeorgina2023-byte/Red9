import { ContentItem, CURRENT_USER } from './data';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  isKids?: boolean;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppState {
  profiles: Profile[];
  addProfile: (profile: Omit<Profile, 'id'>) => void;
  updateProfile: (id: string, profile: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  activeModalContent: ContentItem | null;
  setActiveModalContent: (content: ContentItem | null, autoPlay?: boolean) => void;
  shouldAutoPlay: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchActive: boolean;
  setIsSearchActive: (isActive: boolean) => void;
  ratings: Record<string, number>;
  rateContent: (id: string, rating: number) => void;
  progress: Record<string, { time: number; percentage: number }>;
  updateProgress: (id: string, time: number, percentage: number) => void;
  lastSeriesEpisode: Record<string, string>; // normalized title -> contentId
  setLastSeriesEpisode: (normalizedTitle: string, contentId: string) => void;
  customContent: ContentItem[];
  addCustomContent: (item: ContentItem) => void;
  updateCustomContent: (item: ContentItem) => void;
  deleteCustomContent: (id: string) => void;
  editingContent: ContentItem | null;
  setEditingContent: (item: ContentItem | null) => void;
  notifications: AppNotification[];
  addNotification: (message: string, type: 'success' | 'info' | 'error') => void;
  removeNotification: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (isOpen: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  settingsModalTab: 'account' | 'parental';
  setSettingsModalTab: (tab: 'account' | 'parental') => void;
  isManagingProfiles: boolean;
  setIsManagingProfiles: (isManaging: boolean) => void;
  isGameModeModalOpen: boolean;
  setIsGameModeModalOpen: (isOpen: boolean) => void;
  games: ContentItem[];
  addGame: (item: ContentItem) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [...CURRENT_USER.profiles],
      addProfile: (profile) => set((state) => ({ profiles: [...state.profiles, { ...profile, id: Date.now().toString() }] })),
      updateProfile: (id, updated) => set((state) => ({ 
        profiles: state.profiles.map(p => p.id === id ? { ...p, ...updated } : p),
        currentProfile: state.currentProfile?.id === id ? { ...state.currentProfile, ...updated } : state.currentProfile
      })),
      deleteProfile: (id) => set((state) => ({ 
        profiles: state.profiles.filter(p => p.id !== id),
        currentProfile: state.currentProfile?.id === id ? null : state.currentProfile
      })),
      currentProfile: null,
      setCurrentProfile: (profile) => set({ currentProfile: profile }),
      watchlist: [],
      toggleWatchlist: (id) => {
        const state = get();
        const newWatchlist = [...state.watchlist];
        const index = newWatchlist.indexOf(id);
        if (index > -1) {
          newWatchlist.splice(index, 1);
          state.addNotification('Removed from watchlist', 'info');
        } else {
          newWatchlist.push(id);
          state.addNotification('Added to watchlist', 'success');
        }
        set({ watchlist: newWatchlist });
      },
      activeModalContent: null,
      setActiveModalContent: (content, autoPlay = false) => set({ activeModalContent: content, shouldAutoPlay: autoPlay }),
      shouldAutoPlay: false,
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      isSearchActive: false,
      setIsSearchActive: (isActive) => set({ isSearchActive: isActive }),
      ratings: {},
      rateContent: (id, rating) => {
        const state = get();
        state.addNotification(`Rated ${rating} star${rating > 1 ? 's' : ''}`, 'success');
        set((state) => ({ ratings: { ...state.ratings, [id]: rating } }));
      },
      progress: {},
      updateProgress: (id, time, percentage) => set((state) => ({ 
        progress: { ...state.progress, [id]: { time, percentage } } 
      })),
      lastSeriesEpisode: {},
      setLastSeriesEpisode: (normalizedTitle, contentId) => set((state) => ({
        lastSeriesEpisode: { ...state.lastSeriesEpisode, [normalizedTitle.toLowerCase().trim()]: contentId }
      })),
      customContent: [],
      addCustomContent: (item) => set((state) => ({ customContent: [item, ...state.customContent] })),
      updateCustomContent: (item) => set((state) => ({ 
        customContent: state.customContent.map(c => c.id === item.id ? item : c)
      })),
      deleteCustomContent: (id) => set((state) => ({ 
        customContent: state.customContent.filter(c => c.id !== id)
      })),
      editingContent: null,
      setEditingContent: (item) => set({ editingContent: item }),
      notifications: [],
      addNotification: (message, type) => set((state) => ({ 
        notifications: [...state.notifications, { id: Date.now().toString(), message, type }] 
      })),
      removeNotification: (id) => set((state) => ({ 
        notifications: state.notifications.filter(n => n.id !== id) 
      })),
      isAddModalOpen: false,
      setIsAddModalOpen: (isOpen) => set({ isAddModalOpen: isOpen }),
      isSettingsModalOpen: false,
      setIsSettingsModalOpen: (isOpen) => set({ isSettingsModalOpen: isOpen }),
      settingsModalTab: 'account',
      setSettingsModalTab: (tab) => set({ settingsModalTab: tab }),
      isManagingProfiles: false,
      setIsManagingProfiles: (isManaging) => set({ isManagingProfiles: isManaging }),
      isGameModeModalOpen: false,
      setIsGameModeModalOpen: (isOpen) => set({ isGameModeModalOpen: isOpen }),
      games: [],
      addGame: (item) => set((state) => ({ games: [item, ...state.games] })),
      isMuted: false,
      setIsMuted: (muted) => set({ isMuted: muted }),
    }),
    {
      name: 'netflix-clone-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profiles: state.profiles,
        currentProfile: state.currentProfile,
        watchlist: state.watchlist,
        ratings: state.ratings,
        progress: state.progress,
        lastSeriesEpisode: state.lastSeriesEpisode,
        customContent: state.customContent,
        games: state.games,
        editingContent: state.editingContent,
        isMuted: state.isMuted,
      }),
    }
  )
);
