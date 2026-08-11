import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Connection,
  ReactFlowProvider,
  BackgroundVariant,
  OnNodeDrag,
  ConnectionMode,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sun, Moon, Trash, Copy } from '@phosphor-icons/react';

import { NoteNode } from './nodes/NoteNode';
import { EdgeJunctionNode } from './nodes/EdgeJunctionNode';
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
import { optimizeAllEdges } from '../utils/edgeUtils';

const nodeTypes = {
  noteNode: NoteNode,
  edgeJunction: EdgeJunctionNode,
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

  // Dynamic Minimum Length Edge Optimization on Node Drag
  const handleNodeDrag: OnNodeDrag<CanvasNode> = useCallback(
    (_event, _node, allNodes) => {
      setEdges((prevEdges) => optimizeAllEdges(allNodes, prevEdges) as CanvasEdge[]);
    },
    [setEdges]
  );

  // Native Handle Connection
  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'customEdge',
            data: { animated: false },
          },
          eds
        )
      );
    },
    [setEdges]
  );

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
          title: 'New Note',
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
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setNodeMenu(null);
    },
    [setNodes, setEdges]
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

  const dotsColor = theme === 'dark' ? '#2A2A2A' : '#EEEEEC';

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[var(--canvas-bg)] text-[var(--text-normal)] transition-colors duration-200"
      onClick={handlePaneClick}
    >
      {/* Minimalist Floating Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[var(--sidebar-bg)] hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-hover)] border border-[var(--border-color)] text-xs font-medium shadow-md transition-all cursor-pointer"
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-[var(--text-hover)]" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--text-hover)]" />
        )}
        <span className="capitalize">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>

      {/* Right Click Pane Context Menu */}
      {menu && (
        <div
          className="fixed z-50 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1 w-40 text-xs font-medium text-[var(--text-normal)] transition-colors duration-200"
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
        </div>
      )}

      {/* Right Click Node Context Menu */}
      {nodeMenu && (
        <div
          className="fixed z-50 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-xl shadow-xl py-1 w-44 text-xs font-medium text-[var(--text-normal)] transition-colors duration-200"
          style={{ top: nodeMenu.y, left: nodeMenu.x }}
        >
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
        onNodeDrag={handleNodeDrag}
        onNodeContextMenu={handleNodeContextMenu}
        onMoveEnd={handleMoveEnd}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onDoubleClick={handlePaneDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'customEdge' }}
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        className="bg-[var(--canvas-bg)]"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color={dotsColor} />
      </ReactFlow>
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
