import React from 'react';
import { Thread } from '../types';
import { soundFx } from '../lib/sound';
import { MessageSquare, Image as ImageIcon, Music, Feather, Quote, Sparkles } from 'lucide-react';

interface CatalogViewProps {
  threads: Thread[];
  onOpenThread: (threadId: number) => void;
  sfxEnabled?: boolean;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  threads,
  onOpenThread,
  sfxEnabled = true
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 font-pixel">
      <div className="bg-[#2a1740] text-pink-200 px-3 py-1.5 text-xs font-bold mb-4 flex justify-between items-center border-b-2 border-purple-800">
        <span className="flex items-center gap-1.5">
          <span className="bg-pink-400 text-slate-950 px-1.5 py-0.5 font-bold shadow-[0_0_6px_#f4b8e4]">カタログ</span>
          <span>JOURNAL CATALOG [全スレッド一覧] — {threads.length} Threads</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {threads.map((thread) => {
          const op = thread.opPost;
          const replyCount = thread.replies.length;
          const imageCount = [op, ...thread.replies].filter((p) => p.attachment?.type === 'image' || p.attachment?.type === 'drawing').length;

          return (
            <div
              key={thread.opPost.id}
              onClick={() => {
                if (sfxEnabled) soundFx.playClick();
                onOpenThread(thread.opPost.threadId);
              }}
              className="bg-[#fdf4f9] dark:bg-[#201333] border-2 border-pink-300 dark:border-purple-800 hover:border-pink-500 dark:hover:border-pink-400 p-2 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-[3px_3px_0px_#f4b8e4] group"
            >
              {/* Media Thumbnail */}
              <div className="w-full h-32 bg-pink-100/50 dark:bg-[#130b21] border border-pink-200 dark:border-purple-900 mb-2 flex items-center justify-center overflow-hidden relative">
                {op.attachment?.url ? (
                  <img
                    src={op.attachment.url}
                    alt={op.subject || 'Thumbnail'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform image-rendering-pixelated"
                  />
                ) : op.attachment?.type === 'audio' ? (
                  <div className="flex flex-col items-center text-pink-400 p-2 text-center">
                    <Music className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold">Chiptune Track</span>
                  </div>
                ) : op.attachment?.type === 'quote_card' ? (
                  <div className="flex flex-col items-center text-purple-600 dark:text-purple-300 p-2 text-center">
                    <Quote className="w-8 h-8 mb-1" />
                    <span className="text-[10px] italic line-clamp-2">"{op.attachment.quoteCard?.text}"</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-pink-400/80 p-2 text-center">
                    <Feather className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">Journal Entry</span>
                  </div>
                )}

                {/* Category Badge */}
                <span className="absolute top-1 left-1 px-1 py-0.2 bg-slate-950/80 text-pink-300 text-[9px] font-bold">
                  /{op.category}/
                </span>
              </div>

              {/* Title & Excerpt */}
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-pink-600 dark:text-pink-300 text-xs line-clamp-1 group-hover:underline">
                  {op.subject || `Thread No.${op.id}`}
                </h3>
                <p className="text-[11px] text-purple-900 dark:text-pink-200/90 line-clamp-3 leading-snug">
                  {op.content.replace(/^>+/gm, '')}
                </p>
              </div>

              {/* Footer Stats */}
              <div className="mt-2 pt-1 border-t border-dashed border-pink-200 dark:border-purple-800/60 text-[10px] text-purple-600 dark:text-pink-300/70 flex justify-between items-center font-mono">
                <span>R: {replyCount} / I: {imageCount}</span>
                <span className="text-pink-600 dark:text-pink-300 font-bold">No.{op.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
