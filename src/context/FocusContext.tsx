import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  FocusBlockerConfig,
  FocusBlockingMode,
  FocusSession,
  FocusTag,
  FocusTimerMode,
  TAG_COLORS,
} from '../types/focus';

import {
  loadSavedBlockerConfig,
  loadSavedSessions,
  loadSavedTags,
  playFocusSound,
  saveBlockerConfig,
  saveSessions,
  saveTags,
} from '../utils/focusStorage';

// Safe Tauri state sync helper
const syncToTauriBridge = async (payload: {
  isRunning: boolean;
  isPaused: boolean;
  selectedTagId: string;
  selectedTagName: string;
  selectedTagColor: string;
  elapsedSeconds: number;
  mode: string;
  blockingEnabled: boolean;
  blockingMode: string;
  blockedDomains: string[];
  unlockedUntil: number | null;
  activeSiteStopwatches: Record<string, number>;
  lastUpdated: number;
}) => {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('update_focus_state', { newState: payload });
  } catch {
    // If not in Tauri or during initial load, fallback gracefully
  }
};

interface FocusContextType {
  tags: FocusTag[];
  selectedTagId: string;
  sessions: FocusSession[];
  mode: FocusTimerMode;
  selectedMinutes: number;
  timeLeft: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  selectedTag: FocusTag | undefined;
  // Blocker Config
  blockerConfig: FocusBlockerConfig;
  updateBlockerConfig: (partial: Partial<FocusBlockerConfig>) => void;
  addBlockedDomain: (domain: string) => void;
  removeBlockedDomain: (domain: string) => void;
  setBlockingMode: (mode: FocusBlockingMode) => void;
  toggleBlockingEnabled: () => void;
  tempUnlock: (minutes: number) => void;
  startSiteStopwatch: (domain: string) => void;
  stopSiteStopwatch: (domain: string) => void;


  // Timer Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  finishSession: () => void;
  setMode: (mode: FocusTimerMode) => void;
  setSelectedMinutes: (mins: number) => void;
  setCustomDuration: (seconds: number) => void;
  setSelectedTagId: (id: string) => void;
  createTag: (name: string, color?: string) => void;
  createMultipleTags: (names: string[], baseColor?: string) => void;
  updateTag: (id: string, partial: Partial<FocusTag>) => void;
  deleteTag: (id: string) => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
  restartSession: (session: FocusSession) => void;
  addManualSession: (data: {
    tagId: string;
    startedAt: number;
    endedAt: number;
  }) => void;
  updateSession: (id: string, partial: Partial<FocusSession>) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<FocusTag[]>(loadSavedTags);
  const [selectedTagId, setSelectedTagId] = useState<string>(() => loadSavedTags()[0]?.id || 'tag-coding');
  const [sessions, setSessions] = useState<FocusSession[]>(loadSavedSessions);
  const [blockerConfig, setBlockerConfig] = useState<FocusBlockerConfig>(loadSavedBlockerConfig);

  const [mode] = useState<FocusTimerMode>('stopwatch');
  const [selectedMinutes] = useState<number>(25);
  const [timeLeft] = useState<number>(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Save tags & sessions whenever they change
  useEffect(() => {
    saveTags(tags);
  }, [tags]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveBlockerConfig(blockerConfig);
  }, [blockerConfig]);

  const selectedTag = tags.find((t) => t.id === selectedTagId) || tags[0];

  // Sync state to Tauri backend whenever key fields update
  useEffect(() => {
    syncToTauriBridge({
      isRunning,
      isPaused,
      selectedTagId: selectedTag?.id || 'tag-coding',
      selectedTagName: selectedTag?.name || 'Focus',
      selectedTagColor: selectedTag?.color || '#58CC02',
      elapsedSeconds,
      mode,
      blockingEnabled: blockerConfig.enabled,
      blockingMode: blockerConfig.mode,
      blockedDomains: blockerConfig.blockedDomains,
      unlockedUntil: blockerConfig.unlockedUntil ?? null,
      activeSiteStopwatches: blockerConfig.activeSiteStopwatches || {},
      lastUpdated: Date.now(),
    });


  }, [
    isRunning,
    isPaused,
    selectedTag,
    elapsedSeconds,
    mode,
    blockerConfig,
  ]);

  const setMode = useCallback(() => {}, []);
  const setSelectedMinutes = useCallback(() => {}, []);
  const setCustomDuration = useCallback(() => {}, []);

  const finishSession = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    playFocusSound('complete');

    const duration = Math.max(1, elapsedSeconds);
    const currentActiveTag = tags.find((t) => t.id === selectedTagId) || tags[0];
    const endTimestamp = Date.now();
    const startTimestamp = endTimestamp - duration * 1000;

    const newSession: FocusSession = {
      id: `session-${endTimestamp}`,
      tagId: currentActiveTag.id,
      tagName: currentActiveTag.name,
      tagColor: currentActiveTag.color,
      durationSeconds: duration,
      mode: 'stopwatch',
      startedAt: startTimestamp,
      endedAt: endTimestamp,
    };

