import React, { useState, useEffect } from 'react';
import {
  SquaresFour,
  Timer,
  Sun,
  Moon,
  Bed,
} from '../icons';
import { AppId, JARVIS_APPS } from '../../types/navigation';
import { Canvas } from '../Canvas';
import { FocusApp } from '../focus/FocusApp';
import { SleepApp } from '../sleep/SleepApp';
import { useTheme } from '../../context/ThemeContext';
import { useFocus } from '../../context/FocusContext';
import { loadGistSyncConfig, pushToGitHubGist, saveGistSyncConfig } from '../../utils/syncManager';

export const JarvisShell: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppId>(() => {
    try {
      const saved = localStorage.getItem('jarvis_active_app');
      if (saved === 'focus' || saved === 'canvas' || saved === 'sleep') return saved;
    } catch {
      // fallback
    }
    return 'canvas';
  });

  const { theme, toggleTheme } = useTheme();
  const { isRunning, isPaused, selectedTag } = useFocus();

  const handleSelectApp = (id: AppId) => {
    setActiveApp(id);
    try {
      localStorage.setItem('jarvis_active_app', id);
    } catch {
      // ignore
    }
  };

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

  // Global Keyboard Shortcuts (Cmd+1 for Canvas, Cmd+2 for Focus, Cmd+3 for Sleep)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        handleSelectApp('canvas');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        handleSelectApp('focus');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        handleSelectApp('sleep');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[var(--canvas-bg)] text-[var(--text-normal)]">
      {/* Ultra-Clean Fixed Icon Sidebar */}
      <aside className="w-14 h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col justify-between items-center py-3 select-none z-30 shrink-0">
        {/* Top App Navigation Icons */}
        <nav className="flex flex-col items-center gap-2">
          {JARVIS_APPS.map((app) => {
            const isActive = activeApp === app.id;
            const isFocusActiveRunning = app.id === 'focus' && isRunning && !isPaused;

            return (
              <button
                key={app.id}
                onClick={() => handleSelectApp(app.id)}
                title={`${app.name} (${app.shortcut})`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative hover:bg-[var(--sidebar-hover-bg)] ${
                  isActive
                    ? 'text-[var(--primary-accent)] border border-[var(--primary-accent)]/60 bg-[var(--primary-accent)]/10 shadow-xs'
                    : 'text-[var(--text-light)] hover:text-[var(--text-hover)] border border-transparent'
                }`}
              >
                {app.id === 'canvas' ? (
                  <SquaresFour size={20} weight={isActive ? 'fill' : 'bold'} />
                ) : app.id === 'focus' ? (
                  <Timer size={20} weight={isActive ? 'fill' : 'bold'} />
                ) : (
                  <Bed size={20} weight={isActive ? 'fill' : 'bold'} />
                )}

                {/* Running focus active badge (solid, non-flashing) */}
                {isFocusActiveRunning && !isActive && (
                  <span
                    className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-[var(--sidebar-bg)]"
                    style={{ backgroundColor: selectedTag?.color || '#7aa2f7' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Theme Switcher */}
        <div className="flex flex-col items-center pt-2 border-t border-[var(--border-color)] w-full px-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-[#e0af68]" />
            ) : (
              <Moon size={20} className="text-[#7aa2f7]" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 h-full overflow-hidden relative">
        {/* Canvas Viewport (preserved in DOM) */}
        <div
          className={`w-full h-full ${
            activeApp === 'canvas' ? 'block' : 'hidden pointer-events-none'
          }`}
        >
          <Canvas />
        </div>

        {/* Focus Viewport */}
        <div
          className={`w-full h-full ${
            activeApp === 'focus' ? 'block' : 'hidden pointer-events-none'
          }`}
        >
          <FocusApp />
        </div>

        {/* Sleep Viewport */}
        <div
          className={`w-full h-full ${
            activeApp === 'sleep' ? 'block' : 'hidden pointer-events-none'
          }`}
        >
          <SleepApp />
        </div>
      </main>
    </div>
  );
};

