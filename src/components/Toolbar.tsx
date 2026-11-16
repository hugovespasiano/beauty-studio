import React, { useState } from 'react';
import type { ToolMode } from './CanvasEditor';
import {
  Smile,
  Sparkles,
  Eraser,
  Flame,
  SunMedium,
  Scissors,
  Heart,
  Eye,
  Share2
} from 'lucide-react';
import { LIPSTICK_PALETTE, type LipColor } from '../engine/makeupEngine';

export type CategoryTab = 'face' | 'skin' | 'makeup' | 'teeth_eyes' | 'eraser' | 'body' | 'hair' | 'lighting';

interface ToolbarProps {
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  brushRadius: number;
  setBrushRadius: (r: number) => void;
  brushStrength: number;
  setBrushStrength: (s: number) => void;
  onAutoSlimFace: (intensity: number) => void;
  onApplySkinSmoothing: (intensity: number, glow: number) => void;
  onApplyHairGloss: (intensity: number) => void;
  onApplyStudioLighting: (brightness: number, contrast: number, warmth: number, glow: number) => void;
  onApplyLipstick: (color: LipColor, intensity: number, isGloss: boolean) => void;
  onApplyTeethWhitening: (intensity: number) => void;
  onApplyEyeBagsRemoval: (intensity: number) => void;
  onGenerateInstagramPost: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  toolMode,
  setToolMode,
  brushRadius,
  setBrushRadius,
  brushStrength,
  setBrushStrength,
  onAutoSlimFace,
  onApplySkinSmoothing,
  onApplyHairGloss,
  onApplyStudioLighting,
  onApplyLipstick,
  onApplyTeethWhitening,
  onApplyEyeBagsRemoval,
  onGenerateInstagramPost,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('face');

  // Sliders state
  const [faceSlimIntensity, setFaceSlimIntensity] = useState<number>(35);
  const [skinSmoothIntensity, setSkinSmoothIntensity] = useState<number>(40);
  const [skinGlowIntensity, setSkinGlowIntensity] = useState<number>(15);
  const [hairGlossIntensity, setHairGlossIntensity] = useState<number>(30);
  const [warmthIntensity, setWarmthIntensity] = useState<number>(10);
  const [lightingGlow, setLightingGlow] = useState<number>(15);

  // Makeup state
  const [selectedLipColor, setSelectedLipColor] = useState<LipColor>(LIPSTICK_PALETTE[0]);
  const [lipstickIntensity, setLipstickIntensity] = useState<number>(60);
  const [isGloss, setIsGloss] = useState<boolean>(true);

  // Teeth & Eyes state
  const [teethIntensity, setTeethIntensity] = useState<number>(50);
  const [eyeBagsIntensity, setEyeBagsIntensity] = useState<number>(45);

  const tabs = [
    { id: 'face' as const, label: 'Rosto', icon: Smile },
    { id: 'skin' as const, label: 'Pele', icon: Sparkles },
    { id: 'makeup' as const, label: 'Make', icon: Heart },
    { id: 'teeth_eyes' as const, label: 'Sorriso', icon: Eye },
    { id: 'eraser' as const, label: 'Borracha', icon: Eraser },
    { id: 'body' as const, label: 'Corpo', icon: Flame },
    { id: 'hair' as const, label: 'Cabelo', icon: Scissors },
    { id: 'lighting' as const, label: 'Luz Studio', icon: SunMedium },
  ];

  return (
    <div className="w-full bg-zinc-950/95 border-t border-white/10 z-20 backdrop-blur-xl flex flex-col">
      {/* Category control panel */}
      <div className="p-3 md:px-6 min-h-[110px] flex flex-col justify-center border-b border-white/5">
        {/* Rosto tab */}
        {activeTab === 'face' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Afinar Rosto & Mandíbula</span>
              <span className="text-xs text-zinc-400">{faceSlimIntensity}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={faceSlimIntensity}
                onChange={(e) => setFaceSlimIntensity(Number(e.target.value))}
                className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => onAutoSlimFace(faceSlimIntensity / 100)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                Aplicar Auto V-Line
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Modo Manual:</span>
              <button
                onClick={() => setToolMode(toolMode === 'liquify' ? 'view' : 'liquify')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  toolMode === 'liquify'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {toolMode === 'liquify' ? 'Modelador Ativo (Arraste)' : 'Ativar Pincel Modelador'}
              </button>
            </div>
          </div>
        )}

        {/* Pele tab */}
        {activeTab === 'skin' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Suavizar Textura & Poros</span>
              <span className="text-xs text-zinc-400">{skinSmoothIntensity}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={skinSmoothIntensity}
                onChange={(e) => setSkinSmoothIntensity(Number(e.target.value))}
                className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => onApplySkinSmoothing(skinSmoothIntensity / 100, skinGlowIntensity / 100)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                Aplicar Pele Glow
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Glow & Iluminação da Pele:</span>
              <div className="flex items-center gap-2">
                {[0, 15, 30].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSkinGlowIntensity(val)}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      skinGlowIntensity === val
                        ? 'bg-rose-500 text-white font-medium'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {val === 0 ? 'Natural' : val === 15 ? 'Suave' : 'Glamour'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Make & Batom tab */}
        {activeTab === 'makeup' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Batom Virtual Studio</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsGloss(!isGloss)}
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    isGloss
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-white/10'
                  }`}
                >
                  {isGloss ? 'Efeito Gloss' : 'Acabamento Matte'}
                </button>
                <span className="text-xs text-zinc-400">{lipstickIntensity}%</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Palette swatches */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {LIPSTICK_PALETTE.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedLipColor(color)}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    className={`w-6 h-6 rounded-full transition-all shrink-0 ${
                      selectedLipColor.hex === color.hex
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={lipstickIntensity}
                onChange={(e) => setLipstickIntensity(Number(e.target.value))}
                className="w-24 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => onApplyLipstick(selectedLipColor, lipstickIntensity / 100, isGloss)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-600/20 active:scale-95 transition-all shrink-0"
              >
                Aplicar Batom
              </button>
            </div>
          </div>
        )}

