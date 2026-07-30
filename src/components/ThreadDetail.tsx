import React from 'react';
import { Thread, Post } from '../types';
import { PostCard } from './PostCard';
import { soundFx } from '../lib/sound';
import { ArrowLeft, MessageSquarePlus, RefreshCw } from 'lucide-react';

interface ThreadDetailProps {
  thread: Thread;
  onBack: () => void;
  onOpenReplyModal: (threadId: number, replyToPostId?: number) => void;
  onHoverQuotePost?: (postId: number | null, e?: React.MouseEvent) => void;
  onEditTimestamp?: (postId: number, newTimestamp: string) => void;
  onDeletePost?: (postId: number) => void;
  sfxEnabled?: boolean;
}

export const ThreadDetail: React.FC<ThreadDetailProps> = ({
  thread,
  onBack,
  onOpenReplyModal,
  onHoverQuotePost,
  onEditTimestamp,
  onDeletePost,
  sfxEnabled = true
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 font-pixel">
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-[#2a1740] text-pink-100 p-2.5 border-b-2 border-purple-800">
        <button
          onClick={() => {
            if (sfxEnabled) soundFx.playClick();
            onBack();
          }}
          className="px-3 py-1.5 bg-purple-900/90 hover:bg-purple-800 text-pink-100 font-bold pixel-border-outset text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Board [戻る]</span>
        </button>

        <span className="text-xs font-bold text-pink-300">
          THREAD VIEW &gt;&gt;No.{thread.opPost.id} ({thread.replies.length} REPLIES)
        </span>

        <button
          onClick={() => {
            if (sfxEnabled) soundFx.playClick();
            onOpenReplyModal(thread.opPost.threadId, thread.opPost.id);
          }}
          className="px-3 py-1.5 bg-pink-400 hover:bg-pink-300 active:bg-pink-500 text-slate-950 font-bold pixel-border-outset text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(244,184,228,0.5)]"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-slate-950" />
          <span>Post Reply [返信]</span>
        </button>
      </div>

      {/* OP Post */}
      <PostCard
        post={thread.opPost}
        isOp={true}
        onReplyToPost={(postId) => onOpenReplyModal(thread.opPost.threadId, postId)}
        onHoverQuotePost={onHoverQuotePost}
        onEditTimestamp={onEditTimestamp}
        onDeletePost={onDeletePost}
        sfxEnabled={sfxEnabled}
      />

      {/* Replies */}
      <div className="space-y-2 mt-3">
        {thread.replies.map((replyPost) => (
          <PostCard
            key={replyPost.id}
            post={replyPost}
            isOp={false}
            onReplyToPost={(postId) => onOpenReplyModal(thread.opPost.threadId, postId)}
            onHoverQuotePost={onHoverQuotePost}
            onEditTimestamp={onEditTimestamp}
            onDeletePost={onDeletePost}
            sfxEnabled={sfxEnabled}
          />
        ))}
      </div>

      {/* Bottom Reply Bar */}
      <div className="mt-6 p-4 bg-[#fdf4f9] dark:bg-[#201333] border-2 border-pink-300 dark:border-purple-800 flex justify-between items-center text-xs">
        <button
          onClick={() => {
            if (sfxEnabled) soundFx.playClick();
            onBack();
          }}
          className="text-purple-800 dark:text-pink-300 hover:underline font-bold"
        >
          ← Return to thread index
        </button>

        <button
          onClick={() => {
            if (sfxEnabled) soundFx.playClick();
            onOpenReplyModal(thread.opPost.threadId, thread.opPost.id);
          }}
          className="px-4 py-1.5 bg-pink-400 hover:bg-pink-300 active:bg-pink-500 text-slate-950 font-bold pixel-border-outset cursor-pointer flex items-center gap-1.5 shadow-[0_0_8px_rgba(244,184,228,0.5)]"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-slate-950" />
          <span>Quick Reply to Thread</span>
        </button>
      </div>
    </div>
  );
};
