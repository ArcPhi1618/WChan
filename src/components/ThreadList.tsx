import React from 'react';
import { Thread } from '../types';
import { PostCard } from './PostCard';
import { soundFx } from '../lib/sound';
import { MessageSquarePlus, ExternalLink } from 'lucide-react';

interface ThreadListProps {
  threads: Thread[];
  onOpenThread: (threadId: number) => void;
  onOpenReplyModal: (threadId: number, replyToPostId?: number) => void;
  onHoverQuotePost?: (postId: number | null, e?: React.MouseEvent) => void;
  onEditTimestamp?: (postId: number, newTimestamp: string) => void;
  onDeletePost?: (postId: number) => void;
  sfxEnabled?: boolean;
  isGuest?: boolean;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  onOpenThread,
  onOpenReplyModal,
  onHoverQuotePost,
  onEditTimestamp,
  onDeletePost,
  sfxEnabled = true,
  isGuest = false
}) => {
  if (threads.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto p-8 text-center font-pixel text-purple-800 dark:text-pink-300">
        <div className="bg-[#fdf4f9] dark:bg-[#201333] border-2 border-dashed border-pink-300 dark:border-purple-700 p-8 space-y-2">
          <p className="text-base font-bold text-pink-600 dark:text-pink-300">[掲示板] No journal threads found in this category.</p>
          <p className="text-xs">Click "NEW POST [新規投稿]" at the top to create the first entry!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 space-y-8 font-pixel">
      {threads.map((thread) => {
        const replyCount = thread.replies.length;
        // In 4chan board view, show latest 3 replies
        const displayedReplies = thread.replies.slice(-3);
        const omittedCount = replyCount - displayedReplies.length;

        return (
          <div key={thread.opPost.id} className="border-b-2 border-pink-300 dark:border-purple-800/80 pb-6">
            {/* Thread OP Post */}
            <PostCard
              post={thread.opPost}
              isOp={true}
              onReplyToPost={(postId) => onOpenReplyModal(thread.opPost.threadId, postId)}
              onHoverQuotePost={onHoverQuotePost}
              onEditTimestamp={onEditTimestamp}
              onDeletePost={onDeletePost}
              sfxEnabled={sfxEnabled}
              isGuest={isGuest}
            />

            {/* Omitted replies bar if more than 3 replies */}
            {omittedCount > 0 && (
              <div className="my-2 ml-2 md:ml-6 text-xs font-pixel text-purple-700 dark:text-pink-300">
                <button
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    onOpenThread(thread.opPost.threadId);
                  }}
                  className="hover:underline font-bold text-pink-600 dark:text-pink-300 cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 inline" />
                  <span>
                    {omittedCount} reply {omittedCount === 1 ? '' : 'replies'} omitted. Click here to view thread.
                  </span>
                </button>
              </div>
            )}

            {/* Inline latest replies */}
            <div className="space-y-2 mt-2">
              {displayedReplies.map((replyPost) => (
                <PostCard
                  key={replyPost.id}
                  post={replyPost}
                  isOp={false}
                  onReplyToPost={(postId) => onOpenReplyModal(thread.opPost.threadId, postId)}
                  onHoverQuotePost={onHoverQuotePost}
                  onEditTimestamp={onEditTimestamp}
                  onDeletePost={onDeletePost}
                  sfxEnabled={sfxEnabled}
                  isGuest={isGuest}
                />
              ))}
            </div>

            {/* Thread footer link */}
            <div className="mt-2 text-right">
              <button
                onClick={() => {
                  if (sfxEnabled) soundFx.playClick();
                  onOpenThread(thread.opPost.threadId);
                }}
                className="px-3 py-1 bg-pink-200 dark:bg-[#28183d] hover:bg-pink-400 hover:text-slate-950 text-purple-950 dark:text-pink-200 pixel-border-outset text-xs font-bold cursor-pointer transition-colors"
              >
                View Full Thread ({replyCount} replies) →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
