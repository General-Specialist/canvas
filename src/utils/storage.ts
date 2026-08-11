import { CanvasNode, CanvasEdge } from '../types/canvas';
import { Viewport } from '@xyflow/react';

const STORAGE_KEY_NODES = 'infinite_canvas_nodes_v1';
const STORAGE_KEY_EDGES = 'infinite_canvas_edges_v1';
const STORAGE_KEY_VIEWPORT = 'infinite_canvas_viewport_v1';

export const initialDefaultNodes: CanvasNode[] = [
  {
    id: 'note-welcome',
    type: 'noteNode',
    position: { x: 250, y: 150 },
    data: {
      title: 'Welcome to Canvas',
      content:
        'This is a modern canvas powered by React Flow.\n\nKey features:\n- Drag nodes around to see edges automatically optimize attachment points\n- Click any title, content, or edge label to edit inline\n- Drag and drop files (PDFs, images, text) directly onto the canvas to view them!\n- Toggle between Light and Dark themes anytime using the top bar toggle',
      pinned: false,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'note-feature-min-edge',
    type: 'noteNode',
    position: { x: 750, y: 100 },
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
    data: {
      title: 'Edge-to-Edge Connections',
      content:
        'You can connect edges directly to other edges or nodes by dragging lines onto edge junction points or creating junction nodes!',
      pinned: false,
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'file-demo-architecture',
    type: 'fileNode',
    position: { x: 250, y: 500 },
    data: {
      title: 'sample_document.pdf',
      fileName: 'sample_document.pdf',
      fileSize: '1.2 KB',
      fileType: 'application/pdf',
      fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJSDi48nNCiAxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iaiAyIDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzMgMCBSXT4+CmVuZG9iaiAzIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDQgMCBSL1Jlc291cmNlczw8Pj4+CmVuZG9iaiA0IDAgb2JqCjw8L0xlbmd0aCA0ND4+c3RyZWFtCkJUMCAwIDAgcmdiIC9GMSAxMiBUZiA3MiA3MTIgVGQgKEhlbGxvLCBXb3JsZCEpIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUgCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAxNSAwMDAwMCBuIAowMDY4IDAwMDAwIG4gCjAxMjUgMDAwMDAgbiAKMDIxNCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNS9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjMwOQolJUVPRg==',
      content: 'Sample PDF document preview.',
      updatedAt: new Date().toISOString(),
    },
  },
];

export const initialDefaultEdges: CanvasEdge[] = [
  {
    id: 'e-welcome-min-edge',
    source: 'note-welcome',
    target: 'note-feature-min-edge',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'customEdge',
    data: {
      label: 'minimizes length',
      animated: true,
    },
  },
  {
    id: 'e-welcome-edge-connect',
    source: 'note-welcome',
    target: 'note-feature-edge-connect',
    sourceHandle: 'bottom',
    targetHandle: 'left',
    type: 'customEdge',
    data: {
      label: 'supports junctions',
      animated: false,
    },
  },
  {
    id: 'e-file-welcome',
    source: 'file-demo-architecture',
    target: 'note-welcome',
    sourceHandle: 'top',
    targetHandle: 'bottom',
    type: 'customEdge',
    data: {
      label: 'defines schema',
      animated: false,
    },
  },
];

export const initialDefaultViewport: Viewport = {
  x: 50,
  y: 50,
  zoom: 0.9,
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(defaultValue) ? Array.isArray(parsed) && parsed.length > 0 : parsed && typeof parsed === 'object') {
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

export const loadSavedNodes = (): CanvasNode[] => getStorage(STORAGE_KEY_NODES, initialDefaultNodes);
export const saveNodes = (nodes: CanvasNode[]): void => setStorage(STORAGE_KEY_NODES, nodes);
export const loadSavedEdges = (): CanvasEdge[] => getStorage(STORAGE_KEY_EDGES, initialDefaultEdges);
export const saveEdges = (edges: CanvasEdge[]): void => setStorage(STORAGE_KEY_EDGES, edges);
export const loadSavedViewport = (): Viewport => getStorage(STORAGE_KEY_VIEWPORT, initialDefaultViewport);
export const saveViewport = (viewport: Viewport): void => setStorage(STORAGE_KEY_VIEWPORT, viewport);

export function clearCanvasStorage(): void {
  localStorage.removeItem(STORAGE_KEY_NODES);
  localStorage.removeItem(STORAGE_KEY_EDGES);
  localStorage.removeItem(STORAGE_KEY_VIEWPORT);
}
