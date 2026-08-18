import { CanvasNode, CanvasEdge } from '../types/canvas';
import { Viewport, MarkerType } from '@xyflow/react';
import { sortNodesByDepth } from './edgeUtils';

const STORAGE_KEY_NODES = 'infinite_canvas_nodes_v1';
const STORAGE_KEY_EDGES = 'infinite_canvas_edges_v1';
const STORAGE_KEY_VIEWPORT = 'infinite_canvas_viewport_v1';

const initialDefaultNodes: CanvasNode[] = [
  {
    id: 'note-welcome',
    type: 'noteNode',
    position: { x: 250, y: 150 },
    style: { width: 260 },
    data: {
      title: 'Welcome to Canvas',
      content:
        'This is a modern canvas powered by React Flow.\n\nKey features:\n- Drag nodes to test [[Dynamic Minimum Length Edges]]\n- Connect edges or junctions with [[Edge-to-Edge Connections]]\n- Type [[Note Title]] to auto-link notes in purple like Obsidian!',
      pinned: false,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'note-feature-min-edge',
    type: 'noteNode',
    position: { x: 750, y: 100 },
    style: { width: 260 },
    data: {
      title: 'Dynamic Minimum Length Edges',
      content:
        'Edges dynamically attach to the side midpoint (top, right, bottom, left) that produces the shortest path between nodes as you drag them around.',
      pinned: false,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'note-feature-edge-connect',
    type: 'noteNode',
    position: { x: 750, y: 450 },
    style: { width: 260 },
    data: {
      title: 'Edge-to-Edge Connections',
      content:
        'You can connect edges directly to other edges or nodes by dragging lines onto edge junction points or creating junction nodes!',
      pinned: false,
      updatedAt: new Date().toISOString(),
    },
  },
];

const initialDefaultViewport: Viewport = { x: 50, y: 50, zoom: 0.9 };

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(defaultValue) ? Array.isArray(parsed) : parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage:`, err);
  }
  return defaultValue;
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

export const loadSavedNodes = (): CanvasNode[] => {
  const nodes = getStorage(STORAGE_KEY_NODES, initialDefaultNodes);
  const formatted = nodes.map((node) => {
    if (node.type === 'noteNode' && (!node.style || !node.style.width)) {
      return {
        ...node,
        style: { ...node.style, width: 260 },
      };
    }
    return node;
  });
  return sortNodesByDepth(formatted);
};
export const saveNodes = (nodes: CanvasNode[]): void => setStorage(STORAGE_KEY_NODES, nodes);
export const loadSavedEdges = (): CanvasEdge[] =>
  getStorage<CanvasEdge[]>(STORAGE_KEY_EDGES, []).map((edge) => ({
    ...edge,
    markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
  }));
export const saveEdges = (edges: CanvasEdge[]): void => setStorage(STORAGE_KEY_EDGES, edges);
export const loadSavedViewport = (): Viewport => getStorage(STORAGE_KEY_VIEWPORT, initialDefaultViewport);
export const saveViewport = (viewport: Viewport): void => setStorage(STORAGE_KEY_VIEWPORT, viewport);


