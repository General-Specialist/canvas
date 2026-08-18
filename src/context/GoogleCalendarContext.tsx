import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { GoogleCalendarEvent, GoogleCalendarFeed } from '../types/googleCalendar';
import {
  loadSavedFeeds,
  saveFeeds,
  loadSavedGCalEvents,
  saveGCalEvents,
  loadShowGCalPreference,
  saveShowGCalPreference,
  syncSingleCalendar,
} from '../utils/googleCalendarSync';
import { parseIcsContent } from '../utils/icalParser';

interface GoogleCalendarContextType {
  feeds: GoogleCalendarFeed[];
  events: GoogleCalendarEvent[];
  isSyncing: boolean;
  showGCalEvents: boolean;
  setShowGCalEvents: (show: boolean) => void;
  addCalendar: (name: string, url: string, color: string) => Promise<boolean>;
  updateCalendar: (id: string, partial: Partial<GoogleCalendarFeed>) => void;
  removeCalendar: (id: string) => void;
  syncCalendar: (id: string) => Promise<void>;
  syncAllCalendars: () => Promise<void>;
  importIcsFile: (name: string, icsContent: string, color?: string) => Promise<void>;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType | undefined>(undefined);

export const GoogleCalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feeds, setFeeds] = useState<GoogleCalendarFeed[]>(loadSavedFeeds);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>(loadSavedGCalEvents);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showGCalEvents, setShowGCalEventsState] = useState<boolean>(loadShowGCalPreference);

  const feedsRef = useRef(feeds);
  feedsRef.current = feeds;

  const eventsRef = useRef(events);
  eventsRef.current = events;

  // Persist feeds
  useEffect(() => {
    saveFeeds(feeds);
  }, [feeds]);

  // Persist events
  useEffect(() => {
    saveGCalEvents(events);
  }, [events]);

  // Listen for data restore events (from Gist sync or JSON import)
  useEffect(() => {
    const handleRestore = () => {
      setFeeds(loadSavedFeeds());
      setEvents(loadSavedGCalEvents());
      setShowGCalEventsState(loadShowGCalPreference());
    };
    window.addEventListener('jarvis-data-restored', handleRestore);
    return () => window.removeEventListener('jarvis-data-restored', handleRestore);
  }, []);

  const setShowGCalEvents = useCallback((show: boolean) => {
    setShowGCalEventsState(show);
    saveShowGCalPreference(show);
  }, []);

  // Sync a single calendar by ID
  const syncCalendar = useCallback(async (id: string) => {
    const feed = feedsRef.current.find((f) => f.id === id);
    if (!feed || !feed.url) return;

    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? { ...f, syncStatus: 'syncing', errorMessage: undefined } : f))
    );

    const result = await syncSingleCalendar(feed);

    setFeeds((prev) =>
      prev.map((f) => (f.id === id ? result.updatedFeed : f))
    );

    if (result.updatedFeed.syncStatus === 'success') {
      // Replace events for this calendar while preserving other calendars
      setEvents((prev) => {
        const others = prev.filter((e) => e.calendarId !== id);
        return [...others, ...result.events];
      });
    }
  }, []);

  // Sync all enabled calendars
  const syncAllCalendars = useCallback(async () => {
    const activeFeeds = feedsRef.current.filter((f) => f.enabled && f.url);
    if (activeFeeds.length === 0) return;

    setIsSyncing(true);
    try {
      const results = await Promise.all(
        activeFeeds.map((feed) => syncSingleCalendar(feed))
      );

      // Update feed states
      setFeeds((prev) =>
        prev.map((f) => {
          const matched = results.find((r) => r.updatedFeed.id === f.id);
          return matched ? matched.updatedFeed : f;
        })
      );

      // Merge all newly fetched events with inactive/custom calendar events
      const syncedCalendarIds = new Set(activeFeeds.map((f) => f.id));
      const retainedEvents = eventsRef.current.filter((e) => !syncedCalendarIds.has(e.calendarId));
      const newEvents = results.flatMap((r) => r.events);

      setEvents([...retainedEvents, ...newEvents]);
    } catch (err) {
      console.error('Error during calendar sync:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Add a new calendar feed
  const addCalendar = useCallback(
    async (name: string, url: string, color: string): Promise<boolean> => {
      const newFeed: GoogleCalendarFeed = {
        id: `gcal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: name.trim() || 'Google Calendar',
        url: url.trim(),
        color,
        enabled: true,
        syncStatus: 'syncing',
      };

      setFeeds((prev) => [...prev, newFeed]);

      const result = await syncSingleCalendar(newFeed);

      setFeeds((prev) =>
        prev.map((f) => (f.id === newFeed.id ? result.updatedFeed : f))
      );

      if (result.updatedFeed.syncStatus === 'success') {
        setEvents((prev) => [...prev, ...result.events]);
        return true;
      }
      return false;
    },
    []
  );

  // Update calendar properties (e.g. name, color, enabled toggle)
  const updateCalendar = useCallback(
    (id: string, partial: Partial<GoogleCalendarFeed>) => {
      setFeeds((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const updated = { ...f, ...partial };
          // If color or name changed, update corresponding events
          if (partial.color !== undefined || partial.name !== undefined) {
            setEvents((evs) =>
              evs.map((e) =>
                e.calendarId === id
                  ? {
                      ...e,
                      calendarColor: partial.color ?? e.calendarColor,
                      calendarName: partial.name ?? e.calendarName,
                    }
                  : e
              )
            );
          }
          return updated;
        })
      );
    },
    []
  );

  // Remove a calendar and its associated events
  const removeCalendar = useCallback((id: string) => {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
    setEvents((prev) => prev.filter((e) => e.calendarId !== id));
  }, []);

  // Import an .ics file directly
  const importIcsFile = useCallback(
    async (name: string, icsContent: string, color = '#4285F4') => {
      const feedId = `gcal-file-${Date.now()}`;
      const feed: GoogleCalendarFeed = {
        id: feedId,
        name: name || 'Imported Calendar',
        url: '',
        color,
        enabled: true,
        isCustomFile: true,
        lastSyncedAt: Date.now(),
        syncStatus: 'success',
      };

      const parsedEvents = parseIcsContent(icsContent, feed);
      feed.eventCount = parsedEvents.length;

      setFeeds((prev) => [...prev, feed]);
      setEvents((prev) => [...prev, ...parsedEvents]);
    },
    []
  );

  // Auto-sync on startup
  useEffect(() => {
    const hasSyncableFeeds = feedsRef.current.some((f) => f.enabled && f.url);
    if (hasSyncableFeeds) {
      syncAllCalendars();
    }
  }, [syncAllCalendars]);

  // Periodic background auto-sync every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const hasSyncableFeeds = feedsRef.current.some((f) => f.enabled && f.url);
      if (hasSyncableFeeds) {
        syncAllCalendars();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [syncAllCalendars]);

  return (
    <GoogleCalendarContext.Provider
      value={{
        feeds,
        events,
        isSyncing,
        showGCalEvents,
        setShowGCalEvents,
        addCalendar,
        updateCalendar,
        removeCalendar,
        syncCalendar,
        syncAllCalendars,
        importIcsFile,
      }}
    >
      {children}
    </GoogleCalendarContext.Provider>
  );
};

export const useGoogleCalendar = (): GoogleCalendarContextType => {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  }
  return context;
};
