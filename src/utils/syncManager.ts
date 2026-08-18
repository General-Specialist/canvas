import {
  AppBackupMetadata,
  DEFAULT_GIST_SYNC_CONFIG,
  GistSyncConfig,
  JarvisDataBackupV1,
} from '../types/sync';
import {
  loadSavedEdges,
  loadSavedNodes,
  loadSavedViewport,
  saveEdges,
  saveNodes,
  saveViewport,
} from './storage';
import {
  loadSavedBlockerConfig,
  loadSavedSessions,
  loadSavedTags,
  saveBlockerConfig,
  saveSessions,
  saveTags,
} from './focusStorage';
import {
  loadSavedFeeds,
  loadSavedGCalEvents,
  loadShowGCalPreference,
  saveFeeds,
  saveGCalEvents,
  saveShowGCalPreference,
} from './googleCalendarSync';
import type { FocusSession, FocusTag } from '../types/focus';
import type { GoogleCalendarFeed } from '../types/googleCalendar';

const STORAGE_KEY_GIST_AUTO_ID = 'jarvis_auto_gist_id';

export const loadGistSyncConfig = (): GistSyncConfig => {
  const envToken = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GITHUB_GIST_TOKEN || '').trim();
  const envGistId = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GITHUB_GIST_ID || '').trim();
  const cachedGistId = localStorage.getItem(STORAGE_KEY_GIST_AUTO_ID) || '';
  const gistId = envGistId || cachedGistId;

  return {
    ...DEFAULT_GIST_SYNC_CONFIG,
    token: envToken,
    gistId,
    enabled: Boolean(envToken),
    autoSync: Boolean(envToken),
  };
};

export const saveGistSyncConfig = (config: GistSyncConfig): void => {
  if (config.gistId) {
    localStorage.setItem(STORAGE_KEY_GIST_AUTO_ID, config.gistId);
  }
};

/**
 * Bundles all application state into a single versioned backup structure.
 */
export const serializeAppData = (): JarvisDataBackupV1 => {
  const canvasNodes = loadSavedNodes();
  const canvasEdges = loadSavedEdges();
  const canvasViewport = loadSavedViewport();

  const focusTags = loadSavedTags();
  const focusSessions = loadSavedSessions();
  const focusBlockerConfig = loadSavedBlockerConfig();

  const gcalFeeds = loadSavedFeeds();
  const gcalEvents = loadSavedGCalEvents();
  const gcalShowPreference = loadShowGCalPreference();

  let theme: 'dark' | 'light' = 'dark';
  let viewMode = 'week';
  let hourHeight = 64;
  let activeApp = 'canvas';

  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') theme = savedTheme;

    const savedView = localStorage.getItem('jarvis_focus_view_mode_v1');
    if (savedView) viewMode = savedView;

    const savedHeight = localStorage.getItem('jarvis_focus_hour_height_v1');
    if (savedHeight) hourHeight = parseInt(savedHeight, 10) || 64;

    const savedApp = localStorage.getItem('jarvis_active_app');
    if (savedApp) activeApp = savedApp;
  } catch {
    // ignore
  }

  const totalFocusSeconds = focusSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

  const metadata: AppBackupMetadata = {
    nodeCount: canvasNodes.length,
    edgeCount: canvasEdges.length,
    tagCount: focusTags.length,
    sessionCount: focusSessions.length,
    gcalFeedCount: gcalFeeds.length,
    totalFocusSeconds,
  };

  return {
    version: 1,
    app: 'jarvis',
    exportedAt: Date.now(),
    metadata,
    data: {
      canvasNodes,
      canvasEdges,
      canvasViewport,
      focusTags,
      focusSessions,
      focusBlockerConfig,
      gcalFeeds,
      gcalEvents,
      gcalShowPreference,
      theme,
      viewMode,
      hourHeight,
      activeApp,
    },
  };
};

/**
 * Validates whether a JSON object is a valid Jarvis backup payload.
 */
export const validateBackupPayload = (payload: unknown): payload is JarvisDataBackupV1 => {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return p.app === 'jarvis' && p.version === 1 && typeof p.data === 'object' && p.data !== null;
};

/**
 * Restores or merges an imported backup into local application state.
 */
