import { Node, Edge } from '@xyflow/react';

export type NodeColorTheme = 'slate' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'zinc';

export interface NoteNodeData {
  title: string;
  content: string;
  color?: NodeColorTheme;
  pinned?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface EdgeJunctionNodeData {
  parentEdgeId: string;
  [key: string]: unknown;
}

export type CanvasNode = Node<NoteNodeData | EdgeJunctionNodeData>;

export interface CustomEdgeData {
  label?: string;
  color?: string;
  styleType?: 'default' | 'straight' | 'step' | 'smoothstep';
  animated?: boolean;
  [key: string]: unknown;
}

export type CanvasEdge = Edge<CustomEdgeData>;

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}
