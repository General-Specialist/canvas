import { CanvasEdge, CanvasNode } from './canvas';
import { FocusBlockerConfig, FocusSession, FocusTag } from './focus';
import { GoogleCalendarEvent, GoogleCalendarFeed } from './googleCalendar';
import { Viewport } from '@xyflow/react';

export interface AppBackupMetadata {
  nodeCount: number;
  edgeCount: number;
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
    canvasNodes: CanvasNode[];
    canvasEdges: CanvasEdge[];
    canvasViewport: Viewport;
    focusTags: FocusTag[];
    focusSessions: FocusSession[];
    focusBlockerConfig: FocusBlockerConfig;
    gcalFeeds: GoogleCalendarFeed[];
    gcalEvents?: GoogleCalendarEvent[];
    gcalShowPreference?: boolean;
    theme?: 'dark' | 'light';
    viewMode?: string;
    hourHeight?: number;
    activeApp?: string;
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
