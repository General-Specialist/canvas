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

export type CanvasNode = Node<NoteNodeData | EdgeJunctionNodeData>;

interface CustomEdgeData {
  animated?: boolean;
  [key: string]: unknown;
}

export type CanvasEdge = Edge<CustomEdgeData>;

