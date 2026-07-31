import React, { useState } from 'react';
import { soundFx } from '../lib/sound';
import { Music, Play, Square, Check, X, Sparkles } from 'lucide-react';

interface ChiptuneStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAudio: (audioData: {
    title: string;
    tempo: number;
    notes: Array<{ note: string; duration: number }>;
  }) => void;
  sfxEnabled?: boolean;
}

const PRESET_MELODIES = [
  {
    title: 'Midnight Station (夜の駅)',
    tempo: 110,
    notes: [
      { note: 'C5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'G5', duration: 0.5 },
      { note: 'B5', duration: 0.5 }, { note: 'C6', duration: 1.0 }, { note: 'G5', duration: 0.5 },
      { note: 'E5', duration: 0.5 }, { note: 'A5', duration: 0.5 }, { note: 'F5', duration: 0.5 },
      { note: 'D5', duration: 1.0 }
    ]
  },
  {
    title: 'Sakura Petals Chiptune (桜ひらり)',
    tempo: 125,
    notes: [
      { note: 'E5', duration: 0.5 }, { note: 'G5', duration: 0.5 }, { note: 'A5', duration: 1.0 },
      { note: 'G5', duration: 0.5 }, { note: 'E5', duration: 0.5 }, { note: 'D5', duration: 1.0 },
      { note: 'C5', duration: 0.5 }, { note: 'D5', duration: 0.5 }, { note: 'E5', duration: 1.0 }
    ]
  },
  {
    title: 'Cyberpunk PC-98 Loop (電脳空間)',
    tempo: 140,
    notes: [
      { note: 'C4', duration: 0.25 }, { note: 'C5', duration: 0.25 }, { note: 'D#5', duration: 0.25 },
      { note: 'G5', duration: 0.5 }, { note: 'A#5', duration: 0.5 }, { note: 'G5', duration: 0.25 },
      { note: 'F5', duration: 0.25 }, { note: 'D#5', duration: 0.5 }, { note: 'C5', duration: 1.0 }
    ]
  }
];

const PIANO_KEYS = [
  { note: 'C4', label: 'C4', isBlack: false },
  { note: 'C#4', label: 'C#', isBlack: true },
  { note: 'D4', label: 'D4', isBlack: false },
  { note: 'D#4', label: 'D#', isBlack: true },
  { note: 'E4', label: 'E4', isBlack: false },
  { note: 'F4', label: 'F4', isBlack: false },
  { note: 'F#4', label: 'F#', isBlack: true },
  { note: 'G4', label: 'G4', isBlack: false },
  { note: 'G#4', label: 'G#', isBlack: true },
  { note: 'A4', label: 'A4', isBlack: false },
  { note: 'A#4', label: 'A#', isBlack: true },
  { note: 'B4', label: 'B4', isBlack: false },
  { note: 'C5', label: 'C5', isBlack: false },
  { note: 'C#5', label: 'C#', isBlack: true },
  { note: 'D5', label: 'D5', isBlack: false },
  { note: 'D#5', label: 'D#', isBlack: true },
  { note: 'E5', label: 'E5', isBlack: false },
  { note: 'F5', label: 'F5', isBlack: false },
  { note: 'G5', label: 'G5', isBlack: false },
  { note: 'A5', label: 'A5', isBlack: false },
  { note: 'C6', label: 'C6', isBlack: false },
];

export const ChiptuneStudioModal: React.FC<ChiptuneStudioModalProps> = ({
  isOpen,
  onClose,
  onSaveAudio,
  sfxEnabled = true
}) => {
  const [title, setTitle] = useState<string>('My 16-Bit Melody');
  const [tempo, setTempo] = useState<number>(120);
  const [notes, setNotes] = useState<Array<{ note: string; duration: number }>>(
    PRESET_MELODIES[0].notes
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePlayKey = (note: string) => {
    soundFx.playNote(noteToFreq(note), 0.3, 'square');
  };

  const noteToFreq = (note: string): number => {
    const map: Record<string, number> = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
      'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
      'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
      'C6': 1046.50
    };
    return map[note] || 440;
  };

  const handleAddNote = (note: string) => {
    handlePlayKey(note);
    setNotes((prev) => [...prev, { note, duration: 0.5 }]);
  };

  const handleRemoveNote = (idx: number) => {
    if (sfxEnabled) soundFx.playClick();
    setNotes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePlayMelody = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    soundFx.playSequence(notes, tempo, () => {
      setIsPlaying(false);
    });
  };

  const handleSelectPreset = (presetIdx: number) => {
    if (sfxEnabled) soundFx.playClick();
    const p = PRESET_MELODIES[presetIdx];
    setTitle(p.title);
    setTempo(p.tempo);
    setNotes(p.notes);
  };

  const handleDone = () => {
    if (sfxEnabled) soundFx.playPostChime();
    onSaveAudio({
      title: title || '16-Bit Chiptune Track',
      tempo,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs font-pixel">
      <div className="bg-[#fdf4f9] dark:bg-[#180a2e] border-4 border-pink-400 dark:border-purple-600 w-full max-w-2xl p-4 shadow-[0_0_25px_rgba(244,184,228,0.4)] text-purple-950 dark:text-pink-100 flex flex-col gap-3">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 text-slate-950 px-3 py-1.5 flex justify-between items-center text-xs font-bold border-b-2 border-purple-800">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-pink-300 px-1.5 py-0.5">音</span>
            <span>16-BIT CHIPTUNE SYNTHESIZER STUDIO [作曲]</span>
          </div>
          <button onClick={onClose} className="hover:bg-pink-300 text-slate-950 px-2 py-0.5 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            Presets:
          </span>
          {PRESET_MELODIES.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(idx)}
              className="px-2.5 py-1 bg-pink-200 dark:bg-[#180f2b] hover:bg-pink-400 hover:text-slate-950 pixel-border-outset cursor-pointer text-xs font-bold text-purple-950 dark:text-pink-100"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Composition Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-[#130b21] p-1.5 border-2 border-pink-300 dark:border-purple-700 text-xs font-bold text-purple-950 dark:text-pink-100"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Tempo (BPM): {tempo}</label>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full accent-pink-400"
            />
          </div>
        </div>

        {/* Interactive Piano Keyboard */}
        <div>
          <span className="text-xs font-bold block mb-1">Interactive 16-Bit Keys (Click to add note):</span>
          <div className="flex flex-wrap gap-1 p-2 bg-[#130b21] border-2 border-purple-800 overflow-x-auto justify-center">
            {PIANO_KEYS.map((k, idx) => (
              <button
                key={idx}
                onClick={() => handleAddNote(k.note)}
                className={`py-3 px-2 text-[10px] font-mono cursor-pointer transition-transform active:scale-95 ${
                  k.isBlack
                    ? 'bg-purple-950 text-pink-200 border border-purple-700 hover:bg-purple-900'
                    : 'bg-pink-100 text-purple-950 border border-pink-300 hover:bg-pink-300'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sequence List */}
        <div>
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-bold">Sequence Note Queue ({notes.length} notes):</span>
            <button
              onClick={handlePlayMelody}
              disabled={isPlaying || notes.length === 0}
              className="px-3 py-1 bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold pixel-border-outset flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-[0_0_6px_#f4b8e4]"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>{isPlaying ? 'PLAYING...' : 'TEST PLAY SEQUENCE'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 bg-white dark:bg-[#130b21] border-2 border-pink-300 dark:border-purple-700 min-h-16 max-h-28 overflow-y-auto text-xs">
            {notes.map((item, idx) => (
              <span
                key={idx}
                onClick={() => handleRemoveNote(idx)}
                title="Click to remove note"
                className="px-2 py-0.5 bg-purple-700 text-pink-100 border border-purple-900 cursor-pointer hover:bg-pink-500 hover:text-slate-950 font-bold transition-colors"
              >
                {item.note} ({item.duration}s) ×
              </span>
            ))}
            {notes.length === 0 && (
              <span className="text-purple-400 dark:text-pink-300/60 text-xs italic">No notes added. Click keys above to compose!</span>
            )}
          </div>
        </div>

        {/* Actions */}
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
            <span>Attach Chiptune to Post [投稿に添付]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