export const deserializeAppData = (
  backup: JarvisDataBackupV1,
  mode: 'replace' | 'merge' = 'replace'
): { success: boolean; message: string } => {
  if (!validateBackupPayload(backup)) {
    return { success: false, message: 'Invalid backup payload or incompatible schema.' };
  }

  try {
    const incoming = backup.data;

    if (mode === 'replace') {
      if (incoming.canvasNodes) saveNodes(incoming.canvasNodes);
      if (incoming.canvasEdges) saveEdges(incoming.canvasEdges);
      if (incoming.canvasViewport) saveViewport(incoming.canvasViewport);
      if (incoming.focusTags) saveTags(incoming.focusTags);
      if (incoming.focusSessions) saveSessions(incoming.focusSessions);
      if (incoming.focusBlockerConfig) saveBlockerConfig(incoming.focusBlockerConfig);
      if (incoming.gcalFeeds) saveFeeds(incoming.gcalFeeds);
      if (incoming.gcalEvents) saveGCalEvents(incoming.gcalEvents);
      if (typeof incoming.gcalShowPreference === 'boolean') saveShowGCalPreference(incoming.gcalShowPreference);

      if (incoming.theme) localStorage.setItem('theme', incoming.theme);
      if (incoming.viewMode) localStorage.setItem('jarvis_focus_view_mode_v1', incoming.viewMode);
      if (incoming.hourHeight) localStorage.setItem('jarvis_focus_hour_height_v1', String(incoming.hourHeight));
      if (incoming.activeApp) localStorage.setItem('jarvis_active_app', incoming.activeApp);

      return {
        success: true,
        message: `Successfully restored all data (${new Date(backup.exportedAt).toLocaleDateString()}).`,
      };
    } else {
      // MERGE MODE
      // 1. Merge Nodes
      const currentNodes = loadSavedNodes();
      const currentIds = new Set(currentNodes.map((n) => n.id));
      const newNodes = (incoming.canvasNodes || []).filter((n) => !currentIds.has(n.id));
      saveNodes([...currentNodes, ...newNodes]);

      // 2. Merge Edges
      const currentEdges = loadSavedEdges();
      const currentEdgeIds = new Set(currentEdges.map((e) => e.id));
      const newEdges = (incoming.canvasEdges || []).filter((e) => !currentEdgeIds.has(e.id));
      saveEdges([...currentEdges, ...newEdges]);

      // 3. Merge Tags
      const currentTags = loadSavedTags();
      const currentTagNames = new Set(currentTags.map((t) => t.name.toLowerCase()));
      const currentTagIds = new Set(currentTags.map((t) => t.id));
      const newTags: FocusTag[] = (incoming.focusTags || []).filter(
        (t) => !currentTagIds.has(t.id) && !currentTagNames.has(t.name.toLowerCase())
      );
      saveTags([...currentTags, ...newTags]);

      // 4. Merge Sessions
      const currentSessions = loadSavedSessions();
      const currentSessionIds = new Set(currentSessions.map((s) => s.id));
      const newSessions: FocusSession[] = (incoming.focusSessions || []).filter((s) => !currentSessionIds.has(s.id));
      const mergedSessions = [...currentSessions, ...newSessions].sort((a, b) => b.endedAt - a.endedAt);
      saveSessions(mergedSessions);

      // 5. Merge Calendar Feeds
      const currentFeeds = loadSavedFeeds();
      const currentFeedUrls = new Set(currentFeeds.map((f) => f.url));
      const newFeeds: GoogleCalendarFeed[] = (incoming.gcalFeeds || []).filter((f) => !currentFeedUrls.has(f.url));
      saveFeeds([...currentFeeds, ...newFeeds]);

      return {
        success: true,
        message: `Successfully merged backup (+${newNodes.length} notes, +${newSessions.length} sessions, +${newTags.length} tags).`,
      };
    }
  } catch (err) {
    console.error('Failed to deserialize app data:', err);
    return { success: false, message: `Failed to restore data: ${(err as Error).message}` };
  }
};

/**
 * Downloads a `.json` backup file.
 */
