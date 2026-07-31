import React, { useState, useEffect } from 'react';
import { BoardCategory, Attachment, Post } from '../types';
import { parseNameAndTripcode, formatPostTimestamp } from '../lib/tripcode';
import { soundFx } from '../lib/sound';
import { 
  X, 
  Send, 
  Clock, 
  Palette, 
  Music, 
  Image as ImageIcon, 
  Quote, 
  Hash, 
  Feather,
  Sparkles,
  AlignVerticalJustifyStart,
  Quote as QuoteIcon
} from 'lucide-react';

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (newPost: Omit<Post, 'id'> & { id?: number }) => void;
  replyToThreadId?: number; // If set, replying to thread
  replyToPostId?: number; // If set, quoting specific post ID
  defaultCategory?: BoardCategory;
  onOpenPixelCanvas: () => void;
  onOpenChiptuneStudio: () => void;
  currentAttachment?: Attachment | null;
  onClearAttachment: () => void;
  sfxEnabled?: boolean;
  currentUser?: string;
  isGuest?: boolean;
  onOpenLoginModal?: () => void;
}

export const PostFormModal: React.FC<PostFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
  replyToThreadId,
  replyToPostId,
  defaultCategory = 'poem',
  onOpenPixelCanvas,
  onOpenChiptuneStudio,
  currentAttachment,
  onClearAttachment,
  sfxEnabled = true,
  currentUser = 'Alice',
  isGuest = false,
  onOpenLoginModal
}) => {
  const [nameInput, setNameInput] = useState<string>(currentUser || 'Alice');

  useEffect(() => {
    if (isOpen && currentUser) {
      setNameInput(currentUser);
    }
  }, [isOpen, currentUser]);
  const [subjectInput, setSubjectInput] = useState<string>('');
  const [category, setCategory] = useState<BoardCategory>(defaultCategory === 'all' ? 'poem' : defaultCategory);
  const [customTimestamp, setCustomTimestamp] = useState<string>(formatPostTimestamp());
  const [useAutoTime, setUseAutoTime] = useState<boolean>(true);
  const [content, setContent] = useState<string>(
    replyToPostId ? `>>No.${replyToPostId}\n>` : ''
  );
  const [isVerticalText, setIsVerticalText] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [quoteCardText, setQuoteCardText] = useState<string>('');
  const [quoteCardAuthor, setQuoteCardAuthor] = useState<string>('');
  const [attachmentType, setAttachmentType] = useState<'none' | 'url' | 'canvas' | 'chiptune' | 'quote'>('none');

  if (!isOpen) return null;

  const handleUseCurrentTime = () => {
    if (sfxEnabled) soundFx.playClick();
    setCustomTimestamp(formatPostTimestamp());
    setUseAutoTime(true);
  };

  const handleInsertGreentext = () => {
    if (sfxEnabled) soundFx.playClick();
    setContent((prev) => prev + (prev.endsWith('\n') || prev === '' ? '>' : '\n>'));
  };

  const handleInsertAsciiArt = () => {
    if (sfxEnabled) soundFx.playClick();
    const ascii = `\n(  /\\_/\\  )\n(  ( \u00b0.\u00b0 ) )\n(   > ^ <   )\n`;
    setContent((prev) => prev + ascii);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      alert('Guest mode cannot submit posts or replies. Please log in.');
      onClose();
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }
    if (!content.trim() && !currentAttachment && !imageUrlInput && !quoteCardText) {
      alert('Please enter post text or attach media!');
      return;
    }

    const { name, tripcode } = parseNameAndTripcode(nameInput);
    const finalTimestamp = useAutoTime ? formatPostTimestamp() : customTimestamp;

    let finalAttachment: Attachment | undefined = currentAttachment || undefined;

    if (attachmentType === 'url' && imageUrlInput.trim()) {
      finalAttachment = {
        type: 'image',
        url: imageUrlInput.trim(),
        title: 'Uploaded Image',
        fileSize: '128 KB'
      };
    } else if (attachmentType === 'quote' && quoteCardText.trim()) {
      finalAttachment = {
        type: 'quote_card',
        title: 'Quote Card',
        quoteCard: {
          text: quoteCardText.trim(),
          author: quoteCardAuthor.trim() || name,
          bgStyle: category === 'poem' ? 'sakura' : category === 'art' ? 'cyber' : 'sepia'
        }
      };
    }

    if (sfxEnabled) soundFx.playPostChime();

    onSubmitPost({
      threadId: replyToThreadId || 0, // App will set threadId if OP
      name,
      tripcode,
      subject: replyToThreadId ? undefined : subjectInput.trim() || undefined,
      timestamp: finalTimestamp,
      content: content.trim(),
      category: replyToThreadId ? defaultCategory : category,
      attachment: finalAttachment,
      isVerticalText
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs font-pixel overflow-y-auto">
      <div className="bg-[#fdf4f9] dark:bg-[#180a2e] border-4 border-pink-400 dark:border-purple-600 w-full max-w-2xl my-8 p-4 shadow-[0_0_25px_rgba(244,184,228,0.4)] text-purple-950 dark:text-pink-100 flex flex-col gap-3">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 text-slate-950 px-3 py-1.5 flex justify-between items-center text-xs font-bold border-b-2 border-purple-800">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-pink-300 px-1.5 py-0.5">投稿</span>
            <span>
              {replyToThreadId ? `REPLY TO THREAD >>No.${replyToThreadId}` : 'CREATE NEW JOURNAL THREAD [新規投稿]'}
            </span>
          </div>
          <button onClick={onClose} className="hover:bg-pink-300 text-slate-950 px-2 py-0.5 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4chan Table Style Form Layout */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div className="bg-white/90 dark:bg-[#120623] p-3 border-2 border-pink-300 dark:border-purple-800 space-y-2.5">
            {/* Name & Tripcode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
              <label className="font-bold sm:col-span-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-pink-500" />
                <span>Name / Tripcode:</span>
              </label>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Anonymous or Name#tripcode"
                  className="w-full bg-pink-50/50 dark:bg-[#160a2b] px-2 py-1 border border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 text-xs font-mono"
                />
                <span className="text-[10px] text-purple-700 dark:text-pink-300/80">
                  Tip: Enter <code className="bg-pink-200 dark:bg-purple-900 px-1 text-slate-950 dark:text-pink-100">Name#password</code> for custom tripcode (e.g. !a8B1c2D)
                </span>
              </div>
            </div>

            {/* Subject / Title (Only for new thread) */}
            {!replyToThreadId && (
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="font-bold sm:col-span-1">Subject / Thread Title:</label>
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  placeholder="e.g. Rainy Night Poem / 16-Bit Thoughts"
                  className="sm:col-span-2 bg-pink-50/50 dark:bg-[#1a0f30] px-2 py-1 border border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 text-xs font-bold text-pink-600 dark:text-pink-300"
                />
              </div>
            )}

            {/* Category Select */}
            {!replyToThreadId && (
              <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2">
                <label className="font-bold sm:col-span-1">Board Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BoardCategory)}
                  className="sm:col-span-2 bg-pink-50/50 dark:bg-[#1a0f30] px-2 py-1 border border-pink-300 dark:border-purple-700 font-bold text-purple-950 dark:text-pink-100"
                >
                  <option value="poem">/poem/ - Poems & Haiku (詩歌)</option>
                  <option value="art">/art/ - Pixel Art & Drawings (絵画)</option>
                  <option value="music">/music/ - 16-Bit Chiptunes (音響)</option>
                  <option value="quote">/quote/ - Thoughts & Quotes (語録)</option>
                </select>
              </div>
            )}

            {/* Customizable Timestamp Field */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 bg-pink-100/60 dark:bg-[#1a0f30] p-2 border border-pink-300 dark:border-purple-800">
              <label className="font-bold sm:col-span-1 flex items-center gap-1 text-pink-600 dark:text-pink-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Custom Timestamp:</span>
              </label>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="text"
                  value={customTimestamp}
                  onChange={(e) => {
                    setCustomTimestamp(e.target.value);
                    setUseAutoTime(false);
                  }}
                  className="flex-1 bg-white dark:bg-[#130b21] px-2 py-1 border border-pink-300 dark:border-purple-700 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleUseCurrentTime}
                  className="px-2 py-1 bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold text-[11px] pixel-border-outset whitespace-nowrap cursor-pointer"
                >
                  NOW
                </button>
              </div>
            </div>

            {/* Content Textarea & Formatting Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold">Submission Content / Verse:</label>
                <div className="flex gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={handleInsertGreentext}
                    className="px-2 py-0.5 bg-emerald-800 text-emerald-100 hover:bg-emerald-700 font-bold border border-emerald-600 cursor-pointer"
                  >
                    +Greentext
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertAsciiArt}
                    className="px-2 py-0.5 bg-pink-400 text-slate-950 hover:bg-pink-300 font-bold border border-pink-500 cursor-pointer"
                  >
                    +Cat ASCII
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVerticalText(!isVerticalText)}
                    className={`px-2 py-0.5 border cursor-pointer flex items-center gap-1 ${
                      isVerticalText ? 'bg-purple-800 text-pink-100 font-bold border-purple-600' : 'bg-pink-100 dark:bg-[#201333]'
                    }`}
                  >
                    <AlignVerticalJustifyStart className="w-3 h-3" />
                    <span>Jp Vertical Verse</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your poem, thoughts, or story here... Lines starting with '>' will render in green."
                className={`w-full bg-white dark:bg-[#130b21] p-2.5 border-2 border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 text-xs font-mono leading-relaxed ${
                  isVerticalText ? 'font-jp-vertical h-40' : ''
                }`}
              />
            </div>

            {/* Media & Attachments Bar */}
            <div className="border-t border-pink-200 dark:border-purple-800/80 pt-2">
              <span className="font-bold block mb-1">Multimedia Attachments [マルチメディア]:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                {/* 16-Bit Canvas Draw */}
                <button
                  type="button"
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    setAttachmentType('canvas');
                    onOpenPixelCanvas();
                  }}
                  className="px-3 py-1.5 bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold pixel-border-outset flex items-center gap-1.5 cursor-pointer shadow-[0_0_6px_#f4b8e4]"
                >
                  <Palette className="w-3.5 h-3.5 text-slate-950" />
                  <span>16-Bit Pixel Drawer</span>
                </button>

                {/* 16-Bit Chiptune Synth */}
                <button
                  type="button"
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    setAttachmentType('chiptune');
                    onOpenChiptuneStudio();
                  }}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-pink-100 font-bold pixel-border-outset flex items-center gap-1.5 cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Chiptune Melody Studio</span>
                </button>

                {/* Image URL / Upload */}
                <button
                  type="button"
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    setAttachmentType(attachmentType === 'url' ? 'none' : 'url');
                  }}
                  className={`px-3 py-1.5 font-bold pixel-border-outset flex items-center gap-1.5 cursor-pointer ${
                    attachmentType === 'url' ? 'bg-pink-500 text-slate-950' : 'bg-pink-100 dark:bg-[#201333]'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>

                {/* Quote Card */}
                <button
                  type="button"
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    setAttachmentType(attachmentType === 'quote' ? 'none' : 'quote');
                  }}
                  className={`px-3 py-1.5 font-bold pixel-border-outset flex items-center gap-1.5 cursor-pointer ${
                    attachmentType === 'quote' ? 'bg-purple-400 text-slate-950' : 'bg-pink-100 dark:bg-[#201333]'
                  }`}
                >
                  <QuoteIcon className="w-3.5 h-3.5" />
                  <span>Quote Card</span>
                </button>
              </div>

              {/* URL Input */}
              {attachmentType === 'url' && (
                <div className="mt-2 p-2 bg-pink-100 dark:bg-[#180f2b] border border-pink-300 dark:border-purple-700">
                  <label className="block mb-1 font-bold">Image Direct URL:</label>
                  <input
                    type="url"
                    placeholder="https://example.com/pixel_art.png"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full bg-white dark:bg-[#130b21] px-2 py-1 border border-pink-300 dark:border-purple-700 text-xs"
                  />
                </div>
              )}

              {/* Quote Card Input */}
              {attachmentType === 'quote' && (
                <div className="mt-2 p-2 bg-pink-100 dark:bg-[#180f2b] border border-pink-300 dark:border-purple-700 space-y-1.5">
                  <label className="block font-bold">Featured Quote Text:</label>
                  <textarea
                    rows={2}
                    value={quoteCardText}
                    onChange={(e) => setQuoteCardText(e.target.value)}
                    placeholder="Enter short quote or excerpt..."
                    className="w-full bg-white dark:bg-[#130b21] p-1.5 border border-pink-300 dark:border-purple-700 text-xs"
                  />
                  <input
                    type="text"
                    value={quoteCardAuthor}
                    onChange={(e) => setQuoteCardAuthor(e.target.value)}
                    placeholder="Quote Author / Source"
                    className="w-full bg-white dark:bg-[#130b21] px-2 py-1 border border-pink-300 dark:border-purple-700 text-xs"
                  />
                </div>
              )}

              {/* Display Attached Media Banner if present */}
              {currentAttachment && (
                <div className="mt-2 p-2 bg-pink-200/80 dark:bg-purple-900/80 border-2 border-pink-400 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-300" />
                    <span className="font-bold text-purple-950 dark:text-pink-100">
                      Attached: {currentAttachment.title || currentAttachment.type.toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onClearAttachment}
                    className="text-pink-700 dark:text-pink-300 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-pink-300 dark:border-purple-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-pink-200 dark:bg-[#201333] text-purple-950 dark:text-pink-200 pixel-border-outset text-xs cursor-pointer"
            >
              Cancel
            </button>
            {isGuest ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenLoginModal) onOpenLoginModal();
                }}
                className="px-6 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold pixel-border-outset text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              >
                <span>🔑 LOG IN TO SUBMIT POST</span>
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-1.5 bg-pink-400 hover:bg-pink-300 text-slate-950 font-bold pixel-border-outset text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(244,184,228,0.5)]"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span>Submit Post [送信]</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
