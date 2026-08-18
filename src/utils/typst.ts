import compilerWasm from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url';
import rendererWasm from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url';
import { $typst } from '@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs';

let isInitialized = false;

export function initTypst() {
  if (isInitialized) return;
  try {
    $typst.setCompilerInitOptions({
      getModule: () => compilerWasm,
    });
    $typst.setRendererInitOptions({
      getModule: () => rendererWasm,
    });
    isInitialized = true;
  } catch (e) {
    console.error('Failed to initialize Typst WASM modules:', e);
  }
}

// In-memory cache for rendered SVGs to achieve instantaneous rendering
const typstSvgCache = new Map<string, string>();

/**
 * Clean and optimize Typst SVG for embedding into React DOM
 */
function cleanTypstSvg(rawSvg: string, isMath: boolean, displayMode: boolean): string {
  // Remove script tags from SVG for security and clean DOM lifecycle
  let cleaned = rawSvg.replace(/<script[\s\S]*?<\/script>/gi, '');

  if (isMath) {
    // Add classes for styling and scaling
    cleaned = cleaned.replace(
      /<svg\b([^>]*)>/i,
      `<svg $1 class="typst-math-svg ${displayMode ? 'typst-math-display-svg' : 'typst-math-inline-svg'}">`
    );
  } else {
    cleaned = cleaned.replace(
      /<svg\b([^>]*)>/i,
      '<svg $1 class="typst-doc-svg">'
    );
  }

  return cleaned;
}

/**
 * Synchronous cache lookup for instantaneous renders
 */
export function getCachedTypstSvg(
  content: string,
  isMath: boolean = true,
  displayMode: boolean = false
): string | undefined {
  const cacheKey = `${isMath ? 'math' : 'doc'}:${displayMode ? 'block' : 'inline'}:${content.trim()}`;
  return typstSvgCache.get(cacheKey);
}

/**
 * Render Typst markup or math expression to an SVG string.
 * @param content Typst code or math expression
 * @param isMath When true, wraps content in Typst math mode ($...$)
 * @param displayMode Block vs inline math
 */
export async function renderTypstToSvg(
  content: string,
  isMath: boolean = true,
  displayMode: boolean = false
): Promise<string> {
  const trimmed = content.trim();
  if (!trimmed) return '';

  initTypst();

  const cacheKey = `${isMath ? 'math' : 'doc'}:${displayMode ? 'block' : 'inline'}:${trimmed}`;
  const cached = typstSvgCache.get(cacheKey);
  if (cached) return cached;

  let typstSource = '';
  if (isMath) {
    // For math formulas, use auto page size and zero excess margin
    typstSource = [
      '#set page(width: auto, height: auto, margin: (x: 1.5pt, y: 1.5pt), fill: none)',
      '#set text(size: 13pt)',
      displayMode ? `$ ${trimmed} $` : `$${trimmed}$`,
    ].join('\n');
  } else {
    // For full Typst document / code blocks
    typstSource = [
      '#set page(width: auto, height: auto, margin: (x: 8pt, y: 8pt), fill: none)',
      trimmed,
    ].join('\n');
  }

  try {
    const rawSvg = await $typst.svg({
      mainContent: typstSource,
    });

    if (rawSvg) {
      const processed = cleanTypstSvg(rawSvg, isMath, displayMode);
      typstSvgCache.set(cacheKey, processed);
      return processed;
    }
    throw new Error('Typst returned empty output');
  } catch (err: any) {
    console.warn('Typst compile error:', err?.message || err);
    throw err;
  }
}
