import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PDFAnnotation } from '../types/canvas';

// Helper to parse hex color to pdf-lib rgb tuple [r, g, b]
function hexToRgb(hex: string) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return rgb(0, 0, 0);
  return rgb(((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
}

export async function exportAnnotatedPdf(
  fileUrl: string,
  annotations: PDFAnnotation[],
  originalFileName: string = 'document.pdf'
): Promise<void> {
  try {
    let arrayBuffer: ArrayBuffer;

    if (fileUrl.startsWith('data:')) {
      const base64Str = fileUrl.split(',')[1];
      const binaryStr = atob(base64Str);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      const response = await fetch(fileUrl);
      arrayBuffer = await response.arrayBuffer();
    }

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const ann of annotations) {
      if (ann.pageIndex < 0 || ann.pageIndex >= pages.length) continue;
      const page = pages[ann.pageIndex];
      const { width: pageW, height: pageH } = page.getSize();

      const color = hexToRgb(ann.color);

      if (ann.type === 'pen' || ann.type === 'highlighter') {
        const opacity = ann.opacity ?? (ann.type === 'highlighter' ? 0.4 : 1.0);
        const strokeWidth = ann.width || (ann.type === 'highlighter' ? 12 : 2);

        // Draw connected line segments for stroke points
        for (let i = 0; i < ann.points.length - 1; i++) {
          const p1 = ann.points[i];
          const p2 = ann.points[i + 1];

          // PDF coordinate system has y=0 at bottom
          const x1 = p1.x * pageW;
          const y1 = (1 - p1.y) * pageH;
          const x2 = p2.x * pageW;
          const y2 = (1 - p2.y) * pageH;

          page.drawLine({
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 },
            thickness: strokeWidth,
            color,
            opacity,
          });
        }
      } else if (ann.type === 'rectangle') {
        const x1 = Math.min(ann.startPoint.x, ann.endPoint.x) * pageW;
        const x2 = Math.max(ann.startPoint.x, ann.endPoint.x) * pageW;
        const y1 = (1 - Math.max(ann.startPoint.y, ann.endPoint.y)) * pageH;
        const y2 = (1 - Math.min(ann.startPoint.y, ann.endPoint.y)) * pageH;

        page.drawRectangle({
          x: x1,
          y: y1,
          width: Math.max(x2 - x1, 1),
          height: Math.max(y2 - y1, 1),
          borderColor: color,
          borderWidth: ann.strokeWidth || 2,
        });
      } else if (ann.type === 'circle') {
        const cx = ((ann.startPoint.x + ann.endPoint.x) / 2) * pageW;
        const cy = (1 - (ann.startPoint.y + ann.endPoint.y) / 2) * pageH;
        const rx = (Math.abs(ann.endPoint.x - ann.startPoint.x) / 2) * pageW;
        const ry = (Math.abs(ann.endPoint.y - ann.startPoint.y) / 2) * pageH;

        page.drawEllipse({
          x: cx,
          y: cy,
          xScale: Math.max(rx, 1),
          yScale: Math.max(ry, 1),
          borderColor: color,
          borderWidth: ann.strokeWidth || 2,
        });
      } else if (ann.type === 'arrow') {
        const x1 = ann.startPoint.x * pageW;
        const y1 = (1 - ann.startPoint.y) * pageH;
        const x2 = ann.endPoint.x * pageW;
        const y2 = (1 - ann.endPoint.y) * pageH;
        const thickness = ann.strokeWidth || 2;

        page.drawLine({
          start: { x: x1, y: y1 },
          end: { x: x2, y: y2 },
          thickness,
          color,
        });

        // Draw arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = Math.max(10, thickness * 3);
        const arrowAngle = Math.PI / 6;

        const leftX = x2 - headLength * Math.cos(angle - arrowAngle);
        const leftY = y2 - headLength * Math.sin(angle - arrowAngle);
        const rightX = x2 - headLength * Math.cos(angle + arrowAngle);
        const rightY = y2 - headLength * Math.sin(angle + arrowAngle);

        page.drawLine({ start: { x: x2, y: y2 }, end: { x: leftX, y: leftY }, thickness, color });
        page.drawLine({ start: { x: x2, y: y2 }, end: { x: rightX, y: rightY }, thickness, color });
      } else if (ann.type === 'text') {
        const x = ann.position.x * pageW;
        const y = (1 - ann.position.y) * pageH - (ann.fontSize || 14);

        if (ann.text.trim()) {
          page.drawText(ann.text, {
            x,
            y: Math.max(y, 10),
            size: ann.fontSize || 14,
            font,
            color,
          });
        }
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = downloadUrl;
    const baseName = originalFileName.endsWith('.pdf')
      ? originalFileName.slice(0, -4)
      : originalFileName;
    a.download = `${baseName}_annotated.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    console.error('Failed to export annotated PDF:', err);
    alert('Could not export annotated PDF. Check console for details.');
  }
}
