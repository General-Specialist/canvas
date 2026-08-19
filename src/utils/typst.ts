import compilerWasm from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url';
import rendererWasm from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url';
import { $typst } from '@myriaddreamin/typst.ts/dist/esm/contrib/snippet.mjs';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureTypstInitialized(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
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
      throw e;
    }
  })();

  return initPromise;
}

// In-memory cache for ultra-fast instant 0ms lookups
const memoryCache = new Map<string, string>();
const STORAGE_PREFIX = 'typst_svg_cache_v2:';

function getCacheKey(content: string, isMath: boolean, displayMode: boolean): string {
  return `${isMath ? 'm' : 'd'}:${displayMode ? '1' : '0'}:${content.trim()}`;
}

/**
 * Synchronous cache lookup for instantaneous frame-0 renders
 */
export function getCachedTypstSvg(
  content: string,
  isMath: boolean = true,
  displayMode: boolean = false
): string | undefined {
  const key = getCacheKey(content, isMath, displayMode);
  if (memoryCache.has(key)) return memoryCache.get(key);

  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      memoryCache.set(key, stored);
      return stored;
    }
  } catch {
    // localStorage unavailable
  }

  return undefined;
}

export function setCachedTypstSvg(
  content: string,
  svg: string,
  isMath: boolean = true,
  displayMode: boolean = false
): void {
  const key = getCacheKey(content, isMath, displayMode);
  memoryCache.set(key, svg);

  try {
    localStorage.setItem(STORAGE_PREFIX + key, svg);
  } catch {
    // storage quota full
  }
}

/**
 * Clean and optimize Typst SVG for embedding into React DOM
 */
function cleanTypstSvg(rawSvg: string, isMath: boolean, displayMode: boolean): string {
  // Remove script tags from SVG for clean DOM lifecycle
  let cleaned = rawSvg.replace(/<script[\s\S]*?<\/script>/gi, '');

  if (isMath) {
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

// Global FIFO async compilation queue to prevent concurrent WASM runtime memory collisions
let queuePromise: Promise<any> = Promise.resolve();

function enqueueCompilation<T>(task: () => Promise<T>): Promise<T> {
  const next = queuePromise.then(async () => {
    return task();
  });
  queuePromise = next.catch(() => {});
  return next;
}

/**
 * Render Typst markup or math expression to an SVG string.
 */
export async function renderTypstToSvg(
  content: string,
  isMath: boolean = true,
  displayMode: boolean = false
): Promise<string> {
  const trimmed = content.trim();
  if (!trimmed) return '';

  const cached = getCachedTypstSvg(trimmed, isMath, displayMode);
  if (cached) return cached;

  return enqueueCompilation(async () => {
    // Re-check cache in case previous task compiled identical formula
    const secondCheck = getCachedTypstSvg(trimmed, isMath, displayMode);
    if (secondCheck) return secondCheck;

    await ensureTypstInitialized();

    let typstSource = '';
    if (isMath) {
      typstSource = [
        '#set page(width: auto, height: auto, margin: (x: 1.5pt, y: 1.5pt), fill: none)',
        '#set text(size: 13pt)',
        displayMode ? `$ ${trimmed} $` : `$${trimmed}$`,
      ].join('\n');
    } else {
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
        setCachedTypstSvg(trimmed, processed, isMath, displayMode);
        return processed;
      }
      throw new Error('Typst returned empty output');
    } catch (err: any) {
      console.warn('Typst compile error for:', trimmed, err?.message || err);
      throw err;
    }
  });
}
