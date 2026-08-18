import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  FallAsleepSpeed,
  SleepAnalyticsSummary,
  SleepEntry,
  SleepLocation,
} from '../types/sleep';
import {
  calculateSleepDurationMinutes,
  loadSavedSleepEntries,
  saveSleepEntries,
} from '../utils/sleepStorage';

interface SleepContextValue {
  entries: SleepEntry[];
  addEntry: (entry: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>) => SleepEntry;
  updateEntry: (id: string, updates: Partial<SleepEntry>) => void;
  deleteEntry: (id: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  editingEntry: SleepEntry | null;
  setEditingEntry: (entry: SleepEntry | null) => void;
  openNewEntryForm: () => void;
  openEditEntryForm: (entry: SleepEntry) => void;
  closeForm: () => void;
  filterLocation: SleepLocation | 'all';
  setFilterLocation: (loc: SleepLocation | 'all') => void;
  summary: SleepAnalyticsSummary;
}

const SleepContext = createContext<SleepContextValue | undefined>(undefined);

export const SleepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<SleepEntry[]>(() => loadSavedSleepEntries());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [filterLocation, setFilterLocation] = useState<SleepLocation | 'all'>('all');

  // Persist entries on change
  useEffect(() => {
    saveSleepEntries(entries);
  }, [entries]);

  // Listen for global backup restore event
  useEffect(() => {
    const handleRestored = () => {
      setEntries(loadSavedSleepEntries());
    };
    window.addEventListener('jarvis-data-restored', handleRestored);
    return () => window.removeEventListener('jarvis-data-restored', handleRestored);
  }, []);

