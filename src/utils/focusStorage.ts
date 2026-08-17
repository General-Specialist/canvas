import { DEFAULT_TAGS, FocusSession, FocusTag } from '../types/focus';

const STORAGE_KEY_TAGS = 'jarvis_focus_tags_v1';
const STORAGE_KEY_SESSIONS = 'jarvis_focus_sessions_v1';

export const loadSavedTags = (): FocusTag[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TAGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load focus tags:', err);
  }
  return DEFAULT_TAGS;
};

export const saveTags = (tags: FocusTag[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(tags));
  } catch (err) {
    console.error('Failed to save focus tags:', err);
  }
};

const createDefaultSessions = (): FocusSession[] => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  const start1 = new Date(y, m, d, 9, 30, 0).getTime();
  const end1 = new Date(y, m, d, 10, 15, 0).getTime();

  const start2 = new Date(y, m, d, 11, 0, 0).getTime();
  const end2 = new Date(y, m, d, 12, 30, 0).getTime();

  const start3 = new Date(y, m, d, 14, 0, 0).getTime();
  const end3 = new Date(y, m, d, 15, 0, 0).getTime();

  return [
    {
      id: 'session-sample-3',
      tagId: 'tag-design',
      tagName: 'Design',
      tagColor: '#FF9600',
      durationSeconds: 3600,
      mode: 'stopwatch',
      startedAt: start3,
      endedAt: end3,
    },
    {
      id: 'session-sample-2',
      tagId: 'tag-coding',
      tagName: 'Coding',
      tagColor: '#58CC02',
      durationSeconds: 5400,
      mode: 'stopwatch',
      startedAt: start2,
      endedAt: end2,
    },
    {
      id: 'session-sample-1',
      tagId: 'tag-planning',
      tagName: 'Planning',
      tagColor: '#2B70C9',
      durationSeconds: 2700,
      mode: 'stopwatch',
      startedAt: start1,
      endedAt: end1,
    },
  ];
};

export const loadSavedSessions = (): FocusSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load focus sessions:', err);
  }
  return createDefaultSessions();
};

export const saveSessions = (sessions: FocusSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save focus sessions:', err);
  }
};

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
