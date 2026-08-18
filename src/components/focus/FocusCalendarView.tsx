import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CaretLeft,
  CaretRight,
  CaretDown,
  Play,
  Pause,
  Stop,
  ArrowCounterClockwise,
  Check,
  Plus,
  Minus,
  Tag as TagIcon,
} from '@phosphor-icons/react';
import { useFocus } from '../../context/FocusContext';
import { FocusSession } from '../../types/focus';
import {
  getWeekDays,
  getMonthDays,
  isSameDay,
  isToday,
  formatMonthHeader,
  formatWeekRangeHeader,
  formatDayHeader,
  formatHourLabel,
  formatDuration,
} from '../../utils/calendarUtils';
import { TimeEntryModal } from './TimeEntryModal';
import { TagDistributionCard } from './TagDistributionCard';
import { TagManagerModal } from './TagManagerModal';
import { WebsiteBlockerModal } from './WebsiteBlockerModal';
import { GoogleCalendarModal } from './GoogleCalendarModal';
import { GoogleEventDetailsModal } from './GoogleEventDetailsModal';
import { useGoogleCalendar } from '../../context/GoogleCalendarContext';
import { GoogleCalendarEvent } from '../../types/googleCalendar';
import { ShieldCheck, CalendarCheck } from '@phosphor-icons/react';


const START_HOUR = 7; // 7 AM
const END_HOUR = 24; // 12 AM (Midnight)
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ViewMode = 'month' | 'week' | 'day';

