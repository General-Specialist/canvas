import React from 'react';
import { useSleep } from '../../context/SleepContext';
import { formatSleepDuration } from '../../utils/sleepStorage';
import {
  MapPin,
  Pill,
  WarningCircle,
  Sparkle,
  Lightning,
} from '@phosphor-icons/react';



export const SleepFactorInsights: React.FC = () => {
  const { summary, entries } = useSleep();

  if (entries.length === 0) return null;

  const purdueProd = summary.purdueAvgProductivity;
  const parentsProd = summary.parentsHouseAvgProductivity;
  const purdueDur = summary.purdueAvgDurationMinutes;
  const parentsDur = summary.parentsHouseAvgDurationMinutes;

  const eventImpact = summary.triggeringEventImpact;

  // Magnesium Insights
  const mgInsights = summary.magnesiumVsProductivity;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkle size={18} className="text-[#CE82FF]" />
        <h3 className="text-sm font-bold text-[var(--text-hover)]">
          Factor Correlations & Recovery Insights
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Location Comparison (Purdue vs Parents House) */}
        <div className="p-4 rounded-2xl border border-[var(--border-color)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-normal)]">
              <MapPin size={16} className="text-[#58CC02]" />
              <span>Location Dynamics</span>
            </div>
            <span className="text-[11px] text-[var(--text-light)]">Purdue vs. Parents</span>
          </div>

          <div className="space-y-2.5">
            {/* Purdue */}
            <div className="p-2.5 rounded-xl border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--text-hover)] flex items-center gap-1">
                  🎓 Purdue University
                </div>
                <div className="text-[11px] text-[var(--text-light)]">
                  Avg Sleep: {purdueDur ? formatSleepDuration(purdueDur) : 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#58CC02] flex items-center justify-end gap-1">
                  <Lightning size={13} weight="fill" />
                  {purdueProd !== null ? purdueProd.toFixed(1) : '—'}
                </div>
                <div className="text-[10px] text-[var(--text-light)]">Productivity</div>
              </div>
            </div>

            {/* Parents House */}
            <div className="p-2.5 rounded-xl border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--text-hover)] flex items-center gap-1">
                  🏡 Parent's House
                </div>
                <div className="text-[11px] text-[var(--text-light)]">
                  Avg Sleep: {parentsDur ? formatSleepDuration(parentsDur) : 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#1CB0F6] flex items-center justify-end gap-1">
                  <Lightning size={13} weight="fill" />
                  {parentsProd !== null ? parentsProd.toFixed(1) : '—'}
                </div>
                <div className="text-[10px] text-[var(--text-light)]">Productivity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Magnesium Glycinate Correlation */}
        <div className="p-4 rounded-2xl border border-[var(--border-color)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-normal)]">
              <Pill size={16} className="text-[#1CB0F6]" />
              <span>Magnesium Glycinate</span>
            </div>
            <span className="text-[11px] text-[var(--text-light)]">Dosage vs. Focus</span>
          </div>

          <div className="space-y-2">
            {mgInsights.length > 0 ? (
              mgInsights.slice(0, 3).map((item) => (
                <div
                  key={item.dose}
                  className="p-2 rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1CB0F6]">{item.dose} mg</span>
                    <span className="text-[10px] text-[var(--text-light)]">
                      ({item.count} {item.count === 1 ? 'night' : 'nights'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-[#58CC02]">
                    <Lightning size={12} weight="fill" />
                    <span>{item.avgProductivity.toFixed(1)} / 10</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--text-light)] text-center py-4">
                Log magnesium doses to view correlation
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Triggering Events & Disruptions */}
        <div className="p-4 rounded-2xl border border-[var(--border-color)] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-normal)]">
              <WarningCircle size={16} className="text-[#FF4B4B]" />
              <span>Triggering Events</span>
            </div>
            <span className="text-[11px] text-[var(--text-light)]">Stress Resilience</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--text-hover)]">Calm Nights</div>
                <div className="text-[11px] text-[var(--text-light)]">No triggering event</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#58CC02] flex items-center justify-end gap-1">
                  <Lightning size={13} weight="fill" />
                  {eventImpact.withoutEventAvgProductivity !== null
                    ? eventImpact.withoutEventAvgProductivity.toFixed(1)
                    : '—'}
                </div>
                <div className="text-[10px] text-[var(--text-light)]">Productivity</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#FF4B4B]">High Stress Event</div>
                <div className="text-[11px] text-[var(--text-light)]">Triggering event logged</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-[#FF4B4B] flex items-center justify-end gap-1">
                  <Lightning size={13} weight="fill" />
                  {eventImpact.withEventAvgProductivity !== null
                    ? eventImpact.withEventAvgProductivity.toFixed(1)
                    : '—'}
                </div>
                <div className="text-[10px] text-[var(--text-light)]">Productivity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
