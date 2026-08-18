import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  FocusBlockerConfig,
  FocusBlockingMode,
  FocusSession,
  FocusTag,
  TAG_COLORS,
  getDomainTagName,
  normalizeDomain,
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
    // If not in Tauri or during initial load, fallback to HTTP sync
    try {
      await fetch('http://127.0.0.1:43210/api/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}
  }
};

interface FocusContextType {
  tags: FocusTag[];
  selectedTagId: string;
  sessions: FocusSession[];
  elapsedSeconds: number;
  timerStartTime: number | null;
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

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [pausedDurationMs, setPausedDurationMs] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

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

  // Listen for data restore events (from Gist sync or JSON import)
  useEffect(() => {
    const handleRestore = () => {
      const reloadedTags = loadSavedTags();
      setTags(reloadedTags);
      if (reloadedTags.length > 0) {
        setSelectedTagId((prev) => (reloadedTags.some((t) => t.id === prev) ? prev : reloadedTags[0].id));
      }
      setSessions(loadSavedSessions());
      setBlockerConfig(loadSavedBlockerConfig());
    };
    window.addEventListener('jarvis-data-restored', handleRestore);
    return () => window.removeEventListener('jarvis-data-restored', handleRestore);
  }, []);

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
      mode: 'stopwatch',
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
    blockerConfig,
  ]);


  // Main stopwatch tick directly using real wall-clock timestamps (immune to background tab drift)
  useEffect(() => {
    if (!isRunning || !timerStartTime) {
      return;
    }

    const updateElapsed = () => {
      const now = isPaused && pausedAt ? pausedAt : Date.now();
      const totalElapsedMs = Math.max(0, now - timerStartTime - pausedDurationMs);
      setElapsedSeconds(Math.floor(totalElapsedMs / 1000));
    };

    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timerStartTime, pausedAt, pausedDurationMs]);

  const startTimer = useCallback(() => {
    playFocusSound('start');
    const now = Date.now();
    setTimerStartTime(now);
    setPausedAt(null);
    setPausedDurationMs(0);
    setElapsedSeconds(0);
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    if (!isRunning || isPaused) return;
    setPausedAt(Date.now());
    setIsPaused(true);
  }, [isRunning, isPaused]);

  const resumeTimer = useCallback(() => {
    if (!isRunning || !isPaused) return;
    if (pausedAt) {
      setPausedDurationMs((prev) => prev + (Date.now() - pausedAt));
    }
    setPausedAt(null);
    setIsPaused(false);
  }, [isRunning, isPaused, pausedAt]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimerStartTime(null);
    setPausedAt(null);
    setPausedDurationMs(0);
    setElapsedSeconds(0);
  }, []);

  const finishSession = useCallback(() => {
    playFocusSound('complete');

    const endTimestamp = isPaused && pausedAt ? pausedAt : Date.now();
    const startTimestamp = timerStartTime || endTimestamp - elapsedSeconds * 1000;
    const duration = Math.max(1, elapsedSeconds);
    const currentActiveTag = tags.find((t) => t.id === selectedTagId) || tags[0];

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
    setTimerStartTime(null);
    setPausedAt(null);
    setPausedDurationMs(0);
    setElapsedSeconds(0);
  }, [isPaused, pausedAt, timerStartTime, elapsedSeconds, tags, selectedTagId]);

  const updateBlockerConfig = useCallback((partial: Partial<FocusBlockerConfig>) => {
    setBlockerConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const addBlockedDomain = useCallback((domain: string) => {
    const cleaned = normalizeDomain(domain);
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
    const cleaned = normalizeDomain(domain);
    if (!cleaned) return;
    playFocusSound('start');
    setBlockerConfig((prev) => ({
      ...prev,
      activeSiteStopwatches: {
        ...(prev.activeSiteStopwatches || {}),
        [cleaned]: Date.now(),
      },
    }));
  }, []);

  const stopSiteStopwatch = useCallback(
    (domain: string) => {
      const rawDomain = domain.trim();
      if (!rawDomain) return;

      const cleanedHost = normalizeDomain(rawDomain);
      if (!cleanedHost) return;

      const targetTagName = getDomainTagName(cleanedHost);
      const targetTagLower = targetTagName.toLowerCase();

      // Retrieve start timestamp
      const startedAt =
        blockerConfig.activeSiteStopwatches?.[cleanedHost] ||
        blockerConfig.activeSiteStopwatches?.[rawDomain] ||
        blockerConfig.activeSiteStopwatches?.[domain];
      const endedAt = Date.now();
      const startTimestamp = startedAt || endedAt - 1000;
      const duration = Math.max(1, Math.round((endedAt - startTimestamp) / 1000));

      // Remove stopwatch from activeSiteStopwatches (re-locks the website)
      setBlockerConfig((prev) => {
        const copy = { ...(prev.activeSiteStopwatches || {}) };
        delete copy[cleanedHost];
        delete copy[rawDomain];
        delete copy[domain];
        return {
          ...prev,
          activeSiteStopwatches: copy,
        };
      });

      // If open for less than 1 minute (< 60s), do not record the session in the app
      if (duration < 60) {
        return;
      }

      // 1. Resolve existing tag or create a new clean tag (without .com)
      let targetTag = tags.find((t) => {
        const tLower = t.name.toLowerCase().trim();
        return (
          tLower === targetTagLower ||
          tLower === cleanedHost ||
          tLower === rawDomain.toLowerCase() ||
          getDomainTagName(t.name).toLowerCase() === targetTagLower
        );
      });

      if (!targetTag) {
        const colorIndex = tags.length;
        const newTag: FocusTag = {
          id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: targetTagName,
          color: TAG_COLORS[colorIndex % TAG_COLORS.length],
          createdAt: Date.now(),
        };
        targetTag = newTag;

        setTags((prev) => {
          const alreadyExists = prev.some((t) => {
            const tLower = t.name.toLowerCase().trim();
            return (
              tLower === targetTagLower ||
              tLower === cleanedHost ||
              getDomainTagName(t.name).toLowerCase() === targetTagLower
            );
          });
          if (alreadyExists) return prev;
          return [...prev, newTag];
        });
      }

      // 2. Create focus session block for this unblock duration
      const newSession: FocusSession = {
        id: `session-${endedAt}-${Math.random().toString(36).substring(2, 6)}`,
        tagId: targetTag.id,
        tagName: targetTag.name,
        tagColor: targetTag.color,
        taskTitle: `Unblocked: ${targetTagName}`,
        durationSeconds: duration,
        mode: 'stopwatch',
        startedAt: startTimestamp,
        endedAt,
      };

      setSessions((prev) => [newSession, ...prev]);
      playFocusSound('complete');
    },
    [tags, blockerConfig.activeSiteStopwatches]
  );

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
    setTimerStartTime(Date.now());
    setPausedAt(null);
    setPausedDurationMs(0);
    setElapsedSeconds(0);
    setIsRunning(true);
    setIsPaused(false);
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
      mode: 'stopwatch',
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
        elapsedSeconds,
        timerStartTime,
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
