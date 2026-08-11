import React, { useState } from 'react';
import {
  Hand,
  Pencil,
  Highlighter,
  Square,
  Circle as CircleIcon,
  ArrowUpRight,
  TextT,
  Eraser,
  ArrowCounterClockwise,
  ArrowClockwise,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  DownloadSimple,
  Palette,
  Sliders,
  CaretLeft,
  CaretRight,
  ArrowsOut,
} from '@phosphor-icons/react';
import { PDFAnnotationTool } from '../../types/canvas';

interface PDFToolbarProps {
  activeTool: PDFAnnotationTool;
  setActiveTool: (tool: PDFAnnotationTool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  zoom: number;
  setZoom: (fn: (prev: number) => number) => void;
  resetZoom: () => void;
  onFitFullSize?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  numPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
}

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber / Yellow
  '#10B981', // Emerald / Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#000000', // Black
  '#FFFFFF', // White
];

const STROKE_WIDTHS = [2, 4, 8, 12, 18];

export const PDFToolbar: React.FC<PDFToolbarProps> = ({
  activeTool,
  setActiveTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  fontSize,
  setFontSize,
  zoom,
  setZoom,
  resetZoom,
  onFitFullSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExport,
  numPages,
  currentPage,
  onPageSelect,
}) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showStrokeMenu, setShowStrokeMenu] = useState(false);

  return (
    <div className="nodrag nopan absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--sidebar-bg)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-2xl text-xs text-[var(--text-normal)] select-none transition-all">
      {/* Primary Tool Group */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-[var(--border-color)]">
        <button
          onClick={() => setActiveTool('select')}
          title="Pan / Select (Scroll Mode)"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'select'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('pen')}
          title="Pen (Draw)"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'pen'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('highlighter')}
          title="Highlighter"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'highlighter'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('rectangle')}
          title="Rectangle Shape"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'rectangle'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('circle')}
          title="Circle Shape"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'circle'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <CircleIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('arrow')}
          title="Arrow Shape"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'arrow'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('text')}
          title="Text Note"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'text'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <TextT className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('eraser')}
          title="Eraser (Click item to remove)"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTool === 'eraser'
              ? 'bg-[var(--node-selected-ring)] text-white shadow-sm'
              : 'hover:bg-[var(--sidebar-hover-bg)] text-[var(--text-light)] hover:text-[var(--text-hover)]'
          }`}
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      {/* Style Popovers (Color & Thickness) */}
      <div className="relative flex items-center gap-1 pr-1.5 border-r border-[var(--border-color)]">
        {/* Color Palette Button */}
        <button
          onClick={() => {
            setShowColorMenu(!showColorMenu);
            setShowStrokeMenu(false);
          }}
          title="Color Palette"
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <div
            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner"
            style={{ backgroundColor: color }}
          />
          <Palette className="w-3.5 h-3.5 text-[var(--text-light)]" />
        </button>

        {showColorMenu && (
          <div className="absolute top-full mt-2 left-0 z-40 p-2 rounded-xl bg-[var(--sidebar-bg)] border border-[var(--border-color)] shadow-xl grid grid-cols-4 gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setShowColorMenu(false);
                }}
                className={`w-6 h-6 rounded-full border border-black/20 transition-transform cursor-pointer ${
                  color === c ? 'scale-110 ring-2 ring-[var(--node-selected-ring)]' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}

        {/* Thickness / Font Size Button */}
        <button
          onClick={() => {
            setShowStrokeMenu(!showStrokeMenu);
            setShowColorMenu(false);
          }}
          title="Stroke Width / Font Size"
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors flex items-center gap-1 cursor-pointer text-[var(--text-light)]"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono">{activeTool === 'text' ? `${fontSize}pt` : `${strokeWidth}px`}</span>
        </button>

        {showStrokeMenu && (
          <div className="absolute top-full mt-2 left-0 z-40 p-2 rounded-xl bg-[var(--sidebar-bg)] border border-[var(--border-color)] shadow-xl flex flex-col gap-1 min-w-[100px]">
            {activeTool === 'text' ? (
              <div className="flex flex-col gap-1 p-1">
                <span className="text-[10px] text-[var(--text-light)] font-semibold">Font Size</span>
                {[12, 14, 18, 24, 32].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setFontSize(sz);
                      setShowStrokeMenu(false);
                    }}
                    className={`px-2 py-0.5 text-[11px] rounded text-left hover:bg-[var(--sidebar-hover-bg)] cursor-pointer ${
                      fontSize === sz ? 'font-bold text-[var(--node-selected-ring)]' : ''
                    }`}
                  >
                    {sz} pt
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1 p-1">
                <span className="text-[10px] text-[var(--text-light)] font-semibold">Stroke Width</span>
                {STROKE_WIDTHS.map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setStrokeWidth(w);
                      setShowStrokeMenu(false);
                    }}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-[var(--sidebar-hover-bg)] cursor-pointer"
                  >
                    <span className="text-[10px] font-mono">{w}px</span>
                    <div className="bg-[var(--text-hover)] rounded-full" style={{ width: 24, height: Math.min(w, 8) }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-[var(--border-color)]">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo Annotation"
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] disabled:opacity-30 disabled:pointer-events-none transition-colors text-[var(--text-light)] hover:text-[var(--text-hover)] cursor-pointer"
        >
          <ArrowCounterClockwise className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo Annotation"
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] disabled:opacity-30 disabled:pointer-events-none transition-colors text-[var(--text-light)] hover:text-[var(--text-hover)] cursor-pointer"
        >
          <ArrowClockwise className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom & Page Navigation */}
      <div className="flex items-center gap-1.5 pr-1.5 border-r border-[var(--border-color)]">
        <button
          onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
          title="Zoom Out"
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-light)] hover:text-[var(--text-hover)] cursor-pointer"
        >
          <MagnifyingGlassMinus className="w-4 h-4" />
        </button>
        <button
          onClick={resetZoom}
          title="Reset Zoom (Fit Width)"
          className="px-1 py-0.5 rounded text-[10px] font-mono text-[var(--text-light)] hover:text-[var(--text-hover)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3.0))}
          title="Zoom In"
          className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-light)] hover:text-[var(--text-hover)] cursor-pointer"
        >
          <MagnifyingGlassPlus className="w-4 h-4" />
        </button>

        {onFitFullSize && (
          <button
            onClick={onFitFullSize}
            title="Expand Node to Fit All Pages (Full Size)"
            className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-light)] hover:text-[var(--text-hover)] cursor-pointer"
          >
            <ArrowsOut className="w-4 h-4" />
          </button>
        )}

        {numPages > 1 && (
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => onPageSelect(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              title="Previous Page"
              className="p-1 rounded hover:bg-[var(--sidebar-hover-bg)] disabled:opacity-30 text-[var(--text-light)] hover:text-[var(--text-hover)] cursor-pointer"
            >
              <CaretLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-medium text-[var(--text-light)] px-1">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={() => onPageSelect(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
              title="Next Page"
              className="p-1 rounded hover:bg-[var(--sidebar-hover-bg)] disabled:opacity-30 text-[var(--text-light)] hover:text-[var(--text-hover)] cursor-pointer"
            >
              <CaretRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        title="Export Annotated PDF"
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--node-selected-ring)] hover:opacity-90 text-white font-semibold text-[11px] shadow-sm transition-all cursor-pointer"
      >
        <DownloadSimple className="w-3.5 h-3.5" />
        <span>Export PDF</span>
      </button>
    </div>
  );
};
