import { GoogleCalendarEvent, GoogleCalendarFeed } from '../types/googleCalendar';
import { parseIcsContent } from './icalParser';

const STORAGE_KEY_FEEDS = 'jarvis_google_calendars_v1';
const STORAGE_KEY_EVENTS = 'jarvis_google_calendar_events_v1';
const STORAGE_KEY_SHOW_GCAL = 'jarvis_show_gcal_events_v1';

export const loadSavedFeeds = (): GoogleCalendarFeed[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load Google calendar feeds:', err);
  }
  return [];
};

export const saveFeeds = (feeds: GoogleCalendarFeed[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_FEEDS, JSON.stringify(feeds));
  } catch (err) {
    console.error('Failed to save Google calendar feeds:', err);
  }
};

export const loadSavedGCalEvents = (): GoogleCalendarEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load Google calendar events:', err);
  }
  return [];
};

export const saveGCalEvents = (events: GoogleCalendarEvent[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save Google calendar events:', err);
  }
};

export const loadShowGCalPreference = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHOW_GCAL);
    if (raw !== null) {
      return raw === 'true';
    }
  } catch {}
  return true;
};

export const saveShowGCalPreference = (show: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY_SHOW_GCAL, String(show));
  } catch {}
};

/**
 * Clean up Google Calendar / iCal URL format
 */
export const normalizeIcalUrl = (input: string): string => {
  let url = input.trim();
  if (url.startsWith('webcal://')) {
    url = 'https://' + url.substring(9);
  } else if (url.startsWith('http://')) {
    url = 'https://' + url.substring(7);
  }
  return url;
};

/**
 * Fetch raw iCal feed text via Tauri native command or fallback browser fetch
 */
export const fetchIcalFeedText = async (url: string): Promise<string> => {
  const normalizedUrl = normalizeIcalUrl(url);

  // Try Tauri command first for zero-CORS desktop fetching
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<string>('fetch_ical_feed', { url: normalizedUrl });
    if (result && typeof result === 'string') {
      return result;
    }
  } catch {
    // Tauri invoke failed or running in pure browser environment
  }

  // Fallback 1: Direct fetch
  try {
    const res = await fetch(normalizedUrl, {
      headers: {
        Accept: 'text/calendar, text/plain, */*',
      },
    });
    if (res.ok) {
      return await res.text();
    }
  } catch (err) {
    console.warn('Direct fetch failed, trying CORS proxy fallback:', err);
  }

  // Fallback 2: CORS proxy for browser development mode
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      return await res.text();
    }
  } catch (err) {
    console.error('All fetch methods failed for URL:', normalizedUrl, err);
  }

  throw new Error('Unable to fetch calendar feed. Please verify the URL and your internet connection.');
};

/**
 * Sync a single calendar feed and return parsed events
 */
export const syncSingleCalendar = async (
  feed: GoogleCalendarFeed
): Promise<{ updatedFeed: GoogleCalendarFeed; events: GoogleCalendarEvent[] }> => {
  if (!feed.url && !feed.isCustomFile) {
    return {
      updatedFeed: {
        ...feed,
        syncStatus: 'error',
        errorMessage: 'Missing calendar URL',
      },
      events: [],
    };
  }

  try {
    const icsText = await fetchIcalFeedText(feed.url);
    const parsedEvents = parseIcsContent(icsText, feed);

    return {
      updatedFeed: {
        ...feed,
        lastSyncedAt: Date.now(),
        syncStatus: 'success',
        errorMessage: undefined,
        eventCount: parsedEvents.length,
      },
      events: parsedEvents,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error during calendar sync';
    return {
      updatedFeed: {
        ...feed,
        syncStatus: 'error',
        errorMessage: msg,
      },
      events: [],
    };
  }
};
