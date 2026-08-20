import { useEffect } from 'react';
import { FocusApp } from './components/focus/FocusApp';
import { FocusProvider } from './context/FocusContext';
import { GoogleCalendarProvider } from './context/GoogleCalendarContext';
import { loadGistSyncConfig, pushToGitHubGist, saveGistSyncConfig } from './utils/syncManager';

function FocusRoot() {
  // Silent background auto-sync to GitHub Gist every 15 minutes (if configured)
  useEffect(() => {
    const autoSync = async () => {
      const cfg = loadGistSyncConfig();
      if (cfg.enabled && cfg.autoSync && cfg.token && cfg.gistId) {
        try {
          const res = await pushToGitHubGist(cfg.token, cfg.gistId);
          if (res.success) {
            saveGistSyncConfig({
              ...cfg,
              lastSyncedAt: Date.now(),
              lastSyncStatus: 'success' as const,
              lastSyncError: undefined,
            });
          }
        } catch (err) {
          console.warn('[JarvisSync] Auto-sync error:', err);
        }
      }
    };

    const interval = setInterval(autoSync, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[var(--tokyo-bg)] text-[var(--text-normal)]">
      <FocusApp />
    </div>
  );
}

function App() {
  return (
    <FocusProvider>
      <GoogleCalendarProvider>
        <FocusRoot />
      </GoogleCalendarProvider>
    </FocusProvider>
  );
}

export default App;

