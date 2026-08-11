import React, { useState, useRef, useEffect } from 'react';
import {
  PDFAnnotation,
  PDFAnnotationTool,
  PDFPoint,
  PDFStrokeAnnotation,
  PDFShapeAnnotation,
  PDFTextAnnotation,
} from '../../types/canvas';

interface PDFAnnotationLayerProps {
  pageIndex: number;
  width: number;
  height: number;
  activeTool: PDFAnnotationTool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  annotations: PDFAnnotation[];
  onAddAnnotation: (ann: PDFAnnotation) => void;
  onRemoveAnnotation: (id: string) => void;
}

export const PDFAnnotationLayer: React.FC<PDFAnnotationLayerProps> = ({
  pageIndex,
  width,
  height,
  activeTool,
  color,
  strokeWidth,
  fontSize,
  annotations,
  onAddAnnotation,
  onRemoveAnnotation,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<PDFPoint[]>([]);
  const [shapeStart, setShapeStart] = useState<PDFPoint | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<PDFPoint | null>(null);

  // Active text input editing state
  const [textPos, setTextPos] = useState<PDFPoint | null>(null);
  const [textValue, setTextValue] = useState('');

  const pageAnnotations = annotations.filter((a) => a.pageIndex === pageIndex);

  const getNormalizedPoint = (e: React.MouseEvent<HTMLDivElement>): PDFPoint => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'select') return;
    e.stopPropagation();

    const pt = getNormalizedPoint(e);

    if (activeTool === 'text') {
      if (textPos && textValue.trim()) {
        commitTextAnnotation();
      }
      setTextPos(pt);
      setTextValue('');
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentPoints([pt]);
    } else if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'arrow') {
      setIsDrawing(true);
      setShapeStart(pt);
      setShapeCurrent(pt);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    e.stopPropagation();
    const pt = getNormalizedPoint(e);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentPoints((prev) => [...prev, pt]);
    } else if (shapeStart) {
      setShapeCurrent(pt);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    e.stopPropagation();
    const pt = getNormalizedPoint(e);

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      const finalPoints = [...currentPoints, pt];
      if (finalPoints.length > 1) {
        const strokeAnn: PDFStrokeAnnotation = {
          id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: activeTool,
          pageIndex,
          points: finalPoints,
          color,
          width: strokeWidth,
          opacity: activeTool === 'highlighter' ? 0.4 : 1.0,
          createdAt: new Date().toISOString(),
        };
        onAddAnnotation(strokeAnn);
      }
    } else if (
      (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'arrow') &&
      shapeStart
    ) {
      const shapeAnn: PDFShapeAnnotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: activeTool,
        pageIndex,
        startPoint: shapeStart,
        endPoint: pt,
        color,
        strokeWidth,
        createdAt: new Date().toISOString(),
      };
      onAddAnnotation(shapeAnn);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setShapeStart(null);
    setShapeCurrent(null);
  };

  const commitTextAnnotation = () => {
    if (textPos && textValue.trim()) {
      const textAnn: PDFTextAnnotation = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'text',
        pageIndex,
        position: textPos,
        text: textValue.trim(),
        color,
        fontSize,
        createdAt: new Date().toISOString(),
      };
      onAddAnnotation(textAnn);
    }
    setTextPos(null);
    setTextValue('');
  };

  // Close text editor when tool changes or clicking outside
  useEffect(() => {
    if (activeTool !== 'text' && textPos) {
      commitTextAnnotation();
    }
  }, [activeTool]);

  const convertPointsToSvgPath = (pts: PDFPoint[]) => {
    if (pts.length === 0) return '';
    const first = pts[0];
    let d = `M ${first.x * width} ${first.y * height}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x * width} ${pts[i].y * height}`;
    }
    return d;
  };

  const renderAnnotation = (ann: PDFAnnotation) => {
    const isErasable = activeTool === 'eraser';

    if (ann.type === 'pen' || ann.type === 'highlighter') {
      const pathData = convertPointsToSvgPath(ann.points);
      return (
        <path
          key={ann.id}
          d={pathData}
          stroke={ann.color}
          strokeWidth={ann.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={ann.opacity ?? (ann.type === 'highlighter' ? 0.4 : 1.0)}
          className={isErasable ? 'cursor-pointer hover:opacity-20 transition-opacity' : ''}
          onClick={(e) => {
            if (isErasable) {
              e.stopPropagation();
              onRemoveAnnotation(ann.id);
            }
          }}
        />
      );
    }

    if (ann.type === 'rectangle') {
      const x1 = Math.min(ann.startPoint.x, ann.endPoint.x) * width;
      const x2 = Math.max(ann.startPoint.x, ann.endPoint.x) * width;
      const y1 = Math.min(ann.startPoint.y, ann.endPoint.y) * height;
      const y2 = Math.max(ann.startPoint.y, ann.endPoint.y) * height;

      return (
        <rect
          key={ann.id}
          x={x1}
          y={y1}
          width={Math.max(x2 - x1, 2)}
          height={Math.max(y2 - y1, 2)}
          stroke={ann.color}
          strokeWidth={ann.strokeWidth}
          fill="none"
          className={isErasable ? 'cursor-pointer hover:opacity-20 transition-opacity' : ''}
          onClick={(e) => {
            if (isErasable) {
              e.stopPropagation();
              onRemoveAnnotation(ann.id);
            }
          }}
        />
      );
    }

    if (ann.type === 'circle') {
      const cx = ((ann.startPoint.x + ann.endPoint.x) / 2) * width;
      const cy = ((ann.startPoint.y + ann.endPoint.y) / 2) * height;
      const rx = (Math.abs(ann.endPoint.x - ann.startPoint.x) / 2) * width;
      const ry = (Math.abs(ann.endPoint.y - ann.startPoint.y) / 2) * height;

      return (
        <ellipse
          key={ann.id}
          cx={cx}
          cy={cy}
          rx={Math.max(rx, 2)}
          ry={Math.max(ry, 2)}
          stroke={ann.color}
          strokeWidth={ann.strokeWidth}
          fill="none"
          className={isErasable ? 'cursor-pointer hover:opacity-20 transition-opacity' : ''}
          onClick={(e) => {
            if (isErasable) {
              e.stopPropagation();
              onRemoveAnnotation(ann.id);
            }
          }}
        />
      );
    }

    if (ann.type === 'arrow') {
      const x1 = ann.startPoint.x * width;
      const y1 = ann.startPoint.y * height;
      const x2 = ann.endPoint.x * width;
      const y2 = ann.endPoint.y * height;

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const headLen = Math.max(10, ann.strokeWidth * 3);
      const arrowAngle = Math.PI / 6;

      const leftX = x2 - headLen * Math.cos(angle - arrowAngle);
      const leftY = y2 - headLen * Math.sin(angle - arrowAngle);
      const rightX = x2 - headLen * Math.cos(angle + arrowAngle);
      const rightY = y2 - headLen * Math.sin(angle + arrowAngle);

      return (
        <g
          key={ann.id}
          className={isErasable ? 'cursor-pointer hover:opacity-20 transition-opacity' : ''}
          onClick={(e) => {
            if (isErasable) {
              e.stopPropagation();
              onRemoveAnnotation(ann.id);
            }
          }}
        >
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ann.color} strokeWidth={ann.strokeWidth} strokeLinecap="round" />
          <line x1={x2} y1={y2} x2={leftX} y2={leftY} stroke={ann.color} strokeWidth={ann.strokeWidth} strokeLinecap="round" />
          <line x1={x2} y1={y2} x2={rightX} y2={rightY} stroke={ann.color} strokeWidth={ann.strokeWidth} strokeLinecap="round" />
        </g>
      );
    }

    if (ann.type === 'text') {
      const x = ann.position.x * width;
      const y = ann.position.y * height;
      return (
        <text
          key={ann.id}
          x={x}
          y={y + ann.fontSize}
          fill={ann.color}
          fontSize={ann.fontSize}
          fontFamily="sans-serif"
          fontWeight="bold"
          className={isErasable ? 'cursor-pointer hover:opacity-20 transition-opacity select-none' : 'select-none'}
          onClick={(e) => {
            if (isErasable) {
              e.stopPropagation();
              onRemoveAnnotation(ann.id);
            }
          }}
        >
          {ann.text}
        </text>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ width, height }}
      className={`absolute inset-0 z-10 ${
        activeTool === 'select'
          ? 'pointer-events-none'
          : activeTool === 'eraser'
          ? 'nodrag nopan cursor-pointer'
          : 'nodrag nopan cursor-crosshair'
      }`}
    >
      <svg className="w-full h-full pointer-events-auto" style={{ width, height }}>
        {pageAnnotations.map(renderAnnotation)}

        {/* Live Drawing Stroke Preview */}
        {isDrawing && (activeTool === 'pen' || activeTool === 'highlighter') && currentPoints.length > 0 && (
          <path
            d={convertPointsToSvgPath(currentPoints)}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={activeTool === 'highlighter' ? 0.4 : 1.0}
          />
        )}

        {/* Live Shape Preview */}
        {isDrawing && shapeStart && shapeCurrent && activeTool === 'rectangle' && (
          <rect
            x={Math.min(shapeStart.x, shapeCurrent.x) * width}
            y={Math.min(shapeStart.y, shapeCurrent.y) * height}
            width={Math.abs(shapeCurrent.x - shapeStart.x) * width}
            height={Math.abs(shapeCurrent.y - shapeStart.y) * height}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
          />
        )}

        {isDrawing && shapeStart && shapeCurrent && activeTool === 'circle' && (
          <ellipse
            cx={((shapeStart.x + shapeCurrent.x) / 2) * width}
            cy={((shapeStart.y + shapeCurrent.y) / 2) * height}
            rx={(Math.abs(shapeCurrent.x - shapeStart.x) / 2) * width}
            ry={(Math.abs(shapeCurrent.y - shapeStart.y) / 2) * height}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
          />
        )}

        {isDrawing && shapeStart && shapeCurrent && activeTool === 'arrow' && (
          <g>
            <line
              x1={shapeStart.x * width}
              y1={shapeStart.y * height}
              x2={shapeCurrent.x * width}
              y2={shapeCurrent.y * height}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* Floating Editable Text Box */}
      {textPos && (
        <div
          style={{
            position: 'absolute',
            left: `${textPos.x * 100}%`,
            top: `${textPos.y * 100}%`,
          }}
          className="nodrag nopan z-30 transform -translate-x-1 -translate-y-1"
        >
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitTextAnnotation();
              } else if (e.key === 'Escape') {
                setTextPos(null);
              }
            }}
            onBlur={commitTextAnnotation}
            placeholder="Type note & press Enter..."
            autoFocus
            style={{ color, fontSize }}
            className="bg-[var(--input-bg)] border-2 border-[var(--node-selected-ring)] rounded px-2 py-1 font-bold shadow-lg focus:outline-none min-w-[140px]"
          />
        </div>
      )}
    </div>
  );
};
