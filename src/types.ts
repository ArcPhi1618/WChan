export type BoardCategory = 'all' | 'poem' | 'art' | 'music' | 'quote';

export interface Attachment {
  type: 'image' | 'drawing' | 'audio' | 'quote_card';
  url?: string;
  title?: string;
  dimensions?: string;
  fileSize?: string;
  audioData?: {
    notes?: Array<{ note: string; duration: number }>;
    tempo?: number;
    title?: string;
  };
  quoteCard?: {
    text: string;
    author: string;
    bgStyle: 'sepia' | 'cyber' | 'sakura' | 'monochrome';
  };
}

export interface Post {
  id: number;
  threadId: number; // Same as id for OP, or parent thread id for replies
  subject?: string;
  name: string;
  tripcode?: string;
  timestamp: string; // Customizable formatted timestamp
  content: string;
  category: BoardCategory;
  attachment?: Attachment;
  isSticky?: boolean;
  isClosed?: boolean;
  isVerticalText?: boolean;
}

export interface Thread {
  opPost: Post;
  replies: Post[];
  lastBumpTime: number;
}

export type ViewMode = 'board' | 'catalog' | 'threadDetail';
