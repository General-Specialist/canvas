import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Connection,
  ReactFlowProvider,
  OnNodeDrag,
  ConnectionMode,
  SelectionMode,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sun, Moon, Trash, Copy, SquaresFour } from '@phosphor-icons/react';

import { NoteNode } from './nodes/NoteNode';
import { EdgeJunctionNode } from './nodes/EdgeJunctionNode';
import { GroupNode } from './nodes/GroupNode';
import { CustomEditableEdge } from './edges/CustomEditableEdge';
import { useTheme } from '../context/ThemeContext';

import { CanvasNode, CanvasEdge } from '../types/canvas';
import {
  loadSavedNodes,
  saveNodes,
  loadSavedEdges,
  saveEdges,
  loadSavedViewport,
  saveViewport,
} from '../utils/storage';
import {
  optimizeAllEdges,
  getNodeAbsolutePos,
  consolidateGroupEdges,
  expandGroupEdges,
  ensureGroupTitleClearance,
} from '../utils/edgeUtils';

const nodeTypes = {
  noteNode: NoteNode,
  edgeJunction: EdgeJunctionNode,
  groupNode: GroupNode,
};

const edgeTypes = {
  customEdge: CustomEditableEdge,
};

const InnerCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(loadSavedNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>(loadSavedEdges());
  const [menu, setMenu] = useState<{ x: number; y: number; flowPosition: { x: number; y: number } } | null>(null);
  const [nodeMenu, setNodeMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { screenToFlowPosition, setViewport } = useReactFlow();

  // Restore initial viewport on mount
  useEffect(() => {
    const savedViewport = loadSavedViewport();
    setViewport(savedViewport);
  }, [setViewport]);

  // Persist nodes on changes
  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  // Persist edges on changes
  useEffect(() => {
    saveEdges(edges);
  }, [edges]);

  // Ensure group containers have adequate top clearance for 48px titles
  useEffect(() => {
    setNodes((prevNodes) => {
      const cleared = ensureGroupTitleClearance(prevNodes);
      if (cleared !== prevNodes) {
        return cleared;
      }
      return prevNodes;
    });
  }, [setNodes]);

  // Grouping Logic
  const handleGroupSelectedNodes = useCallback(() => {
    setNodes((currentNodes) => {
      const selectedNodes = currentNodes.filter((n) => n.selected);
      if (selectedNodes.length === 0) return currentNodes;

      const nodeMap = new Map<string, CanvasNode>(currentNodes.map((n) => [n.id, n]));

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      selectedNodes.forEach((node) => {
        const absPos = getNodeAbsolutePos(node, nodeMap);
        const defaultW = node.type === 'noteNode' ? 260 : node.type === 'edgeJunction' ? 16 : 300;
        const defaultH = node.type === 'noteNode' ? 100 : node.type === 'edgeJunction' ? 16 : 200;
        const width = node.measured?.width || node.width || (node.style?.width as number) || defaultW;
        const height = node.measured?.height || node.height || (node.style?.height as number) || defaultH;

        minX = Math.min(minX, absPos.x);
        minY = Math.min(minY, absPos.y);
        maxX = Math.max(maxX, absPos.x + width);
        maxY = Math.max(maxY, absPos.y + height);
      });

      const paddingTop = 140;
      const paddingSide = 40;
      const paddingBottom = 40;

      const groupX = Math.round(minX - paddingSide);
      const groupY = Math.round(minY - paddingTop);
      const groupWidth = Math.round(Math.max(400, maxX - minX + paddingSide * 2));
      const groupHeight = Math.round(Math.max(280, maxY - minY + paddingTop + paddingBottom));

      const groupId = `group-${Date.now()}`;
      const selectedIds = new Set(selectedNodes.map((n) => n.id));

      const newGroupNode: CanvasNode = {
        id: groupId,
        type: 'groupNode',
        position: { x: groupX, y: groupY },
        style: { width: groupWidth, height: groupHeight },
        data: {
          title: `Group ${currentNodes.filter((n) => n.type === 'groupNode').length + 1}`,
          color: 'blue',
        },
        selected: true,
        zIndex: -1,
      };

      const updatedNodes = currentNodes.map((n) => {
        if (selectedIds.has(n.id)) {
          const absPos = getNodeAbsolutePos(n, nodeMap);
          return {
            ...n,
            parentId: groupId,
            position: {
              x: Math.round(absPos.x - groupX),
              y: Math.round(absPos.y - groupY),
            },
            selected: false,
          };
        }
        return n;
      });

      return [newGroupNode, ...updatedNodes];
    });
  }, [setNodes]);

  const handleUngroupSelectedNodes = useCallback(() => {
    setNodes((currentNodes) => {
      const selectedGroupNodes = currentNodes.filter((n) => n.selected && n.type === 'groupNode');
      if (selectedGroupNodes.length === 0) return currentNodes;

      const groupIdsToUngroup = new Set(selectedGroupNodes.map((g) => g.id));
      const nodeMap = new Map<string, CanvasNode>(currentNodes.map((n) => [n.id, n]));

      setEdges((eds) => expandGroupEdges(groupIdsToUngroup, currentNodes, eds) as CanvasEdge[]);

      return currentNodes
        .filter((n) => !groupIdsToUngroup.has(n.id))
        .map((n) => {
          if (n.parentId && groupIdsToUngroup.has(n.parentId)) {
            const absPos = getNodeAbsolutePos(n, nodeMap);
            return {
              ...n,
              parentId: undefined,
              position: {
                x: Math.round(absPos.x),
                y: Math.round(absPos.y),
              },
              selected: true,
            };
          }
          return n;
        });
    });
  }, [setNodes, setEdges]);

  const isCmdHeldRef = useRef(false);
  const clickedNodesDuringCmdRef = useRef<Set<string>>(new Set());

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: CanvasNode) => {
      if (event.metaKey || event.ctrlKey || isCmdHeldRef.current) {
        clickedNodesDuringCmdRef.current.add(node.id);
      }
    },
    []
  );

  const handleSelectionEnd = useCallback(() => {
    setTimeout(() => {
      handleGroupSelectedNodes();
    }, 50);
  }, [handleGroupSelectedNodes]);

  // Global Keyboard Shortcuts
  // - Holding Cmd/Ctrl and clicking multiple nodes then releasing Cmd/Ctrl (or pressing Cmd/Ctrl + G) automatically creates a group
  // - Cmd/Ctrl + Shift + G ungroups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        isCmdHeldRef.current = true;
      }

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroupSelectedNodes();
        } else {
          handleGroupSelectedNodes();
        }
        clickedNodesDuringCmdRef.current.clear();
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || e.key === 'Control') {
        isCmdHeldRef.current = false;
        if (clickedNodesDuringCmdRef.current.size >= 2) {
          handleGroupSelectedNodes();
        }
        clickedNodesDuringCmdRef.current.clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleGroupSelectedNodes, handleUngroupSelectedNodes]);

  // Dynamic Minimum Length Edge Optimization on Node Drag
  const handleNodeDrag: OnNodeDrag<CanvasNode> = useCallback(
    (_event, _node, allNodes) => {
      setEdges((prevEdges) => optimizeAllEdges(allNodes, prevEdges) as CanvasEdge[]);
    },
    [setEdges]
  );

  // Native Handle Connection with Group Edge Consolidation
  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...connection,
            type: 'customEdge',
            data: { animated: false },
          },
          eds
        );
        return consolidateGroupEdges(nodes, newEdges) as CanvasEdge[];
      });
    },
    [nodes, setEdges]
  );

  // Auto-consolidate group edges when all child nodes in a group are connected
  useEffect(() => {
    setEdges((prevEdges) => {
      const consolidated = consolidateGroupEdges(nodes, prevEdges) as CanvasEdge[];
      if (JSON.stringify(consolidated) !== JSON.stringify(prevEdges)) {
        return consolidated;
      }
      return prevEdges;
    });
  }, [nodes, setEdges]);

  // Add New Note Node
  const handleAddNote = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || {
        x: 300 + Math.random() * 50,
        y: 200 + Math.random() * 50,
      };

      const id = `note-${Date.now()}`;
      const newNode: CanvasNode = {
        id,
        type: 'noteNode',
        position: pos,
        data: {
          title: '',
          content: '',
          updatedAt: new Date().toISOString(),
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Right-click node handler
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: CanvasNode) => {
      event.preventDefault();
      event.stopPropagation();
      setMenu(null);
      setNodeMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setEdges((eds) => expandGroupEdges(new Set([nodeId]), nodes, eds) as CanvasEdge[]);
      setNodes((nds) => {
        const nodeToDelete = nds.find((n) => n.id === nodeId);
        if (!nodeToDelete) return nds;

        const nodeMap = new Map<string, CanvasNode>(nds.map((n) => [n.id, n]));

        return nds
          .filter((n) => n.id !== nodeId)
          .map((n) => {
            if (n.parentId === nodeId) {
              const absPos = getNodeAbsolutePos(n, nodeMap);
              return {
                ...n,
                parentId: undefined,
                position: absPos,
              };
            }
            return n;
          });
      });

      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setNodeMenu(null);
    },
    [nodes, setNodes, setEdges]
  );

  const handleNodesDelete = useCallback(
    (deletedNodes: CanvasNode[]) => {
      const deletedGroupIds = new Set(
        deletedNodes.filter((n) => n.type === 'groupNode').map((n) => n.id)
      );
      if (deletedGroupIds.size === 0) return;

      setNodes((currentNodes) => {
        const nodeMap = new Map<string, CanvasNode>(currentNodes.map((n) => [n.id, n]));
        return currentNodes.map((n) => {
          if (n.parentId && deletedGroupIds.has(n.parentId)) {
            const absPos = getNodeAbsolutePos(n, nodeMap);
            return {
              ...n,
              parentId: undefined,
              position: absPos,
            };
          }
          return n;
        });
      });
    },
    [setNodes]
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const nodeToCopy = nodes.find((n) => n.id === nodeId);
      if (!nodeToCopy) return;

      const newId = `${nodeToCopy.type || 'node'}-${Date.now()}`;
      const newNode: CanvasNode = {
        ...JSON.parse(JSON.stringify(nodeToCopy)),
        id: newId,
        position: {
          x: nodeToCopy.position.x + 30,
          y: nodeToCopy.position.y + 30,
        },
        selected: true,
      };

      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
      setNodeMenu(null);
    },
    [nodes, setNodes]
  );

  // Right-click pane to open context menu
  const handlePaneContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      e.preventDefault();
      setNodeMenu(null);
      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setMenu({ x: e.clientX, y: e.clientY, flowPosition });
    },
    [screenToFlowPosition]
  );

  // Double click canvas to add note
  const handlePaneDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      handleAddNote(flowPosition);
    },
    [handleAddNote, screenToFlowPosition]
  );

  // Close context menu on click
  const handlePaneClick = useCallback(() => {
    setMenu(null);
    setNodeMenu(null);
  }, []);

  // Save Viewport state on move end
  const handleMoveEnd = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: { x: number; y: number; zoom: number }) => {
      saveViewport(viewport);
    },
    []
  );

  const selectedCount = nodes.filter((n) => n.selected).length;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[var(--canvas-bg)] text-[var(--text-normal)] transition-colors duration-200"
      onClick={handlePaneClick}
    >
      {/* Minimalist Floating Theme Toggle & Quick Action Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {selectedCount > 0 && (
          <button
            onClick={handleGroupSelectedNodes}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer animate-fade-in"
            title="Group Selected Nodes (Cmd+G)"
          >
            <SquaresFour className="w-4 h-4" />
            <span>Group ({selectedCount})</span>
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-hover)] border border-[var(--border-color)] text-xs font-medium shadow-md transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[var(--text-hover)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--text-hover)]" />
          )}
          <span className="capitalize">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Right Click Pane Context Menu */}
      {menu && (
        <div
          className="fixed z-50 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1 w-48 text-xs font-medium text-[var(--text-normal)] transition-colors duration-200"
          style={{ top: menu.y, left: menu.x }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddNote(menu.flowPosition);
              setMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
          >
            + Add Note
          </button>
          {selectedCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGroupSelectedNodes();
                setMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-hover)] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <SquaresFour className="w-3.5 h-3.5 text-blue-500" />
              <span>Group Selected (Cmd+G)</span>
            </button>
          )}
        </div>
      )}

      {/* Right Click Node Context Menu */}
      {nodeMenu && (
        <div
          className="fixed z-50 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1 w-48 text-xs font-medium text-[var(--text-normal)] transition-colors duration-200"
          style={{ top: nodeMenu.y, left: nodeMenu.x }}
        >
          {selectedCount > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGroupSelectedNodes();
                setNodeMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-hover)] transition-colors flex items-center gap-2 cursor-pointer border-b border-[var(--border-color)]"
            >
              <SquaresFour className="w-3.5 h-3.5 text-blue-500" />
              <span>Group Selected (Cmd+G)</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicateNode(nodeMenu.nodeId);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-hover)] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-[var(--text-light)]" />
            <span>Duplicate Node</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNode(nodeMenu.nodeId);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-red-500 hover:text-red-600 font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5" />
            <span>Delete Node</span>
          </button>
        </div>
      )}

      {/* Main Infinite Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDrag={handleNodeDrag}
        onNodeContextMenu={handleNodeContextMenu}
        onNodesDelete={handleNodesDelete}
        onSelectionEnd={handleSelectionEnd}
        onMoveEnd={handleMoveEnd}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onDoubleClick={handlePaneDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
        selectionOnDrag={false}
        panOnDrag={true}
        selectionKeyCode={['Meta', 'Control']}
        selectionMode={SelectionMode.Partial}
        defaultEdgeOptions={{ type: 'customEdge' }}
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--canvas-bg)]"
      />
    </div>
  );
};

export const Canvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <InnerCanvas />
    </ReactFlowProvider>
  );
};
