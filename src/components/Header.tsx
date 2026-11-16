import React, { useRef } from 'react';
import { Sparkles, Undo2, Redo2, RotateCcw, Download, ImagePlus, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onImageSelected: (img: HTMLImageElement) => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onImageSelected,
  onExport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => onImageSelected(img);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="h-14 bg-zinc-950/90 border-b border-white/10 px-3 md:px-5 flex items-center justify-between z-20 backdrop-blur-md">
      {/* Brand & Badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-300 p-0.5 shadow-md shadow-rose-500/20">
          <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-rose-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              Beauty Studio
            </span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30 font-semibold uppercase">
              Pro
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Processamento 100% Local</span>
          </div>
        </div>
      </div>

      {/* Undo / Redo Actions */}
      <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-white/5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Desfazer"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Refazer"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
          title="Restaurar Original"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Import & Export */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-medium"
        >
          <ImagePlus className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">Nova Foto</span>
        </button>

        <button
          onClick={onExport}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Salvar</span>
        </button>
      </div>
    </header>
  );
};
