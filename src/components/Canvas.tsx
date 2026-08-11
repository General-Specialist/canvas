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
  MarkerType,
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
  getNodeAbsolutePos,
  syncAutoEdges,
  expandGroupEdges,
  ensureGroupTitleClearance,
  autoWrapConnectedNodeTitles,
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
  const { screenToFlowPosition, setViewport, getNodes } = useReactFlow();

  useEffect(() => {
    setViewport(loadSavedViewport());
  }, [setViewport]);

  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  useEffect(() => {
    saveEdges(edges);
  }, [edges]);

  useEffect(() => {
    setNodes((prev) => ensureGroupTitleClearance(prev));
  }, [setNodes]);

  const executeGroup = useCallback(
    (targetNodeIds: string[]) => {
      if (targetNodeIds.length === 0) return;

      setNodes((currentNodes) => {
        const targetSet = new Set(targetNodeIds);
        const selectedNodes = currentNodes.filter((n) => targetSet.has(n.id));
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
          if (targetSet.has(n.id)) {
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

        const finalNodes = [newGroupNode, ...updatedNodes];
        setEdges((eds) => syncAutoEdges(finalNodes, eds) as CanvasEdge[]);
        return finalNodes;
      });
    },
    [setNodes, setEdges]
  );

  const handleGroupSelectedNodes = useCallback(() => {
    const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
    executeGroup(selectedIds);
  }, [nodes, executeGroup]);

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

  // Group Mode State
  const [isGroupMode, setIsGroupMode] = useState(false);
  const isGroupModeRef = useRef(false);
  const [toggledNodeIds, setToggledNodeIds] = useState<Set<string>>(new Set());
  const toggledNodeIdsRef = useRef<Set<string>>(new Set());

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: CanvasNode) => {
      if (isGroupModeRef.current) {
        setToggledNodeIds((prev) => {
          const next = new Set(prev);
          if (next.has(node.id)) next.delete(node.id);
          else next.add(node.id);
          toggledNodeIdsRef.current = next;
          return next;
        });
      }
    },
    []
  );

  const handleSelectionEnd = useCallback(() => {
    if (isGroupModeRef.current) {
      const selectedNodes = getNodes().filter((n) => n.selected);
      if (selectedNodes.length > 0) {
        setToggledNodeIds((prev) => {
          const next = new Set(prev);
          selectedNodes.forEach((n) => {
            if (next.has(n.id)) next.delete(n.id);
            else next.add(n.id);
          });
          toggledNodeIdsRef.current = next;
          return next;
        });
      }
    }
  }, [getNodes]);

  const exitGroupMode = useCallback(() => {
    if (isGroupModeRef.current) {
      isGroupModeRef.current = false;
      setIsGroupMode(false);
      const nodesToGroup = Array.from(toggledNodeIdsRef.current);
      if (nodesToGroup.length > 0) {
        executeGroup(nodesToGroup);
      }
      toggledNodeIdsRef.current = new Set();
      setToggledNodeIds(new Set());
    }
  }, [executeGroup]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroupSelectedNodes();
          return;
        }

        if (!isGroupModeRef.current) {
          isGroupModeRef.current = true;
          setIsGroupMode(true);
          toggledNodeIdsRef.current = new Set();
          setToggledNodeIds(new Set());
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (isGroupModeRef.current && (key === 'g' || key === 'control' || key === 'meta')) {
        exitGroupMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', exitGroupMode);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', exitGroupMode);
    };
  }, [exitGroupMode, handleUngroupSelectedNodes]);

  const handleNodeDrag: OnNodeDrag<CanvasNode> = useCallback(
    (_event, _node, allNodes) => {
      setEdges((prevEdges) => syncAutoEdges(allNodes, prevEdges) as CanvasEdge[]);
    },
    [setEdges]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      let updatedEdgesList: CanvasEdge[] = [];
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...connection,
            type: 'customEdge',
            markerEnd: { type: MarkerType.ArrowClosed },
            data: { animated: false },
          },
          eds
        );
        updatedEdgesList = syncAutoEdges(nodes, newEdges) as CanvasEdge[];
        return updatedEdgesList;
      });

      setNodes((currentNodes) => {
        const { updatedNodes, modified } = autoWrapConnectedNodeTitles(currentNodes, updatedEdgesList);
        return modified ? updatedNodes : currentNodes;
      });
    },
    [nodes, setNodes, setEdges]
  );

  useEffect(() => {
    setNodes((currentNodes) => {
      const { updatedNodes, modified } = autoWrapConnectedNodeTitles(currentNodes, edges);
      return modified ? updatedNodes : currentNodes;
    });
  }, [edges, setNodes]);

  const handleAddNote = useCallback(
    (position?: { x: number; y: number }) => {
      const pos = position || {
        x: 300 + Math.random() * 50,
        y: 200 + Math.random() * 50,
      };

      setNodes((nds) => [
        ...nds,
        {
          id: `note-${Date.now()}`,
          type: 'noteNode',
          position: pos,
          data: { title: '', content: '', updatedAt: new Date().toISOString() },
        },
      ]);
    },
    [setNodes]
  );

  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: CanvasNode) => {
    event.preventDefault();
    event.stopPropagation();
    setMenu(null);
    setNodeMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  }, []);

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
              return { ...n, parentId: undefined, position: getNodeAbsolutePos(n, nodeMap) };
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
            return { ...n, parentId: undefined, position: getNodeAbsolutePos(n, nodeMap) };
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
        ...nodeToCopy,
        data: { ...nodeToCopy.data },
        id: newId,
        position: { x: nodeToCopy.position.x + 30, y: nodeToCopy.position.y + 30 },
        selected: true,
      };

      setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), newNode]);
      setNodeMenu(null);
    },
    [nodes, setNodes]
  );

  const handlePaneContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      e.preventDefault();
      setNodeMenu(null);
      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setMenu({ x: e.clientX, y: e.clientY, flowPosition });
    },
    [screenToFlowPosition]
  );

  const handlePaneDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      handleAddNote(screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [handleAddNote, screenToFlowPosition]
  );

  const handlePaneClick = useCallback(() => {
    setMenu(null);
    setNodeMenu(null);
  }, []);

  const displayNodes = React.useMemo(() => {
    if (!isGroupMode) return nodes;
    return nodes.map((n) => ({ ...n, selected: toggledNodeIds.has(n.id) }));
  }, [nodes, isGroupMode, toggledNodeIds]);

  const selectedCount = nodes.filter((n) => n.selected).length;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[var(--canvas-bg)] text-[var(--text-normal)] transition-colors duration-200"
      onClick={handlePaneClick}
    >
      {isGroupMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-xs shadow-lg border border-blue-400/30 select-none">
          <SquaresFour className="w-4 h-4" />
          <span>Group Mode Active: Click or drag-select nodes ({toggledNodeIds.size} selected). Release Ctrl/Cmd+G to group.</span>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
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
              <span>Group Selected</span>
            </button>
          )}
        </div>
      )}

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
              <span>Group Selected</span>
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

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDrag={handleNodeDrag}
        onNodeContextMenu={handleNodeContextMenu}
        onNodesDelete={handleNodesDelete}
        onSelectionEnd={handleSelectionEnd}
        onMoveEnd={(_e, viewport) => saveViewport(viewport)}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onDoubleClick={handlePaneDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
        selectionOnDrag={isGroupMode}
        panOnDrag={!isGroupMode}
        selectionKeyCode={isGroupMode ? null : ['Meta', 'Control']}
        selectionMode={SelectionMode.Partial}
        defaultEdgeOptions={{ type: 'customEdge', markerEnd: { type: MarkerType.ArrowClosed } }}
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

