import React, { useRef } from 'react';
import { soundFx } from '../lib/sound';
import { Download, Upload, RotateCcw, Heart, Trash2 } from 'lucide-react';

interface FooterProps {
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onResetData: () => void;
  onClearAllData?: () => void;
  sfxEnabled?: boolean;
  isGuest?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onExportData,
  onImportData,
  onResetData,
  onClearAllData,
  sfxEnabled = true,
  isGuest = false
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        onImportData(result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <footer className="w-full bg-[#f8e8f2] dark:bg-[#1a0f2b] border-t-2 border-pink-300 dark:border-purple-800 font-pixel text-purple-950 dark:text-pink-100 mt-12 py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        {/* Left Japanese Notice */}
        <div className="space-y-1 text-center md:text-left">
          <p className="font-bold text-pink-600 dark:text-pink-300 flex items-center justify-center md:justify-start gap-1">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
            <span>[16-BIT JOURNAL BOARD — 16ビット電子掲示板日記]</span>
          </p>
          <p className="text-[11px] text-purple-800/80 dark:text-pink-200/80">
            A pastel aesthetic board for sharing poems, drawings, quotes, & chiptune melodies.
          </p>
        </div>

        {/* Middle Backup & Restore Actions - Hidden in Guest Mode */}
        {!isGuest && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                onExportData();
              }}
              className="px-2.5 py-1 bg-pink-100 dark:bg-[#28183d] hover:bg-pink-300 hover:text-slate-950 pixel-border-outset flex items-center gap-1 cursor-pointer font-bold transition-colors"
            >
              <Download className="w-3 h-3 text-pink-600 dark:text-pink-300" />
              <span>Export Journal (.json)</span>
            </button>

            <button
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                fileInputRef.current?.click();
              }}
              className="px-2.5 py-1 bg-pink-100 dark:bg-[#28183d] hover:bg-pink-300 hover:text-slate-950 pixel-border-outset flex items-center gap-1 cursor-pointer font-bold transition-colors"
            >
              <Upload className="w-3 h-3 text-purple-600 dark:text-purple-300" />
              <span>Import Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                if (confirm('Reset journal board back to default sample posts?')) {
                  onResetData();
                }
              }}
              className="px-2.5 py-1 bg-pink-100 dark:bg-[#28183d] hover:bg-purple-800 hover:text-pink-100 pixel-border-outset flex items-center gap-1 cursor-pointer font-bold transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-pink-600 dark:text-pink-300" />
              <span>Reset Samples</span>
            </button>

            {onClearAllData && (
              <button
                onClick={() => {
                  if (sfxEnabled) soundFx.playClick();
                  if (confirm('Are you sure you want to delete ALL posts and clear the board?')) {
                    onClearAllData();
                  }
                }}
                className="px-2.5 py-1 bg-pink-100 dark:bg-[#28183d] hover:bg-rose-600 hover:text-white pixel-border-outset flex items-center gap-1 cursor-pointer font-bold transition-colors"
              >
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span>Clear All Posts</span>
              </button>
            )}
          </div>
        )}

        {/* Right font credit */}
        <div className="text-[10px] text-purple-700/80 dark:text-pink-300/70 text-center md:text-right font-mono">
          <span>Font: PixelMplus / DotGothic16</span>
          <span className="block mt-0.5">NEED GIRL OVERLOAD Aesthetic © 2026</span>
        </div>
      </div>
    </footer>
  );
};
