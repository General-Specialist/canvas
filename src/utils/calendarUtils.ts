/**
 * Calendar utilities for month/week/day calculations and formatting
 */

export const getWeekDays = (centerDate: Date): Date[] => {
  const date = new Date(centerDate);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, ...
  // Calculate distance to Monday (if Sunday (0), distance is -6, otherwise 1 - day)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
};

export interface MonthDayInfo {
  date: Date;
  isCurrentMonth: boolean;
}

export const getMonthDays = (centerDate: Date): MonthDayInfo[] => {
  const year = centerDate.getFullYear();
  const month = centerDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const weekdayOfFirst = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...
  const diffToMonday = weekdayOfFirst === 0 ? -6 : 1 - weekdayOfFirst;

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(firstDayOfMonth.getDate() + diffToMonday);
  startDate.setHours(0, 0, 0, 0);

  const days: MonthDayInfo[] = [];
  // Standard 35 or 42 grid cells
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push({
      date: d,
      isCurrentMonth: d.getMonth() === month,
    });
  }

  // If the last 7 days are entirely next month, slice to 35
  if (days.slice(35).every((item) => !item.isCurrentMonth)) {
    return days.slice(0, 35);
  }

  return days;
};

export const isSameDay = (d1: Date | number, d2: Date | number): boolean => {
  const a = typeof d1 === 'number' ? new Date(d1) : d1;
  const b = typeof d2 === 'number' ? new Date(d2) : d2;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const isToday = (date: Date | number): boolean => {
  return isSameDay(date, new Date());
};

export const formatMonthHeader = (date: Date): string => {
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
};

export const formatWeekRangeHeader = (days: Date[]): string => {
  if (days.length === 0) return '';
  const first = days[0];
  const last = days[days.length - 1];

  const firstMonth = first.toLocaleDateString([], { month: 'short' });
  const lastMonth = last.toLocaleDateString([], { month: 'short' });
  const firstYear = first.getFullYear();
  const lastYear = last.getFullYear();

  if (firstYear !== lastYear) {
    return `${firstMonth} ${first.getDate()}, ${firstYear} - ${lastMonth} ${last.getDate()}, ${lastYear}`;
  }
  if (firstMonth !== lastMonth) {
    return `${firstMonth} ${first.getDate()} - ${lastMonth} ${last.getDate()}, ${firstYear}`;
  }
  return `${firstMonth} ${first.getDate()} - ${last.getDate()}, ${firstYear}`;
};

export const formatDayHeader = (date: Date): string => {
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatHourLabel = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`.trim();
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return `${secs}s`;
};

export const formatLocalDateInput = (d: Date | number): string => {
  const date = typeof d === 'number' ? new Date(d) : d;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

