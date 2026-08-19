import React, { useState, useMemo } from 'react';
import { useSleep } from '../../context/SleepContext';
import { calculateSleepDurationMinutes, formatFriendlyDate } from '../../utils/sleepStorage';
import { SleepEntry } from '../../types/sleep';
import { ChartLineUp, Bed, Lightning } from '../icons';

export const SleepTrendsChart: React.FC = () => {
  const { entries, openEditEntryForm } = useSleep();
  const [hoveredEntry, setHoveredEntry] = useState<SleepEntry | null>(null);

  // Chronological order for chart (oldest to newest, up to last 14 logs)
  const chartData = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [entries]);

  if (chartData.length === 0) {
    return null;
  }



  // Chart dimensions
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = 700;

  // Max duration (in hours, e.g. 10 or 12)
  const maxHours = 12;
  const maxProductivity = 10;

  const getX = (index: number) => {
    if (chartData.length <= 1) return paddingLeft + (chartWidth - paddingLeft - paddingRight) / 2;
    return paddingLeft + (index / (chartData.length - 1)) * (chartWidth - paddingLeft - paddingRight);
  };

  const getDurationY = (minutes: number) => {
    const hours = Math.min(maxHours, minutes / 60);
    const usableHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (hours / maxHours) * usableHeight;
  };

  const getProductivityY = (score: number) => {
    const usableHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - (Math.min(maxProductivity, score) / maxProductivity) * usableHeight;
  };

  // Build SVG path for productivity line
  const productivityPoints = chartData.map((entry, idx) => ({
    x: getX(idx),
    y: getProductivityY(entry.productivity),
    entry,
  }));

  const linePathD = productivityPoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  return (
    <div className="p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
      {/* Chart Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChartLineUp size={18} className="text-[var(--primary-accent)]" />
          <h3 className="text-sm font-bold text-[var(--text-hover)]">
            Sleep Duration & Productivity Trends
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[var(--text-normal)]">
            <span className="w-3 h-3 rounded-sm bg-[#7aa2f7]/70 inline-block border border-[#7aa2f7]" />
            <span>Sleep Duration (Hours)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-normal)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7dcfff] inline-block border-2 border-white dark:border-[#1f2335]" />
            <span>Productivity (Score 1-10)</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${height}`}
          className="w-full min-w-[550px] h-[220px] select-none"
        >
          <defs>
            <linearGradient id="sleepBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7aa2f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7aa2f7" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 3, 6, 9, 12].map((hour) => {
            const y = height - paddingBottom - (hour / maxHours) * (height - paddingTop - paddingBottom);
            return (
              <g key={hour}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-light)"
                  fontSize="10"
                >
                  {hour}h
                </text>
                <text
                  x={chartWidth - paddingRight + 8}
                  y={y + 3}
                  textAnchor="start"
                  fill="var(--text-light)"
                  fontSize="10"
                >
                  {Math.round((hour / maxHours) * 10)}
                </text>
              </g>
            );
          })}

          {/* Sleep Duration Bars */}
          {chartData.map((entry, idx) => {
            const durMinutes = calculateSleepDurationMinutes(entry.bedTime, entry.wakeTime);
            const barWidth = Math.max(14, Math.min(32, (chartWidth - paddingLeft - paddingRight) / chartData.length - 8));
            const x = getX(idx) - barWidth / 2;
            const y = getDurationY(durMinutes);
            const barHeight = height - paddingBottom - y;
            const isHovered = hoveredEntry?.id === entry.id;

            return (
              <g
                key={entry.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEntry(entry)}
                onMouseLeave={() => setHoveredEntry(null)}
                onClick={() => openEditEntryForm(entry)}
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill={isHovered ? '#7aa2f7' : 'url(#sleepBarGradient)'}
                  stroke="#7aa2f7"
                  strokeWidth={isHovered ? '2' : '1'}
                  className="transition-all duration-150"
                />
                {/* Date Label on X Axis */}
                <text
                  x={getX(idx)}
                  y={height - 12}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--text-hover)' : 'var(--text-light)'}
                  fontSize="10"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                >
                  {formatFriendlyDate(entry.date).split(',')[0]}
                </text>
              </g>
            );
          })}

          {/* Productivity Connection Line */}
          {linePathD && (
            <path
              d={linePathD}
              fill="none"
              stroke="#7dcfff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Productivity Dots */}
          {productivityPoints.map((pt) => {
            const isHovered = hoveredEntry?.id === pt.entry.id;
            return (
              <g
                key={pt.entry.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEntry(pt.entry)}
                onMouseLeave={() => setHoveredEntry(null)}
                onClick={() => openEditEntryForm(pt.entry)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4.5}
                  fill="#7dcfff"
                  stroke="var(--node-bg)"
                  strokeWidth="2"
                  className="transition-transform duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip info on hover */}
        {hoveredEntry && (
          <div className="absolute top-2 right-4 bg-[var(--canvas-bg)] border border-[var(--border-color)] rounded-xl p-3 shadow-lg text-xs space-y-1.5 z-20 pointer-events-none animate-fadeIn">
            <div className="font-bold text-[var(--text-hover)] border-b border-[var(--border-color)] pb-1 flex items-center justify-between gap-3">
              <span>{formatFriendlyDate(hoveredEntry.date)}</span>
              <span className="text-[11px] font-normal text-[var(--text-light)]">
                {hoveredEntry.factors.location === 'purdue' ? '🎓 Purdue' : '🏡 Parents'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[#7aa2f7] font-semibold">
                <Bed size={14} />
                <span>
                  {calculateSleepDurationMinutes(hoveredEntry.bedTime, hoveredEntry.wakeTime) / 60}h
                </span>
                <span className="text-[10px] text-[var(--text-light)]">
                  ({hoveredEntry.bedTime} → {hoveredEntry.wakeTime})
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#7dcfff] font-semibold">
                <Lightning size={14} weight="fill" />
                <span>{hoveredEntry.productivity.toFixed(1)} / 10</span>
              </div>
            </div>
            <div className="text-[11px] text-[var(--text-light)] flex items-center gap-2">
              <span>Mg: {hoveredEntry.factors.magnesiumGlycinateMg}mg</span>
              <span>•</span>
              <span>PS: {hoveredEntry.factors.phosphatidylserineMg}mg</span>
              {hoveredEntry.factors.triggeringEvent && (
                <>
                  <span>•</span>
                  <span className="text-[#f7768e]">⚠️ Trigger Event</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
