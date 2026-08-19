export type FallAsleepSpeed = 'very_fast' | 'fast' | 'normal' | 'slow' | 'very_slow';

export type SleepLocation = 'purdue' | 'parents_house' | 'other';

export interface SleepFactors {
  magnesiumGlycinateMg: number; // intervals of 100mg (e.g. 0, 100, 200, 300, 400...)
  phosphatidylserineMg: number; // intervals of 100mg (e.g. 0, 100, 200, 300, 400...)
  otherMedicineAntiNausea: boolean; // Anti-vomit / Anti-nausea
  otherMedicineNotes?: string;
  triggeringEvent: boolean; // Yes / No
  triggeringEventNotes?: string;
  location: SleepLocation;
}

export interface SleepEntry {
  id: string;
  date: string; // YYYY-MM-DD
  bedTime: string; // HH:mm 24-hr format (e.g. "23:30")
  wakeTime: string; // HH:mm 24-hr format (e.g. "07:30")
  fallAsleepSpeed: FallAsleepSpeed;
  productivity: number; // 1.0 to 10.0 in intervals of 0.5
  factors: SleepFactors;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FallAsleepSpeedOption {
  value: FallAsleepSpeed;
  label: string;
  description: string;
  iconColor: string;
}

export const FALL_ASLEEP_OPTIONS: FallAsleepSpeedOption[] = [
  {
    value: 'very_fast',
    label: 'Very Fast',
    description: '< 10m',
    iconColor: '#9ece6a', // Tokyo Green
  },
  {
    value: 'fast',
    label: 'Fast',
    description: '10-20m',
    iconColor: '#73daca', // Tokyo Teal
  },
  {
    value: 'normal',
    label: 'Normal',
    description: '20-30m',
    iconColor: '#7aa2f7', // Tokyo Blue
  },
  {
    value: 'slow',
    label: 'Slow',
    description: '30-60m',
    iconColor: '#ff9e64', // Tokyo Orange
  },
  {
    value: 'very_slow',
    label: 'Very Slow',
    description: '> 60m',
    iconColor: '#f7768e', // Tokyo Red
  },
];

export interface SleepAnalyticsSummary {
  totalLogs: number;
  avgDurationMinutes: number;
  avgProductivity: number;
  commonFallAsleepSpeed: FallAsleepSpeed;
  purdueAvgProductivity: number | null;
  parentsHouseAvgProductivity: number | null;
  purdueAvgDurationMinutes: number | null;
  parentsHouseAvgDurationMinutes: number | null;
  magnesiumVsProductivity: { dose: number; avgProductivity: number; count: number }[];
  triggeringEventImpact: {
    withEventAvgProductivity: number | null;
    withoutEventAvgProductivity: number | null;
  };
}
