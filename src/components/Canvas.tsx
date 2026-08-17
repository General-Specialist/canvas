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
import { Sun, Moon, Trash, Copy, SquaresFour, Palette } from '@phosphor-icons/react';

import { NoteNode } from './nodes/NoteNode';
import { EdgeJunctionNode } from './nodes/EdgeJunctionNode';
import { GroupNode, COLOR_THEMES } from './nodes/GroupNode';
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
  getNodeDimensions,
  syncAutoEdges,
  expandGroupEdges,
  sortNodesByDepth,
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

const MenuItem: React.FC<{
  label: string;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'danger' | 'warning' | 'default';
  borderBottom?: boolean;
}> = ({ label, icon, onClick, variant = 'default', borderBottom }) => {
  const colorClass =
    variant === 'danger'
      ? 'text-[#FF4B4B] hover:bg-[#FF4B4B]/10 font-semibold'
      : variant === 'warning'
      ? 'text-[#FF9600] hover:bg-[var(--sidebar-hover-bg)]'
      : 'text-[var(--text-normal)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-hover)]';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`w-full text-left px-3 py-1.5 transition-colors flex items-center gap-2 cursor-pointer ${colorClass} ${
        borderBottom ? 'border-b border-[var(--border-color)]' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
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
          const { width, height } = getNodeDimensions(node);

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
            title: '',
            color: 'featherGreen',
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

        const finalNodes = sortNodesByDepth([newGroupNode, ...updatedNodes]);
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

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: CanvasNode) => {
    if (isGroupModeRef.current) {
      setToggledNodeIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        toggledNodeIdsRef.current = next;
        return next;
      });
    }
  }, []);

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
          const currentlySelected = getNodes().filter((n) => n.selected).map((n) => n.id);
          const initialSet = new Set(currentlySelected);
          toggledNodeIdsRef.current = initialSet;
          setToggledNodeIds(initialSet);
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
  }, [exitGroupMode, handleUngroupSelectedNodes, getNodes]);

  const handleRemoveNodeFromGroup = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => {
        const nodeMap = new Map<string, CanvasNode>(currentNodes.map((n) => [n.id, n]));
        const targetNode = nodeMap.get(nodeId);
        if (!targetNode || !targetNode.parentId) return currentNodes;

        const absPos = getNodeAbsolutePos(targetNode, nodeMap);
        const updatedNodes = currentNodes.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              parentId: undefined,
              position: {
                x: Math.round(absPos.x),
                y: Math.round(absPos.y),
              },
            };
          }
          return n;
        });

        const sorted = sortNodesByDepth(updatedNodes);
        setEdges((eds) => syncAutoEdges(sorted, eds) as CanvasEdge[]);
        return sorted;
      });
    },
    [setNodes, setEdges]
  );

  const handleNodeDragStop: OnNodeDrag<CanvasNode> = useCallback(
    (_event, draggedNode) => {
      if (draggedNode.type === 'groupNode') {
        setNodes((currentNodes) => {
          setEdges((prevEdges) => syncAutoEdges(currentNodes, prevEdges) as CanvasEdge[]);
          return currentNodes;
        });
        return;
      }

      setNodes((currentNodes) => {
        const nodeMap = new Map<string, CanvasNode>(currentNodes.map((n) => [n.id, n]));
        const targetNode = nodeMap.get(draggedNode.id);
        if (!targetNode) return currentNodes;

        const absPos = getNodeAbsolutePos(targetNode, nodeMap);
        const { width: nodeW, height: nodeH } = getNodeDimensions(targetNode);
        const nodeCenterX = absPos.x + nodeW / 2;
        const nodeCenterY = absPos.y + nodeH / 2;

        const groupNodes = currentNodes.filter((n) => n.type === 'groupNode' && n.id !== targetNode.id);

        let containingGroup: CanvasNode | null = null;
        for (const group of groupNodes) {
          const groupAbsPos = getNodeAbsolutePos(group, nodeMap);
          const { width: groupW, height: groupH } = getNodeDimensions(group);

          if (
            nodeCenterX >= groupAbsPos.x &&
            nodeCenterX <= groupAbsPos.x + groupW &&
            nodeCenterY >= groupAbsPos.y &&
            nodeCenterY <= groupAbsPos.y + groupH
          ) {
            containingGroup = group;
            break;
          }
        }

        const isInsideParent = (parent: CanvasNode) => {
          const pAbs = getNodeAbsolutePos(parent, nodeMap);
          const { width: pW, height: pH } = getNodeDimensions(parent);
          return (
            nodeCenterX >= pAbs.x &&
            nodeCenterX <= pAbs.x + pW &&
            nodeCenterY >= pAbs.y &&
            nodeCenterY <= pAbs.y + pH
          );
        };

        let nextParentId: string | undefined = targetNode.parentId;

        if (targetNode.parentId) {
          const currentParent = groupNodes.find((g) => g.id === targetNode.parentId);
          if (!currentParent || !isInsideParent(currentParent)) {
            nextParentId = containingGroup?.id;
          }
        } else if (containingGroup) {
          nextParentId = containingGroup.id;
        }

        if (nextParentId !== targetNode.parentId) {
          const nextParent = nextParentId ? groupNodes.find((g) => g.id === nextParentId) : undefined;
          const nextParentPos = nextParent ? getNodeAbsolutePos(nextParent, nodeMap) : { x: 0, y: 0 };

          const updatedNodes = currentNodes.map((n) => {
            if (n.id === targetNode.id) {
              return {
                ...n,
                parentId: nextParentId,
                position: nextParentId
                  ? { x: Math.round(absPos.x - nextParentPos.x), y: Math.round(absPos.y - nextParentPos.y) }
                  : { x: Math.round(absPos.x), y: Math.round(absPos.y) },
              };
            }
            return n;
          });

          const sorted = sortNodesByDepth(updatedNodes);
          setEdges((eds) => syncAutoEdges(sorted, eds) as CanvasEdge[]);
          return sorted;
        }

        setEdges((eds) => syncAutoEdges(currentNodes, eds) as CanvasEdge[]);
        return currentNodes;
      });
    },
    [setNodes, setEdges]
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
          style: { width: 260 },
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

  const handleSetGroupColor = useCallback(
    (nodeId: string, color: string) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, color } } : n))
      );
      setNodeMenu(null);
    },
    [setNodes]
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#58CC02] text-white font-medium text-xs shadow-lg border border-[#89E219]/30 select-none">
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
          <MenuItem
            label="+ Add Note"
            onClick={() => {
              handleAddNote(menu.flowPosition);
              setMenu(null);
            }}
          />
          {selectedCount > 0 && (
            <MenuItem
              label="Group Selected"
              icon={<SquaresFour className="w-3.5 h-3.5 text-[#58CC02]" />}
              onClick={() => {
                handleGroupSelectedNodes();
                setMenu(null);
              }}
            />
          )}
        </div>
      )}

      {nodeMenu && (() => {
        const targetNode = nodes.find((n) => n.id === nodeMenu.nodeId);
        const isGroupNode = targetNode?.type === 'groupNode';

        if (isGroupNode) {
          const currentColor = (targetNode?.data as Record<string, any>)?.color || 'featherGreen';

          return (
            <div
              className="fixed z-50 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-2 px-2 w-52 text-xs font-medium text-[var(--text-normal)] transition-colors duration-200"
              style={{ top: nodeMenu.y, left: nodeMenu.x }}
            >
              <div className="px-1 py-1 select-none">
                <div className="flex items-center gap-1.5 text-[var(--text-light)] font-semibold mb-2 px-1">
                  <Palette className="w-4 h-4 text-[var(--text-light)]" />
                  <span>Color</span>
                </div>
                <div className="grid grid-cols-4 gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-lg">
                  {Object.entries(COLOR_THEMES).map(([cKey, t]) => (
                    <button
                      key={cKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetGroupColor(nodeMenu.nodeId, cKey);
                      }}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                        t.dot
                      } ${
                        currentColor === cKey
                          ? 'ring-2 ring-[var(--text-normal)] border-white shadow-sm'
                          : 'border-black/10'
                      }`}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>

              <div className="my-1.5 border-t border-[var(--border-color)]" />

              <MenuItem
                label="Delete Group"
                variant="danger"
                icon={<Trash className="w-4 h-4" />}
                onClick={() => handleDeleteNode(nodeMenu.nodeId)}
              />
            </div>
          );
        }

        return (
          <div
            className="fixed z-50 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1 w-48 text-xs font-medium text-[var(--text-normal)] transition-colors duration-200"
            style={{ top: nodeMenu.y, left: nodeMenu.x }}
          >
            {targetNode?.parentId && (
              <MenuItem
                label="Remove from Group"
                variant="warning"
                borderBottom
                icon={<SquaresFour className="w-3.5 h-3.5" />}
                onClick={() => {
                  handleRemoveNodeFromGroup(nodeMenu.nodeId);
                  setNodeMenu(null);
                }}
              />
            )}
            {selectedCount > 1 && (
              <MenuItem
                label="Group Selected"
                borderBottom
                icon={<SquaresFour className="w-3.5 h-3.5 text-[#58CC02]" />}
                onClick={() => {
                  handleGroupSelectedNodes();
                  setNodeMenu(null);
                }}
              />
            )}
            <MenuItem
              label="Duplicate Node"
              icon={<Copy className="w-3.5 h-3.5 text-[var(--text-light)]" />}
              onClick={() => handleDuplicateNode(nodeMenu.nodeId)}
            />
            <MenuItem
              label="Delete Node"
              variant="danger"
              icon={<Trash className="w-3.5 h-3.5" />}
              onClick={() => handleDeleteNode(nodeMenu.nodeId)}
            />
          </div>
        );
      })()}

      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
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
