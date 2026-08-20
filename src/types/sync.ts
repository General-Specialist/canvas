import { FocusBlockerConfig, FocusSession, FocusTag } from './focus';
import { GoogleCalendarEvent, GoogleCalendarFeed } from './googleCalendar';

export interface AppBackupMetadata {
  tagCount: number;
  sessionCount: number;
  gcalFeedCount: number;
  totalFocusSeconds: number;
}

export interface JarvisDataBackupV1 {
  version: 1;
  app: 'jarvis';
  exportedAt: number;
  metadata: AppBackupMetadata;
  data: {
    focusTags: FocusTag[];
    focusSessions: FocusSession[];
    focusBlockerConfig: FocusBlockerConfig;
    gcalFeeds: GoogleCalendarFeed[];
    gcalEvents?: GoogleCalendarEvent[];
    gcalShowPreference?: boolean;
    theme?: string;
    viewMode?: string;
    hourHeight?: number;
  };
}

export interface GistSyncConfig {
  enabled: boolean;
  token: string;
  gistId: string;
  autoSync: boolean;
  lastSyncedAt?: number | null;
  lastSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncError?: string;
}

export const DEFAULT_GIST_SYNC_CONFIG: GistSyncConfig = {
  enabled: false,
  token: '',
  gistId: '',
  autoSync: true,
  lastSyncedAt: null,
  lastSyncStatus: 'idle',
};
