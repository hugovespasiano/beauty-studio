import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WarpEngine } from '../engine/warpEngine';
import { EraserEngine } from '../engine/eraserEngine';
import { Eye } from 'lucide-react';

export type ToolMode = 'view' | 'liquify' | 'eraser';

interface CanvasEditorProps {
  originalImage: HTMLImageElement | null;
  toolMode: ToolMode;
  brushRadius: number;
  brushStrength: number;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  editorRef: React.MutableRefObject<{
    getCanvas: () => HTMLCanvasElement | null;
    applyFilterPass: (renderFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void) => void;
    undo: () => void;
    redo: () => void;
    reset: () => void;
  } | null>;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  originalImage,
  toolMode,
  brushRadius,
  brushStrength,
  onHistoryChange,
  editorRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Before / After inspection
  const [showOriginal, setShowOriginal] = useState(false);

  // Interaction tracking
  const isInteracting = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Save state to undo history
  const pushState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, data];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Load image into canvas
  useEffect(() => {
    if (!originalImage || !canvasRef.current || !maskCanvasRef.current) return;

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    canvas.width = originalImage.naturalWidth || 800;
    canvas.height = originalImage.naturalHeight || 1000;
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(originalImage, 0, 0);
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
      setHistoryIndex(0);
    }
  }, [originalImage]);

  // Expose editor API via ref
  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange(historyIndex > 0, historyIndex < history.length - 1);
    }

    if (editorRef) {
      editorRef.current = {
        getCanvas: () => canvasRef.current,
        applyFilterPass: (renderFn) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return;
          renderFn(ctx, canvas.width, canvas.height);
          pushState();
        },
        undo: () => {
          if (historyIndex > 0 && canvasRef.current) {
            const nextIdx = historyIndex - 1;
            const ctx = canvasRef.current.getContext('2d');
            if (ctx && history[nextIdx]) {
              ctx.putImageData(history[nextIdx], 0, 0);
              setHistoryIndex(nextIdx);
            }
          }
        },
        redo: () => {
          if (historyIndex < history.length - 1 && canvasRef.current) {
            const nextIdx = historyIndex + 1;
            const ctx = canvasRef.current.getContext('2d');
            if (ctx && history[nextIdx]) {
              ctx.putImageData(history[nextIdx], 0, 0);
              setHistoryIndex(nextIdx);
            }
          }
        },
        reset: () => {
          if (history[0] && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.putImageData(history[0], 0, 0);
              setHistory([history[0]]);
              setHistoryIndex(0);
            }
          }
        },
      };
    }
  }, [history, historyIndex, onHistoryChange, editorRef, pushState]);

  // Coordinate helper: translates client mouse/touch to internal canvas coords
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Touch / Mouse events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (toolMode === 'view') return;
    isInteracting.current = true;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    lastPos.current = coords;

    if (toolMode === 'eraser' && maskCanvasRef.current) {
      const mCtx = maskCanvasRef.current.getContext('2d');
      if (mCtx) {
        mCtx.fillStyle = 'rgba(244, 63, 94, 0.7)';
        mCtx.beginPath();
        mCtx.arc(coords.x, coords.y, brushRadius, 0, Math.PI * 2);
        mCtx.fill();
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting.current || !lastPos.current || !canvasRef.current) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (toolMode === 'liquify') {
      // Interactive Liquify Push
      WarpEngine.applyPush(
        ctx,
        canvas.width,
        canvas.height,
        lastPos.current.x,
        lastPos.current.y,
        coords.x,
        coords.y,
        brushRadius,
        brushStrength
      );
      lastPos.current = coords;
    } else if (toolMode === 'eraser' && maskCanvasRef.current) {
      // Paint inpainting mask
      const mCtx = maskCanvasRef.current.getContext('2d');
      if (mCtx) {
        mCtx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        mCtx.lineWidth = brushRadius * 2;
        mCtx.lineCap = 'round';
        mCtx.lineJoin = 'round';
        mCtx.beginPath();
        mCtx.moveTo(lastPos.current.x, lastPos.current.y);
        mCtx.lineTo(coords.x, coords.y);
        mCtx.stroke();
        lastPos.current = coords;
      }
    }
  };

  const handlePointerUp = () => {
    if (!isInteracting.current) return;
    isInteracting.current = false;
    lastPos.current = null;

    if (toolMode === 'eraser' && canvasRef.current && maskCanvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const mCtx = maskCanvasRef.current.getContext('2d');
      if (ctx && mCtx) {
        // Execute smart inpainting on masked spot
        EraserEngine.inpaint(ctx, mCtx, canvas.width, canvas.height);
      }
    }

    pushState();
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0d0f17] to-[#07080b] p-2 select-none"
    >
      {/* Canvas container */}
      <div className="relative max-h-full max-w-full flex items-center justify-center shadow-2xl rounded-xl overflow-hidden border border-white/5">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="max-h-[72vh] max-w-full object-contain cursor-crosshair touch-none"
        />

        {/* Mask overlay for Eraser brush */}
        <canvas
          ref={maskCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none object-contain"
        />

        {/* Original photo overlay (when holding Compare) */}
        {showOriginal && history[0] && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <img
              src={originalImage?.src}
              alt="Original"
              className="max-h-[72vh] max-w-full object-contain pointer-events-none"
            />
            <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wider border border-white/10 uppercase">
              Foto Original
            </span>
          </div>
        )}
      </div>

      {/* Floating comparison button */}
      <button
        onPointerDown={() => setShowOriginal(true)}
        onPointerUp={() => setShowOriginal(false)}
        onPointerLeave={() => setShowOriginal(false)}
        className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-zinc-800 text-rose-300 active:scale-95 border border-rose-500/30 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-semibold tracking-wide transition-all"
        title="Segure para comparar com a original"
      >
        <Eye className="w-4 h-4 text-rose-400" />
        <span>Comparar</span>
      </button>

      {/* Active tool indicator / brush size */}
      {toolMode !== 'view' && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>{toolMode === 'liquify' ? 'Modelar / Afinar' : 'Borracha Inteligente'}</span>
          <span className="text-zinc-500">| Raio: {brushRadius}px</span>
        </div>
      )}
    </div>
  );
};