export const FocusCalendarView: React.FC = () => {
  const {
    tags,
    selectedTagId,
    setSelectedTagId,
    selectedTag,
    sessions,
    elapsedSeconds,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishSession,
    blockerConfig,
    stopSiteStopwatch,
  } = useFocus();

  const {
    feeds: gcalFeeds,
    events: gcalEvents,
    isSyncing: isGCalSyncing,
    showGCalEvents,
  } = useGoogleCalendar();

  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [isGCalModalOpen, setIsGCalModalOpen] = useState(false);
  const [selectedGCalEvent, setSelectedGCalEvent] = useState<GoogleCalendarEvent | null>(null);
  const [isGCalDetailsOpen, setIsGCalDetailsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('jarvis_focus_view_mode_v1');
      if (saved === 'month' || saved === 'week' || saved === 'day') return saved;
    } catch {}
    return 'day';
  });

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('jarvis_focus_view_mode_v1', mode);
    } catch {}
  };

  // Zoom / Hour Height state (defaults to 85px = 100% zoom, supports up to 850px = 1000% zoom)
  const MIN_HOUR_HEIGHT = 40; // ~47%
  const MAX_HOUR_HEIGHT = 850; // 1000%

  const [hourHeight, setHourHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jarvis_focus_hour_height_v1');
      if (saved) {
        const val = Number(saved);
        if (val >= MIN_HOUR_HEIGHT && val <= MAX_HOUR_HEIGHT) return val;
      }
    } catch {
      // fallback
    }
    return 85;
  });

  const handleZoomIn = () => {
    setHourHeight((prev) => {
      const step = prev >= 340 ? 50 : prev >= 170 ? 25 : 15;
      const next = Math.min(MAX_HOUR_HEIGHT, prev + step);
      try {
        localStorage.setItem('jarvis_focus_hour_height_v1', String(next));
      } catch {}
      return next;
    });
  };

  const handleZoomOut = () => {
    setHourHeight((prev) => {
      const step = prev > 340 ? 50 : prev > 170 ? 25 : 15;
      const next = Math.max(MIN_HOUR_HEIGHT, prev - step);
      try {
        localStorage.setItem('jarvis_focus_hour_height_v1', String(next));
      } catch {}
      return next;
    });
  };

  // Timer & Tag Dropdown state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Time Entry Modal state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<FocusSession | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<Date>(new Date());
  const [modalDefaultHour, setModalDefaultHour] = useState<number>(9);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        if (isRunning && !isPaused) {
          pauseTimer();
        } else if (isRunning && isPaused) {
          resumeTimer();
        } else {
          startTimer();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, isPaused, startTimer, pauseTimer, resumeTimer]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeColor = selectedTag?.color || '#58CC02';

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase().trim())
  );

  // Auto-scroll to current work hour or default to 8 AM on mount
  useEffect(() => {
    if (viewMode !== 'month' && scrollContainerRef.current) {
      const now = new Date();
      const currentH = now.getHours();
      // Scroll to 1 hour before current time, capped so early day is easily reachable
      if (currentH >= START_HOUR && currentH < 18) {
        const scrollOffsetHours = Math.max(0, currentH - START_HOUR - 1);
        scrollContainerRef.current.scrollTop = scrollOffsetHours * hourHeight;
      } else if (currentH >= 18) {
        // Evening: show from 12 PM onwards
        scrollContainerRef.current.scrollTop = 4 * hourHeight;
      } else {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [viewMode, hourHeight]);

  // Current time ticker for the red indicator line and live stopwatch blocks
  const [nowDate, setNowDate] = useState<Date>(new Date());
  useEffect(() => {
    const hasActiveSiteStopwatch = Object.keys(blockerConfig.activeSiteStopwatches || {}).length > 0;
    const intervalMs = (isRunning || hasActiveSiteStopwatch) ? 1000 : 30000;
    const timer = setInterval(() => setNowDate(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [isRunning, blockerConfig.activeSiteStopwatches]);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleCellClick = (date: Date, hour: number = 9) => {
    setSelectedSession(null);
    setModalDefaultDate(date);
    setModalDefaultHour(hour);
    setIsEntryModalOpen(true);
  };

  const handleSessionClick = (e: React.MouseEvent, session: FocusSession) => {
    e.stopPropagation();
    setSelectedSession(session);
    setIsEntryModalOpen(true);
  };

  const handleGCalEventClick = (e: React.MouseEvent, event: GoogleCalendarEvent) => {
    e.stopPropagation();
    setSelectedGCalEvent(event);
    setIsGCalDetailsOpen(true);
  };

  // Calculate total duration for visible range
  const totalRangeSeconds = useMemo(() => {
    if (viewMode === 'month') {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      return sessions
        .filter((s) => {
          const d = new Date(s.startedAt);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, s) => sum + s.durationSeconds, 0);
    } else if (viewMode === 'week') {
      return sessions
        .filter((s) => weekDays.some((d) => isSameDay(s.startedAt, d)))
        .reduce((sum, s) => sum + s.durationSeconds, 0);
    } else {
      return sessions
        .filter((s) => isSameDay(s.startedAt, currentDate))
        .reduce((sum, s) => sum + s.durationSeconds, 0);
    }
  }, [sessions, viewMode, currentDate, weekDays]);

  // Format time of day for live indicator
  const nowHourFloat = nowDate.getHours() + nowDate.getMinutes() / 60;
  const isNowInVisibleRange = nowHourFloat >= START_HOUR && nowHourFloat <= END_HOUR;
  const nowIndicatorTop = Math.max(0, (nowHourFloat - START_HOUR) * hourHeight);

  const visibleDays = viewMode === 'week' ? weekDays : [currentDate];

  return (
    <div className="w-full flex flex-col gap-4">
      <TagManagerModal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} />
      <WebsiteBlockerModal isOpen={isBlockerModalOpen} onClose={() => setIsBlockerModalOpen(false)} />

      {/* Unified Single Calendar Box */}

      <div className="w-full border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col">
        {/* Integrated Top Calendar & Timer Header */}
        <div className="p-3 sm:p-4 border-b border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Date Title & Calendar Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2
              onClick={() => setCurrentDate(new Date())}
              className="text-sm sm:text-base font-bold text-[var(--text-hover)] cursor-pointer hover:opacity-80 transition-opacity"
              title="Jump to today"
            >
              {viewMode === 'month'
                ? formatMonthHeader(currentDate)
                : viewMode === 'week'
                ? formatWeekRangeHeader(weekDays)
                : formatDayHeader(currentDate)}
            </h2>

            {/* Prev / Next Navigation */}
            <div className="flex items-center border border-[var(--border-color)] rounded-lg p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-md text-[var(--text-light)] hover:text-[var(--text-normal)] transition-colors cursor-pointer"
                title="Previous"
              >
                <CaretLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-md text-[var(--text-light)] hover:text-[var(--text-normal)] transition-colors cursor-pointer"
                title="Next"
              >
                <CaretRight size={14} />
              </button>
            </div>
          </div>

          {/* Right: Tag Selector, Timer, Controls, Zoom & Calendar Tools */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap ml-auto">
            {/* Tag Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] text-[var(--text-normal)] hover:text-[var(--text-hover)] bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeColor }}
                />
                <span className="truncate max-w-[100px] sm:max-w-[130px]">
                  {selectedTag?.name || 'Tag'}
                </span>
                <CaretDown
                  size={12}
                  className={`text-[var(--text-light)] transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-[var(--canvas-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                  {tags.length > 4 && (
                    <div className="px-2 py-1">
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Filter tags..."
                        className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-normal)] placeholder:text-[var(--text-light)]/50 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="max-h-52 overflow-y-auto px-1 py-1 space-y-0.5">
                    {filteredTags.map((tag) => {
                      const isSelected = tag.id === selectedTagId;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            setSelectedTagId(tag.id);
                            setIsDropdownOpen(false);
                            setTagSearch('');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'text-[var(--text-hover)] font-bold border border-[var(--border-color)]'
                              : 'text-[var(--text-normal)] hover:text-[var(--text-hover)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="truncate">{tag.name}</span>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-[var(--text-hover)] shrink-0" weight="bold" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="my-1 border-t border-[var(--border-color)]" />

                  <div className="px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTagModalOpen(true);
                        setIsDropdownOpen(false);
                        setTagSearch('');
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-light)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
                    >
                      <TagIcon size={13} weight="bold" />
                      <span>Manage Tags</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stopwatch Time Display */}
            <div className="font-mono text-xs sm:text-sm font-bold text-[var(--text-hover)] min-w-[46px] sm:min-w-[54px] text-right tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>

            {/* Play / Pause / Stop / Start Controls */}
            <div className="flex items-center gap-1">
              {isRunning && (
                <>
                  <button
                    type="button"
                    onClick={isPaused ? resumeTimer : pauseTimer}
                    title={isPaused ? 'Resume' : 'Pause'}
                    className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
                  >
                    {isPaused ? <Play size={13} weight="fill" /> : <Pause size={13} weight="fill" />}
                  </button>
                  <button
                    type="button"
                    onClick={resetTimer}
                    title="Reset Stopwatch"
                    className="p-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
                  >
                    <ArrowCounterClockwise size={13} weight="bold" />
                  </button>
                </>
              )}

              {!isRunning ? (
                <button
                  type="button"
                  onClick={startTimer}
                  title="Start Stopwatch (Spacebar)"
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                  style={{ backgroundColor: activeColor }}
                >
                  <Play size={13} weight="fill" className="ml-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => finishSession()}
                  title="Stop & Log Session"
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-[#FF4B4B] hover:bg-[#E03A3A] text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                >
                  <Stop size={13} weight="fill" />
                </button>
              )}
            </div>

            {/* Subtle Vertical Divider */}
            <div className="h-4 w-[1px] bg-[var(--border-color)] mx-0.5 hidden sm:block" />

            {/* Zoom Controls (- / +) for Week & Day views */}
            {viewMode !== 'month' && (
              <div className="flex items-center p-0.5 rounded-lg border border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={hourHeight <= MIN_HOUR_HEIGHT}
                  className="p-1.5 rounded-md text-[var(--text-light)] hover:text-[var(--text-normal)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Zoom out calendar"
                >
                  <Minus size={12} weight="bold" />
                </button>
                <span className="text-[10px] font-mono font-bold text-[var(--text-light)] px-1 select-none">
                  {Math.round((hourHeight / 85) * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={hourHeight >= MAX_HOUR_HEIGHT}
                  className="p-1.5 rounded-md text-[var(--text-light)] hover:text-[var(--text-normal)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Zoom in calendar (supports over 500%)"
                >
                  <Plus size={12} weight="bold" />
                </button>
              </div>
            )}

            {/* Total Duration */}
            {totalRangeSeconds > 0 && (
              <div className="text-xs font-mono font-bold text-[var(--text-normal)] hidden lg:block">
                {formatDuration(totalRangeSeconds)}
              </div>
            )}

            {/* View Switcher: D, W, M */}
            <div className="flex items-center p-0.5 rounded-lg border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => handleSetViewMode('day')}
                title="Day view"
                className={`w-6 h-6 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center justify-center border ${
                  viewMode === 'day'
                    ? 'border-[var(--border-color)] text-[var(--text-hover)]'
                    : 'border-transparent text-[var(--text-light)] hover:text-[var(--text-normal)]'
                }`}
              >
                D
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('week')}
                title="Week view"
                className={`w-6 h-6 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center justify-center border ${
                  viewMode === 'week'
                    ? 'border-[var(--border-color)] text-[var(--text-hover)]'
                    : 'border-transparent text-[var(--text-light)] hover:text-[var(--text-normal)]'
                }`}
              >
                W
              </button>
              <button
                type="button"
                onClick={() => handleSetViewMode('month')}
                title="Month view"
                className={`w-6 h-6 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center justify-center border ${
                  viewMode === 'month'
                    ? 'border-[var(--border-color)] text-[var(--text-hover)]'
                    : 'border-transparent text-[var(--text-light)] hover:text-[var(--text-normal)]'
                }`}
              >
                M
              </button>
            </div>

            {/* LibreWolf Blocker Settings Button */}
            <button
              type="button"
              onClick={() => setIsBlockerModalOpen(true)}
              title="LibreWolf Website Blocker"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                blockerConfig.enabled
                  ? 'border-[#58CC02]/40 text-[#58CC02] bg-[#58CC02]/10 hover:bg-[#58CC02]/20'
                  : 'border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)]'
              }`}
            >
              <ShieldCheck size={14} weight={blockerConfig.enabled ? 'fill' : 'bold'} />
              <span className="hidden sm:inline">Blocker</span>
              {blockerConfig.enabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02]" />
              )}
            </button>

            {/* Google Calendar Integration Button */}
            <button
              type="button"
              onClick={() => setIsGCalModalOpen(true)}
              title="Google Calendar Integration & Sync"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                gcalFeeds.some((f) => f.enabled)
                  ? 'border-[#4285F4]/40 text-[#4285F4] bg-[#4285F4]/10 hover:bg-[#4285F4]/20'
                  : 'border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)]'
              }`}
            >
              <CalendarCheck size={14} weight={gcalFeeds.some((f) => f.enabled) ? 'fill' : 'bold'} />
              <span className="hidden sm:inline">Google Cal</span>
              {isGCalSyncing && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-ping" />
              )}
            </button>
          </div>
        </div>


        {/* Tag Distribution Summary */}
        {sessions.length > 0 && (
          <div className="p-3 sm:p-4 border-b border-[var(--border-color)]">
            <TagDistributionCard />
          </div>
        )}

        {/* Main Calendar View Area */}
        {viewMode === 'month' ? (
          /* Month View Grid */
          <div className="w-full flex flex-col">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-[var(--border-color)] divide-x divide-[var(--border-color)]">
              {WEEKDAY_NAMES.map((name) => (
                <div
                  key={name}
                  className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-[var(--text-light)]"
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-color)]">
              {monthDays.map((item) => {
                const isCurrent = isToday(item.date);
                const daySessions = sessions.filter((s) => isSameDay(s.startedAt, item.date));
                const dayGCal = showGCalEvents
                  ? gcalEvents.filter((e) => isSameDay(e.start, item.date))
                  : [];
                const dayTotalSecs = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

                return (
                  <div
                    key={item.date.toISOString()}
                    onClick={() => handleCellClick(item.date, 9)}
                    className={`min-h-[125px] sm:min-h-[140px] p-2 flex flex-col justify-between transition-colors cursor-pointer ${
                      !item.isCurrentMonth ? 'opacity-30' : ''
                    }`}
                  >
                    {/* Cell Header: Date Number + Day Total */}
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'border-2 border-[#58CC02] text-[#58CC02]'
                            : 'text-[var(--text-hover)]'
                        }`}
                      >
                        {item.date.getDate()}
                      </div>
                      {dayTotalSecs > 0 && (
                        <span className="text-[10px] font-mono font-medium text-[var(--text-light)]">
                          {formatDuration(dayTotalSecs)}
                        </span>
                      )}
                    </div>

                    {/* Sessions & GCal Events List in Month Cell */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {/* Logged Focus Sessions */}
                      {daySessions.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          onClick={(e) => handleSessionClick(e, s)}
                          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--node-bg)] text-[10px] truncate cursor-pointer transition-colors"
                          title={`${s.tagName} (${formatDuration(s.durationSeconds)})`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.tagColor }}
                          />
                          <span className="font-semibold text-[var(--text-hover)] truncate flex-1">
                            {s.tagName}
                          </span>
                          <span className="font-mono text-[var(--text-light)] text-[9px] shrink-0">
                            {formatDuration(s.durationSeconds)}
                          </span>
                        </div>
                      ))}

                      {/* Google Calendar Events */}
                      {dayGCal.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          onClick={(ev) => handleGCalEventClick(ev, e)}
                          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--sidebar-bg)]/60 text-[10px] truncate cursor-pointer transition-colors hover:border-[var(--text-light)]"
                          title={`[GCal] ${e.title}`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: e.calendarColor }}
                          />
                          <span className="font-medium text-[var(--text-hover)] truncate flex-1">
                            {e.title}
                          </span>
                          {!e.allDay && (
                            <span className="font-mono text-[var(--text-light)] text-[9px] shrink-0">
                              {new Date(e.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      ))}

                      {daySessions.length + dayGCal.length > 4 && (
                        <div className="text-[9px] font-mono text-[var(--text-light)] pl-1">
                          + {daySessions.length + dayGCal.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Week / Day Hourly Calendar Grid View */
          <div className="w-full flex flex-col">
            {/* Day Column Headers */}
            <div className="flex border-b border-[var(--border-color)] sticky top-0 z-20">
              {/* Gutter space for time column */}
              <div className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] p-2 text-center text-[11px] font-mono text-[var(--text-light)]" />

              {/* Days columns */}
              <div className="flex-1 grid grid-flow-col auto-cols-fr divide-x divide-[var(--border-color)]">
                {visibleDays.map((day) => {
                  const isCurrent = isToday(day);
                  const daySessions = sessions.filter((s) => isSameDay(s.startedAt, day));
                  const dayTotalSecs = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

                  return (
                    <div
                      key={day.toISOString()}
                      className="py-2 px-1 sm:px-3 text-center flex flex-col items-center justify-center transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-light)]">
                        {day.toLocaleDateString([], { weekday: 'short' })}
                      </span>
                      <div
                        className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'border-2 border-[#58CC02] text-[#58CC02]'
                            : 'text-[var(--text-hover)]'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      {dayTotalSecs > 0 && (
                        <span className="text-[10px] font-mono font-medium text-[var(--text-light)] mt-0.5">
                          {formatDuration(dayTotalSecs)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All-Day Events Banner (if any exist for visible days) */}
            {showGCalEvents && visibleDays.some((day) => gcalEvents.some((e) => e.allDay && isSameDay(e.start, day))) && (
              <div className="flex border-b border-[var(--border-color)] bg-[var(--sidebar-bg)]/30 min-h-[32px]">
                <div className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] p-1.5 text-center text-[10px] font-mono text-[var(--text-light)] flex items-center justify-center">
                  All-day
                </div>
                <div className="flex-1 grid grid-flow-col auto-cols-fr divide-x divide-[var(--border-color)] p-1 gap-1">
                  {visibleDays.map((day) => {
                    const dayAllDay = gcalEvents.filter((e) => e.allDay && isSameDay(e.start, day));
                    return (
                      <div key={day.toISOString()} className="space-y-1 px-1">
                        {dayAllDay.map((e) => (
                          <div
                            key={e.id}
                            onClick={(ev) => handleGCalEventClick(ev, e)}
                            style={{ borderLeftColor: e.calendarColor }}
                            className="px-2 py-0.5 rounded border-l-3 border border-[var(--border-color)] bg-[var(--node-bg)] text-[10px] font-semibold text-[var(--text-hover)] truncate cursor-pointer hover:border-[var(--text-light)] transition-all"
                            title={`${e.calendarName}: ${e.title}`}
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hourly Scrollable Grid Container */}
            <div
              ref={scrollContainerRef}
              className="w-full max-h-[700px] overflow-y-auto relative flex select-none"
            >
              {/* Time labels gutter */}
              <div
                className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] relative select-none"
                style={{ height: `${TOTAL_HOURS * hourHeight}px` }}
              >
                {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i).map((hour, idx) => (
                  <div
                    key={hour}
                    style={{ top: `${idx * hourHeight}px` }}
                    className="absolute right-2 -translate-y-1/2 text-[11px] font-mono text-[var(--text-light)] pointer-events-none"
                  >
                    <span>{formatHourLabel(hour)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Day Columns Grid */}
              <div className="flex-1 grid grid-flow-col auto-cols-fr divide-x divide-[var(--border-color)] relative">
                {visibleDays.map((day) => {
                  const daySessions = sessions.filter((s) => isSameDay(s.startedAt, day));
                  const dayGCal = showGCalEvents
                    ? gcalEvents.filter((e) => !e.allDay && isSameDay(e.start, day))
                    : [];
                  const isCurrent = isToday(day);

                  // Check for live active session today
                  const isLiveToday = isRunning && isCurrent;
                  const activeStart = isLiveToday
                    ? new Date(Date.now() - elapsedSeconds * 1000)
                    : null;
                  const activeStartHour = activeStart
                    ? activeStart.getHours() + activeStart.getMinutes() / 60 + activeStart.getSeconds() / 3600
                    : 0;
                  const liveTop =
                    activeStart &&
                    Math.max(0, (activeStartHour - START_HOUR) * hourHeight);
                  const liveHeight =
                    activeStart &&
                    Math.max(26, (Math.max(1, elapsedSeconds) / 3600) * hourHeight);

                  return (
                    <div
                      key={day.toISOString()}
                      className="relative"
                      style={{ height: `${TOTAL_HOURS * hourHeight}px` }}
                    >
                      {/* Hourly Horizontal Lines & Clickable Slots */}
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          onClick={() => handleCellClick(day, hour)}
                          style={{ height: `${hourHeight}px` }}
                          className="border-b border-[var(--border-color)]/70 relative transition-colors cursor-pointer hover:bg-[var(--sidebar-hover-bg)]/20"
                          title={`Click to log time at ${formatHourLabel(hour)}`}
                        >
                          {/* 30-minute subtle dashed divider line when zoomed in */}
                          {hourHeight >= 65 && (
                            <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-[var(--border-color)]/30 pointer-events-none" />
                          )}
                          {/* 15-minute and 45-minute subtle dotted sub-lines when zoomed in deep (200%+) */}
                          {hourHeight >= 180 && (
                            <>
                              <div className="absolute top-1/4 left-0 right-0 border-b border-dotted border-[var(--border-color)]/20 pointer-events-none" />
                              <div className="absolute top-3/4 left-0 right-0 border-b border-dotted border-[var(--border-color)]/20 pointer-events-none" />
                            </>
                          )}
                        </div>
                      ))}

                      {/* Current Time Red Indicator Line on Today's column */}
                      {isCurrent && isNowInVisibleRange && (
                        <div
                          className="absolute left-0 right-0 z-30 pointer-events-none flex items-center -translate-y-1/2"
                          style={{ top: `${nowIndicatorTop}px` }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B] -ml-1 shrink-0 ring-2 ring-[var(--canvas-bg)]" />
                          <div className="flex-1 h-[2px] bg-[#FF4B4B]" />
                        </div>
                      )}

                      {/* Live Active Session Block (Solid, calm, non-flashing) */}
                      {isLiveToday && liveTop !== null && liveHeight !== null && (
                        <div
                          style={{
                            top: `${liveTop}px`,
                            height: `${liveHeight}px`,
                            borderLeftColor: selectedTag?.color || '#58CC02',
                          }}
                          className="absolute left-1 right-1 z-20 rounded-md border-l-4 border-t border-r border-b border-[var(--border-color)] p-1.5 flex flex-col justify-between overflow-hidden bg-[var(--node-bg)] shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-1 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: selectedTag?.color || '#58CC02' }}
                              />
                              <span className="text-xs font-bold text-[var(--text-hover)] truncate">
                                {selectedTag?.name || 'Focus'}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[var(--text-normal)] shrink-0">
                              {formatDuration(elapsedSeconds)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Live Active Unblock / Site Stopwatches Blocks */}
                      {isCurrent &&
                        Object.entries(blockerConfig.activeSiteStopwatches || {}).map(
                          ([siteDomain, startedAt]) => {
                            const siteElapsed = Math.max(
                              1,
                              Math.floor((nowDate.getTime() - startedAt) / 1000)
                            );
                            const siteStart = new Date(startedAt);
                            const siteStartHour =
                              siteStart.getHours() +
                              siteStart.getMinutes() / 60 +
                              siteStart.getSeconds() / 3600;
                            const siteTop = Math.max(
                              0,
                              (siteStartHour - START_HOUR) * hourHeight
                            );
                            const siteHeight = Math.max(
                              26,
                              (siteElapsed / 3600) * hourHeight
                            );
                            const siteTag = tags.find(
                              (t) =>
                                t.name.toLowerCase() === siteDomain.toLowerCase()
                            );
                            const siteColor = siteTag?.color || '#58CC02';

                            return (
                              <div
                                key={siteDomain}
                                style={{
                                  top: `${siteTop}px`,
                                  height: `${siteHeight}px`,
                                  borderLeftColor: siteColor,
                                }}
                                className="absolute left-1 right-1 z-20 rounded-md border-l-4 border-t border-r border-b border-[var(--border-color)] p-1.5 flex flex-col justify-between overflow-hidden bg-[var(--node-bg)] shadow-xs hover:border-[var(--text-light)] transition-all"
                              >
                                <div className="flex items-center justify-between gap-1 min-w-0">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-2 h-2 rounded-full shrink-0 bg-[#58CC02] animate-pulse" />
                                    <span className="text-xs font-bold text-[var(--text-hover)] truncate">
                                      {siteDomain}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] font-mono font-bold text-[#58CC02]">
                                      {formatDuration(siteElapsed)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        stopSiteStopwatch(siteDomain);
                                      }}
                                      className="px-1.5 py-0.5 rounded bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold cursor-pointer transition-all active:scale-95"
                                      title="Stop stopwatch & save block to calendar"
                                    >
                                      Stop
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}

                      {/* Synced Google Calendar Events Blocks */}
                      {dayGCal.map((e) => {
                        const start = new Date(e.start);
                        const end = new Date(e.end);
                        const startHour = start.getHours() + start.getMinutes() / 60 + start.getSeconds() / 3600;
                        const durationHours = Math.max(0.25, (e.end - e.start) / 3600000);
                        const top = Math.max(0, (startHour - START_HOUR) * hourHeight);
                        const height = Math.max(22, durationHours * hourHeight);

                        const startStr = start.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const endStr = end.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={e.id}
                            onClick={(ev) => handleGCalEventClick(ev, e)}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              borderLeftColor: e.calendarColor,
                            }}
                            className="absolute left-1 right-1 z-10 rounded-md border-l-4 border-t border-r border-b border-[var(--border-color)] bg-[var(--node-bg)] shadow-xs hover:border-[var(--text-light)] p-1.5 cursor-pointer transition-all overflow-hidden group hover:z-20"
                            title={`[Google Calendar] ${e.title} (${startStr} - ${endStr})`}
                          >
                            {height < 46 ? (
                              <div className="flex items-center justify-between gap-1 min-w-0 h-full">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: e.calendarColor }}
                                  />
                                  <span className="text-xs font-semibold text-[var(--text-hover)] truncate block leading-none">
                                    {e.title}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-[var(--text-light)] shrink-0">
                                  {startStr}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col justify-between h-full">
                                <div className="flex items-start justify-between gap-1 min-w-0">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: e.calendarColor }}
                                    />
                                    <span className="text-xs font-semibold text-[var(--text-hover)] truncate block leading-tight">
                                      {e.title}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono text-[var(--text-light)] pt-0.5 truncate">
                                  {startStr} - {endStr}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Logged Focus Sessions Blocks */}
                      {daySessions.map((s) => {
                        const start = new Date(s.startedAt);
                        const startHour = start.getHours() + start.getMinutes() / 60 + start.getSeconds() / 3600;
                        const durationHours = Math.max(1, s.durationSeconds) / 3600;
                        const top = Math.max(0, (startHour - START_HOUR) * hourHeight);
                        const height = Math.max(26, durationHours * hourHeight);

                        const startStr = start.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const endStr = new Date(s.endedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={s.id}
                            onClick={(e) => handleSessionClick(e, s)}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              borderLeftColor: s.tagColor,
                            }}
                            className="absolute left-1 right-1 z-10 rounded-md border-l-4 border-t border-r border-b border-[var(--border-color)] bg-[var(--node-bg)] shadow-xs hover:border-[var(--text-light)] p-1.5 cursor-pointer transition-all overflow-hidden group"
                          >
                            {height < 46 ? (
                              <div className="flex items-center justify-between gap-1 min-w-0 h-full">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: s.tagColor }}
                                  />
                                  <span className="text-xs font-bold text-[var(--text-hover)] truncate block leading-none">
                                    {s.tagName}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[var(--text-normal)] shrink-0">
                                  {formatDuration(s.durationSeconds)}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col justify-between h-full">
                                <div className="flex items-start justify-between gap-1 min-w-0">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span
                                      className="w-2 h-2 rounded-full shrink-0"
                                      style={{ backgroundColor: s.tagColor }}
                                    />
                                    <span className="text-xs font-bold text-[var(--text-hover)] truncate block leading-tight">
                                      {s.tagName}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-[var(--text-normal)] shrink-0">
                                    {formatDuration(s.durationSeconds)}
                                  </span>
                                </div>
                                <div className="text-[10px] font-mono text-[var(--text-light)] pt-0.5">
                                  {startStr} - {endStr}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry / Edit Modal */}
      <TimeEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        defaultDate={modalDefaultDate}
        defaultStartHour={modalDefaultHour}
      />

      {/* Google Calendar Integration Modal */}
      <GoogleCalendarModal
        isOpen={isGCalModalOpen}
        onClose={() => setIsGCalModalOpen(false)}
      />

      {/* Google Calendar Event Details Modal */}
      <GoogleEventDetailsModal
        isOpen={isGCalDetailsOpen}
        event={selectedGCalEvent}
        onClose={() => {
          setIsGCalDetailsOpen(false);
          setSelectedGCalEvent(null);
        }}
      />
    </div>
  );
};
