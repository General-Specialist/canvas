export interface FocusTag {
  id: string;
  name: string;
  color: string; // hex color
  createdAt: number;
}

export interface FocusSession {
  id: string;
  tagId: string;
  tagName: string;
  tagColor: string;
  taskTitle?: string;
  durationSeconds: number;
  mode?: string;
  startedAt: number;
  endedAt: number;
}

export type FocusBlockingMode = 'unlock_on_timer' | 'block_on_timer';

export interface FocusBlockerConfig {
  enabled: boolean;
  mode: FocusBlockingMode;
  blockedDomains: string[];
  unlockedUntil?: number | null;
  activeSiteStopwatches?: Record<string, number>; // domain -> startedAt timestamp
}

export const DEFAULT_BLOCKED_DOMAINS: string[] = [
  'youtube.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'instagram.com',
  'facebook.com',
  'tiktok.com',
  'twitch.tv',
  'netflix.com',
];

export const DEFAULT_BLOCKER_CONFIG: FocusBlockerConfig = {
  enabled: true,
  mode: 'unlock_on_timer',
  blockedDomains: DEFAULT_BLOCKED_DOMAINS,
  unlockedUntil: null,
};

export const DEFAULT_TAGS: FocusTag[] = [
  { id: 'tag-coding', name: 'Coding', color: '#58CC02', createdAt: 1 },
  { id: 'tag-research', name: 'Research', color: '#1CB0F6', createdAt: 2 },
  { id: 'tag-writing', name: 'Writing', color: '#CE82FF', createdAt: 3 },
  { id: 'tag-design', name: 'Design', color: '#FF9600', createdAt: 4 },
  { id: 'tag-reading', name: 'Reading', color: '#FFC800', createdAt: 5 },
  { id: 'tag-planning', name: 'Planning', color: '#2B70C9', createdAt: 6 },
];

export const TAG_COLORS = [
  '#58CC02', // Duolingo Green
  '#1CB0F6', // Sky Blue
  '#CE82FF', // Purple
  '#FF9600', // Orange
  '#FFC800', // Yellow
  '#FF4B4B', // Red
  '#2B70C9', // Navy
  '#00D2D3', // Teal
  '#FF9FF3', // Pink
  '#777777', // Gray
];

/**
 * Normalizes a raw URL or domain string into a clean hostname (e.g. "https://www.youtube.com/watch" -> "youtube.com")
 */
export function normalizeDomain(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')
    .replace(/^m\./, '');
}

/**
 * Normalizes a raw domain or URL into a clean, human-friendly tag name without domain extensions (.com, .org, etc.)
 * e.g. "youtube.com" -> "YouTube", "reddit.com" -> "Reddit", "twitch.tv" -> "Twitch", "instagram.com" -> "Instagram"
 */
export function getDomainTagName(raw: string): string {
  let cleaned = normalizeDomain(raw);
  if (!cleaned) return 'Focus';


  // Strip multi-part TLDs (e.g. .co.uk, .com.au, .co.jp)
  cleaned = cleaned.replace(/\.(co|com|org|net|gov|edu|ac)\.[a-z]{2,4}$/i, '');

  // Strip single-part TLDs (.com, .org, .net, .io, .ai, .tv, .co, .app, .dev, .me, etc.)
  cleaned = cleaned.replace(/\.(com|org|net|edu|gov|mil|io|ai|tv|co|app|dev|me|info|biz|xyz|site|online|tech|store|cc|to|is|gg|so|fm|page|link)$/i, '');
  cleaned = cleaned.replace(/\.[a-z]{2,6}$/i, '');

  if (!cleaned) return raw.trim();

  // Known brand casing
  const BRAND_CASING: Record<string, string> = {
    youtube: 'YouTube',
    twitter: 'Twitter',
    x: 'X',
    reddit: 'Reddit',
    instagram: 'Instagram',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    twitch: 'Twitch',
    netflix: 'Netflix',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    google: 'Google',
    discord: 'Discord',
    threads: 'Threads',
    spotify: 'Spotify',
    pinterest: 'Pinterest',
    amazon: 'Amazon',
    whatsapp: 'WhatsApp',
    hulu: 'Hulu',
  };

  if (BRAND_CASING[cleaned.toLowerCase()]) {
    return BRAND_CASING[cleaned.toLowerCase()];
  }

  // Capitalize words separated by hyphens, underscores, or dots
  return cleaned
    .split(/[-_.]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

