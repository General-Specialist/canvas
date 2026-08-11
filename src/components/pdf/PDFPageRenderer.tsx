import React, { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFAnnotationLayer } from './PDFAnnotationLayer';
import { PDFAnnotation, PDFAnnotationTool } from '../../types/canvas';

interface PDFPageRendererProps {
  pdfDoc: PDFDocumentProxy;
  pageIndex: number;
  zoom: number;
  activeTool: PDFAnnotationTool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  annotations: PDFAnnotation[];
  onAddAnnotation: (ann: PDFAnnotation) => void;
  onRemoveAnnotation: (id: string) => void;
  onPageVisible?: (pageIndex: number) => void;
}

export const PDFPageRenderer: React.FC<PDFPageRendererProps> = ({
  pdfDoc,
  pageIndex,
  zoom,
  activeTool,
  color,
  strokeWidth,
  fontSize,
  annotations,
  onAddAnnotation,
  onRemoveAnnotation,
  onPageVisible,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let renderTask: any = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        setIsRendering(true);
        const page = await pdfDoc.getPage(pageIndex + 1);
        if (isCancelled) return;

        // Base viewport at 1.0 scale
        const baseViewport = page.getViewport({ scale: 1.0 });

        // Account for node width container or standard scaling
        const targetWidth = baseViewport.width * zoom;
        const scale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const outputScale = window.devicePixelRatio || 1;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        setPageSize({ width: viewport.width, height: viewport.height });

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        renderTask = page.render({
          canvasContext: context,
          canvas: canvas,
          transform,
          viewport,
        });

        await renderTask.promise;
        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering page ${pageIndex + 1}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageIndex, zoom]);

  // IntersectionObserver to report current visible page to parent toolbar
  useEffect(() => {
    if (!containerRef.current || !onPageVisible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onPageVisible(pageIndex + 1);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pageIndex, onPageVisible]);

  return (
    <div
      ref={containerRef}
      className="relative my-3 mx-auto shadow-lg bg-white rounded overflow-hidden select-none border border-[var(--border-color)]"
      style={{ width: pageSize.width || 'auto', height: pageSize.height || 'auto' }}
    >
      <canvas ref={canvasRef} className="block" />

      {pageSize.width > 0 && pageSize.height > 0 && (
        <PDFAnnotationLayer
          pageIndex={pageIndex}
          width={pageSize.width}
          height={pageSize.height}
          activeTool={activeTool}
          color={color}
          strokeWidth={strokeWidth}
          fontSize={fontSize}
          annotations={annotations}
          onAddAnnotation={onAddAnnotation}
          onRemoveAnnotation={onRemoveAnnotation}
        />
      )}

      {isRendering && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center text-xs text-slate-500 font-medium">
          Loading Page {pageIndex + 1}...
        </div>
      )}
    </div>
  );
};
