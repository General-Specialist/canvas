import React, { useState, useEffect } from 'react';
import { X, Trash, Play, Clock, Check } from '../icons';
import { useFocus } from '../../context/FocusContext';
import { FocusSession } from '../../types/focus';
import { formatLocalDateInput } from '../../utils/calendarUtils';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: FocusSession | null;
  defaultDate?: Date;
  defaultStartHour?: number;
}

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  isOpen,
  onClose,
  session,
  defaultDate,
  defaultStartHour = 9,
}) => {
  const { tags, addManualSession, updateSession, deleteSession, restartSession } = useFocus();

  const [tagId, setTagId] = useState(tags[0]?.id || 'tag-coding');
  const [dateStr, setDateStr] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('10:00');

  useEffect(() => {
    if (session) {
      setTagId(session.tagId);
      const start = new Date(session.startedAt);
      const end = new Date(session.endedAt);
      setDateStr(formatLocalDateInput(start));
      setStartTimeStr(
        `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
      );
      setEndTimeStr(
        `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
      );
    } else {
      setTagId(tags[0]?.id || 'tag-coding');
      const targetDate = defaultDate || new Date();
      setDateStr(formatLocalDateInput(targetDate));
      const hour = Math.min(23, Math.max(0, Math.floor(defaultStartHour)));
      const nextHour = Math.min(23, hour + 1);
      setStartTimeStr(`${String(hour).padStart(2, '0')}:00`);
      setEndTimeStr(`${String(nextHour).padStart(2, '0')}:00`);
    }
  }, [session, defaultDate, defaultStartHour, tags, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateStr || !startTimeStr || !endTimeStr) return;

    const [year, month, day] = dateStr.split('-').map(Number);
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, startH, startM, 0);
    const endDate = new Date(year, month - 1, day, endH, endM, 0);

    let startedAt = startDate.getTime();
    let endedAt = endDate.getTime();

    if (endedAt <= startedAt) {
      // If same minute or inverted, preserve original duration or default to 15 mins
      const fallbackMs = session ? Math.max(1000, session.durationSeconds * 1000) : 15 * 60 * 1000;
      endedAt = startedAt + fallbackMs;
    }

    if (session) {
      updateSession(session.id, {
        tagId,
        startedAt,
        endedAt,
      });
    } else {
      addManualSession({
        tagId,
        startedAt,
        endedAt,
      });
    }

    onClose();
  };

  const isEditing = !!session;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-[var(--node-bg)] border border-[var(--border-color)] rounded-xl w-full max-w-md p-5 space-y-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[var(--primary-accent)]" weight="bold" />
            <h3 className="text-sm font-bold text-[var(--text-hover)]">
              {isEditing ? 'Edit Time Entry' : 'Log Time Entry'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-light)] hover:text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">

          {/* Tag Selector */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-light)] mb-1.5 block">
              Tag / Activity
            </label>
            <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
              {tags.map((t) => {
                const isSelected = t.id === tagId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTagId(t.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--text-hover)] text-[var(--text-hover)] bg-[var(--sidebar-hover-bg)]'
                        : 'border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-normal)]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.name}</span>
                    {isSelected && <Check size={12} weight="bold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Range */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-light)] mb-1 block">
                Date
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-normal)] focus:outline-none focus:border-[var(--primary-accent)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-light)] mb-1 block">
                Start Time
              </label>
              <input
                type="time"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-normal)] focus:outline-none focus:border-[var(--primary-accent)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-light)] mb-1 block">
                End Time
              </label>
              <input
                type="time"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-normal)] focus:outline-none focus:border-[var(--primary-accent)]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2">
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (session) {
                      deleteSession(session.id);
                      onClose();
                    }
                  }}
                  className="p-2 rounded-lg text-[var(--text-light)] hover:text-[#f7768e] border border-[var(--border-color)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                  title="Delete Entry"
                >
                  <Trash size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (session) {
                      restartSession(session);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[var(--primary-accent)] border border-[var(--border-color)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                >
                  <Play size={13} weight="fill" />
                  <span>Continue</span>
                </button>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs text-[var(--text-light)] hover:text-[var(--text-normal)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[var(--primary-accent)] text-white dark:text-[#16161e] text-xs font-bold hover:brightness-110 transition-all cursor-pointer active:scale-95"
              >
                {isEditing ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
