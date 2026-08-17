export type AppId = 'canvas' | 'focus';

export interface JarvisAppConfig {
  id: AppId;
  name: string;
  description: string;
  iconName: string;
  shortcut: string;
}

export const JARVIS_APPS: JarvisAppConfig[] = [
  {
    id: 'canvas',
    name: 'Canvas',
    description: 'Infinite visual workspace & mind map',
    iconName: 'SquaresFour',
    shortcut: '⌘1',
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'Deep work timer & soundscapes',
    iconName: 'Timer',
    shortcut: '⌘2',
  },
];
