import { Node, Edge } from '@xyflow/react';

export type NodeColorTheme = 'slate' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'zinc';

export interface PDFPoint {
  x: number; // Normalized [0..1]
  y: number; // Normalized [0..1]
}

export type PDFAnnotationTool = 'select' | 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser';

export interface PDFStrokeAnnotation {
  id: string;
  type: 'pen' | 'highlighter';
  pageIndex: number;
  points: PDFPoint[];
  color: string;
  width: number;
  opacity: number;
  createdAt: string;
}

export interface PDFShapeAnnotation {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow';
  pageIndex: number;
  startPoint: PDFPoint;
  endPoint: PDFPoint;
  color: string;
  strokeWidth: number;
  createdAt: string;
}

export interface PDFTextAnnotation {
  id: string;
  type: 'text';
  pageIndex: number;
  position: PDFPoint;
  text: string;
  color: string;
  fontSize: number;
  createdAt: string;
}

export type PDFAnnotation = PDFStrokeAnnotation | PDFShapeAnnotation | PDFTextAnnotation;

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
  annotations?: PDFAnnotation[];
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
