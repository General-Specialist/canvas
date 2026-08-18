import { SleepEntry } from '../types/sleep';

const STORAGE_KEY_SLEEP_ENTRIES = 'jarvis_sleep_entries_v1';

/**
 * Calculates duration in minutes between bedTime (HH:mm) and wakeTime (HH:mm).
 * Properly handles crossing midnight (e.g., 23:00 to 07:30 = 8h 30m = 510m).
 */
export const calculateSleepDurationMinutes = (bedTime: string, wakeTime: string): number => {
  if (!bedTime || !wakeTime) return 0;

  const [bH, bM] = bedTime.split(':').map((v) => parseInt(v, 10) || 0);
  const [wH, wM] = wakeTime.split(':').map((v) => parseInt(v, 10) || 0);

  const bedTotal = bH * 60 + bM;
  const wakeTotal = wH * 60 + wM;

  if (wakeTotal >= bedTotal) {
    return wakeTotal - bedTotal;
  } else {
    // Crossed midnight
    return 24 * 60 - bedTotal + wakeTotal;
  }
};

/**
 * Formats duration in minutes to human readable "Xh Ym" string.
 */
export const formatSleepDuration = (minutes: number): string => {
  if (minutes <= 0) return '0h 00m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

/**
 * Formats YYYY-MM-DD into friendly readable date (e.g., "Mon, Aug 17").
 */
export const formatFriendlyDate = (dateStr: string): string => {
  try {
    const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Generates ISO Date string (YYYY-MM-DD) for N days offset from today.
 */
export const getDateOffsetIso = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
};

import { getStorage, setStorage } from './storage';

export const loadSavedSleepEntries = (): SleepEntry[] =>
  getStorage<SleepEntry[]>(STORAGE_KEY_SLEEP_ENTRIES, []);

export const saveSleepEntries = (entries: SleepEntry[]): void =>
  setStorage(STORAGE_KEY_SLEEP_ENTRIES, entries);

