import React, { useState, memo } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import {
  File,
  FileCode,
  FileText,
  FilePdf,
  FileZip,
  Image,
  Video,
  MusicNotes,
  DownloadSimple,
} from '@phosphor-icons/react';
import { NoteNodeData, PDFAnnotation } from '../../types/canvas';
import { FourWayHandles } from './FourWayHandles';
import { PDFViewer } from '../pdf/PDFViewer';

export const FileNode: React.FC<NodeProps> = memo(({ id, data, selected, isConnectable }) => {
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as NoteNodeData;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(
    nodeData.title || nodeData.fileName || 'document.txt'
  );

  const updateNodeData = (updates: Partial<NoteNodeData>) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...updates } } : n))
    );
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    const finalTitle = titleInput.trim() || nodeData.fileName || 'document.txt';
    setTitleInput(finalTitle);
    updateNodeData({ title: finalTitle });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitleInput(val);
    updateNodeData({ title: val });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData({ content: e.target.value });
  };

  const fileUrl = nodeData.fileUrl || '';
  const fileName = nodeData.fileName || nodeData.title || 'document';
  const fileType = (nodeData.fileType || '').toLowerCase();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const isPdf = fileType.includes('pdf') || ext === 'pdf' || fileUrl.startsWith('data:application/pdf');
  const isImage = fileType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
  const isVideo = fileType.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext);
  const isAudio = fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext);

  const getFileIcon = () => {
    if (isImage) return Image;
    if (isPdf) return FilePdf;
    if (isVideo) return Video;
    if (isAudio) return MusicNotes;
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return FileZip;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'drawio', 'xml', 'py', 'sh', 'rs', 'go', 'c', 'cpp', 'java', 'sql', 'yaml', 'yml'].includes(ext)) return FileCode;
    if (['txt', 'md', 'doc', 'docx', 'rtf', 'csv'].includes(ext)) return FileText;
    return File;
  };

  const FileIconComponent = getFileIcon();
  const [isHovered, setIsHovered] = useState(false);

  const minW = isPdf ? 520 : 280;
  const minH = isPdf ? 600 : 160;

  const handleResizeNode = (w: number, h: number) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              style: { ...n.style, width: w, height: h },
            }
          : n
      )
    );
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full rounded-xl border border-[var(--node-border)] bg-[var(--node-bg)] shadow-xl flex flex-col p-3 transition-shadow duration-150 ${
        selected
          ? 'ring-2 ring-[var(--node-selected-ring)]'
          : isHovered
          ? 'ring-2 ring-[var(--node-hover-ring)]'
          : ''
      }`}
      style={{
        minWidth: minW,
        minHeight: minH,
      }}
    >
      <NodeResizer
        minWidth={minW}
        minHeight={minH}
        isVisible={selected}
        color="var(--node-selected-ring)"
      />

      {/* Connection Handles */}
      <FourWayHandles isConnectable={isConnectable} />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-color)] drag-handle cursor-move">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-hover)] shrink-0">
            <FileIconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={handleTitleChange}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                onBlur={handleTitleSubmit}
                autoFocus
                className="nodrag bg-[var(--input-bg)] text-[var(--text-hover)] text-xs font-semibold px-2 py-0.5 rounded border border-[var(--node-selected-ring)] focus:outline-none w-full"
              />
            ) : (
              <span
                onClick={() => setIsEditingTitle(true)}
                className="text-xs font-semibold text-[var(--text-normal)] hover:text-[var(--text-hover)] cursor-pointer truncate block transition-colors"
                title={nodeData.title || nodeData.fileName}
              >
                {nodeData.title || nodeData.fileName || 'document.txt'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {ext && (
            <span className="uppercase text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-light)]">
              {ext}
            </span>
          )}
          {fileUrl && (
            <a
              href={fileUrl}
              download={fileName}
              target="_blank"
              rel="noreferrer"
              title="Download File"
              className="nodrag p-1 rounded text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors"
            >
              <DownloadSimple className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Embedded File Viewer / Editor Area */}
      <div className="pt-2 flex-1 flex flex-col min-h-0">
        {isPdf && fileUrl ? (
          <PDFViewer
            fileUrl={fileUrl}
            fileName={fileName}
            annotations={nodeData.annotations || []}
            onUpdateAnnotations={(anns: PDFAnnotation[]) => updateNodeData({ annotations: anns })}
            onResizeNode={handleResizeNode}
          />
        ) : isImage && fileUrl ? (
          <div className="w-full flex-1 min-h-0 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)] p-1.5 flex items-center justify-center overflow-hidden">
            <img
              src={fileUrl}
              alt={nodeData.title || 'Attached Image'}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        ) : isVideo && fileUrl ? (
          <div className="w-full flex-1 min-h-0 bg-black rounded-lg border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
            <video src={fileUrl} controls className="max-w-full max-h-full rounded" />
          </div>
        ) : isAudio && fileUrl ? (
          <div className="w-full p-2 bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)] flex flex-col gap-2">
            <audio src={fileUrl} controls className="w-full" />
          </div>
        ) : (
          <div className="w-full flex-1 min-h-[80px] bg-[var(--input-bg)] rounded-lg border border-[var(--border-color)] p-2.5 flex flex-col overflow-hidden">
            <textarea
              value={nodeData.content || ''}
              onChange={handleContentChange}
              placeholder="File content or notes..."
              className="nodrag nopan w-full h-full bg-transparent text-xs font-mono text-[var(--text-normal)] placeholder-[var(--text-light)] focus:outline-none resize-none leading-relaxed overflow-auto cursor-text"
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      {nodeData.fileSize && (
        <div className="pt-1.5 flex items-center justify-between text-[10px] text-[var(--text-light)]">
          <span>{nodeData.fileSize}</span>
          <span className="truncate max-w-[150px]">{nodeData.fileType}</span>
        </div>
      )}
    </div>
  );
});

FileNode.displayName = 'FileNode';
