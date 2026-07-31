import React, { useState, useEffect } from 'react';
import { BoardCategory, ViewMode } from '../types';
import { soundFx } from '../lib/sound';
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Tv, 
  Grid, 
  List, 
  PlusCircle, 
  Search,
  BookOpen,
  Feather,
  Palette,
  Music,
  Quote,
  KeyRound
} from 'lucide-react';

interface HeaderProps {
  currentCategory: BoardCategory;
  onSelectCategory: (cat: BoardCategory) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  scanlines: boolean;
  onToggleScanlines: () => void;
  onOpenNewPost: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  postCount: number;
  isGuest?: boolean;
  currentUser?: string;
  onOpenLoginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  viewMode,
  onSelectViewMode,
  darkMode,
  onToggleDarkMode,
  sfxEnabled,
  onToggleSfx,
  scanlines,
  onToggleScanlines,
  onOpenNewPost,
  searchQuery,
  onSearchChange,
  postCount,
  isGuest = false,
  currentUser = 'User',
  onOpenLoginModal
}) => {
  const [clockStr, setClockStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dayName = days[d.getDay()];
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      setClockStr(`${year}-${month}-${day}(${dayName}) ${hours}:${minutes}:${seconds}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCatClick = (cat: BoardCategory) => {
    if (sfxEnabled) soundFx.playClick();
    onSelectCategory(cat);
  };

  const categories: Array<{ id: BoardCategory; label: string; jp: string; icon: React.ReactNode }> = [
    { id: 'all', label: '/all/', jp: '全件 Journal', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'art', label: '/art/', jp: '画廊 Pixel Art', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'poem', label: '/poem/', jp: '詩歌 Poetry', icon: <Feather className="w-3.5 h-3.5" /> },
    { id: 'music', label: '/music/', jp: '音響 Music', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'quote', label: '/quote/', jp: '語録 Quotes', icon: <Quote className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="w-full bg-[#fce7f3] dark:bg-[#1f1333] border-b-2 border-pink-300 dark:border-purple-800 text-purple-950 dark:text-pink-100 transition-colors">
      {/* Top 16-Bit System Status Bar */}
      <div className="bg-[#2a1740] text-pink-200 text-xs px-3 py-1 font-pixel flex flex-wrap justify-between items-center gap-2 border-b border-purple-900/80">
        <div className="flex items-center gap-3">
          <span className="text-pink-300 font-bold flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-400 animate-pulse shadow-[0_0_6px_#f4b8e4]"></span>
            WONDERLAND ARCHIVES ₊˚⊹♡ [ARC]
          </span>
          <span className="hidden sm:inline text-purple-400">|</span>
          <span className="hidden sm:inline text-cyan-300 font-mono">: 🌸 | MOOD: 1.618% | [{postCount} POSTS]</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          {/* User / Guest Status Badge */}
          {isGuest ? (
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-pixel font-bold flex items-center gap-1 bg-amber-950/80 px-2 py-0.5 border border-amber-600">
                👻 GUEST MODE
              </span>
              {onOpenLoginModal && (
                <button
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    onOpenLoginModal();
                  }}
                  className="px-2 py-0.5 bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold font-pixel cursor-pointer text-[10px] transition-colors"
                >
                  🔑 LOG IN
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-pink-300 font-pixel font-bold flex items-center gap-1 bg-purple-900/80 px-2 py-0.5 border border-purple-700">
                🌸 {currentUser}
              </span>
              {onOpenLoginModal && (
                <button
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    onOpenLoginModal();
                  }}
                  className="px-2 py-0.5 bg-purple-900 hover:bg-purple-800 text-pink-200 font-pixel cursor-pointer text-[10px] transition-colors border border-purple-700"
                >
                  SWITCH
                </button>
              )}
            </div>
          )}
          <span className="text-purple-300 font-pixel">{clockStr || '2026-07-29(水) 22:15:44'}</span>
        </div>
      </div>

      {/* Main Banner & Japanese Aesthetics */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-dashed border-pink-300 dark:border-purple-800/80 pb-4">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2 py-0.5 bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 text-slate-950 text-xs font-bold font-pixel rounded-none shadow-[0_0_8px_#f4b8e4]">
                ❥ 不思議の国 
              </span>
              <h1 className="text-xl md:text-2xl font-bold font-pixel tracking-wider text-pink-600 dark:text-pink-300 drop-shadow-[0_1px_2px_rgba(244,184,228,0.4)]">
                𐙚⋆°｡⋆♡ WONDERLAND ARCHIVE BOARD °❀.ೃ࿔
              </h1>
            </div>
            <p className="text-xs text-purple-700 dark:text-pink-300/80 mt-1 font-pixel">
              Life inside Pastel Wonderland ♡
            </p>
          </div>

          {/* Top Actions: Dark mode, SFX, Scanlines, New Post & Log In */}
          <div className="flex flex-wrap items-center justify-center gap-2 font-pixel text-xs">
            {/* New Post Button */}
            <button
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                onOpenNewPost();
              }}
              className="px-3 py-1.5 bg-pink-400 hover:bg-pink-300 active:bg-pink-500 text-slate-950 font-bold pixel-border-outset flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(244,184,228,0.5)] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>投稿 [NEW POST]</span>
            </button>

            {/* Log In / User Switch Button */}
            {onOpenLoginModal && (
              <button
                onClick={() => {
                  if (sfxEnabled) soundFx.playClick();
                  onOpenLoginModal();
                }}
                className={`px-3 py-1.5 font-bold pixel-border-outset flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isGuest
                    ? 'bg-purple-900 hover:bg-purple-800 text-pink-200 border border-purple-700'
                    : 'bg-pink-200 dark:bg-purple-900/90 text-purple-950 dark:text-pink-100 hover:bg-pink-300'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {isGuest 
                    ? 'ログイン [LOG IN]' 
                    : currentUser.toLowerCase().includes('rabbit') 
                    ? `🐰 ${currentUser}` 
                    : `🌸 ${currentUser}`}
                </span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                onToggleDarkMode();
              }}
              title="Toggle Dark Mode (Reduces Eye Strain)"
              className="px-2.5 py-1.5 bg-pink-100 dark:bg-[#2e1d45] hover:bg-pink-200 dark:hover:bg-[#3b2659] text-purple-900 dark:text-pink-200 pixel-border-outset flex items-center gap-1 cursor-pointer transition-colors"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
              <span className="hidden sm:inline">{darkMode ? 'LIGHT' : 'DARK'}</span>
            </button>

            {/* SFX Toggle */}
            <button
              onClick={onToggleSfx}
              title="Toggle 16-bit Sound Effects"
              className="px-2.5 py-1.5 bg-pink-100 dark:bg-[#2e1d45] hover:bg-pink-200 dark:hover:bg-[#3b2659] text-purple-900 dark:text-pink-200 pixel-border-outset flex items-center gap-1 cursor-pointer transition-colors"
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-pink-500 dark:text-pink-300" /> : <VolumeX className="w-3.5 h-3.5 text-purple-400" />}
              <span className="hidden sm:inline">SFX</span>
            </button>

            {/* Scanlines Toggle */}
            <button
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                onToggleScanlines();
              }}
              title="Toggle CRT Scanline Overlay Effect"
              className={`px-2.5 py-1.5 pixel-border-outset flex items-center gap-1 cursor-pointer transition-colors ${
                scanlines
                  ? 'bg-purple-800 text-pink-200'
                  : 'bg-pink-100 dark:bg-[#2e1d45] text-purple-900 dark:text-pink-200'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CRT</span>
            </button>
          </div>
        </div>

        {/* Board Categories Nav & View Controls */}
        <div className="mt-3 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
          {/* Categories */}
          <div className="flex flex-wrap gap-1 font-pixel text-xs">
            {categories.map((cat) => {
              const isActive = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCatClick(cat.id)}
                  className={`px-3 py-1.5 border-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-pink-400 text-slate-950 border-purple-400 font-bold shadow-[0_0_8px_rgba(244,184,228,0.5)]'
                      : 'bg-white/80 dark:bg-[#201333] text-purple-900 dark:text-pink-200 border-pink-200 dark:border-purple-800 hover:bg-pink-100 dark:hover:bg-[#2e1d47]'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-80">({cat.jp})</span>
                </button>
              );
            })}
          </div>

          {/* Search & View Switcher */}
          <div className="flex items-center gap-2 font-pixel text-xs">
            {/* Search Input */}
            <div className="relative flex-1 md:w-48">
              <input
                type="text"
                placeholder="Search journal..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white dark:bg-[#18102a] text-purple-950 dark:text-pink-100 pl-7 pr-2 py-1 text-xs border-2 border-pink-300 dark:border-purple-800 focus:outline-none focus:border-pink-500"
              />
              <Search className="w-3.5 h-3.5 text-pink-400 absolute left-2 top-1.5" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex border-2 border-pink-300 dark:border-purple-800 bg-pink-100 dark:bg-[#201333]">
              <button
                onClick={() => {
                  if (sfxEnabled) soundFx.playClick();
                  onSelectViewMode('board');
                }}
                title="Board View (Threads & Replies)"
                className={`px-2.5 py-1 flex items-center gap-1 cursor-pointer ${
                  viewMode === 'board'
                    ? 'bg-pink-400 text-slate-950 font-bold'
                    : 'text-purple-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-purple-900/60'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thread</span>
              </button>
              <button
                onClick={() => {
                  if (sfxEnabled) soundFx.playClick();
                  onSelectViewMode('catalog');
                }}
                title="Catalog View (Grid View)"
                className={`px-2.5 py-1 flex items-center gap-1 cursor-pointer ${
                  viewMode === 'catalog'
                    ? 'bg-pink-400 text-slate-950 font-bold'
                    : 'text-purple-900 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-purple-900/60'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catalog</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
