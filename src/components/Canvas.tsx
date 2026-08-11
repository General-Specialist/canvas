import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Sun, Moon } from '@phosphor-icons/react';

import { NoteNode } from './nodes/NoteNode';
import { FileNode } from './nodes/FileNode';
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
  fileNode: FileNode,
  edgeJunction: EdgeJunctionNode,
};

const edgeTypes = {
  customEdge: CustomEditableEdge,
};

const InnerCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(loadSavedNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState<CanvasEdge>(loadSavedEdges());
  const [menu, setMenu] = useState<{ x: number; y: number; flowPosition: { x: number; y: number } } | null>(null);

  const { theme, toggleTheme } = useTheme();
  const { screenToFlowPosition, setViewport } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingFilePosRef = useRef<{ x: number; y: number } | null>(null);

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
            data: { label: '', animated: false },
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

  // Add File Node helper
  const createFileNode = useCallback(
    (file: File, position?: { x: number; y: number }) => {
      const pos = position || {
        x: 300,
        y: 250,
      };

      const id = `file-${Date.now()}`;
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isTextFile =
        file.type.startsWith('text/') ||
        ['txt', 'md', 'json', 'xml', 'drawio', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'sh', 'rs', 'go', 'c', 'cpp', 'java', 'sql', 'yaml', 'yml', 'csv', 'svg'].includes(ext);

      const sizeStr =
        file.size < 1024
          ? `${file.size} B`
          : file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;

        if (isTextFile && file.size < 2 * 1024 * 1024) {
          const textReader = new FileReader();
          textReader.onload = (textEvent) => {
            const textContent = (textEvent.target?.result as string) || '';
            const newNode: CanvasNode = {
              id,
              type: 'fileNode',
              position: pos,
              data: {
                title: file.name,
                fileName: file.name,
                fileSize: sizeStr,
                fileType: file.type || ext.toUpperCase() || 'Document',
                fileUrl,
                content: textContent,
                updatedAt: new Date().toISOString(),
              },
            };
            setNodes((nds) => [...nds, newNode]);
          };
          textReader.readAsText(file);
        } else {
          const newNode: CanvasNode = {
            id,
            type: 'fileNode',
            position: pos,
            data: {
              title: file.name,
              fileName: file.name,
              fileSize: sizeStr,
              fileType: file.type || ext.toUpperCase() || 'Document',
              fileUrl,
              content: `File: ${file.name}\nSize: ${sizeStr}`,
              updatedAt: new Date().toISOString(),
            },
          };
          setNodes((nds) => [...nds, newNode]);
        }
      };

      reader.readAsDataURL(file);
    },
    [setNodes]
  );

  const handleAddFileNode = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    createFileNode(files[0], pendingFilePosRef.current || undefined);
    pendingFilePosRef.current = null;
    e.target.value = '';
  };

  // Drag & Drop File Handling onto Canvas
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const flowPosition = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      files.forEach((file, index) => {
        createFileNode(file, {
          x: flowPosition.x + index * 30,
          y: flowPosition.y + index * 30,
        });
      });
    },
    [createFileNode, screenToFlowPosition]
  );

  // Right-click pane to open context menu
  const handlePaneContextMenu = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      e.preventDefault();
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
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handlePaneClick}
    >
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />

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

      {/* Right Click Context Menu */}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              pendingFilePosRef.current = menu.flowPosition;
              handleAddFileNode();
              setMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-hover)] transition-colors cursor-pointer"
          >
            + Add File
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