export const downloadBackupAsFile = (): void => {
  const data = serializeAppData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const a = document.createElement('a');
  a.href = url;
  a.download = `jarvis-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* =========================================================================
   GITHUB GIST SYNC INTEGRATION
   ========================================================================= */

/**
 * Push data snapshot to a private GitHub Gist.
 * If existingGistId is provided, updates that Gist. If it fails with 404 or empty, creates a new private Gist.
 */
export const pushToGitHubGist = async (
  token: string,
  existingGistId?: string
): Promise<{ success: boolean; gistId?: string; error?: string; exportedAt?: number }> => {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { success: false, error: 'GitHub Personal Access Token is required.' };
  }

  try {
    const data = serializeAppData();
    const payload = JSON.stringify(data, null, 2);
    const dateStr = new Date().toLocaleString();

    const gistPayload = {
      description: `Jarvis Canvas & Focus Vault Backup (Synced ${dateStr})`,
      public: false,
      files: {
        'jarvis-backup.json': {
          content: payload,
        },
      },
    };

    let targetGistId = existingGistId?.trim();
    let isUpdate = Boolean(targetGistId);

    let res = isUpdate
      ? await fetch(`https://api.github.com/gists/${targetGistId}`, {
          method: 'PATCH',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${cleanToken}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gistPayload),
        })
      : null;

    // If update failed with 404 (Gist deleted or wrong ID), fallback to creating a new one
    if (!res || res.status === 404) {
      res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${cleanToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gistPayload),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `GitHub API error (${res.status})`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.message) errorMsg = `${errJson.message} (HTTP ${res.status})`;
      } catch {
        // ignore
      }
      return { success: false, error: errorMsg };
    }

    const responseJson = await res.json();
    return { success: true, gistId: responseJson.id, exportedAt: data.exportedAt };
  } catch (err) {
    return { success: false, error: `Network error: ${(err as Error).message}` };
  }
};

/**
 * Pull data snapshot from a private GitHub Gist.
 */
export const pullFromGitHubGist = async (
  token: string,
  gistId: string
): Promise<{ success: boolean; backup?: JarvisDataBackupV1; error?: string }> => {
  const cleanToken = token.trim();
  const cleanGistId = gistId.trim();

  if (!cleanToken || !cleanGistId) {
    return { success: false, error: 'Both GitHub Token and Gist ID are required to pull.' };
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${cleanGistId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${cleanToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `GitHub API error (${res.status})`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson.message) errorMsg = `${errJson.message} (HTTP ${res.status})`;
      } catch {
        // ignore
      }
      return { success: false, error: errorMsg };
    }

    const json = await res.json();
    const file = json.files?.['jarvis-backup.json'];
    if (!file || !file.content) {
      return { success: false, error: 'No "jarvis-backup.json" file found in this Gist.' };
    }

    const parsed = JSON.parse(file.content);
    if (!validateBackupPayload(parsed)) {
      return { success: false, error: 'The content in this Gist is not a valid Jarvis backup payload.' };
    }

    return { success: true, backup: parsed };
  } catch (err) {
    return { success: false, error: `Network error: ${(err as Error).message}` };
  }
};

// Global headless API on window for zero-UI management
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).jarvisSync = {
    push: async (token?: string, gistId?: string) => {
      const cfg = loadGistSyncConfig();
      const tok = token || cfg.token;
      const gid = gistId || cfg.gistId;
      const res = await pushToGitHubGist(tok, gid);
      if (res.success && res.gistId) {
        saveGistSyncConfig({
          ...cfg,
          token: tok,
          gistId: res.gistId,
          enabled: true,
          lastSyncedAt: Date.now(),
          lastSyncStatus: 'success',
        });
        console.log(`%c[JarvisSync] Synced to Gist: https://gist.github.com/${res.gistId}`, 'color: #58CC02; font-weight: bold;');
      } else {
        console.error(`[JarvisSync] Push failed:`, res.error);
      }
      return res;
    },
    pull: async (mode: 'replace' | 'merge' = 'replace', token?: string, gistId?: string) => {
      const cfg = loadGistSyncConfig();
      const tok = token || cfg.token;
      const gid = gistId || cfg.gistId;
      const res = await pullFromGitHubGist(tok, gid);
      if (res.success && res.backup) {
        const applied = deserializeAppData(res.backup, mode);
        window.dispatchEvent(new CustomEvent('jarvis-data-restored'));
        console.log(`%c[JarvisSync] Pulled & restored: ${applied.message}`, 'color: #58CC02; font-weight: bold;');
      } else {
        console.error(`[JarvisSync] Pull failed:`, res.error);
      }
      return res;
    },
    export: downloadBackupAsFile,
    status: () => loadGistSyncConfig(),
  };
}
