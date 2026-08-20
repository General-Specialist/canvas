import {
  DEFAULT_BLOCKER_CONFIG,
  DEFAULT_TAGS,
  FocusBlockerConfig,
  FocusSession,
  FocusTag,
  getDomainTagName,
} from '../types/focus';

export const getStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

const STORAGE_KEY_TAGS = 'jarvis_focus_tags_v1';
const STORAGE_KEY_SESSIONS = 'jarvis_focus_sessions_v1';
const STORAGE_KEY_BLOCKER = 'jarvis_focus_blocker_v1';

export const loadSavedBlockerConfig = (): FocusBlockerConfig => {
  const parsed = getStorage<FocusBlockerConfig>(STORAGE_KEY_BLOCKER, DEFAULT_BLOCKER_CONFIG);
  return { ...DEFAULT_BLOCKER_CONFIG, ...parsed };
};

export const saveBlockerConfig = (config: FocusBlockerConfig): void =>
  setStorage(STORAGE_KEY_BLOCKER, config);

export const loadSavedTags = (): FocusTag[] => {
  const fallback = DEFAULT_TAGS;
  const parsed = getStorage<FocusTag[]>(STORAGE_KEY_TAGS, fallback);
  if (!Array.isArray(parsed)) return fallback;

  const seen = new Set<string>();
  const cleanedTags: FocusTag[] = [];

  for (const tag of parsed) {
    if (!tag || !tag.name) continue;
    const name = getDomainTagName(tag.name.trim());
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    cleanedTags.push({
      ...tag,
      name,
    });
  }

  return cleanedTags.length > 0 ? cleanedTags : fallback;
};

export const saveTags = (tags: FocusTag[]): void =>
  setStorage(STORAGE_KEY_TAGS, tags);

export const loadSavedSessions = (): FocusSession[] => {
  const parsed = getStorage<FocusSession[]>(STORAGE_KEY_SESSIONS, []);
  if (!Array.isArray(parsed)) return [];

  return parsed.map((s) => ({
    ...s,
    tagName: s.tagName ? getDomainTagName(s.tagName) : s.tagName,
    taskTitle: s.taskTitle?.startsWith('Unblocked: ')
      ? `Unblocked: ${getDomainTagName(s.taskTitle.replace(/^Unblocked:\s*/, ''))}`
      : s.taskTitle,
  }));
};

export const saveSessions = (sessions: FocusSession[]): void =>
  setStorage(STORAGE_KEY_SESSIONS, sessions);


// Soft Web Audio chime generator (0 external dependencies)
export const playFocusSound = (type: 'start' | 'complete' | 'click' = 'complete') => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'complete') {
      // Gentle chord progression
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.15); // E5

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      gain2.gain.setValueAtTime(0.001, now + 0.2);
      gain2.gain.linearRampToValueAtTime(0.25, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc.start(now);
      osc2.start(now + 0.2);
      osc.stop(now + 1.2);
      osc2.stop(now + 1.4);
    }
  } catch {
    // ignore audio errors
  }
};
