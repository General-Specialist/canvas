import { Node, Edge } from '@xyflow/react';

export interface NoteNodeData {
  title: string;
  content: string;
  pinned?: boolean;
  updatedAt?: string;
  [key: string]: unknown;
}

interface EdgeJunctionNodeData {
  parentEdgeId: string;
  [key: string]: unknown;
}

export interface GroupNodeData {
  title?: string;
  color?: string;
  [key: string]: unknown;
}

export type CanvasNode = Node<NoteNodeData | EdgeJunctionNodeData | GroupNodeData>;

interface CustomEdgeData {
  animated?: boolean;
  label?: string;
  isWikiLink?: boolean;
  isGroupAutoEdge?: boolean;
  [key: string]: unknown;
}

export type CanvasEdge = Edge<CustomEdgeData>;
