import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash,
  ArrowClockwise,
  UploadSimple,
  Check,
  CalendarCheck,
  WarningCircle,
  Eye,
  EyeSlash,
} from '../icons';
import { useGoogleCalendar } from '../../context/GoogleCalendarContext';
import { GCAL_PRESET_COLORS } from '../../types/googleCalendar';

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({ isOpen, onClose }) => {
  const {
    feeds,
    isSyncing,
    addCalendar,
    updateCalendar,
    removeCalendar,
    syncCalendar,
    syncAllCalendars,
    importIcsFile,
    showGCalEvents,
    setShowGCalEvents,
  } = useGoogleCalendar();

  const [calName, setCalName] = useState('');
  const [calUrl, setCalUrl] = useState('');
  const [selectedColor, setSelectedColor] = useState(GCAL_PRESET_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calUrl.trim()) {
      setErrorMessage('Please enter your Google Calendar iCal URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await addCalendar(calName.trim() || 'Google Calendar', calUrl.trim(), selectedColor);
      if (success) {
        setCalName('');
        setCalUrl('');
        setSelectedColor(GCAL_PRESET_COLORS[0]);
      } else {
        setErrorMessage('Could not fetch events from the provided URL. Please verify your secret iCal address.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect calendar';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const name = file.name.replace(/\.ics$/i, '') || 'Imported Calendar';
        await importIcsFile(name, content, selectedColor);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return 'Never synced';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-xl bg-[var(--canvas-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4]">
              <CalendarCheck size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-hover)]">
                Google Calendar Integration
              </h2>
              <p className="text-xs text-[var(--text-light)]">
                Sync and overlay your Google Calendar schedule in Focus view
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Global Visibility & Sync All Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--sidebar-bg)]/50">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGCalEvents(!showGCalEvents)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  showGCalEvents
                    ? 'border-[#4285F4]/40 text-[#4285F4] bg-[#4285F4]/10'
                    : 'border-[var(--border-color)] text-[var(--text-light)]'
                }`}
              >
                {showGCalEvents ? <Eye size={14} weight="bold" /> : <EyeSlash size={14} weight="bold" />}
                <span>{showGCalEvents ? 'Visible on Calendar' : 'Hidden from View'}</span>
              </button>
            </div>

            {feeds.length > 0 && (
              <button
                type="button"
                onClick={() => syncAllCalendars()}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border border-[var(--border-color)] text-[var(--text-normal)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ArrowClockwise size={13} className={isSyncing ? 'animate-spin' : ''} weight="bold" />
                <span>{isSyncing ? 'Syncing...' : 'Sync All'}</span>
              </button>
            )}
          </div>

          {/* Connected Calendars List */}
          {feeds.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-light)]">
                Connected Calendars ({feeds.length})
              </h3>
              <div className="space-y-2">
                {feeds.map((feed) => (
                  <div
                    key={feed.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--node-bg)] hover:border-[var(--text-light)]/40 transition-all gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Color Dot with Picker dropdown */}
                      <div className="relative group shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full block ring-2 ring-transparent group-hover:ring-[var(--border-color)] transition-all cursor-pointer"
                          style={{ backgroundColor: feed.color }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--text-hover)] truncate">
                            {feed.name}
                          </span>
                          {feed.isCustomFile && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-[var(--border-color)] text-[var(--text-light)]">
                              File
                            </span>
                          )}
                          {feed.syncStatus === 'syncing' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-[#4285F4] bg-[#4285F4]/10 animate-pulse">
                              Syncing...
                            </span>
                          )}
                          {feed.syncStatus === 'error' && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono text-[#FF4B4B] bg-[#FF4B4B]/10 flex items-center gap-1"
                              title={feed.errorMessage || 'Sync failed'}
                            >
                              <WarningCircle size={10} weight="bold" />
                              Error
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-light)]">
                          {feed.eventCount !== undefined ? `${feed.eventCount} events` : 'Synced'} ·{' '}
                          {formatLastSync(feed.lastSyncedAt)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {feed.url && (
                        <button
                          type="button"
                          onClick={() => syncCalendar(feed.id)}
                          disabled={feed.syncStatus === 'syncing'}
                          title="Sync calendar now"
                          className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                        >
                          <ArrowClockwise
                            size={14}
                            className={feed.syncStatus === 'syncing' ? 'animate-spin' : ''}
                            weight="bold"
                          />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => updateCalendar(feed.id, { enabled: !feed.enabled })}
                        title={feed.enabled ? 'Hide this calendar' : 'Show this calendar'}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          feed.enabled
                            ? 'border-[var(--border-color)] text-[var(--text-hover)]'
                            : 'border-[var(--border-color)]/50 text-[var(--text-light)]/40'
                        }`}
                      >
                        {feed.enabled ? <Eye size={14} /> : <EyeSlash size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeCalendar(feed.id)}
                        title="Remove calendar"
                        className="p-1.5 rounded-lg border border-transparent hover:border-[#FF4B4B]/30 text-[var(--text-light)] hover:text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-colors cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Google Calendar */}
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-light)]">
                Connect New Google Calendar
              </h3>
            </div>

            {/* Calendar Name & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-light)] mb-1">
                  Calendar Name
                </label>
                <input
                  type="text"
                  value={calName}
                  onChange={(e) => setCalName(e.target.value)}
                  placeholder="e.g. Work, Personal, School"
                  className="w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-normal)] placeholder:text-[var(--text-light)]/50 focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-light)] mb-1">
                  Calendar Color
                </label>
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {GCAL_PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shadow-xs"
                      style={{ backgroundColor: c }}
                    >
                      {selectedColor === c && <Check size={11} className="text-white" weight="bold" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* iCal URL Input */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-light)] mb-1">
                Google Calendar Secret iCal Address
              </label>
              <input
                type="text"
                value={calUrl}
                onChange={(e) => setCalUrl(e.target.value)}
                placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                className="w-full font-mono bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-normal)] placeholder:text-[var(--text-light)]/50 focus:outline-none focus:border-[#4285F4]"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl border border-[#FF4B4B]/30 bg-[#FF4B4B]/10 text-xs text-[#FF4B4B] flex items-center gap-2">
                <WarningCircle size={15} weight="bold" className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit & File Upload Buttons */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".ics,text/calendar"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                >
                  <UploadSimple size={14} weight="bold" />
                  <span>Import .ics File</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !calUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4285F4] hover:bg-[#3367D6] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <ArrowClockwise size={14} className="animate-spin" weight="bold" />
                    <span>Connecting & Syncing...</span>
                  </>
                ) : (
                  <>
                    <Plus size={14} weight="bold" />
                    <span>Connect & Sync</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
