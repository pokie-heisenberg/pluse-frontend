import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Search, BookmarkX, Sparkles, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { getBookmarks, unbookmarkPost } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


// Skeleton card for loading state
const BookmarkSkeleton = () => (
  <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-white/10 rounded-full w-28" />
        <div className="h-2.5 bg-white/[0.06] rounded-full w-16" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-white/[0.06] rounded-full w-full" />
      <div className="h-3 bg-white/[0.06] rounded-full w-5/6" />
      <div className="h-3 bg-white/[0.06] rounded-full w-3/4" />
    </div>
    <div className="h-36 bg-white/[0.04] rounded-xl mb-4" />
    <div className="flex space-x-3 pt-3 border-t border-white/5">
      <div className="h-7 w-16 bg-white/[0.06] rounded-lg" />
      <div className="h-7 w-16 bg-white/[0.06] rounded-lg" />
    </div>
  </div>
);

// Single bookmarked post card — full-width, list style
const BookmarkedPostCard = ({ bookmark, onRemove }) => {
  const navigate = useNavigate();
  const post = bookmark.post;
  const [removing, setRemoving] = useState(false);

  // Guard: if post was deleted on the server
  if (!post) {
    return (
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-slate-500 text-sm italic flex items-center space-x-2">
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="group bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg"
    >
      <div className="p-5">
        {/* Author row */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate(`/profile/${post.author?._id}`)}
          >
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity" />
              <img
                src={post.author?.profileImage || `https://ui-avatars.com/api/?name=User&background=random`}
                alt={post.author?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover relative z-10 ring-2 ring-white/10"
              />
            </div>
            <div>
              <p className="font-semibold text-white text-sm hover:text-primary-400 transition-colors">
                {post.author?.name || 'Unknown User'}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">
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
            className="p-2 rounded-xl text-accent-400 hover:text-red-400 hover:bg-red-400/10 border border-accent-500/20 hover:border-red-400/20 transition-all duration-200 opacity-60 group-hover:opacity-100 disabled:opacity-40"
          >
            {removing ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Bookmark size={15} className="fill-accent-400" />
            )}
          </button>
        </div>

        {/* Post content */}
        {post.content && (
          <p className="text-[15px] text-slate-300 leading-relaxed mb-4 line-clamp-4 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Media */}
        {images.length > 0 && (
          <div className={`mb-4 grid gap-1.5 rounded-xl overflow-hidden ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.slice(0, 4).map((url, idx) => (
              <div key={idx} className={`relative overflow-hidden ${images.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
                <img
                  src={url.split('#')[0]}
                  alt={`Post media ${idx + 1}`}
                  className="w-full object-cover max-h-60 hover:scale-[1.02] transition-transform duration-500"
                />
                {images.length > 4 && idx === 3 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center space-x-4 pt-3 border-t border-white/[0.06] text-sm text-slate-500">
          <span className="flex items-center space-x-1.5">
            <Heart size={14} />
            <span>{post.likes || 0}</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <MessageCircle size={14} />
            <span>{post.comments || 0}</span>
          </span>
          <span className="ml-auto flex items-center space-x-1.5 text-accent-500/70 text-xs">
            <Bookmark size={12} className="fill-accent-500/70" />
            <span>Saved</span>
          </span>
        </div>
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
    <div className="py-2 sm:py-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-7"
      >
        <div className="flex flex-wrap gap-3 justify-between items-start mb-5">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-2.5 bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-accent-500/20 rounded-xl">
                <Bookmark size={20} className="text-accent-400 fill-accent-400/40" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-primary-400 to-accent-500 tracking-tight">
                Bookmarks
              </h1>
            </div>
            <p className="text-slate-400 text-sm ml-1">
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
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="relative"
            >
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search bookmarks…"
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-500/40 focus:bg-white/[0.07] transition-all w-48 sm:w-56"
              />
            </motion.div>
          )}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-accent-500/25 to-transparent" />
      </motion.div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <BookmarkSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4">
            <AlertCircle size={40} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Failed to load bookmarks</h3>
          <p className="text-slate-400 text-sm max-w-xs mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      ) : bookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 blur-3xl opacity-10 rounded-full scale-150" />
            <div className="relative p-6 bg-white/5 border border-white/10 rounded-3xl">
              <BookmarkX size={48} className="text-slate-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No bookmarks yet</h3>
          <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
            Tap the bookmark icon on any post to save it here for later.
          </p>
          <div className="mt-5 flex items-center space-x-2 text-xs text-slate-500">
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
          <Search size={36} className="text-slate-600 mb-4" />
          <p className="text-slate-400 text-sm">
            No bookmarks match "<span className="text-white font-medium">{searchQuery}</span>"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-sm text-accent-400 hover:text-accent-300 transition-colors"
          >
            Clear search
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((bookmark, idx) => (
              <motion.div
                key={bookmark._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <BookmarkedPostCard bookmark={bookmark} onRemove={handleRemove} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
