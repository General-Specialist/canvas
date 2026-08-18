import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash,
  Globe,
  Play,
  Stop,
} from '@phosphor-icons/react';
import { useFocus } from '../../context/FocusContext';

interface WebsiteBlockerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_PRESETS = [
  'youtube.com',
  'x.com',
  'reddit.com',
  'instagram.com',
  'tiktok.com',
  'twitch.tv',
  'facebook.com',
  'netflix.com',
];

export const WebsiteBlockerModal: React.FC<WebsiteBlockerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    blockerConfig,
    addBlockedDomain,
    removeBlockedDomain,
    startSiteStopwatch,
    stopSiteStopwatch,
  } = useFocus();

  const [inputDomain, setInputDomain] = useState('');
  const [, setTick] = useState(0);

  // Live stopwatch ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDomain.trim()) return;
    addBlockedDomain(inputDomain);
    setInputDomain('');
  };

  const stopwatches = blockerConfig.activeSiteStopwatches || {};

  const formatElapsed = (startedAt: number) => {
    const totalSec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[var(--text-normal)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-tight">Blocked Websites</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[var(--canvas-bg)] text-[var(--text-light)] border border-[var(--border-color)]">
              {blockerConfig.blockedDomains.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-light)] hover:text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Content Body: List & Stopwatch Buttons */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Add Website Form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="relative flex-1">
              <Globe
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]"
              />
              <input
                type="text"
                value={inputDomain}
                onChange={(e) => setInputDomain(e.target.value)}
                placeholder="Add website (e.g. youtube.com)..."
                className="w-full bg-[var(--canvas-bg)] border border-[var(--border-color)] focus:border-[#58CC02] rounded-xl pl-9 pr-3 py-2 text-xs outline-none text-[var(--text-normal)] placeholder:text-[var(--text-light)]/50 transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#58CC02] text-black text-xs font-bold rounded-xl hover:brightness-110 flex items-center gap-1 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Plus size={14} weight="bold" />
              Add
            </button>
          </form>

          {/* Quick Add Presets */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {COMMON_PRESETS.map((preset) => {
              if (blockerConfig.blockedDomains.includes(preset)) return null;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addBlockedDomain(preset)}
                  className="text-[11px] px-2.5 py-0.5 rounded-lg bg-[var(--canvas-bg)] border border-[var(--border-color)] hover:border-[#58CC02] hover:text-[#58CC02] text-[var(--text-light)] transition-colors cursor-pointer"
                >
                  +{preset}
                </button>
              );
            })}
          </div>

          {/* List of Blocked Domains with Per-Site Stopwatch */}
          <div className="space-y-2 pt-1">
            {blockerConfig.blockedDomains.map((domain) => {
              const startedAt = stopwatches[domain];
              const isRunning = Boolean(startedAt);

              return (
                <div
                  key={domain}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    isRunning
                      ? 'border-[#58CC02]/50 bg-[#58CC02]/10 ring-1 ring-[#58CC02]/30'
                      : 'border-[var(--border-color)] bg-[var(--canvas-bg)] hover:border-[var(--text-light)]'
                  }`}
                >
                  {/* Left: Domain & Status */}
                  <div className="flex items-center gap-2.5 truncate pr-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isRunning ? 'bg-[#58CC02] animate-pulse' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-mono text-xs truncate font-medium">{domain}</span>

                    {isRunning && (
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-[#58CC02] text-black">
                        {formatElapsed(startedAt)}
                      </span>
                    )}
                  </div>

                  {/* Right: Stopwatch Start/Stop Control */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isRunning ? (
                      <button
                        type="button"
                        onClick={() => stopSiteStopwatch(domain)}
                        title="Stop stopwatch & lock site"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <Stop size={13} weight="fill" />
                        Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startSiteStopwatch(domain)}
                        title="Start stopwatch & unlock site"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#58CC02] hover:brightness-110 text-black text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <Play size={13} weight="fill" />
                        Start
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeBlockedDomain(domain)}
                      className="text-[var(--text-light)] hover:text-red-500 p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer ml-1"
                      title={`Remove ${domain}`}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {blockerConfig.blockedDomains.length === 0 && (
              <div className="py-8 text-center text-xs text-[var(--text-light)]">
                No blocked websites. Add domains above to block them.
              </div>
            )}
          </div>

          {/* Helper Note */}
          <div className="pt-2 text-[11px] text-[var(--text-light)]/70 text-center border-t border-[var(--border-color)]">
            Websites stay blocked until unblocked here. Sessions under 1 minute are not recorded.
          </div>
        </div>
      </div>
    </div>
  );
};
