import { Play, Plus, ThumbsUp, ChevronDown, Check, Download, Share2, Volume2, VolumeX, Maximize, Settings, Search, Bell, User } from 'lucide-react';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  duration: string;
  match: number;
  year: number;
  maturity: string;
  genres: string[];
  progress?: number; // 0-100
  rating?: number; // 1-5
  season?: number;
  episode?: number;
  releaseDate?: string;
  seriesThumbnail?: string;
  seriesDescription?: string;
  homeCategories?: string[];
}

export const CURRENT_USER = {
  name: "User",
  avatar: "https://upload.wikimedia.org/wikipedia/en/0/02/Homer_Simpson_2006.png",
  profiles: [],
  watchlist: []
};

export const TRENDING_NOW: ContentItem[] = [];

export const FOR_YOU: ContentItem[] = [];

export const NEW_RELEASES: ContentItem[] = [];
