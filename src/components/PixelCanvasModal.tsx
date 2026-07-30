import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../lib/sound';
import { Paintbrush, Eraser, PaintBucket, Trash2, Check, X, Grid, Eye } from 'lucide-react';

interface PixelCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawing: (dataUrl: string, width: number, height: number) => void;
  sfxEnabled?: boolean;
}

const PALETTES = {
  needy: {
    name: 'Needy Angel (超てんちゃん)',
    colors: [
      '#181825', '#ffffff', '#f4b8e4', '#f5c2e7', '#cba6f7', '#b4befe',
      '#89dceb', '#74c7ec', '#a6e3a1', '#f9e2af', '#fab387', '#f38ba8',
      '#eb6f92', '#31274a', '#45315d', '#6c4a8b'
    ]
  },
  pc98: {
    name: 'PC-98 Retro',
    colors: [
      '#000000', '#ffffff', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500',
      '#aaaaaa', '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55'
    ]
  },
  gameboy: {
    name: 'Game Boy Green',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f']
  },
  synthwave: {
    name: 'Cyberpunk 16-Bit',
    colors: [
      '#0f172a', '#1e1b4b', '#4c1d95', '#831843', '#be123c', '#e11d48', '#f43f5e', '#fb7185',
      '#0284c7', '#06b6d4', '#22d3ee', '#38bdf8', '#10b981', '#34d399', '#facc15', '#f8fafc'
    ]
  },
  monochrome: {
    name: 'Sepia Paper',
    colors: ['#2a2421', '#594d46', '#8c7b70', '#bfb2a8', '#d9cfc7', '#f4efe8']
  }
};

