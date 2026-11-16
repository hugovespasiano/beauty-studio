import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CanvasEditor, type ToolMode } from './components/CanvasEditor';
import { Toolbar } from './components/Toolbar';
import { WarpEngine } from './engine/warpEngine';
import { SkinEngine } from './engine/skinEngine';
import { FiltersEngine } from './engine/filtersEngine';
import { MakeupEngine, type LipColor } from './engine/makeupEngine';
import { createSamplePortraitImage } from './assets/samplePortrait';

export function App() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('view');
  const [brushRadius, setBrushRadius] = useState<number>(24);
  const [brushStrength, setBrushStrength] = useState<number>(0.45);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const editorRef = useRef<{
    getCanvas: () => HTMLCanvasElement | null;
    applyFilterPass: (renderFn: (ctx: CanvasRenderingContext2D, width: number, height: number) => void) => void;
    undo: () => void;
    redo: () => void;
    reset: () => void;
  } | null>(null);

  // Load sample portrait on mount
  useEffect(() => {
    createSamplePortraitImage().then((img) => {
      setOriginalImage(img);
    });
  }, []);

  const handleAutoSlimFace = (intensity: number) => {
    editorRef.current?.applyFilterPass((ctx, width, height) => {
      WarpEngine.autoSlimFace(ctx, width, height, intensity);
    });
  };

  const handleApplySkinSmoothing = (intensity: number, glow: number) => {
    editorRef.current?.applyFilterPass((ctx, width, height) => {
      SkinEngine.applySkinSmoothing(ctx, width, height, intensity, glow);
    });
  };

  const handleApplyHairGloss = (intensity: number) => {
    editorRef.current?.applyFilterPass((ctx, width, height) => {
      FiltersEngine.applyHairGloss(ctx, width, height, intensity);
    });
  };

  const handleApplyStudioLighting = (
    brightness: number,
    contrast: number,
    warmth: number,
    glow: number
  ) => {
    editorRef.current?.applyFilterPass((ctx, width, height) => {
      FiltersEngine.applyStudioLighting(ctx, width, height, brightness, contrast, warmth, glow);
    });
  };

  const handleApplyLipstick = (color: LipColor, intensity: number, isGloss: boolean) => {
    editorRef.current?.applyFilterPass((ctx, width, height) => {
      MakeupEngine.applyLipstick(ctx, width, height, color, intensity, isGloss);
    });
  };

  const handleApplyTeethWhitening = (intensity: number) => {
    editorRef.current?.applyFilterPass((ctx, width, height) => {
      MakeupEngine.applyTeethWhitening(ctx, width, height, intensity);
    });
  };

  const handleApplyEyeBagsRemoval = (intensity: number) => {
    editorRef.current?.applyFilterPass((ctx, width, height) => {
      MakeupEngine.applyEyeBagsRemoval(ctx, width, height, intensity);
    });
  };

  const handleGenerateInstagramPost = () => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas || !originalImage) return;

    // Create temp original canvas
    const origCanvas = document.createElement('canvas');
    origCanvas.width = canvas.width;
    origCanvas.height = canvas.height;
    const oCtx = origCanvas.getContext('2d')!;
    oCtx.drawImage(originalImage, 0, 0);

    const postDataUrl = MakeupEngine.generateInstagramBeforeAfter(origCanvas, canvas);
    const link = document.createElement('a');
    link.download = `instagram_antes_depois_${Date.now()}.png`;
    link.href = postDataUrl;
    link.click();
  };

  const handleExport = () => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;

    // Export with high-quality PNG
    const link = document.createElement('a');
    link.download = `beauty_studio_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0d13] text-gray-100 overflow-hidden font-sans">
      {/* Top Bar */}
      <Header
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => editorRef.current?.undo()}
        onRedo={() => editorRef.current?.redo()}
        onReset={() => editorRef.current?.reset()}
        onImageSelected={(img) => setOriginalImage(img)}
        onExport={handleExport}
      />

      {/* Main Interactive Stage */}
      <CanvasEditor
        originalImage={originalImage}
        toolMode={toolMode}
        brushRadius={brushRadius}
        brushStrength={brushStrength}
        onHistoryChange={(undo, redo) => {
          setCanUndo(undo);
          setCanRedo(redo);
        }}
        editorRef={editorRef}
      />

      {/* Bottom Toolset */}
      <Toolbar
        toolMode={toolMode}
        setToolMode={setToolMode}
        brushRadius={brushRadius}
        setBrushRadius={setBrushRadius}
        brushStrength={brushStrength}
        setBrushStrength={setBrushStrength}
        onAutoSlimFace={handleAutoSlimFace}
        onApplySkinSmoothing={handleApplySkinSmoothing}
        onApplyHairGloss={handleApplyHairGloss}
        onApplyStudioLighting={handleApplyStudioLighting}
        onApplyLipstick={handleApplyLipstick}
        onApplyTeethWhitening={handleApplyTeethWhitening}
        onApplyEyeBagsRemoval={handleApplyEyeBagsRemoval}
        onGenerateInstagramPost={handleGenerateInstagramPost}
      />
    </div>
  );
}

export default App;
