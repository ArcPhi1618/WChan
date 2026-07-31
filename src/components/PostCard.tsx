import React, { useState } from 'react';
import { Post } from '../types';
import { soundFx } from '../lib/sound';
import { 
  Play, 
  Square, 
  Quote as QuoteIcon, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Edit3,
  CornerDownRight,
  Trash2
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  isOp?: boolean;
  onReplyToPost: (postId: number) => void;
  onHoverQuotePost?: (postId: number | null, e?: React.MouseEvent) => void;
  onEditTimestamp?: (postId: number, newTimestamp: string) => void;
  onDeletePost?: (postId: number) => void;
  sfxEnabled?: boolean;
  isGuest?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isOp = false,
  onReplyToPost,
  onHoverQuotePost,
  onEditTimestamp,
  onDeletePost,
  sfxEnabled = true,
  isGuest = false
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isImageExpanded, setIsImageExpanded] = useState<boolean>(false);
  const [isEditingTime, setIsEditingTime] = useState<boolean>(false);
  const [editedTime, setEditedTime] = useState<string>(post.timestamp);

  const handlePlayAudio = () => {
    if (!post.attachment?.audioData?.notes) return;
    if (isPlayingAudio) return;

    setIsPlayingAudio(true);
    soundFx.playSequence(
      post.attachment.audioData.notes,
      post.attachment.audioData.tempo || 120,
      () => setIsPlayingAudio(false)
    );
  };

  const handleCopyLink = () => {
    if (sfxEnabled) soundFx.playClick();
    navigator.clipboard.writeText(`#No.${post.id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveTimestamp = () => {
    if (sfxEnabled) soundFx.playClick();
    if (onEditTimestamp) {
      onEditTimestamp(post.id, editedTime);
    }
    setIsEditingTime(false);
  };

  // Process text lines to detect greentext (>...) and quotes (>>No.123)
  const renderContentLines = (contentStr: string) => {
    const lines = contentStr.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Detect quote reference e.g., >>No.84920101 or >>84920101
      if (trimmed.startsWith('>>')) {
        const match = trimmed.match(/>>(?:No\.)?(\d+)/i);
        const refId = match ? parseInt(match[1], 10) : null;

        return (
          <div key={idx} className="my-0.5">
            <span
              onMouseEnter={(e) => refId && onHoverQuotePost?.(refId, e)}
              onMouseLeave={() => onHoverQuotePost?.(null)}
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                if (refId) onReplyToPost(refId);
              }}
              className="text-rose-700 dark:text-rose-400 font-bold underline cursor-pointer hover:bg-rose-200 dark:hover:bg-rose-950 px-1 py-0.2 rounded-none inline-flex items-center gap-1"
            >
              <CornerDownRight className="w-3 h-3 inline" />
              {line}
            </span>
          </div>
        );
      }

      // Detect 4chan Greentext
      if (trimmed.startsWith('>')) {
        return (
          <div key={idx} className="greentext font-bold my-0.5">
            {line}
          </div>
        );
      }

      return (
        <div key={idx} className="my-0.5 whitespace-pre-wrap">
          {line}
        </div>
      );
    });
  };

  return (
    <div
      id={`post-${post.id}`}
      className={`p-3 font-pixel text-xs transition-colors border-2 ${
        isOp
          ? 'bg-[#fdf4f9] dark:bg-[#1c0e33] border-pink-300 dark:border-purple-800 shadow-sm'
          : 'bg-white/90 dark:bg-[#160a29] border-pink-200 dark:border-purple-900/80 ml-0 md:ml-6 my-2'
      }`}
    >
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-pink-200 dark:border-purple-800/60 pb-1.5 mb-2 text-xs">
        {/* Subject (if OP) */}
        {post.subject && (
          <span className="font-bold text-pink-600 dark:text-pink-300 text-sm">
            {post.subject}
          </span>
        )}

        {/* Name & Tripcode */}
        <span className="font-bold text-purple-700 dark:text-purple-300">
          {post.name}
        </span>
        {post.tripcode && (
          <span className="text-fuchsia-600 dark:text-fuchsia-300 font-mono text-[11px]">
            {post.tripcode}
          </span>
        )}

        {/* Sticky Badge */}
        {post.isSticky && (
          <span className="px-1.5 py-0.2 bg-pink-400 text-slate-950 text-[10px] font-bold shadow-[0_0_6px_#f4b8e4]">
            [✝ STICKY JOURNAL ✝]
          </span>
        )}

        {/* Visible & Customizable Timestamp */}
        <div className="flex items-center gap-1 text-purple-800 dark:text-pink-300 font-mono text-[11px] ml-auto sm:ml-0">
          <Clock className="w-3 h-3 text-pink-400 dark:text-pink-400" />
          {isEditingTime && !isGuest ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                className="bg-white dark:bg-[#130b21] text-purple-950 dark:text-pink-100 px-1 py-0.5 border border-pink-300 text-[11px]"
              />
              <button
                onClick={handleSaveTimestamp}
                className="px-1.5 py-0.5 bg-pink-400 text-slate-950 font-bold text-[10px] cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <span
              onClick={() => !isGuest && setIsEditingTime(true)}
              title={isGuest ? 'Timestamp' : 'Click to customize post timestamp'}
              className={`flex items-center gap-0.5 ${!isGuest ? 'hover:underline cursor-pointer' : ''}`}
            >
              {post.timestamp}
              {!isGuest && <Edit3 className="w-2.5 h-2.5 text-pink-400 hover:text-pink-600 ml-0.5" />}
            </span>
          )}
        </div>

        {/* Post ID Number */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => onReplyToPost(post.id)}
            className="text-pink-600 dark:text-pink-300 font-bold hover:underline cursor-pointer"
          >
            No. {post.id}
          </button>

          <button
            onClick={handleCopyLink}
            title="Copy Post No."
            className="p-1 hover:text-pink-600 cursor-pointer"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-pink-400" />}
          </button>

          {!isGuest && onDeletePost && (
            <button
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                if (confirm(`Delete post No.${post.id}?${isOp ? ' (This is an OP post, deleting it will remove the entire thread)' : ''}`)) {
                  onDeletePost(post.id);
                }
              }}
              title={isOp ? 'Delete Thread' : 'Delete Post'}
              className="p-1 text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer transition-colors ml-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body with Media & Content */}
      <div className="flex flex-col md:flex-row gap-3 items-start">
        {/* Attachment Renderer */}
        {post.attachment && (
          <div className="w-full md:w-auto shrink-0 mb-2 md:mb-0">
            {/* Image / Drawing Attachment */}
            {(post.attachment.type === 'image' || post.attachment.type === 'drawing') && post.attachment.url && (
              <div className="border-2 border-pink-300 dark:border-purple-700 bg-pink-50/50 dark:bg-purple-950/40 p-1">
                <div className="text-[10px] text-purple-800 dark:text-pink-300 mb-1 flex justify-between items-center font-mono">
                  <span>
                    File: {post.attachment.title || 'creation.png'} ({post.attachment.dimensions || '32x32'})
                  </span>
                </div>
                <img
                  src={post.attachment.url}
                  alt={post.attachment.title || 'Attachment'}
                  onClick={() => setIsImageExpanded(!isImageExpanded)}
                  className={`image-rendering-pixelated cursor-pointer border border-pink-300 dark:border-purple-600 transition-all ${
                    isImageExpanded ? 'w-full max-w-lg h-auto' : 'w-40 h-40 object-cover hover:opacity-90'
                  }`}
                />
                <span className="text-[9px] text-pink-400 dark:text-pink-300 block mt-0.5">
                  [Click to {isImageExpanded ? 'collapse' : 'expand'}]
                </span>
              </div>
            )}

            {/* Chiptune Audio Player Attachment */}
            {post.attachment.type === 'audio' && post.attachment.audioData && (
              <div className="p-2.5 bg-[#201333] text-pink-100 border-2 border-pink-400 w-full md:w-56 space-y-1.5 shadow-[2px_2px_0px_#f4b8e4]">
                <div className="flex items-center gap-1.5 text-xs text-pink-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                  <span>16-Bit Chiptune Track</span>
                </div>
                <p className="text-[11px] font-mono truncate text-pink-200">
                  {post.attachment.audioData.title || 'Chiptune Loop'}
                </p>
                <div className="text-[10px] text-purple-300">
                  Tempo: {post.attachment.audioData.tempo} BPM | Notes: {post.attachment.audioData.notes?.length || 0}
                </div>
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className="w-full py-1 bg-pink-400 hover:bg-pink-300 active:bg-pink-500 text-slate-950 font-bold pixel-border-outset text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isPlayingAudio ? 'PLAYING AUDIO...' : 'PLAY CHIPTUNE'}</span>
                </button>
              </div>
            )}

            {/* Quote Card Attachment */}
            {post.attachment.type === 'quote_card' && post.attachment.quoteCard && (
              <div
                className={`p-3 border-2 w-full md:w-64 space-y-1 ${
                  post.attachment.quoteCard.bgStyle === 'cyber'
                    ? 'bg-[#141026] text-cyan-200 border-cyan-400'
                    : post.attachment.quoteCard.bgStyle === 'sakura'
                    ? 'bg-[#2b1428] text-pink-200 border-pink-400'
                    : 'bg-amber-100 text-amber-950 border-amber-800 dark:bg-[#281c18] dark:text-amber-100'
                }`}
              >
                <QuoteIcon className="w-4 h-4 opacity-70" />
                <p className="text-xs italic leading-snug font-serif whitespace-pre-wrap">
                  "{post.attachment.quoteCard.text}"
                </p>
                <p className="text-[10px] font-bold text-right opacity-80">
                  — {post.attachment.quoteCard.author}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Text Content */}
        <div className={`flex-1 ${post.isVerticalText ? 'font-jp-vertical h-48 border-l-2 border-pink-300 dark:border-purple-700 pl-2' : ''}`}>
          {renderContentLines(post.content)}
        </div>
      </div>

      {/* Reply Action footer */}
      <div className="mt-2 pt-1 border-t border-pink-200 dark:border-purple-800/60 flex justify-end items-center gap-2 text-[11px]">
        {isGuest ? (
          <button
            onClick={() => onReplyToPost(post.id)}
            className="text-pink-600/90 dark:text-pink-300/90 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
          >
            <span>🔑 Log in to Reply</span>
          </button>
        ) : (
          <button
            onClick={() => onReplyToPost(post.id)}
            className="text-pink-600 dark:text-pink-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Reply [&gt;&gt;No.{post.id}]</span>
          </button>
        )}
      </div>
    </div>
  );
};
