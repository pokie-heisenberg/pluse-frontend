import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Search, BookmarkX, Sparkles, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { getBookmarks, unbookmarkPost } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


// Skeleton card for loading state
const BookmarkSkeleton = () => (
  <div className="px-4 py-4 border-b border-border-subtle animate-pulse">
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-bg-elevated flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-bg-elevated rounded-full w-28" />
        <div className="h-2.5 bg-bg-elevated/60 rounded-full w-16" />
      </div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-3 bg-bg-elevated/60 rounded-full w-full" />
      <div className="h-3 bg-bg-elevated/60 rounded-full w-5/6" />
      <div className="h-3 bg-bg-elevated/60 rounded-full w-3/4" />
    </div>
    <div className="h-32 bg-bg-elevated/40 rounded-xl mb-3" />
    <div className="flex space-x-3 pt-3 border-t border-border-subtle">
      <div className="h-6 w-14 bg-bg-elevated/50 rounded-md" />
      <div className="h-6 w-14 bg-bg-elevated/50 rounded-md" />
    </div>
  </div>
);

// Single bookmarked post card — flat, divider-separated style
const BookmarkedPostCard = ({ bookmark, onRemove }) => {
  const navigate = useNavigate();
  const post = bookmark.post;
  const [removing, setRemoving] = useState(false);

  // Guard: if post was deleted on the server
  if (!post) {
    return (
      <div className="px-4 py-4 border-b border-border-subtle text-text-muted text-sm italic flex items-center space-x-2">
        <AlertCircle size={15} />
        <span>This post is no longer available.</span>
      </div>
    );
  }

  const handleRemove = async (e) => {
    e.stopPropagation();
    setRemoving(true);
    try {
      await unbookmarkPost(post._id);
      toast.success('Removed from bookmarks');
      onRemove(bookmark._id);
    } catch {
      toast.error('Failed to remove bookmark');
      setRemoving(false);
    }
  };

  const images = (post.media || []).filter(
    m => !m.toLowerCase().includes('.mp4') && !m.toLowerCase().includes('.webm')
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="group px-4 py-4 border-b border-border-subtle hover:bg-bg-secondary/50 transition-colors duration-200"
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.author?._id}`)}
        >
          <img
            src={post.author?.profileImage || `https://ui-avatars.com/api/?name=User&background=random`}
            alt={post.author?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-border-subtle group-hover:ring-accent-500/30 transition-all"
          />
          <div>
            <p className="font-semibold text-text-primary text-sm hover:text-accent-400 transition-colors">
              {post.author?.name || 'Unknown User'}
            </p>
            <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
              {new Date(post.createdAt).toLocaleDateString([], {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Remove bookmark btn */}
        <button
          onClick={handleRemove}
          disabled={removing}
          title="Remove bookmark"
          className="p-2 rounded-lg text-accent-400 hover:text-danger hover:bg-danger/[0.06] border border-border-subtle hover:border-danger/20 transition-all duration-200 opacity-50 group-hover:opacity-100 disabled:opacity-30"
        >
          {removing ? (
            <div className="w-4 h-4 border-2 border-danger/30 border-t-danger rounded-full animate-spin" />
          ) : (
            <Bookmark size={15} className="fill-accent-400" />
          )}
        </button>
      </div>

      {/* Post content */}
      {post.content && (
        <p className="text-[15px] text-text-secondary leading-relaxed mb-3 line-clamp-4 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media */}
      {images.length > 0 && (
        <div className={`mb-3 grid gap-1 rounded-xl overflow-hidden border border-border-subtle ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.slice(0, 4).map((url, idx) => (
            <div key={idx} className={`relative overflow-hidden ${images.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
              <img
                src={url.split('#')[0]}
                alt={`Post media ${idx + 1}`}
                className="w-full object-cover max-h-60 hover:scale-[1.02] transition-transform duration-500"
              />
              {images.length > 4 && idx === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center space-x-4 pt-3 border-t border-border-subtle text-sm text-text-muted">
        <span className="flex items-center space-x-1.5">
          <Heart size={14} />
          <span>{post.likes || 0}</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <MessageCircle size={14} />
          <span>{post.comments || 0}</span>
        </span>
        <span className="ml-auto flex items-center space-x-1.5 text-accent-400/60 text-xs">
          <Bookmark size={12} className="fill-accent-400/60" />
          <span>Saved</span>
        </span>
      </div>
    </motion.article>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBookmarks();
        setBookmarks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load bookmarks:', err);
        setError('Could not load your bookmarks. Please try again.');
        toast.error('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleRemove = (bookmarkId) => {
    setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const q = searchQuery.toLowerCase();
    return bookmarks.filter(b =>
      b.post?.content?.toLowerCase().includes(q) ||
      b.post?.author?.name?.toLowerCase().includes(q)
    );
  }, [bookmarks, searchQuery]);

  return (
    <div className="py-2 sm:py-4">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 px-4"
      >
        <div className="flex flex-wrap gap-3 justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-2 bg-accent-500/10 border border-accent-500/20 rounded-xl">
                <Bookmark size={18} className="text-accent-400 fill-accent-400/40" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Bookmarks
              </h1>
            </div>
            <p className="text-text-tertiary text-sm ml-1">
              {loading
                ? 'Loading your saved posts…'
                : error
                ? 'Something went wrong'
                : `${bookmarks.length} saved post${bookmarks.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Search */}
          {!loading && !error && bookmarks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search bookmarks…"
                className="pl-9 pr-4 py-2 bg-bg-secondary border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all w-48 sm:w-56"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Content ── */}
      <div className="border-t border-border-subtle">
        {loading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <BookmarkSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl mb-4">
              <AlertCircle size={32} className="text-danger" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Failed to load bookmarks</h3>
            <p className="text-text-tertiary text-sm max-w-xs mb-5">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-bg-elevated hover:bg-bg-elevated/80 border border-border-default text-text-primary rounded-xl text-sm transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="p-5 bg-bg-elevated border border-border-subtle rounded-xl mb-4">
              <BookmarkX size={36} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">No bookmarks yet</h3>
            <p className="text-text-tertiary max-w-xs text-sm leading-relaxed">
              Tap the bookmark icon on any post to save it here for later.
            </p>
            <div className="mt-4 flex items-center space-x-1.5 text-xs text-text-muted">
              <Sparkles size={13} className="text-accent-400" />
              <span>Your saved posts will appear here</span>
            </div>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Search size={32} className="text-text-muted mb-3" />
            <p className="text-text-tertiary text-sm">
              No bookmarks match "<span className="text-text-primary font-medium">{searchQuery}</span>"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm text-accent-400 hover:text-accent-300 transition-colors"
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((bookmark, idx) => (
              <motion.div
                key={bookmark._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <BookmarkedPostCard bookmark={bookmark} onRemove={handleRemove} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
