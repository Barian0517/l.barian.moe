import { LucideIcon } from 'lucide-react';
import React from 'react';

export interface SocialLink {
  platform: string;
  url: string;
  icon: LucideIcon | React.FC<{ className?: string; size?: number | string }>;
  color?: string;
}

export interface GameItem {
  name: string;
  description?: string; // For "推> xxx"
}

export interface CategoryGroup {
  title: string;
  items: (string | GameItem)[];
}

export interface MusicTrack {
  title: string;
  artist: string;
  url: string;
}

export interface ProfileData {
  displayName: string;
  quote: string;
  avatarUrl: string;
  backgroundUrl: string;
  backgroundType: 'image' | 'video'; // Added to support video backgrounds
  popupMessage: {
    title: string;
    text: string;
  };
  about: {
    name: string;
    nicknames: string;
    age: string;
    location: string;
    dislikes: string;
    habits: string[];
  };
  activity: {
    socialPriority: string;
    hours: string[];
    note: string;
  };
  games: CategoryGroup[];
  anime: CategoryGroup[];
  music: MusicTrack[];
}