        {/* Sorriso & Olhar tab */}
        {activeTab === 'teeth_eyes' && (
          <div className="grid grid-cols-2 gap-3">
            {/* Clareamento dental */}
            <div className="flex flex-col gap-1.5 bg-zinc-900/60 p-2 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-300">Clarear Dentes</span>
                <span className="text-[10px] text-zinc-400">{teethIntensity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={teethIntensity}
                  onChange={(e) => setTeethIntensity(Number(e.target.value))}
                  className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => onApplyTeethWhitening(teethIntensity / 100)}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium"
                >
                  Clarear
                </button>
              </div>
            </div>

            {/* Anti-olheiras */}
            <div className="flex flex-col gap-1.5 bg-zinc-900/60 p-2 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-300">Anti-Olheiras</span>
                <span className="text-[10px] text-zinc-400">{eyeBagsIntensity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={eyeBagsIntensity}
                  onChange={(e) => setEyeBagsIntensity(Number(e.target.value))}
                  className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <button
                  onClick={() => onApplyEyeBagsRemoval(eyeBagsIntensity / 100)}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium"
                >
                  Iluminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Borracha tab */}
        {activeTab === 'eraser' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Borracha Inteligente (Pinte sobre a mancha)</span>
              <span className="text-xs text-zinc-400">Tamanho: {brushRadius}px</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="60"
                value={brushRadius}
                onChange={(e) => setBrushRadius(Number(e.target.value))}
                className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setToolMode('eraser')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  toolMode === 'eraser'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                {toolMode === 'eraser' ? 'Pincel Ativado' : 'Usar Pincel'}
              </button>
            </div>
            <span className="text-[11px] text-zinc-500">
              Dica: Pinte espinhas, manchas ou fios soltos. A área se regenera automaticamente ao soltar o dedo.
            </span>
          </div>
        )}

        {/* Corpo tab */}
        {activeTab === 'body' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Modelar Cintura & Curvas</span>
              <span className="text-xs text-zinc-400">Força: {Math.round(brushStrength * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="100"
                value={Math.round(brushStrength * 100)}
                onChange={(e) => setBrushStrength(Number(e.target.value) / 100)}
                className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setToolMode('liquify')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  toolMode === 'liquify'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-zinc-800 text-zinc-300 hover:text-white'
                }`}
              >
                {toolMode === 'liquify' ? 'Pronto para Modelar' : 'Ativar Modelador'}
              </button>
            </div>
            <span className="text-[11px] text-zinc-500">
              Arraste as laterais da cintura ou braços suavemente para dentro para afinar ou definir curvas.
            </span>
          </div>
        )}

        {/* Cabelo tab */}
        {activeTab === 'hair' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Brilho Capilar Studio</span>
              <span className="text-xs text-zinc-400">{hairGlossIntensity}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={hairGlossIntensity}
                onChange={(e) => setHairGlossIntensity(Number(e.target.value))}
                className="flex-1 accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => onApplyHairGloss(hairGlossIntensity / 100)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                Aplicar Brilho
              </button>
            </div>
            <span className="text-[11px] text-zinc-500">
              Realça os reflexos e mechas do cabelo, conferindo acabamento de salão.
            </span>
          </div>
        )}

        {/* Luz Studio tab */}
        {activeTab === 'lighting' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-300">Temperatura & Luz Quente (Golden Hour)</span>
              <span className="text-xs text-zinc-400">{warmthIntensity > 0 ? `+${warmthIntensity}` : warmthIntensity}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-20"
                max="40"
                value={warmthIntensity}
                onChange={(e) => setWarmthIntensity(Number(e.target.value))}
                className="flex-1 accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => onApplyStudioLighting(5, 10, warmthIntensity, lightingGlow)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium shadow-md shadow-amber-600/20 active:scale-95 transition-all"
              >
                Aplicar Luz
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setWarmthIntensity(18); setLightingGlow(20); onApplyStudioLighting(6, 12, 18, 20); }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-200 text-[11px]"
                >
                  Golden Glow
                </button>
                <button
                  onClick={() => { setWarmthIntensity(-8); setLightingGlow(10); onApplyStudioLighting(4, 15, -8, 10); }}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-200 text-[11px]"
                >
                  Clean Studio
                </button>
              </div>

              {/* Botão Instagram Antes x Depois */}
              <button
                onClick={onGenerateInstagramPost}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-medium shadow-md shadow-pink-600/20 active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Gerar Post Instagram</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main navigation tabs */}
      <div className="grid grid-cols-8 gap-1 px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'eraser') {
                  setToolMode('eraser');
                } else if (tab.id === 'body') {
                  setToolMode('liquify');
                } else if (tab.id !== 'face' && toolMode !== 'view') {
                  setToolMode('view');
                }
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-rose-500/15 text-rose-300 font-medium border border-rose-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-rose-400 scale-110' : ''}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
