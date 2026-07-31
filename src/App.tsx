import React, { useState, useEffect, useMemo } from 'react';
import { BoardCategory, ViewMode, Post, Thread, Attachment } from './types';
import { INITIAL_POSTS } from './data/samplePosts';
import { Header } from './components/Header';
import { ThreadList } from './components/ThreadList';
import { CatalogView } from './components/CatalogView';
import { ThreadDetail } from './components/ThreadDetail';
import { PostFormModal } from './components/PostFormModal';
import { PixelCanvasModal } from './components/PixelCanvasModal';
import { ChiptuneStudioModal } from './components/ChiptuneStudioModal';
import { Footer } from './components/Footer';
import { soundFx } from './lib/sound';

export default function App() {
  // Persistence state
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('16bit_journal_posts_v2');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_POSTS;
  });

  // Fetch posts from Cloudflare D1 API backend if available
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api');
        if (!response.ok) return;
        const data = await response.json();
        console.log("Database results:", data);
        if (data && data.success && Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Failed to connect to the database API:", error);
      }
    }
    loadData();
  }, []);

  // Dark mode state (Default to dark mode or user preference for reduced eye strain)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('16bit_journal_darkmode');
      if (saved !== null) return JSON.parse(saved);
    } catch {
      //
    }
    return true; // Default dark mode to reduce eye strain
  });

  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<BoardCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isPostFormOpen, setIsPostFormOpen] = useState<boolean>(false);
  const [replyToThreadId, setReplyToThreadId] = useState<number | undefined>(undefined);
  const [replyToPostId, setReplyToPostId] = useState<number | undefined>(undefined);

  const [isPixelCanvasOpen, setIsPixelCanvasOpen] = useState<boolean>(false);
  const [isChiptuneStudioOpen, setIsChiptuneStudioOpen] = useState<boolean>(false);
  const [currentAttachment, setCurrentAttachment] = useState<Attachment | null>(null);

  // Hover quote preview popover state
  const [hoveredQuotePost, setHoveredQuotePost] = useState<Post | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Sync dark mode HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('16bit_journal_darkmode', JSON.stringify(darkMode));
    } catch {
      //
    }
  }, [darkMode]);

  // Sync sound manager enabled flag
  useEffect(() => {
    soundFx.enabled = sfxEnabled;
  }, [sfxEnabled]);

  // Save posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('16bit_journal_posts_v2', JSON.stringify(posts));
    } catch {
      //
    }
  }, [posts]);

  // Organize raw posts into Threads
  const threads = useMemo(() => {
    // Separate OP posts and replies
    const opPosts = posts.filter((p) => p.threadId === p.id);
    const replies = posts.filter((p) => p.threadId !== p.id);

    const threadList: Thread[] = opPosts.map((op) => {
      const threadReplies = replies.filter((r) => r.threadId === op.id);

      // Find latest bump time
      const times = [op, ...threadReplies].map((p) => {
        const d = new Date(p.timestamp.replace(/\([^)]*\)/, ' '));
        return isNaN(d.getTime()) ? Date.now() : d.getTime();
      });
      const lastBumpTime = Math.max(...times);

      return {
        opPost: op,
        replies: threadReplies,
        lastBumpTime
      };
    });

    // Sort threads by bump order (newest first)
    threadList.sort((a, b) => b.lastBumpTime - a.lastBumpTime);

    // Filter by Category
    let filtered = threadList;
    if (currentCategory !== 'all') {
      filtered = filtered.filter((t) => t.opPost.category === currentCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => {
        const matchesOp =
          t.opPost.subject?.toLowerCase().includes(q) ||
          t.opPost.content.toLowerCase().includes(q) ||
          t.opPost.name.toLowerCase().includes(q) ||
          t.opPost.id.toString().includes(q);

        const matchesReply = t.replies.some(
          (r) =>
            r.content.toLowerCase().includes(q) ||
            r.name.toLowerCase().includes(q) ||
            r.id.toString().includes(q)
        );

        return matchesOp || matchesReply;
      });
    }

    return filtered;
  }, [posts, currentCategory, searchQuery]);

  // Active single thread
  const activeThread = useMemo(() => {
    if (!activeThreadId) return null;
    return threads.find((t) => t.opPost.id === activeThreadId) || null;
  }, [threads, activeThreadId]);

  // Post Submission Handler
  const handleCreatePost = (newPostData: Omit<Post, 'id'>) => {
    const highestId = posts.reduce((max, p) => Math.max(max, p.id), 84920100);
    const newPostId = highestId + 1;

    let finalThreadId = newPostData.threadId;
    if (!finalThreadId || finalThreadId === 0) {
      // OP Post starting new thread
      finalThreadId = newPostId;
    }

    const fullPost: Post = {
      ...newPostData,
      id: newPostId,
      threadId: finalThreadId
    };

    setPosts((prev) => [fullPost, ...prev]);
    setCurrentAttachment(null);

    // Sync with backend API (D1)
    fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post: fullPost })
    }).catch((err) => console.error("Error persisting post to D1:", err));

    // If starting new thread, jump to it or stay in board
    if (viewMode === 'threadDetail' && activeThreadId !== finalThreadId) {
      setActiveThreadId(finalThreadId);
    }
  };

  const handleEditTimestamp = (postId: number, newTimestamp: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, timestamp: newTimestamp } : p))
    );

    fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateTimestamp', id: postId, timestamp: newTimestamp })
    }).catch((err) => console.error("Error updating timestamp in D1:", err));
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prevPosts) => {
      const targetPost = prevPosts.find((p) => p.id === postId);
      if (!targetPost) return prevPosts;

      // If it's an OP post, deleting it removes all posts in that thread
      if (targetPost.id === targetPost.threadId) {
        return prevPosts.filter((p) => p.threadId !== targetPost.id);
      } else {
        // It's a reply post, remove just this reply
        return prevPosts.filter((p) => p.id !== postId);
      }
    });

    fetch('/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id: postId })
    }).catch((err) => console.error("Error deleting post from D1:", err));

    if (activeThreadId === postId) {
      setActiveThreadId(null);
      setViewMode('board');
    }
  };

  const handleOpenReplyModal = (tId: number, rPostId?: number) => {
    setReplyToThreadId(tId);
    setReplyToPostId(rPostId);
    setIsPostFormOpen(true);
  };

  const handleOpenNewThreadModal = () => {
    setReplyToThreadId(undefined);
    setReplyToPostId(undefined);
    setIsPostFormOpen(true);
  };

  const handleOpenThreadDetail = (tId: number) => {
    setActiveThreadId(tId);
    setViewMode('threadDetail');
  };

  const handleHoverQuotePost = (postId: number | null, e?: React.MouseEvent) => {
    if (!postId) {
      setHoveredQuotePost(null);
      setHoverPos(null);
      return;
    }
    const found = posts.find((p) => p.id === postId);
    if (found) {
      setHoveredQuotePost(found);
      if (e) {
        setHoverPos({ x: e.clientX + 10, y: e.clientY + 10 });
      }
    }
  };

  const handleSavePixelDrawing = (dataUrl: string) => {
    setCurrentAttachment({
      type: 'drawing',
      url: dataUrl,
      title: 'pixel_canvas_drawing.png',
      dimensions: '32x32px',
      fileSize: '16 KB'
    });
  };

  const handleSaveChiptuneAudio = (audioData: {
    title: string;
    tempo: number;
    notes: Array<{ note: string; duration: number }>;
  }) => {
    setCurrentAttachment({
      type: 'audio',
      title: audioData.title,
      audioData
    });
  };

  const handleExportJournalJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(posts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `16bit_journal_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJournalJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        setPosts(parsed);
        alert('Journal database imported successfully!');
      } else {
        alert('Invalid JSON file format.');
      }
    } catch {
      alert('Failed to parse JSON file.');
    }
  };

  const handleResetSampleData = () => {
    setPosts(INITIAL_POSTS);
    localStorage.setItem('16bit_journal_posts_v2', JSON.stringify(INITIAL_POSTS));
  };

  const handleClearAllData = () => {
    setPosts([]);
    localStorage.setItem('16bit_journal_posts_v2', JSON.stringify([]));
  };

  return (
    <div className={`min-h-screen bg-[#fdf2f8] dark:bg-[#181825] text-purple-950 dark:text-pink-100 font-pixel selection:bg-pink-300 selection:text-purple-950 dark:selection:bg-pink-500 dark:selection:text-slate-950 transition-colors relative ${scanlines ? 'scanlines' : ''}`}>
      {/* Top Header Navigation */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          if (viewMode === 'threadDetail') setViewMode('board');
        }}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        sfxEnabled={sfxEnabled}
        onToggleSfx={() => setSfxEnabled(!sfxEnabled)}
        scanlines={scanlines}
        onToggleScanlines={() => setScanlines(!scanlines)}
        onOpenNewPost={handleOpenNewThreadModal}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        postCount={posts.length}
      />

      {/* Main Body View Switching */}
      <main className="pb-12">
        {viewMode === 'catalog' && (
          <CatalogView
            threads={threads}
            onOpenThread={handleOpenThreadDetail}
            sfxEnabled={sfxEnabled}
          />
        )}

        {viewMode === 'board' && (
          <ThreadList
            threads={threads}
            onOpenThread={handleOpenThreadDetail}
            onOpenReplyModal={handleOpenReplyModal}
            onHoverQuotePost={handleHoverQuotePost}
            onEditTimestamp={handleEditTimestamp}
            onDeletePost={handleDeletePost}
            sfxEnabled={sfxEnabled}
          />
        )}

        {viewMode === 'threadDetail' && activeThread && (
          <ThreadDetail
            thread={activeThread}
            onBack={() => setViewMode('board')}
            onOpenReplyModal={handleOpenReplyModal}
            onHoverQuotePost={handleHoverQuotePost}
            onEditTimestamp={handleEditTimestamp}
            onDeletePost={handleDeletePost}
            sfxEnabled={sfxEnabled}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onExportData={handleExportJournalJSON}
        onImportData={handleImportJournalJSON}
        onResetData={handleResetSampleData}
        onClearAllData={handleClearAllData}
        sfxEnabled={sfxEnabled}
      />

      {/* Post Submission Modal */}
      <PostFormModal
        isOpen={isPostFormOpen}
        onClose={() => setIsPostFormOpen(false)}
        onSubmitPost={handleCreatePost}
        replyToThreadId={replyToThreadId}
        replyToPostId={replyToPostId}
        defaultCategory={currentCategory}
        onOpenPixelCanvas={() => setIsPixelCanvasOpen(true)}
        onOpenChiptuneStudio={() => setIsChiptuneStudioOpen(true)}
        currentAttachment={currentAttachment}
        onClearAttachment={() => setCurrentAttachment(null)}
        sfxEnabled={sfxEnabled}
      />

      {/* Pixel Art Canvas Modal */}
      <PixelCanvasModal
        isOpen={isPixelCanvasOpen}
        onClose={() => setIsPixelCanvasOpen(false)}
        onSaveDrawing={handleSavePixelDrawing}
        sfxEnabled={sfxEnabled}
      />

      {/* 16-Bit Chiptune Studio Modal */}
      <ChiptuneStudioModal
        isOpen={isChiptuneStudioOpen}
        onClose={() => setIsChiptuneStudioOpen(false)}
        onSaveAudio={handleSaveChiptuneAudio}
        sfxEnabled={sfxEnabled}
      />

      {/* Floating Hover Popover for >>No. Quotes */}
      {hoveredQuotePost && hoverPos && (
        <div
          style={{ top: Math.min(hoverPos.y, window.innerHeight - 200), left: Math.min(hoverPos.x, window.innerWidth - 320) }}
          className="fixed z-50 w-80 p-3 bg-[#241836] text-pink-100 border-2 border-pink-400 shadow-[4px_4px_0px_#f4b8e4] font-pixel text-xs pointer-events-none"
        >
          <div className="flex justify-between items-center text-[10px] text-pink-300 font-bold border-b border-purple-800/80 pb-1 mb-1">
            <span>PREVIEW &gt;&gt;No.{hoveredQuotePost.id}</span>
            <span>{hoveredQuotePost.name}</span>
          </div>
          <p className="line-clamp-4 leading-snug font-mono text-[11px]">
            {hoveredQuotePost.content}
          </p>
        </div>
      )}
    </div>
  );
}