  const addEntry = useCallback(
    (data: Omit<SleepEntry, 'id' | 'createdAt' | 'updatedAt'>): SleepEntry => {
      const now = Date.now();
      const newEntry: SleepEntry = {
        ...data,
        id: `sleep-${now}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };

      setEntries((prev) => {
        // If an entry already exists for the exact same date, we update or prepend
        const existingIndex = prev.findIndex((e) => e.date === newEntry.date);
        let updated: SleepEntry[];
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = newEntry;
        } else {
          updated = [newEntry, ...prev];
        }
        // Sort descending by date
        return updated.sort((a, b) => b.date.localeCompare(a.date));
      });

      return newEntry;
    },
    []
  );

  const updateEntry = useCallback((id: string, updates: Partial<SleepEntry>) => {
    setEntries((prev) =>
      prev
        .map((entry) => {
          if (entry.id === id) {
            return {
              ...entry,
              ...updates,
              updatedAt: Date.now(),
            };
          }
          return entry;
        })
        .sort((a, b) => b.date.localeCompare(a.date))
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const openNewEntryForm = useCallback(() => {
    setEditingEntry(null);
    setIsFormOpen(true);
  }, []);

  const openEditEntryForm = useCallback((entry: SleepEntry) => {
    setEditingEntry(entry);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setEditingEntry(null);
    setIsFormOpen(false);
  }, []);

  // Compute aggregate statistics & factor correlations
  const summary = useMemo<SleepAnalyticsSummary>(() => {
    if (entries.length === 0) {
      return {
        totalLogs: 0,
        avgDurationMinutes: 0,
        avgProductivity: 0,
        commonFallAsleepSpeed: 'normal',
        purdueAvgProductivity: null,
        parentsHouseAvgProductivity: null,
        purdueAvgDurationMinutes: null,
        parentsHouseAvgDurationMinutes: null,
        magnesiumVsProductivity: [],
        triggeringEventImpact: {
          withEventAvgProductivity: null,
          withoutEventAvgProductivity: null,
        },
      };
    }

    let totalDuration = 0;
    let totalProd = 0;
    const speedCounts: Record<FallAsleepSpeed, number> = {
      very_fast: 0,
      fast: 0,
      normal: 0,
      slow: 0,
      very_slow: 0,
    };

    let purdueCount = 0;
    let purdueProdSum = 0;
    let purdueDurSum = 0;

    let parentsCount = 0;
    let parentsProdSum = 0;
    let parentsDurSum = 0;

    let withEventCount = 0;
    let withEventProdSum = 0;

    let withoutEventCount = 0;
    let withoutEventProdSum = 0;

    const mgMap = new Map<number, { sumProd: number; count: number }>();

    for (const entry of entries) {
      const dur = calculateSleepDurationMinutes(entry.bedTime, entry.wakeTime);
      totalDuration += dur;
      totalProd += entry.productivity;

      if (speedCounts[entry.fallAsleepSpeed] !== undefined) {
        speedCounts[entry.fallAsleepSpeed]++;
      }

      if (entry.factors.location === 'purdue') {
        purdueCount++;
        purdueProdSum += entry.productivity;
        purdueDurSum += dur;
      } else if (entry.factors.location === 'parents_house') {
        parentsCount++;
        parentsProdSum += entry.productivity;
        parentsDurSum += dur;
      }

      if (entry.factors.triggeringEvent) {
        withEventCount++;
        withEventProdSum += entry.productivity;
      } else {
        withoutEventCount++;
        withoutEventProdSum += entry.productivity;
      }

      const mg = entry.factors.magnesiumGlycinateMg || 0;
      const currentMg = mgMap.get(mg) || { sumProd: 0, count: 0 };
      currentMg.sumProd += entry.productivity;
      currentMg.count += 1;
      mgMap.set(mg, currentMg);
    }

    let mostCommonSpeed: FallAsleepSpeed = 'normal';
    let maxSpeedCount = -1;
    (Object.keys(speedCounts) as FallAsleepSpeed[]).forEach((spd) => {
      if (speedCounts[spd] > maxSpeedCount) {
        maxSpeedCount = speedCounts[spd];
        mostCommonSpeed = spd;
      }
    });

    const magnesiumVsProductivity = Array.from(mgMap.entries())
      .map(([dose, val]) => ({
        dose,
        avgProductivity: Number((val.sumProd / val.count).toFixed(1)),
        count: val.count,
      }))
      .sort((a, b) => a.dose - b.dose);

    return {
      totalLogs: entries.length,
      avgDurationMinutes: Math.round(totalDuration / entries.length),
      avgProductivity: Number((totalProd / entries.length).toFixed(1)),
      commonFallAsleepSpeed: mostCommonSpeed,
      purdueAvgProductivity: purdueCount > 0 ? Number((purdueProdSum / purdueCount).toFixed(1)) : null,
      parentsHouseAvgProductivity: parentsCount > 0 ? Number((parentsProdSum / parentsCount).toFixed(1)) : null,
      purdueAvgDurationMinutes: purdueCount > 0 ? Math.round(purdueDurSum / purdueCount) : null,
      parentsHouseAvgDurationMinutes: parentsCount > 0 ? Math.round(parentsDurSum / parentsCount) : null,
      magnesiumVsProductivity,
      triggeringEventImpact: {
        withEventAvgProductivity: withEventCount > 0 ? Number((withEventProdSum / withEventCount).toFixed(1)) : null,
        withoutEventAvgProductivity: withoutEventCount > 0 ? Number((withoutEventProdSum / withoutEventCount).toFixed(1)) : null,
      },
    };
  }, [entries]);

  return (
    <SleepContext.Provider
      value={{
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        isFormOpen,
        setIsFormOpen,
        editingEntry,
        setEditingEntry,
        openNewEntryForm,
        openEditEntryForm,
        closeForm,
        filterLocation,
        setFilterLocation,
        summary,
      }}
    >
      {children}
    </SleepContext.Provider>
  );
};

export const useSleep = (): SleepContextValue => {
  const context = useContext(SleepContext);
  if (!context) {
    throw new Error('useSleep must be used within a SleepProvider');
  }
  return context;
};
