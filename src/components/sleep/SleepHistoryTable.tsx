import React, { useState, useMemo } from 'react';
import { useSleep } from '../../context/SleepContext';
import {
  calculateSleepDurationMinutes,
  formatFriendlyDate,
  formatSleepDuration,
} from '../../utils/sleepStorage';
import {
  FALL_ASLEEP_OPTIONS,
} from '../../types/sleep';
import {
  PencilSimple,
  Trash,
  Lightning,
  Pill,
  WarningCircle,
  MagnifyingGlass,
} from '@phosphor-icons/react';

export const SleepHistoryTable: React.FC = () => {
  const {
    entries,
    openEditEntryForm,
    deleteEntry,
    filterLocation,
    setFilterLocation,
  } = useSleep();


  const [searchQuery, setSearchQuery] = useState('');
  const [onlyTriggerEvents, setOnlyTriggerEvents] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Filter by location
      if (filterLocation !== 'all' && entry.factors.location !== filterLocation) {
        return false;
      }

      // Filter by trigger events
      if (onlyTriggerEvents && !entry.factors.triggeringEvent) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDate = entry.date.includes(q) || formatFriendlyDate(entry.date).toLowerCase().includes(q);
        const matchesNotes = (entry.notes || '').toLowerCase().includes(q);
        const matchesTrigger = (entry.factors.triggeringEventNotes || '').toLowerCase().includes(q);
        const matchesMed = (entry.factors.otherMedicineNotes || '').toLowerCase().includes(q);
        return matchesDate || matchesNotes || matchesTrigger || matchesMed;
      }

      return true;
    });
  }, [entries, filterLocation, onlyTriggerEvents, searchQuery]);

  const getSpeedOption = (val: string) => {
    return FALL_ASLEEP_OPTIONS.find((o) => o.value === val) || FALL_ASLEEP_OPTIONS[2];
  };

  const getProductivityColor = (score: number) => {
    if (score >= 8.5) return 'text-[#58CC02] bg-[#58CC02]/15 border-[#58CC02]/30';
    if (score >= 7.0) return 'text-[#89E219] bg-[#89E219]/15 border-[#89E219]/30';
    if (score >= 5.0) return 'text-[#FFC800] bg-[#FFC800]/15 border-[#FFC800]/30';
    if (score >= 3.5) return 'text-[#FF9600] bg-[#FF9600]/15 border-[#FF9600]/30';
    return 'text-[#FF4B4B] bg-[#FF4B4B]/15 border-[#FF4B4B]/30';
  };

  return (
    <div className="space-y-4">
      {/* Search & Filtering Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-light)]"
          />
          <input
            type="text"
            placeholder="Search dates, notes, medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-transparent border border-[var(--border-color)] text-[var(--text-normal)] focus:border-[#58CC02] focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Location Filters */}
          <div className="flex items-center p-0.5 rounded-xl bg-transparent border border-[var(--border-color)]">
            <button
              onClick={() => setFilterLocation('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterLocation === 'all'
                  ? 'bg-[var(--sidebar-hover-bg)] text-[var(--text-hover)] font-bold'
                  : 'text-[var(--text-light)] hover:text-[var(--text-normal)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterLocation('purdue')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterLocation === 'purdue'
                  ? 'bg-[#58CC02]/20 text-[#58CC02] font-bold'
                  : 'text-[var(--text-light)] hover:text-[var(--text-normal)]'
              }`}
            >
              🎓 Purdue
            </button>
            <button
              onClick={() => setFilterLocation('parents_house')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterLocation === 'parents_house'
                  ? 'bg-[#1CB0F6]/20 text-[#1CB0F6] font-bold'
                  : 'text-[var(--text-light)] hover:text-[var(--text-normal)]'
              }`}
            >
              🏡 Parents
            </button>
          </div>

          {/* Trigger event toggle */}
          <button
            onClick={() => setOnlyTriggerEvents((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              onlyTriggerEvents
                ? 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FF4B4B]'
                : 'bg-transparent border-[var(--border-color)] text-[var(--text-light)] hover:text-[var(--text-normal)]'
            }`}
          >
            <WarningCircle size={14} />
            <span>Triggers Only</span>
          </button>
        </div>
      </div>

      {/* Log Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 rounded-2xl bg-transparent border border-[var(--border-color)] text-center">
          <p className="text-xs text-[var(--text-light)]">
            {entries.length === 0 ? 'No sleep sessions recorded yet.' : 'No sleep sessions match the current filter.'}
          </p>
        </div>
      ) : (

        <div className="space-y-2.5">
          {filteredEntries.map((entry) => {
            const dur = calculateSleepDurationMinutes(entry.bedTime, entry.wakeTime);
            const speedOpt = getSpeedOption(entry.fallAsleepSpeed);

            return (
              <div
                key={entry.id}
                onClick={() => openEditEntryForm(entry)}
                className="p-4 rounded-2xl bg-transparent border border-[var(--border-color)] hover:border-[#58CC02]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group shadow-sm hover:shadow-md"
              >
                {/* Left: Date & Times */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-transparent border border-[var(--border-color)] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-[var(--text-light)] uppercase">
                      {formatFriendlyDate(entry.date).split(' ')[0]}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-hover)]">
                      {entry.date.split('-')[2]}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-hover)]">
                        {formatFriendlyDate(entry.date)}
                      </span>
                      <span className="text-xs font-semibold text-[#58CC02]">
                        {formatSleepDuration(dur)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-light)] mt-0.5">
                      <span>{entry.bedTime}</span>
                      <span>→</span>
                      <span>{entry.wakeTime}</span>
                      <span>•</span>
                      <span
                        className="px-1.5 py-0.2 rounded text-[10px] font-semibold"
                        style={{ color: speedOpt.iconColor, backgroundColor: `${speedOpt.iconColor}15` }}
                      >
                        {speedOpt.label} ({speedOpt.description})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Factors Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Location badge */}
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                      entry.factors.location === 'purdue'
                        ? 'border-[#58CC02]/30 bg-[#58CC02]/10 text-[#58CC02]'
                        : entry.factors.location === 'parents_house'
                        ? 'border-[#1CB0F6]/30 bg-[#1CB0F6]/10 text-[#1CB0F6]'
                        : 'border-[var(--border-color)] bg-transparent text-[var(--text-light)]'
                    }`}
                  >
                    {entry.factors.location === 'purdue'
                      ? '🎓 Purdue'
                      : entry.factors.location === 'parents_house'
                      ? '🏡 Parents'
                      : '✈️ Other'}
                  </span>

                  {/* Magnesium Glycinate */}
                  {entry.factors.magnesiumGlycinateMg > 0 && (
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-[#1CB0F6]/30 bg-[#1CB0F6]/10 text-[#1CB0F6] flex items-center gap-1">
                      <Pill size={12} />
                      {entry.factors.magnesiumGlycinateMg}mg Mg
                    </span>
                  )}

                  {/* Phosphatidylserine */}
                  {entry.factors.phosphatidylserineMg > 0 && (
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-[#CE82FF]/30 bg-[#CE82FF]/10 text-[#CE82FF] flex items-center gap-1">
                      <Pill size={12} />
                      {entry.factors.phosphatidylserineMg}mg PS
                    </span>
                  )}

                  {/* Anti-nausea med */}
                  {entry.factors.otherMedicineAntiNausea && (
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-[#FF9600]/30 bg-[#FF9600]/10 text-[#FF9600] flex items-center gap-1">
                      <Pill size={12} />
                      Anti-nausea
                    </span>
                  )}

                  {/* Trigger event */}
                  {entry.factors.triggeringEvent && (
                    <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-[#FF4B4B]/30 bg-[#FF4B4B]/10 text-[#FF4B4B] flex items-center gap-1">
                      <WarningCircle size={12} />
                      Trigger
                    </span>
                  )}
                </div>

                {/* Right: Productivity & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
                  {/* Productivity score */}
                  <div
                    className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold flex items-center gap-1 ${getProductivityColor(
                      entry.productivity
                    )}`}
                  >
                    <Lightning size={13} weight="fill" />
                    {entry.productivity.toFixed(1)} / 10
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEntryForm(entry);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this sleep entry?')) {
                          deleteEntry(entry.id);
                        }
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-light)] hover:text-[#FF4B4B] hover:bg-[#FF4B4B]/10 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
