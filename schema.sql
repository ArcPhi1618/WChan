-- Cloudflare D1 Database Schema for WChan / 16-Bit Journal
-- Run locally: npx wrangler d1 execute DB --local --file=./schema.sql
-- Run production: npx wrangler d1 execute wchan_db1 --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  threadId INTEGER NOT NULL,
  subject TEXT DEFAULT '',
  name TEXT DEFAULT 'Anonymous',
  tripcode TEXT DEFAULT '',
  timestamp TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'all',
  attachment TEXT,
  isSticky INTEGER DEFAULT 0,
  isClosed INTEGER DEFAULT 0,
  isVerticalText INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_posts_threadId ON posts(threadId);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
