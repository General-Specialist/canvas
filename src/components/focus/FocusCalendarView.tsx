import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CaretLeft,
  CaretRight,
  Clock,
  CalendarBlank,
  Columns,
  ChartPieSlice,
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

const START_HOUR = 7; // 7 AM
const END_HOUR = 24; // 12 AM (Midnight)
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT = 50; // pixels per hour
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type ViewMode = 'month' | 'week' | 'day';

export const FocusCalendarView: React.FC = () => {
  const { sessions, isRunning, elapsedSeconds, selectedTag, taskTitle } = useFocus();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // Time Entry Modal state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<FocusSession | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<Date>(new Date());
  const [modalDefaultHour, setModalDefaultHour] = useState<number>(9);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current work hour or default to 8 AM on mount
  useEffect(() => {
    if (viewMode !== 'month' && scrollContainerRef.current) {
      const now = new Date();
      const currentH = now.getHours();
      // Scroll to 1 hour before current time, capped so early day is easily reachable
      if (currentH >= START_HOUR && currentH < 18) {
        const scrollOffsetHours = Math.max(0, currentH - START_HOUR - 1);
        scrollContainerRef.current.scrollTop = scrollOffsetHours * HOUR_HEIGHT;
      } else if (currentH >= 18) {
        // Evening: show from 12 PM onwards
        scrollContainerRef.current.scrollTop = 4 * HOUR_HEIGHT;
      } else {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [viewMode]);

  // Current time ticker for the red indicator line
  const [nowDate, setNowDate] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNowDate(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

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
  const nowIndicatorTop = Math.max(0, (nowHourFloat - START_HOUR) * HOUR_HEIGHT);

  const visibleDays = viewMode === 'week' ? weekDays : [currentDate];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Unified Single Calendar Box */}
      <div className="w-full border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col">
        {/* Integrated Top Calendar Header */}
        <div className="p-3 sm:p-4 border-b border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Date Title */}
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text-hover)]">
              {viewMode === 'month'
                ? formatMonthHeader(currentDate)
                : viewMode === 'week'
                ? formatWeekRangeHeader(weekDays)
                : formatDayHeader(currentDate)}
            </h2>
          </div>

          {/* Right: Duration, Summary Toggle, View Switcher, < > Nav Arrows */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap ml-auto">
            {totalRangeSeconds > 0 && (
              <div className="text-xs font-mono font-bold text-[var(--text-normal)] mr-1 hidden md:block">
                Total: {formatDuration(totalRangeSeconds)}
              </div>
            )}

            {/* Toggle Summary Bar */}
            <button
              type="button"
              onClick={() => setShowSummary((prev) => !prev)}
              title="Toggle tag distribution summary"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                showSummary
                  ? 'border-[var(--text-hover)] text-[var(--text-hover)]'
                  : 'border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-normal)]'
              }`}
            >
              <ChartPieSlice size={15} weight={showSummary ? 'fill' : 'regular'} />
            </button>

            {/* Icon-Only View Switcher (Month, Week, Day) */}
            <div className="flex items-center p-0.5 rounded-lg border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                title="Month view"
                className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  viewMode === 'month'
                    ? 'border-[var(--border-color)] text-[var(--text-hover)]'
                    : 'border-transparent text-[var(--text-light)] hover:text-[var(--text-normal)]'
                }`}
              >
                <CalendarBlank size={15} weight={viewMode === 'month' ? 'fill' : 'regular'} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                title="Week view"
                className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  viewMode === 'week'
                    ? 'border-[var(--border-color)] text-[var(--text-hover)]'
                    : 'border-transparent text-[var(--text-light)] hover:text-[var(--text-normal)]'
                }`}
              >
                <Columns size={15} weight={viewMode === 'week' ? 'fill' : 'regular'} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('day')}
                title="Day view"
                className={`p-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                  viewMode === 'day'
                    ? 'border-[var(--border-color)] text-[var(--text-hover)]'
                    : 'border-transparent text-[var(--text-light)] hover:text-[var(--text-normal)]'
                }`}
              >
                <Clock size={15} weight={viewMode === 'day' ? 'fill' : 'regular'} />
              </button>
            </div>

            {/* Prev / Next Navigation Arrows (Replacing Add Entry) */}
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
        </div>

        {/* Collapsible Tag Summary Bar */}
        {showSummary && (
          <div className="p-3 border-b border-[var(--border-color)]">
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
                const dayTotalSecs = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

                return (
                  <div
                    key={item.date.toISOString()}
                    onClick={() => handleCellClick(item.date, 9)}
                    className={`min-h-[105px] sm:min-h-[115px] p-2 flex flex-col justify-between transition-colors cursor-pointer ${
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

                    {/* Sessions List in Month Cell */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {daySessions.slice(0, 3).map((s) => (
                        <div
                          key={s.id}
                          onClick={(e) => handleSessionClick(e, s)}
                          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-[var(--border-color)] text-[10px] truncate cursor-pointer transition-colors"
                          title={`${s.taskTitle} (${formatDuration(s.durationSeconds)})`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.tagColor }}
                          />
                          <span className="font-medium text-[var(--text-hover)] truncate flex-1">
                            {s.taskTitle}
                          </span>
                          <span className="font-mono text-[var(--text-light)] text-[9px] shrink-0">
                            {formatDuration(s.durationSeconds)}
                          </span>
                        </div>
                      ))}
                      {daySessions.length > 3 && (
                        <div className="text-[9px] font-mono text-[var(--text-light)] pl-1">
                          + {daySessions.length - 3} more
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

            {/* Hourly Scrollable Grid Container */}
            <div
              ref={scrollContainerRef}
              className="w-full max-h-[640px] overflow-y-auto relative flex select-none"
            >
              {/* Time labels gutter */}
              <div
                className="w-14 sm:w-16 shrink-0 border-r border-[var(--border-color)] relative select-none"
                style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
              >
                {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => START_HOUR + i).map((hour, idx) => (
                  <div
                    key={hour}
                    style={{ top: `${idx * HOUR_HEIGHT}px` }}
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
                  const isCurrent = isToday(day);

                  // Check for live active session today
                  const isLiveToday = isRunning && isCurrent;
                  const activeStart = isLiveToday
                    ? new Date(Date.now() - elapsedSeconds * 1000)
                    : null;
                  const activeStartHour = activeStart
                    ? activeStart.getHours() + activeStart.getMinutes() / 60
                    : 0;
                  const liveTop =
                    activeStart &&
                    Math.max(0, (activeStartHour - START_HOUR) * HOUR_HEIGHT);
                  const liveHeight =
                    activeStart &&
                    Math.max(26, (Math.max(1, elapsedSeconds) / 3600) * HOUR_HEIGHT);

                  return (
                    <div
                      key={day.toISOString()}
                      className="relative"
                      style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
                    >
                      {/* Hourly Horizontal Lines & Clickable Slots */}
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          onClick={() => handleCellClick(day, hour)}
                          style={{ height: `${HOUR_HEIGHT}px` }}
                          className="border-b border-[var(--border-color)]/70 transition-colors cursor-pointer"
                          title={`Click to log time at ${formatHourLabel(hour)}`}
                        />
                      ))}

                      {/* Current Time Red Indicator Line on Today's column */}
                      {isCurrent && isNowInVisibleRange && (
                        <div
                          className="absolute left-0 right-0 z-30 pointer-events-none flex items-center -translate-y-1/2"
                          style={{ top: `${nowIndicatorTop}px` }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B] -ml-1.25 shrink-0" />
                          <div className="flex-1 h-[2px] bg-[#FF4B4B]" />
                        </div>
                      )}

                      {/* Live Active Session Block */}
                      {isLiveToday && liveTop !== null && liveHeight !== null && (
                        <div
                          style={{
                            top: `${liveTop}px`,
                            height: `${liveHeight}px`,
                            borderColor: selectedTag?.color || '#58CC02',
                          }}
                          className="absolute left-1 right-1 z-20 rounded-md border-2 border-dashed p-2 flex flex-col justify-between overflow-hidden animate-pulse"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: selectedTag?.color || '#58CC02' }}
                            />
                            <span className="text-[11px] font-bold text-[var(--text-hover)] truncate">
                              {taskTitle || 'Tracking...'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#58CC02]">
                            ● Live ({Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s)
                          </span>
                        </div>
                      )}

                      {/* Logged Focus Sessions Blocks */}
                      {daySessions.map((s) => {
                        const start = new Date(s.startedAt);
                        const startHour = start.getHours() + start.getMinutes() / 60;
                        const durationHours = s.durationSeconds / 3600;
                        const top = Math.max(0, (startHour - START_HOUR) * HOUR_HEIGHT);
                        const height = Math.max(24, durationHours * HOUR_HEIGHT);

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
                            className="absolute left-1 right-1 z-10 rounded-md border-l-4 border-t border-r border-b border-[var(--border-color)] p-1.5 cursor-pointer transition-all flex flex-col justify-between overflow-hidden group"
                          >
                            <div className="flex items-start justify-between gap-1 min-w-0">
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-[var(--text-hover)] truncate block leading-tight">
                                  {s.taskTitle}
                                </span>
                                {height >= 42 && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0"
                                      style={{ backgroundColor: s.tagColor }}
                                    />
                                    <span className="text-[10px] text-[var(--text-light)] font-medium truncate">
                                      #{s.tagName}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-[var(--text-normal)] shrink-0">
                                {formatDuration(s.durationSeconds)}
                              </span>
                            </div>

                            {height >= 55 && (
                              <div className="text-[10px] font-mono text-[var(--text-light)] pt-0.5">
                                {startStr} - {endStr}
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
    </div>
  );
};