    setSessions((prev) => [newSession, ...prev]);

    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
  }, [elapsedSeconds, tags, selectedTagId]);

  // Main stopwatch tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  const startTimer = useCallback(() => {
    playFocusSound('start');
    sessionStartTimeRef.current = Date.now();
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
  }, []);

  const updateBlockerConfig = useCallback((partial: Partial<FocusBlockerConfig>) => {
    setBlockerConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const addBlockedDomain = useCallback((domain: string) => {
    const cleaned = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');
    if (!cleaned) return;

    setBlockerConfig((prev) => {
      if (prev.blockedDomains.includes(cleaned)) return prev;
      return {
        ...prev,
        blockedDomains: [...prev.blockedDomains, cleaned],
      };
    });
  }, []);

  const removeBlockedDomain = useCallback((domain: string) => {
    setBlockerConfig((prev) => ({
      ...prev,
      blockedDomains: prev.blockedDomains.filter((d) => d !== domain),
    }));
  }, []);

  const setBlockingMode = useCallback((mode: FocusBlockingMode) => {
    setBlockerConfig((prev) => ({ ...prev, mode }));
  }, []);

  const toggleBlockingEnabled = useCallback(() => {
    setBlockerConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const tempUnlock = useCallback((minutes: number) => {
    const unlockTime = Date.now() + minutes * 60 * 1000;
    setBlockerConfig((prev) => ({ ...prev, unlockedUntil: unlockTime }));
  }, []);

  const startSiteStopwatch = useCallback((domain: string) => {
    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    playFocusSound('start');
    setBlockerConfig((prev) => ({
      ...prev,
      activeSiteStopwatches: {
        ...(prev.activeSiteStopwatches || {}),
        [cleaned]: Date.now(),
      },
    }));
  }, []);

  const stopSiteStopwatch = useCallback((domain: string) => {
    const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    playFocusSound('complete');
    setBlockerConfig((prev) => {
      const copy = { ...(prev.activeSiteStopwatches || {}) };
      delete copy[cleaned];
      return {
        ...prev,
        activeSiteStopwatches: copy,
      };
    });
  }, []);



  const createTag = useCallback((name: string, color?: string) => {
    if (!name.trim()) return;
    const newTag: FocusTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim().replace(/^#/, ''),
      color: color || TAG_COLORS[tags.length % TAG_COLORS.length],
      createdAt: Date.now(),
    };
    setTags((prev) => [...prev, newTag]);
    setSelectedTagId(newTag.id);
  }, [tags.length]);

  const createMultipleTags = useCallback((names: string[], baseColor?: string) => {
    const validNames = names
      .map((n) => n.trim().replace(/^#/, ''))
      .filter(Boolean);
    if (validNames.length === 0) return;

    setTags((prev) => {
      let colorIndex = prev.length;
      const newTags: FocusTag[] = validNames.map((name, i) => ({
        id: `tag-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        color: (i === 0 && baseColor) ? baseColor : TAG_COLORS[(colorIndex + i) % TAG_COLORS.length],
        createdAt: Date.now() + i,
      }));
      if (newTags.length > 0) {
        setSelectedTagId(newTags[0].id);
      }
      return [...prev, ...newTags];
    });
  }, []);

  const updateTag = useCallback((id: string, partial: Partial<FocusTag>) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
    );
    if (partial.color || partial.name) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.tagId === id) {
            return {
              ...s,
              tagColor: partial.color ?? s.tagColor,
              tagName: partial.name ?? s.tagName,
            };
          }
          return s;
        })
      );
    }
  }, []);

  const deleteTag = useCallback((id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    if (selectedTagId === id) {
      const remaining = tags.filter((t) => t.id !== id);
      if (remaining.length > 0) setSelectedTagId(remaining[0].id);
    }
  }, [selectedTagId, tags]);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAllSessions = useCallback(() => {
    setSessions([]);
  }, []);

  const restartSession = useCallback((session: FocusSession) => {
    setSelectedTagId(session.tagId);
    setElapsedSeconds(0);
    setIsRunning(true);
    setIsPaused(false);
    sessionStartTimeRef.current = Date.now();
    playFocusSound('start');
  }, []);

  const addManualSession = useCallback((data: {
    tagId: string;
    startedAt: number;
    endedAt: number;
  }) => {
    const targetTag = tags.find((t) => t.id === data.tagId) || tags[0];
    const duration = Math.max(1, Math.round((data.endedAt - data.startedAt) / 1000));
    const newSession: FocusSession = {
      id: `session-${Date.now()}`,
      tagId: targetTag.id,
      tagName: targetTag.name,
      tagColor: targetTag.color,
      durationSeconds: duration,
      mode: 'countdown',
      startedAt: data.startedAt,
      endedAt: data.endedAt,
    };
    setSessions((prev) => [newSession, ...prev]);
  }, [tags]);

  const updateSession = useCallback((id: string, partial: Partial<FocusSession>) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...partial };
        if (partial.tagId) {
          const targetTag = tags.find((t) => t.id === partial.tagId);
          if (targetTag) {
            updated.tagName = targetTag.name;
            updated.tagColor = targetTag.color;
          }
        }
        if (partial.startedAt || partial.endedAt) {
          const start = partial.startedAt ?? s.startedAt;
          const end = partial.endedAt ?? s.endedAt;
          updated.durationSeconds = Math.max(1, Math.round((end - start) / 1000));
        }
        return updated;
      })
    );
  }, [tags]);

  return (
    <FocusContext.Provider
      value={{
        tags,
        selectedTagId,
        sessions,
        mode,
        selectedMinutes,
        timeLeft,
        elapsedSeconds,
        isRunning,
        isPaused,
        selectedTag,
        blockerConfig,
        updateBlockerConfig,
        addBlockedDomain,
        removeBlockedDomain,
        setBlockingMode,
        toggleBlockingEnabled,
        tempUnlock,
        startSiteStopwatch,
        stopSiteStopwatch,
        startTimer,


        pauseTimer,
        resumeTimer,
        resetTimer,
        finishSession,
        setMode,
        setSelectedMinutes,
        setCustomDuration,
        setSelectedTagId,
        createTag,
        createMultipleTags,
        updateTag,
        deleteTag,
        deleteSession,
        clearAllSessions,
        restartSession,
        addManualSession,
        updateSession,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = (): FocusContextType => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
