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
import { loadSavedSleepEntries, saveSleepEntries } from './sleepStorage';



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

  const sleepEntries = loadSavedSleepEntries();

  const gcalFeeds = loadSavedFeeds();
  const gcalEvents = loadSavedGCalEvents();
  const gcalShowPreference = loadShowGCalPreference();

  let theme = 'dark';
  let viewMode = 'week';
  let hourHeight = 64;
  let activeApp = 'canvas';

  try {
    const savedView = localStorage.getItem('jarvis_focus_view_mode_v1');
    if (savedView) viewMode = savedView;

    const savedHeight = localStorage.getItem('jarvis_focus_hour_height_v1');
    if (savedHeight) hourHeight = parseInt(savedHeight, 10) || 64;

    const savedApp = localStorage.getItem('jarvis_active_app');
    if (savedApp) activeApp = savedApp;
  } catch {}

  const totalFocusSeconds = focusSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

  const metadata: AppBackupMetadata = {
    nodeCount: canvasNodes.length,
    edgeCount: canvasEdges.length,
    tagCount: focusTags.length,
    sessionCount: focusSessions.length,
    sleepCount: sleepEntries.length,
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
      sleepEntries,
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
  return (p.app === 'jarvis' || p.appName === 'Jarvis') && typeof p.data === 'object' && p.data !== null;
};


/**
 * Validates and restores a master backup payload into localStorage.
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
      if (incoming.sleepEntries) saveSleepEntries(incoming.sleepEntries);
      if (incoming.gcalFeeds) saveFeeds(incoming.gcalFeeds);
      if (incoming.gcalEvents) saveGCalEvents(incoming.gcalEvents);
      if (typeof incoming.gcalShowPreference === 'boolean') saveShowGCalPreference(incoming.gcalShowPreference);

      localStorage.setItem('jarvis_theme', 'dark');
      localStorage.setItem('canvas_theme', 'dark');

      if (incoming.viewMode) localStorage.setItem('jarvis_focus_view_mode_v1', incoming.viewMode);
      if (incoming.hourHeight) localStorage.setItem('jarvis_focus_hour_height_v1', String(incoming.hourHeight));
      if (incoming.activeApp) localStorage.setItem('jarvis_active_app', incoming.activeApp);

      return {
        success: true,
        message: `Successfully restored all data (${new Date(backup.exportedAt).toLocaleDateString()}).`,
      };
    } else {
      // MERGE MODE
      const mergeList = <T>(current: T[], incoming: T[] = [], getKey: (item: T) => string): [T[], number] => {
        const seen = new Set(current.map(getKey));
        const additions = incoming.filter((item) => !seen.has(getKey(item)));
        return [[...current, ...additions], additions.length];
      };

      const [mergedNodes, newNodesCount] = mergeList(loadSavedNodes(), incoming.canvasNodes, (n) => n.id);
      saveNodes(mergedNodes);

      const [mergedEdges] = mergeList(loadSavedEdges(), incoming.canvasEdges, (e) => e.id);
      saveEdges(mergedEdges);

      const [mergedTags, newTagsCount] = mergeList(loadSavedTags(), incoming.focusTags, (t) => t.id);
      saveTags(mergedTags);

      const [mergedSessions, newSessionsCount] = mergeList(loadSavedSessions(), incoming.focusSessions, (s) => s.id);
      saveSessions(mergedSessions.sort((a, b) => b.endedAt - a.endedAt));

      const [mergedSleep, newSleepCount] = mergeList(loadSavedSleepEntries(), incoming.sleepEntries, (s) => s.date);
      saveSleepEntries(mergedSleep.sort((a, b) => b.date.localeCompare(a.date)));

      const [mergedFeeds] = mergeList(loadSavedFeeds(), incoming.gcalFeeds, (f) => f.url);
      saveFeeds(mergedFeeds);

      return {
        success: true,
        message: `Successfully merged backup (+${newNodesCount} notes, +${newSessionsCount} sessions, +${newSleepCount} sleep logs, +${newTagsCount} tags).`,
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
        console.log(`%c[JarvisSync] Synced to Gist: https://gist.github.com/${res.gistId}`, 'color: #7aa2f7; font-weight: bold;');
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
        console.log(`%c[JarvisSync] Pulled & restored: ${applied.message}`, 'color: #7aa2f7; font-weight: bold;');
      } else {
        console.error(`[JarvisSync] Pull failed:`, res.error);
      }
      return res;
    },
    export: downloadBackupAsFile,
    status: () => loadGistSyncConfig(),
  };
}
