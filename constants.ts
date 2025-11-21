import { Chat } from './types';

// Wallie.io is a public Gun relay. You can add more if needed.
export const GUN_PEERS = [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://peer.wallie.io/gun'
];

export const APP_NAMESPACE = 'reactgram_v_2_0'; // Change this to reset DB

export const DEFAULT_CHANNELS: Chat[] = [
  {
    id: 'general_chat',
    name: 'General Chat',
    type: 'group',
    participants: [],
    unreadCount: 0,
    avatar: 'https://ui-avatars.com/api/?name=General&background=3b82f6&color=fff'
  },
  {
    id: 'tech_talk',
    name: 'Tech Talk',
    type: 'group',
    participants: [],
    unreadCount: 0,
    avatar: 'https://ui-avatars.com/api/?name=Tech&background=10b981&color=fff'
  },
  {
    id: 'random',
    name: 'Random',
    type: 'group',
    participants: [],
    unreadCount: 0,
    avatar: 'https://ui-avatars.com/api/?name=Random&background=f59e0b&color=fff'
  }
];

export const WALLPAPER_PATTERN = `
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.05">
  <path d="M20 20L30 30M70 70L80 80" stroke="currentColor" stroke-width="2" />
  <circle cx="50" cy="50" r="10" stroke="currentColor" stroke-width="2" />
  <rect x="10" y="60" width="10" height="10" stroke="currentColor" stroke-width="2" />
</svg>
`;