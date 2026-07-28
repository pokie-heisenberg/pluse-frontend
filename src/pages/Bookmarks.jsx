import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Search, Trash2, BookmarkX, Sparkles } from 'lucide-react';
import { getBookmarks, unbookmarkPost } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PostSkeleton } from '../components/Skeleton';

// Mini post card optimised for the bookmarks grid
const BookmarkedPostCard = ({ bookmark, onRemove }) => {
  const navigate = useNavigate();
  const post = bookmark.post;
  const [removing, setRemoving] = useState(false);

  if (!post) return null;

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

  const firstImage = post.media?.find(m => !m.includes('.mp4') && !m.includes('.webm'));

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -10 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg hover:shadow-primary-500/10"
      onClick={() => navigate(`/profile/${post.author?._id}`)}
    >
      {/* Cover Image */}
      {firstImage && (
        <div className="relative h-40 w-full overflow-hidden bg-black/30">
          <img
            src={firstImage.split('#')[0]}
            alt="Post media"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className={`p-4 ${firstImage ? '' : 'pt-5'}`}>
        {/* Author row */}
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-sm opacity-30 group-hover:opacity-60 transition-opacity" />
            <img
              src={post.author?.profileImage}
              alt={post.author?.name}
              className="w-8 h-8 rounded-full object-cover relative z-10 ring-1 ring-white/20"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
              {post.author?.name}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Post text */}
        {post.content && (
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3 mb-3">
            {post.content}
          </p>
        )}

        {/* Stats & remove */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span>❤️ {post.likes || 0}</span>
            <span>💬 {post.comments || 0}</span>
          </div>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
            title="Remove bookmark"
          >
            {removing ? (
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Bookmark indicator */}
      <div className="absolute top-3 right-3">
        <div className="p-1.5 bg-accent-500/20 backdrop-blur-sm rounded-lg border border-accent-500/30">
          <Bookmark size={13} className="text-accent-400 fill-accent-400" />
        </div>
      </div>
    </motion.article>
  );
};

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const data = await getBookmarks();
        setBookmarks(data);
      } catch (err) {
        console.error('Failed to load bookmarks', err);
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
    <div className="max-w-5xl mx-auto px-0 py-4 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-3 justify-between items-end mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-2.5 bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-accent-500/20 rounded-xl">
                <Bookmark size={22} className="text-accent-400 fill-accent-400/30" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-primary-400 to-accent-500 tracking-tight">
                Bookmarks
              </h1>
            </div>
            <p className="text-slate-400 text-sm sm:text-base ml-1">
              {loading ? 'Loading your saved posts…' : `${bookmarks.length} saved post${bookmarks.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Search */}
          {!loading && bookmarks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search bookmarks…"
                className="pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.07] transition-all w-56"
              />
            </motion.div>
          )}
        </div>

        {/* Decorative divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent-500/30 to-transparent" />
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 blur-3xl opacity-10 rounded-full scale-150" />
            <div className="relative p-6 bg-white/5 border border-white/10 rounded-3xl">
              <BookmarkX size={52} className="text-slate-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No bookmarks yet</h3>
          <p className="text-slate-400 max-w-xs leading-relaxed">
            Save posts you want to revisit later by tapping the bookmark icon on any post.
          </p>
          <div className="mt-6 flex items-center space-x-2 text-sm text-slate-500">
            <Sparkles size={14} className="text-accent-400" />
            <span>Your saved posts will appear here</span>
          </div>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Search size={40} className="text-slate-600 mb-4" />
          <p className="text-slate-400">No bookmarks match "<span className="text-white">{searchQuery}</span>"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Clear search
          </button>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((bookmark, idx) => (
              <motion.div
                key={bookmark._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.04 }}
              >
                <BookmarkedPostCard bookmark={bookmark} onRemove={handleRemove} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
