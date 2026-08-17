import React from 'react';
import { ChartPieSlice } from '@phosphor-icons/react';
import { useFocus } from '../../context/FocusContext';

const formatHoursMins = (totalSecs: number) => {
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return `${totalSecs}s`;
};

export const TagDistributionCard: React.FC = () => {
  const { tags, sessions } = useFocus();

  // Aggregate time per tag from sessions
  const tagTimeMap: Record<string, number> = {};
  let totalTimeSeconds = 0;

  sessions.forEach((s) => {
    tagTimeMap[s.tagId] = (tagTimeMap[s.tagId] || 0) + s.durationSeconds;
    totalTimeSeconds += s.durationSeconds;
  });

  const tagStats = tags
    .map((tag) => {
      const time = tagTimeMap[tag.id] || 0;
      const percentage = totalTimeSeconds > 0 ? Math.round((time / totalTimeSeconds) * 100) : 0;
      return {
        ...tag,
        time,
        percentage,
      };
    })
    .sort((a, b) => b.time - a.time);

  if (sessions.length === 0) {
    return null; // Keep the interface clean when no sessions exist yet
  }

  const activeStats = tagStats.filter((t) => t.time > 0);

  return (
    <div className="w-full border border-[var(--border-color)] rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChartPieSlice size={16} className="text-[var(--text-light)]" weight="bold" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-light)]">
            Distribution
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-[var(--text-normal)]">
          Total Tracked: {formatHoursMins(totalTimeSeconds)}
        </span>
      </div>

      {/* Multi-color Segmented Bar */}
      <div className="w-full h-2 rounded-full overflow-hidden flex border border-[var(--border-color)] mb-3.5">
        {activeStats.map((t) => (
          <div
            key={t.id}
            style={{
              width: `${t.percentage}%`,
              backgroundColor: t.color,
            }}
            className="h-full transition-all duration-300"
            title={`#${t.name}: ${formatHoursMins(t.time)} (${t.percentage}%)`}
          />
        ))}
      </div>

      {/* Tag Pills List */}
      <div className="flex items-center gap-2 flex-wrap">
        {activeStats.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-[var(--border-color)] text-xs"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: t.color }}
            />
            <span className="font-medium text-[var(--text-normal)]">#{t.name}</span>
            <span className="text-[var(--text-light)] font-mono text-[11px]">{t.percentage}%</span>
            <span className="font-mono font-semibold text-[var(--text-hover)]">
              {formatHoursMins(t.time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
