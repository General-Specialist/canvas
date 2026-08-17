export interface FocusTag {
  id: string;
  name: string;
  color: string; // hex color
  createdAt: number;
}

export type FocusTimerMode = 'countdown' | 'stopwatch';

export interface FocusSession {
  id: string;
  tagId: string;
  tagName: string;
  tagColor: string;
  taskTitle: string;
  durationSeconds: number;
  mode: FocusTimerMode;
  startedAt: number;
  endedAt: number;
}

export const DEFAULT_TAGS: FocusTag[] = [
  { id: 'tag-coding', name: 'Coding', color: '#58CC02', createdAt: 1 },
  { id: 'tag-research', name: 'Research', color: '#1CB0F6', createdAt: 2 },
  { id: 'tag-writing', name: 'Writing', color: '#CE82FF', createdAt: 3 },
  { id: 'tag-design', name: 'Design', color: '#FF9600', createdAt: 4 },
  { id: 'tag-reading', name: 'Reading', color: '#FFC800', createdAt: 5 },
  { id: 'tag-planning', name: 'Planning', color: '#2B70C9', createdAt: 6 },
];

export const TAG_COLORS = [
  '#58CC02', // Duolingo Green
  '#1CB0F6', // Sky Blue
  '#CE82FF', // Purple
  '#FF9600', // Orange
  '#FFC800', // Yellow
  '#FF4B4B', // Red
  '#2B70C9', // Navy
  '#00D2D3', // Teal
  '#FF9FF3', // Pink
  '#777777', // Gray
];
