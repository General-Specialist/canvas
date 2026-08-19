import React from 'react';
import { useSleep } from '../../context/SleepContext';
import { SleepTrendsChart } from './SleepTrendsChart';
import { SleepFactorInsights } from './SleepFactorInsights';
import { SleepHistoryTable } from './SleepHistoryTable';
import { SleepFormModal } from './SleepFormModal';
import { formatSleepDuration } from '../../utils/sleepStorage';
import { FALL_ASLEEP_OPTIONS } from '../../types/sleep';
import {
  Bed,
  Plus,
  Lightning,
  Clock,
} from '../icons';

export const SleepApp: React.FC = () => {
  const { summary, openNewEntryForm } = useSleep();

  const speedOption = FALL_ASLEEP_OPTIONS.find(
    (o) => o.value === summary.commonFallAsleepSpeed
  ) || FALL_ASLEEP_OPTIONS[2];

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-center">
      <div className="w-full max-w-6xl space-y-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-end pt-1">
          {/* Primary Log Sleep Action */}
          <button
            onClick={openNewEntryForm}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[var(--primary-accent)] hover:brightness-110 text-white dark:text-[#16161e] shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Plus size={18} weight="bold" />
            <span>Log Sleep Session</span>
          </button>
        </div>

        {/* Aggregate KPI Badges (3-column layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* KPI 1: Duration */}
          <div className="p-4 rounded-2xl border border-[var(--border-color)] flex items-center gap-3.5">
            <Clock size={28} weight="bold" className="text-[var(--primary-accent)] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[var(--text-light)] truncate">
                Sleep Duration
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--text-hover)] mt-0.5">
                {summary.totalLogs > 0 ? formatSleepDuration(summary.avgDurationMinutes) : '—'}
              </div>
            </div>
          </div>

          {/* KPI 2: Productivity */}
          <div className="p-4 rounded-2xl border border-[var(--border-color)] flex items-center gap-3.5">
            <Lightning size={28} weight="fill" className="text-[#e0af68] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[var(--text-light)] truncate">
                Productivity
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--text-hover)] mt-0.5">
                {summary.totalLogs > 0 ? `${summary.avgProductivity.toFixed(1)} / 10` : '—'}
              </div>
            </div>
          </div>

          {/* KPI 3: Common Sleep Latency */}
          <div className="p-4 rounded-2xl border border-[var(--border-color)] flex items-center gap-3.5">
            <Bed size={28} weight="fill" className="text-[#7dcfff] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[var(--text-light)] truncate">
                Fall Asleep Latency
              </div>
              <div className="text-xl sm:text-2xl font-black text-[var(--text-hover)] mt-0.5">
                {summary.totalLogs > 0 ? (
                  <span style={{ color: speedOption.iconColor }}>{speedOption.label}</span>
                ) : (
                  '—'
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Content */}
        <div className="space-y-6 animate-fadeIn">
          {/* Visual Trends Chart */}
          <SleepTrendsChart />

          {/* Factor Correlations & Location Insights */}
          <SleepFactorInsights />

          {/* Sleep Sessions History Table */}
          <SleepHistoryTable />
        </div>
      </div>

      {/* Modal Sleep Form */}
      <SleepFormModal />
    </div>
  );
};
