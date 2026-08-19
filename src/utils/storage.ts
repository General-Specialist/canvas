import { CanvasNode, CanvasEdge, NoteNodeData } from '../types/canvas';
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
  let nodes = getStorage<CanvasNode[]>(STORAGE_KEY_NODES, SEED_NODES);
  if (!Array.isArray(nodes) || nodes.length <= 3) {
    nodes = SEED_NODES;
    setStorage(STORAGE_KEY_NODES, nodes);
  } else {
    const existingIds = new Set(nodes.map((n) => n.id));
    const missingSeedNodes = SEED_NODES.filter((sn) => !existingIds.has(sn.id));
    const seedMap = new Map(SEED_NODES.map((sn) => [sn.id, sn]));
    nodes = nodes.map((n) => {
      const seedNode = seedMap.get(n.id);
      if (seedNode) {
        let updated = n;
        // Sync quantum groups to their latest seed data positions
        if (seedNode.type === 'groupNode' && seedNode.id.startsWith('group-') && !seedNode.id.startsWith('group-178')) {
          updated = { ...updated, position: seedNode.position, style: seedNode.style };
        }
        if (seedNode.id.startsWith('note-qc-') && seedNode.type === 'noteNode') {
          const seedData = seedNode.data as NoteNodeData;
          updated = {
            ...updated,
            data: {
              ...(updated.data as NoteNodeData),
              title: seedData.title,
              content: seedData.content,
              updatedAt: seedData.updatedAt,
            },
          };
        } else if (seedNode.type === 'noteNode' && (n.data as NoteNodeData)?.content) {
          const content = (n.data as NoteNodeData).content;
          if (content.includes('\\frac') || content.includes('\\begin{bmatrix}') || content.includes('\\text{') || content.includes('\\dagger') || content.includes('\\sum') || content.includes('\\alpha')) {
            const seedData = seedNode.data as NoteNodeData;
            updated = {
              ...updated,
              data: {
                ...(updated.data as NoteNodeData),
                content: seedData.content || content,
                updatedAt: seedData.updatedAt,
              },
            };
          }
        }
        return updated;
      }
      return n;
    });
    if (missingSeedNodes.length > 0) {
      nodes = [...nodes, ...missingSeedNodes];
    }
    setStorage(STORAGE_KEY_NODES, nodes);
  }
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
  let edges = getStorage<CanvasEdge[]>(STORAGE_KEY_EDGES, SEED_EDGES);
  if (!Array.isArray(edges) || (edges.length === 0 && SEED_EDGES.length > 0)) {
    edges = SEED_EDGES;
    setStorage(STORAGE_KEY_EDGES, edges);
  } else {
    const existingIds = new Set(edges.map((e) => e.id));
    const missingSeedEdges = SEED_EDGES.filter((se) => !existingIds.has(se.id));
    if (missingSeedEdges.length > 0) {
      edges = [...edges, ...missingSeedEdges];
      setStorage(STORAGE_KEY_EDGES, edges);
    }
  }
  return edges.map((edge) => ({
    ...edge,
    markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed },
  }));
};
export const saveEdges = (edges: CanvasEdge[]): void => setStorage(STORAGE_KEY_EDGES, edges);

export const loadSavedViewport = (): Viewport => getStorage(STORAGE_KEY_VIEWPORT, SEED_VIEWPORT);
export const saveViewport = (viewport: Viewport): void => setStorage(STORAGE_KEY_VIEWPORT, viewport);


