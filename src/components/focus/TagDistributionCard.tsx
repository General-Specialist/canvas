import React from 'react';
import { useFocus } from '../../context/FocusContext';
import { formatDuration } from '../../utils/calendarUtils';

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
    <div className="w-full">
      <div className="flex items-center justify-start mb-2.5">
        <span className="text-xs font-mono font-bold text-[var(--text-normal)]">
          Total Tracked: {formatDuration(totalTimeSeconds)}
        </span>
      </div>

      {/* Multi-color Segmented Bar */}
      <div className="w-full h-2 rounded-full overflow-hidden flex bg-[var(--border-color)]/30 mb-3">
        {activeStats.map((t) => (
          <div
            key={t.id}
            style={{
              width: `${t.percentage}%`,
              backgroundColor: t.color,
            }}
            className="h-full transition-all duration-300"
            title={`${t.name}: ${formatDuration(t.time)} (${t.percentage}%)`}
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
            <span className="font-medium text-[var(--text-normal)]">{t.name}</span>
            <span className="text-[var(--text-light)] font-mono text-[11px]">{t.percentage}%</span>
            <span className="font-mono font-semibold text-[var(--text-hover)]">
              {formatDuration(t.time)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
