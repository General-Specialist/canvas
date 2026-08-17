import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Stop,
  ArrowCounterClockwise,
  CaretDown,
  Check,
  Tag as TagIcon,
} from '@phosphor-icons/react';
import { useFocus } from '../../context/FocusContext';
import { TagManagerModal } from './TagManagerModal';

export const FocusTimerCard: React.FC = () => {
  const {
    tags,
    selectedTagId,
    setSelectedTagId,
    selectedTag,
    elapsedSeconds,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishSession,
    taskTitle,
    setTaskTitle,
  } = useFocus();

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full border border-[var(--border-color)] rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
      <TagManagerModal isOpen={isTagModalOpen} onClose={() => setIsTagModalOpen(false)} />

      {/* Left: Task Intention Input */}
      <div className="flex-1 min-w-[180px] flex items-center">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="What are you working on?"
          className="w-full bg-transparent text-sm sm:text-base font-medium text-[var(--text-hover)] placeholder:text-[var(--text-light)]/60 focus:outline-none py-1 px-2"
        />
      </div>

      {/* Right: Controls Strip */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        {/* Tag Dropdown on the right side */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-color)] text-[var(--text-normal)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeColor }}
            />
            <span className="truncate max-w-[90px] sm:max-w-[120px]">
              #{selectedTag?.name || 'Tag'}
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
              {/* Search input if > 4 tags */}
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
                        <span className="truncate">#{tag.name}</span>
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
        <div className="font-mono text-base sm:text-xl font-bold text-[var(--text-hover)] min-w-[65px] sm:min-w-[80px] text-right tabular-nums">
          {formatTime(elapsedSeconds)}
        </div>

        {/* Play / Pause / Stop / Start Controls */}
        <div className="flex items-center gap-1.5">
          {isRunning && (
            <>
              <button
                type="button"
                onClick={isPaused ? resumeTimer : pauseTimer}
                title={isPaused ? 'Resume' : 'Pause'}
                className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
              >
                {isPaused ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}
              </button>
              <button
                type="button"
                onClick={resetTimer}
                title="Reset Stopwatch"
                className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
              >
                <ArrowCounterClockwise size={16} weight="bold" />
              </button>
            </>
          )}

          {!isRunning ? (
            <button
              type="button"
              onClick={startTimer}
              title="Start Stopwatch"
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              style={{ backgroundColor: activeColor }}
            >
              <Play size={16} weight="fill" className="ml-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => finishSession()}
              title="Stop & Log Session"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FF4B4B] hover:bg-[#E03A3A] text-white transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
            >
              <Stop size={16} weight="fill" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
