export interface GoogleCalendarFeed {
  id: string;
  name: string;
  url: string;
  color: string;
  enabled: boolean;
  lastSyncedAt?: number;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
  eventCount?: number;
  isCustomFile?: boolean;
}

export interface GoogleCalendarEvent {
  id: string;
  calendarId: string;
  calendarName: string;
  calendarColor: string;
  title: string;
  description?: string;
  location?: string;
  start: number; // timestamp ms
  end: number;   // timestamp ms
  allDay?: boolean;
  isRecurring?: boolean;
  rawUid?: string;
}

export const GCAL_PRESET_COLORS = [
  '#4285F4', // Google Blue
  '#33B679', // Sage / Green
  '#8E24AA', // Grape / Purple
  '#E67C73', // Flamingo / Coral
  '#F4511E', // Tangerine / Orange
  '#F6BF26', // Banana / Yellow
  '#039BE5', // Peacock / Cyan
  '#3F51B5', // Indigo
  '#0B8043', // Basil / Dark Green
  '#616161', // Graphite / Gray
  '#D50000', // Tomato / Bold Red
  '#7986CB', // Lavender / Periwinkle
];
