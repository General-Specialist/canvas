import { CanvasNode, CanvasEdge } from '../types/canvas';
import { Viewport, MarkerType } from '@xyflow/react';
import { sortNodesByDepth } from './edgeUtils';
import { SEED_NODES, SEED_EDGES, SEED_VIEWPORT } from '../data/seedData';

const STORAGE_KEY_NODES = 'infinite_canvas_nodes_v1';
const STORAGE_KEY_EDGES = 'infinite_canvas_edges_v1';
const STORAGE_KEY_VIEWPORT = 'infinite_canvas_viewport_v1';

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(defaultValue) ? Array.isArray(parsed) : parsed && typeof parsed === 'object') {
        return parsed;
      }
      if (typeof defaultValue === typeof parsed) {
        return parsed;
      }
    }
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage:`, err);
  }
  return defaultValue;
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

export const loadSavedNodes = (): CanvasNode[] => {
  const nodes = getStorage<CanvasNode[]>(STORAGE_KEY_NODES, SEED_NODES);
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

export const loadSavedEdges = (): CanvasEdge[] => {
  const edges = getStorage<CanvasEdge[]>(STORAGE_KEY_EDGES, SEED_EDGES);
  return edges.map((edge) => ({
    ...edge,
    markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
  }));
};
export const saveEdges = (edges: CanvasEdge[]): void => setStorage(STORAGE_KEY_EDGES, edges);

export const loadSavedViewport = (): Viewport => getStorage(STORAGE_KEY_VIEWPORT, SEED_VIEWPORT);
export const saveViewport = (viewport: Viewport): void => setStorage(STORAGE_KEY_VIEWPORT, viewport);


