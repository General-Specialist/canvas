import React, { useState, useEffect } from 'react';
import {
  X,
  Moon,
  SunHorizon,
  Bed,
  Pill,
  WarningCircle,
  MapPin,
  Check,
  Trash,
  Plus,
  Minus,
  Lightning,
} from '@phosphor-icons/react';
import {
  FALL_ASLEEP_OPTIONS,
  FallAsleepSpeed,
  SleepLocation,
} from '../../types/sleep';

import { useSleep } from '../../context/SleepContext';
import {
  getDateOffsetIso,
} from '../../utils/sleepStorage';

export const SleepFormModal: React.FC = () => {
  const { isFormOpen, closeForm, editingEntry, addEntry, updateEntry, deleteEntry } = useSleep();

  const [date, setDate] = useState(getDateOffsetIso(0));
  const [bedTime, setBedTime] = useState('23:30');
  const [wakeTime, setWakeTime] = useState('07:30');
  const [fallAsleepSpeed, setFallAsleepSpeed] = useState<FallAsleepSpeed>('normal');
  const [productivity, setProductivity] = useState<number>(8.0);
  const [magnesiumMg, setMagnesiumMg] = useState<number>(300);
  const [isCustomMag, setIsCustomMag] = useState<boolean>(false);
  const [phosphatidylserineMg, setPhosphatidylserineMg] = useState<number>(300);
  const [isCustomPs, setIsCustomPs] = useState<boolean>(false);
  const [otherMedicineAntiNausea, setOtherMedicineAntiNausea] = useState<boolean>(false);
  const [otherMedicineNotes, setOtherMedicineNotes] = useState<string>('');
  const [triggeringEvent, setTriggeringEvent] = useState<boolean>(false);
  const [triggeringEventNotes, setTriggeringEventNotes] = useState<string>('');
  const [location, setLocation] = useState<SleepLocation>('purdue');
  const [notes, setNotes] = useState<string>('');

  // Populate when editing or opening fresh
  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setBedTime(editingEntry.bedTime);
      setWakeTime(editingEntry.wakeTime);
      setFallAsleepSpeed(editingEntry.fallAsleepSpeed);
      setProductivity(editingEntry.productivity);
      const mag = editingEntry.factors.magnesiumGlycinateMg ?? 300;
      setMagnesiumMg(mag);
      setIsCustomMag(mag !== 300);
      const ps = editingEntry.factors.phosphatidylserineMg ?? 300;
      setPhosphatidylserineMg(ps);
      setIsCustomPs(ps !== 300);
      setOtherMedicineAntiNausea(editingEntry.factors.otherMedicineAntiNausea ?? false);
      setOtherMedicineNotes(editingEntry.factors.otherMedicineNotes ?? '');
      setTriggeringEvent(editingEntry.factors.triggeringEvent ?? false);
      setTriggeringEventNotes(editingEntry.factors.triggeringEventNotes ?? '');
      setLocation(editingEntry.factors.location ?? 'purdue');
      setNotes(editingEntry.notes ?? '');
    } else {
      setDate(getDateOffsetIso(0));
      setBedTime('23:30');
      setWakeTime('07:30');
      setFallAsleepSpeed('normal');
      setProductivity(8.0);
      setMagnesiumMg(300);
      setIsCustomMag(false);
      setPhosphatidylserineMg(300);
      setIsCustomPs(false);
      setOtherMedicineAntiNausea(false);
      setOtherMedicineNotes('');
      setTriggeringEvent(false);
      setTriggeringEventNotes('');
      setLocation('purdue');
      setNotes('');
    }
  }, [editingEntry, isFormOpen]);

  const fallAsleepIndex = Math.max(
    0,
    FALL_ASLEEP_OPTIONS.findIndex((opt) => opt.value === fallAsleepSpeed)
  );
  const currentFallAsleepOption =
    FALL_ASLEEP_OPTIONS[fallAsleepIndex] || FALL_ASLEEP_OPTIONS[2];

  if (!isFormOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      date,
      bedTime,
      wakeTime,
      fallAsleepSpeed,
      productivity: Math.round(productivity * 2) / 2, // round to 0.5 interval
      factors: {
        magnesiumGlycinateMg: Math.max(0, Number(magnesiumMg) || 0),
        phosphatidylserineMg: Math.max(0, Number(phosphatidylserineMg) || 0),
        otherMedicineAntiNausea,
        otherMedicineNotes: otherMedicineNotes.trim() || undefined,
        triggeringEvent,
        triggeringEventNotes: triggeringEventNotes.trim() || undefined,
        location,
      },
      notes: notes.trim() || undefined,
    };

    if (editingEntry) {
      updateEntry(editingEntry.id, payload);
    } else {
      addEntry(payload);
    }

    closeForm();
  };

  const handleDelete = () => {
    if (editingEntry && window.confirm('Are you sure you want to delete this sleep log?')) {
      deleteEntry(editingEntry.id);
      closeForm();
    }
  };

  // Productivity color token helper
  const getProductivityColor = (score: number) => {
    if (score >= 8.5) return 'text-[#58CC02] bg-[#58CC02]/15 border-[#58CC02]/30';
    if (score >= 7.0) return 'text-[#89E219] bg-[#89E219]/15 border-[#89E219]/30';
    if (score >= 5.0) return 'text-[#FFC800] bg-[#FFC800]/15 border-[#FFC800]/30';
    if (score >= 3.5) return 'text-[#FF9600] bg-[#FF9600]/15 border-[#FF9600]/30';
    return 'text-[#FF4B4B] bg-[#FF4B4B]/15 border-[#FF4B4B]/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[var(--node-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-normal)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-end px-6 py-3 border-b border-[var(--border-color)] bg-transparent shrink-0">
          <button
            type="button"
            onClick={closeForm}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Date & Sleep Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-1.5">
                Date (Morning of)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl bg-transparent border border-[var(--border-color)] focus:border-[#58CC02] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Moon size={14} className="text-[#1CB0F6]" /> Got in Bed
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl bg-transparent border border-[var(--border-color)] focus:border-[#58CC02] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <SunHorizon size={14} className="text-[#FFC800]" /> Wake Up Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl bg-transparent border border-[var(--border-color)] focus:border-[#58CC02] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Section 2: Time to Fall Asleep */}
          <div className="p-4 rounded-xl bg-transparent border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider block">
                Time to fall asleep
              </label>
              <div
                className="px-3 py-1 rounded-xl border text-sm font-extrabold flex items-center gap-1.5"
                style={{
                  color: currentFallAsleepOption.iconColor,
                  backgroundColor: `${currentFallAsleepOption.iconColor}1a`,
                  borderColor: `${currentFallAsleepOption.iconColor}4d`,
                }}
              >
                <Bed size={14} weight="fill" />
                {currentFallAsleepOption.label} ({currentFallAsleepOption.description})
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (fallAsleepIndex > 0) {
                    setFallAsleepSpeed(FALL_ASLEEP_OPTIONS[fallAsleepIndex - 1].value);
                  }
                }}
                disabled={fallAsleepIndex <= 0}
                className="w-8 h-8 rounded-lg bg-transparent border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-normal)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Minus size={14} />
              </button>

              <input
                type="range"
                min="0"
                max={FALL_ASLEEP_OPTIONS.length - 1}
                step="1"
                value={fallAsleepIndex}
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (FALL_ASLEEP_OPTIONS[idx]) {
                    setFallAsleepSpeed(FALL_ASLEEP_OPTIONS[idx].value);
                  }
                }}
                className="flex-1 accent-[#58CC02] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => {
                  if (fallAsleepIndex < FALL_ASLEEP_OPTIONS.length - 1) {
                    setFallAsleepSpeed(FALL_ASLEEP_OPTIONS[fallAsleepIndex + 1].value);
                  }
                }}
                disabled={fallAsleepIndex >= FALL_ASLEEP_OPTIONS.length - 1}
                className="w-8 h-8 rounded-lg bg-transparent border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-normal)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[var(--text-light)] px-1">
              {FALL_ASLEEP_OPTIONS.map((opt, i) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setFallAsleepSpeed(opt.value)}
                  className={`transition-colors cursor-pointer ${
                    fallAsleepIndex === i
                      ? 'font-bold text-[var(--text-hover)]'
                      : 'hover:text-[var(--text-normal)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Productivity Rating (1.0 to 10.0 with 0.5 interval) */}
          <div className="p-4 rounded-xl bg-transparent border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider block">
                Productivity
              </label>
              <div
                className={`px-3 py-1 rounded-xl border text-sm font-extrabold flex items-center gap-1 ${getProductivityColor(
                  productivity
                )}`}
              >
                <Lightning size={14} weight="fill" />
                {productivity.toFixed(1)} / 10
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setProductivity((prev) => Math.max(1.0, Math.round((prev - 0.5) * 2) / 2))}
                className="w-8 h-8 rounded-lg bg-transparent border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-normal)] cursor-pointer"
              >
                <Minus size={14} />
              </button>

              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={productivity}
                onChange={(e) => setProductivity(parseFloat(e.target.value))}
                className="flex-1 accent-[#58CC02] cursor-pointer"
              />

              <button
                type="button"
                onClick={() => setProductivity((prev) => Math.min(10.0, Math.round((prev + 0.5) * 2) / 2))}
                className="w-8 h-8 rounded-lg bg-transparent border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-normal)] cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Section 4: Biological & Environmental Factors */}
          <div className="space-y-4">
            {/* Magnesium Glycinate & Phosphatidylserine */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Magnesium Glycinate */}
              <div className="p-3.5 rounded-xl bg-transparent border border-[var(--border-color)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-normal)]">
                    <Pill size={15} className="text-[#1CB0F6]" />
                    <span>Magnesium Glycinate</span>
                  </div>
                  <span className="text-xs font-bold text-[#1CB0F6]">{magnesiumMg} mg</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMagnesiumMg(300);
                      setIsCustomMag(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !isCustomMag && magnesiumMg === 300
                        ? 'bg-[#1CB0F6]/20 border-[#1CB0F6] text-[#1CB0F6] shadow-xs'
                        : 'border-[var(--border-color)] bg-transparent text-[var(--text-light)] hover:text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)]'
                    }`}
                  >
                    300mg
                  </button>

                  <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-transparent transition-colors focus-within:border-[#1CB0F6] border-[var(--border-color)]">
                    <span className="text-[11px] text-[var(--text-light)] shrink-0">Custom:</span>
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      placeholder=""
                      value={magnesiumMg === 300 && !isCustomMag ? '' : (magnesiumMg || '')}
                      onChange={(e) => {
                        setIsCustomMag(true);
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        setMagnesiumMg(isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      onFocus={() => setIsCustomMag(true)}
                      className="w-full text-xs font-bold text-[var(--text-hover)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[11px] text-[var(--text-light)] shrink-0">mg</span>
                  </div>
                </div>
              </div>

              {/* Phosphatidylserine */}
              <div className="p-3.5 rounded-xl bg-transparent border border-[var(--border-color)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-normal)]">
                    <Pill size={15} className="text-[#CE82FF]" />
                    <span>Phosphatidylserine</span>
                  </div>
                  <span className="text-xs font-bold text-[#CE82FF]">{phosphatidylserineMg} mg</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPhosphatidylserineMg(300);
                      setIsCustomPs(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      !isCustomPs && phosphatidylserineMg === 300
                        ? 'bg-[#CE82FF]/20 border-[#CE82FF] text-[#CE82FF] shadow-xs'
                        : 'border-[var(--border-color)] bg-transparent text-[var(--text-light)] hover:text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)]'
                    }`}
                  >
                    300mg
                  </button>

                  <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-transparent transition-colors focus-within:border-[#CE82FF] border-[var(--border-color)]">
                    <span className="text-[11px] text-[var(--text-light)] shrink-0">Custom:</span>
                    <input
                      type="number"
                      min="0"
                      max="2000"
                      placeholder=""
                      value={phosphatidylserineMg === 300 && !isCustomPs ? '' : (phosphatidylserineMg || '')}
                      onChange={(e) => {
                        setIsCustomPs(true);
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                        setPhosphatidylserineMg(isNaN(val) ? 0 : Math.max(0, val));
                      }}
                      onFocus={() => setIsCustomPs(true)}
                      className="w-full text-xs font-bold text-[var(--text-hover)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[11px] text-[var(--text-light)] shrink-0">mg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Medicine (Anti-vomit / Anti-nausea) */}
            <div className="p-3.5 rounded-xl bg-transparent border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill size={16} className="text-[#FF9600]" />
                  <span className="text-xs font-semibold text-[var(--text-normal)]">
                    Other Medicine (Anti-vomit / Anti-nausea)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOtherMedicineAntiNausea(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      !otherMedicineAntiNausea
                        ? 'bg-[var(--border-color)] border-[var(--border-color)] text-[var(--text-hover)]'
                        : 'bg-transparent border-transparent text-[var(--text-light)]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtherMedicineAntiNausea(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      otherMedicineAntiNausea
                        ? 'bg-[#FF9600]/20 border-[#FF9600] text-[#FF9600]'
                        : 'bg-transparent border-transparent text-[var(--text-light)]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {otherMedicineAntiNausea && (
                <input
                  type="text"
                  placeholder="Optional details (e.g. Ondansetron / Ginger 50mg / anti-vomit)"
                  value={otherMedicineNotes}
                  onChange={(e) => setOtherMedicineNotes(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 text-xs rounded-lg bg-transparent border border-[var(--border-color)] focus:border-[#FF9600] focus:outline-none transition-colors"
                />
              )}
            </div>

            {/* Triggering Event (Yes / No) */}
            <div className="p-3.5 rounded-xl bg-transparent border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WarningCircle size={16} className={triggeringEvent ? 'text-[#FF4B4B]' : 'text-[var(--text-light)]'} />
                  <span className="text-xs font-semibold text-[var(--text-normal)]">
                    Triggering Event (High Stress / Argument / Disruption)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTriggeringEvent(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      !triggeringEvent
                        ? 'bg-[var(--border-color)] border-[var(--border-color)] text-[var(--text-hover)]'
                        : 'bg-transparent border-transparent text-[var(--text-light)]'
                    }`}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriggeringEvent(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      triggeringEvent
                        ? 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FF4B4B]'
                        : 'bg-transparent border-transparent text-[var(--text-light)]'
                    }`}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {triggeringEvent && (
                <input
                  type="text"
                  placeholder="Describe triggering event (e.g. deadline rush, late caffeine, travel)"
                  value={triggeringEventNotes}
                  onChange={(e) => setTriggeringEventNotes(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 text-xs rounded-lg bg-transparent border border-[var(--border-color)] focus:border-[#FF4B4B] focus:outline-none transition-colors"
                />
              )}
            </div>

            {/* Location (Purdue vs Parents House) */}
            <div className="p-3.5 rounded-xl bg-transparent border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-normal)]">
                <MapPin size={16} className="text-[#58CC02]" />
                <span>Sleep Location</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLocation('purdue')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    location === 'purdue'
                      ? 'border-[#58CC02] bg-[#58CC02]/15 text-[#58CC02]'
                      : 'border-[var(--border-color)] bg-transparent text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)]'
                  }`}
                >
                  🎓 Purdue University
                </button>

                <button
                  type="button"
                  onClick={() => setLocation('parents_house')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    location === 'parents_house'
                      ? 'border-[#1CB0F6] bg-[#1CB0F6]/15 text-[#1CB0F6]'
                      : 'border-[var(--border-color)] bg-transparent text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)]'
                  }`}
                >
                  🏡 Parent's House
                </button>

                <button
                  type="button"
                  onClick={() => setLocation('other')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    location === 'other'
                      ? 'border-[#FF9600] bg-[#FF9600]/15 text-[#FF9600]'
                      : 'border-[var(--border-color)] bg-transparent text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)]'
                  }`}
                >
                  ✈️ Other / Travel
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Freeform Notes */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-light)] uppercase tracking-wider mb-1.5">
              Journal / Sleep Quality Notes
            </label>
            <textarea
              rows={2}
              placeholder="E.g., Woke up feeling refreshed, had vivid dreams, room temperature was cold..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-transparent border border-[var(--border-color)] focus:border-[#58CC02] focus:outline-none transition-colors"
            />
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
            {editingEntry ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FF4B4B] hover:bg-[#FF4B4B]/10 border border-[#FF4B4B]/30 transition-colors cursor-pointer"
              >
                <Trash size={15} />
                Delete Log
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] border border-[var(--border-color)] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#58CC02] hover:bg-[#46a302] text-white transition-colors shadow-sm cursor-pointer"
              >
                <Check size={16} weight="bold" />
                {editingEntry ? 'Update Log' : 'Save Sleep Log'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
