import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfjsLib } from '../../utils/pdfWorker';
import { PDFPageRenderer } from './PDFPageRenderer';
import { PDFToolbar } from './PDFToolbar';
import { PDFAnnotation, PDFAnnotationTool } from '../../types/canvas';
import { exportAnnotatedPdf } from '../../utils/pdfExport';

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  annotations?: PDFAnnotation[];
  onUpdateAnnotations?: (annotations: PDFAnnotation[]) => void;
  onResizeNode?: (width: number, height: number) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  fileName = 'document.pdf',
  annotations: initialAnnotations = [],
  onUpdateAnnotations,
  onResizeNode,
}) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Annotation Tool & Styling State
  const [activeTool, setActiveTool] = useState<PDFAnnotationTool>('select');
  const [color, setColor] = useState<string>('#EF4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [fontSize, setFontSize] = useState<number>(16);
  const [zoom, setZoom] = useState<number>(1.0);

  // Annotations & Undo/Redo Stacks
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>(initialAnnotations);
  const [history, setHistory] = useState<PDFAnnotation[][]>([initialAnnotations]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync prop changes if external annotations update
  useEffect(() => {
    if (initialAnnotations && JSON.stringify(initialAnnotations) !== JSON.stringify(annotations)) {
      setAnnotations(initialAnnotations);
    }
  }, [initialAnnotations]);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const loadPdf = async () => {
      try {
        if (!fileUrl) {
          throw new Error('No PDF URL or data provided');
        }

        let loadingTask: any;

        if (fileUrl.startsWith('data:')) {
          const base64Index = fileUrl.indexOf(';base64,');
          if (base64Index !== -1) {
            const base64Str = fileUrl.substring(base64Index + 8);
            const binaryStr = atob(base64Str);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            loadingTask = pdfjsLib.getDocument({ data: bytes });
          } else {
            const encodedStr = fileUrl.split(',')[1] || '';
            const decodedStr = decodeURIComponent(encodedStr);
            const bytes = new Uint8Array(decodedStr.length);
            for (let i = 0; i < decodedStr.length; i++) {
              bytes[i] = decodedStr.charCodeAt(i);
            }
            loadingTask = pdfjsLib.getDocument({ data: bytes });
          }
        } else {
          loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        }

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load PDF document:', err);
          setError(err?.message || 'Failed to load PDF file.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  const fitToFullSize = useCallback(async () => {
    if (!pdfDoc || !onResizeNode) return;
    try {
      let totalH = 0;
      let maxW = 500;
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const vp = page.getViewport({ scale: zoom });
        totalH += vp.height + 24;
        if (vp.width > maxW) maxW = vp.width;
      }
      const calcW = Math.ceil(maxW + 64);
      const calcH = Math.ceil(totalH + 110);
      onResizeNode(calcW, calcH);
    } catch (err) {
      console.error('Failed to calculate PDF full size:', err);
    }
  }, [pdfDoc, zoom, onResizeNode]);

  // Auto-resize node to fit full PDF document when pdfDoc finishes loading
  useEffect(() => {
    if (pdfDoc && onResizeNode) {
      fitToFullSize();
    }
  }, [pdfDoc]);

  const handleAddAnnotation = useCallback(
    (ann: PDFAnnotation) => {
      setAnnotations((prev) => {
        const next = [...prev, ann];
        if (onUpdateAnnotations) onUpdateAnnotations(next);

        setHistory((h) => {
          const newH = h.slice(0, historyIndex + 1);
          newH.push(next);
          return newH;
        });
        setHistoryIndex((idx) => idx + 1);
        return next;
      });
    },
    [historyIndex, onUpdateAnnotations]
  );

  const handleRemoveAnnotation = useCallback(
    (id: string) => {
      setAnnotations((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (onUpdateAnnotations) onUpdateAnnotations(next);

        setHistory((h) => {
          const newH = h.slice(0, historyIndex + 1);
          newH.push(next);
          return newH;
        });
        setHistoryIndex((idx) => idx + 1);
        return next;
      });
    },
    [historyIndex, onUpdateAnnotations]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const prevAnnotations = history[prevIdx];
      setHistoryIndex(prevIdx);
      setAnnotations(prevAnnotations);
      if (onUpdateAnnotations) onUpdateAnnotations(prevAnnotations);
    }
  }, [historyIndex, history, onUpdateAnnotations]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextAnnotations = history[nextIdx];
      setHistoryIndex(nextIdx);
      setAnnotations(nextAnnotations);
      if (onUpdateAnnotations) onUpdateAnnotations(nextAnnotations);
    }
  }, [historyIndex, history, onUpdateAnnotations]);

  const handleExport = () => {
    exportAnnotatedPdf(fileUrl, annotations, fileName);
  };

  const handlePageSelect = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (scrollContainerRef.current) {
      const pageElements = scrollContainerRef.current.children;
      const targetElement = pageElements[pageNumber - 1] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const numPages = pdfDoc ? pdfDoc.numPages : 0;

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--input-bg)] rounded-lg overflow-hidden border border-[var(--border-color)]">
      {/* Floating Interactive Toolbar */}
      {pdfDoc && (
        <PDFToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          fontSize={fontSize}
          setFontSize={setFontSize}
          zoom={zoom}
          setZoom={setZoom}
          resetZoom={() => setZoom(1.0)}
          onFitFullSize={fitToFullSize}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExport={handleExport}
          numPages={numPages}
          currentPage={currentPage}
          onPageSelect={handlePageSelect}
        />
      )}

      {/* Main Continuous PDF Pages View */}
      <div
        ref={scrollContainerRef}
        className="nodrag nopan flex-1 w-full h-full overflow-y-auto overflow-x-auto p-4 flex flex-col items-center custom-scrollbar"
      >
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-light)]">
            <div className="w-6 h-6 border-2 border-[var(--node-selected-ring)] border-t-transparent rounded-full animate-spin" />
            <span>Parsing PDF document...</span>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 text-xs text-red-500 text-center">
            <span>Failed to render PDF: {error}</span>
          </div>
        )}

        {pdfDoc &&
          Array.from({ length: numPages }, (_, index) => (
            <PDFPageRenderer
              key={`page-${index}`}
              pdfDoc={pdfDoc}
              pageIndex={index}
              zoom={zoom}
              activeTool={activeTool}
              color={color}
              strokeWidth={strokeWidth}
              fontSize={fontSize}
              annotations={annotations}
              onAddAnnotation={handleAddAnnotation}
              onRemoveAnnotation={handleRemoveAnnotation}
              onPageVisible={(p) => setCurrentPage(p)}
            />
          ))}
      </div>
    </div>
  );
};