export const PixelCanvasModal: React.FC<PixelCanvasModalProps> = ({
  isOpen,
  onClose,
  onSaveDrawing,
  sfxEnabled = true
}) => {
  const [gridSize, setGridSize] = useState<number>(32); // 16 or 32
  const [pixels, setPixels] = useState<string[]>(() => Array(32 * 32).fill('transparent'));
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof PALETTES>('needy');
  const [currentColor, setCurrentColor] = useState<string>('#f4b8e4');
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'bucket'>('pencil');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-initialize pixels if grid size changes
  useEffect(() => {
    setPixels(Array(gridSize * gridSize).fill('transparent'));
  }, [gridSize]);

  if (!isOpen) return null;

  const handlePixelClick = (index: number) => {
    if (sfxEnabled) soundFx.playClick();
    const newPixels = [...pixels];

    if (tool === 'pencil') {
      newPixels[index] = currentColor;
    } else if (tool === 'eraser') {
      newPixels[index] = 'transparent';
    } else if (tool === 'bucket') {
      // Flood fill
      const targetColor = pixels[index];
      if (targetColor === currentColor) return;

      const fill = (idx: number) => {
        if (idx < 0 || idx >= gridSize * gridSize) return;
        if (newPixels[idx] !== targetColor) return;
        newPixels[idx] = currentColor;

        const row = Math.floor(idx / gridSize);
        const col = idx % gridSize;

        if (col > 0) fill(idx - 1);
        if (col < gridSize - 1) fill(idx + 1);
        if (row > 0) fill(idx - gridSize);
        if (row < gridSize - 1) fill(idx + gridSize);
      };
      fill(index);
    }

    setPixels(newPixels);
  };

  const handleMouseEnter = (index: number) => {
    if (!isMouseDown) return;
    if (tool === 'pencil') {
      const newPixels = [...pixels];
      newPixels[index] = currentColor;
      setPixels(newPixels);
    } else if (tool === 'eraser') {
      const newPixels = [...pixels];
      newPixels[index] = 'transparent';
      setPixels(newPixels);
    }
  };

  const handleClear = () => {
    if (sfxEnabled) soundFx.playClick();
    setPixels(Array(gridSize * gridSize).fill('transparent'));
  };

  const handleDone = () => {
    if (sfxEnabled) soundFx.playPostChime();

    // Export drawing as crisp pixel SVG or Data URL canvas image
    const canvas = document.createElement('canvas');
    canvas.width = gridSize * 8; // Scale up for crisp rendering
    canvas.height = gridSize * 8;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      // Background transparent or dark/light depending on theme
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const color = pixels[r * gridSize + c];
          if (color !== 'transparent') {
            ctx.fillStyle = color;
            ctx.fillRect(c * 8, r * 8, 8, 8);
          }
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing(dataUrl, gridSize, gridSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs font-pixel">
      <div className="bg-[#fdf4f9] dark:bg-[#201333] border-4 border-pink-400 dark:border-purple-600 w-full max-w-2xl p-4 shadow-[0_0_25px_rgba(244,184,228,0.4)] text-purple-950 dark:text-pink-100 flex flex-col gap-3">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 text-slate-950 px-3 py-1.5 flex justify-between items-center text-xs font-bold border-b-2 border-purple-800">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-pink-300 px-1.5 py-0.5">絵</span>
            <span>16-BIT PIXEL ART DRAWING CANVAS [お絵かき]</span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-pink-300 text-slate-950 px-2 py-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Layout */}
        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start justify-center">
          {/* Canvas Box */}
          <div className="flex flex-col items-center">
            <div
              className={`grid border-4 border-slate-700 bg-white dark:bg-slate-950 p-1 cursor-crosshair user-select-none touch-none ${
                gridSize === 16 ? 'w-64 h-64' : 'w-72 h-72 sm:w-80 sm:h-80'
              }`}
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
              onMouseDown={() => setIsMouseDown(true)}
              onMouseUp={() => setIsMouseDown(false)}
              onMouseLeave={() => setIsMouseDown(false)}
            >
              {pixels.map((color, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => handlePixelClick(idx)}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  className={`${showGrid ? 'border-[0.5px] border-slate-200/40 dark:border-slate-800/60' : ''}`}
                  style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                />
              ))}
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Canvas: {gridSize}x{gridSize} pixels
            </span>
          </div>

          {/* Tools & Palette Panel */}
          <div className="flex-1 flex flex-col gap-3 w-full">
            {/* Tool Selection */}
            <div>
              <span className="text-xs font-bold block mb-1">ツール (Tools):</span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => setTool('pencil')}
                  className={`px-3 py-1.5 pixel-border-outset flex items-center gap-1.5 cursor-pointer ${
                    tool === 'pencil' ? 'bg-pink-400 text-slate-950 font-bold' : 'bg-pink-100 dark:bg-[#201333]'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Pencil</span>
                </button>
                <button
                  onClick={() => setTool('bucket')}
                  className={`px-3 py-1.5 pixel-border-outset flex items-center gap-1.5 cursor-pointer ${
                    tool === 'bucket' ? 'bg-pink-400 text-slate-950 font-bold' : 'bg-pink-100 dark:bg-[#201333]'
                  }`}
                >
                  <PaintBucket className="w-3.5 h-3.5" />
                  <span>Fill</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-3 py-1.5 pixel-border-outset flex items-center gap-1.5 cursor-pointer ${
                    tool === 'eraser' ? 'bg-pink-400 text-slate-950 font-bold' : 'bg-pink-100 dark:bg-[#201333]'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser</span>
                </button>
                <button
                  onClick={handleClear}
                  className="px-2.5 py-1.5 bg-pink-200 dark:bg-[#201333] hover:bg-pink-400 hover:text-slate-950 pixel-border-outset flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Grid Size & Toggle */}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold">Grid Size:</span>
              <button
                onClick={() => setGridSize(16)}
                className={`px-2 py-0.5 border cursor-pointer ${gridSize === 16 ? 'bg-pink-400 text-slate-950 font-bold border-purple-500' : 'bg-pink-100 dark:bg-[#201333]'}`}
              >
                16x16
              </button>
              <button
                onClick={() => setGridSize(32)}
                className={`px-2 py-0.5 border cursor-pointer ${gridSize === 32 ? 'bg-pink-400 text-slate-950 font-bold border-purple-500' : 'bg-pink-100 dark:bg-[#201333]'}`}
              >
                32x32
              </button>
              <label className="flex items-center gap-1 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                <span>Grid lines</span>
              </label>
            </div>

            {/* Color Palette Selector */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold">16-Bit Color Palette:</span>
                <select
                  value={selectedPalette}
                  onChange={(e) => setSelectedPalette(e.target.value as keyof typeof PALETTES)}
                  className="bg-white dark:bg-[#180f2b] text-purple-950 dark:text-pink-100 text-xs px-2 py-0.5 border border-pink-300 dark:border-purple-700 font-bold"
                >
                  {Object.entries(PALETTES).map(([key, pal]) => (
                    <option key={key} value={key}>
                      {pal.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swatches */}
              <div className="grid grid-cols-8 gap-1.5 p-2 bg-pink-100 dark:bg-[#130b21] border-2 border-pink-300 dark:border-purple-700">
                {PALETTES[selectedPalette].colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (sfxEnabled) soundFx.playClick();
                      setCurrentColor(color);
                      if (tool === 'eraser') setTool('pencil');
                    }}
                    className={`w-7 h-7 border-2 cursor-pointer transition-transform ${
                      currentColor === color ? 'border-white ring-2 ring-pink-400 scale-110 z-10' : 'border-purple-900/60'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 mt-2 pt-2 border-t-2 border-pink-300 dark:border-purple-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-pink-200 dark:bg-[#201333] text-purple-950 dark:text-pink-200 pixel-border-outset text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            className="px-5 py-1.5 bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold pixel-border-outset text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(244,184,228,0.5)]"
          >
            <Check className="w-4 h-4 text-slate-950" />
            <span>Attach Drawing [投稿に添付]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
