import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle,
  MapPin,
  Calendar,
} from '@phosphor-icons/react';
import { GoogleCalendarEvent } from '../../types/googleCalendar';
import { useFocus } from '../../context/FocusContext';
import { formatDuration } from '../../utils/calendarUtils';

interface GoogleEventDetailsModalProps {
  event: GoogleCalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleEventDetailsModal: React.FC<GoogleEventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const { tags, setSelectedTagId, startTimer, addManualSession } = useFocus();
  const [selectedTagIdForLog, setSelectedTagIdForLog] = useState<string>(() => tags[0]?.id || 'tag-coding');

  if (!isOpen || !event) return null;

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const durationSeconds = Math.max(60, Math.floor((event.end - event.start) / 1000));

  const formattedDate = startDate.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = event.allDay
    ? 'All Day'
    : `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

  // 1-Click "Start Focus on This Event"
  const handleStartFocus = () => {
    // Look for matching tag or use selected tag
    const matchingTag = tags.find(
      (t) => t.name.toLowerCase() === event.title.toLowerCase() || t.name.toLowerCase() === event.calendarName.toLowerCase()
    );

    if (matchingTag) {
      setSelectedTagId(matchingTag.id);
    } else if (selectedTagIdForLog) {
      setSelectedTagId(selectedTagIdForLog);
    }

    startTimer();
    onClose();
  };

  // 1-Click "Log as Focus Session"
  const handleLogSession = () => {
    addManualSession({
      tagId: selectedTagIdForLog,
      startedAt: event.start,
      endedAt: event.end,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="w-full max-w-md bg-[var(--canvas-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Calendar Color Stripe */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: event.calendarColor }}
        />

        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: event.calendarColor }}
              />
              <span className="text-xs font-semibold text-[var(--text-light)]">
                {event.calendarName}
              </span>
              {event.isRecurring && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-[var(--border-color)] text-[var(--text-light)]">
                  Recurring
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-hover)] leading-tight break-words">
              {event.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Details */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Date & Time */}
          <div className="flex items-start gap-2.5 text-[var(--text-normal)]">
            <Calendar size={16} className="text-[var(--text-light)] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[var(--text-hover)]">{formattedDate}</div>
              <div className="text-[var(--text-light)] font-mono">
                {formattedTime} {!event.allDay && `(${formatDuration(durationSeconds)})`}
              </div>
            </div>
          </div>

          {/* Location if present */}
          {event.location && (
            <div className="flex items-start gap-2.5 text-[var(--text-normal)]">
              <MapPin size={16} className="text-[var(--text-light)] shrink-0 mt-0.5" />
              <div className="text-[var(--text-hover)] break-words">{event.location}</div>
            </div>
          )}

          {/* Description if present */}
          {event.description && (
            <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--sidebar-bg)]/50 max-h-36 overflow-y-auto whitespace-pre-wrap text-[var(--text-normal)] text-xs leading-relaxed">
              {event.description}
            </div>
          )}

          {/* Tag Selector for logging */}
          <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-light)]">
              Assign to Tag:
            </label>
            <select
              value={selectedTagIdForLog}
              onChange={(e) => setSelectedTagIdForLog(e.target.value)}
              className="w-full bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-normal)] focus:outline-none focus:border-[#4285F4]"
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--sidebar-bg)]/30 flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleStartFocus}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#58CC02] hover:bg-[#46A302] transition-colors cursor-pointer shadow-xs"
          >
            <Play size={14} weight="fill" />
            <span>Start Focus</span>
          </button>

          <button
            type="button"
            onClick={handleLogSession}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-[var(--border-color)] text-[var(--text-normal)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle size={14} weight="bold" />
            <span>Log as Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
