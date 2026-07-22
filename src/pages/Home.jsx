import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFeedPosts, getAllPosts, createPost } from '../services/api';
import { PostCard } from '../components/PostCard';
import { PostSkeleton } from '../components/Skeleton';
import { Button } from '../components/Button';
import { Image as ImageIcon, Video, Link2, Sparkles, LogIn, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const data = user ? await getFeedPosts(1, 10) : await getAllPosts(1, 10);
        setPosts(data);
      } catch (err) {
        setError('Failed to load your feed.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [user]);

  const handleCreatePost = async () => {
    if (!postText.trim() && selectedMedia.length === 0) return;
    setIsPublishing(true);
    
    try {
      const filesToUpload = selectedMedia.map(media => media.file);
      const response = await createPost(postText, filesToUpload);
      
      const newPost = response.data?.post || response.post || response.data?.doc;
      if (newPost) {
        setPosts([newPost, ...posts]);
      } else {
        // Fallback: refetch feed if we can't extract the new post easily
        const data = await getFeedPosts(1, 10);
        setPosts(data);
      }
      
      setPostText('');
      setSelectedMedia([]);
      toast.success('Post created successfully!');
    } catch (err) {
      console.error("Failed to create post", err);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleMediaChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newMediaItems = filesArray.map(file => ({
        file,
        type: file.type,
        previewUrl: URL.createObjectURL(file)
      }));
      setSelectedMedia(prev => [...prev, ...newMediaItems]);
    }
  };

  const removeMedia = (indexToRemove) => {
    setSelectedMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="max-w-2xl mx-auto relative z-10">
      {/* ── Stunning Hero Banner ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative mb-6 rounded-3xl overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#0d1a3a] to-[#030303]" />

        {/* Animated glow orbs */}
        <div className="absolute -top-8 -left-8 w-48 h-48 bg-primary-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-accent-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-blob" style={{ animationDelay: '4s' }} />

        {/* Floating dot particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary-400/60"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{ y: [0, -12, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center gap-6">

          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 bg-primary-500/40 rounded-2xl blur-xl scale-125" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 46" fill="none" className="w-9 h-9 sm:w-11 sm:h-11 drop-shadow-lg">
                <path fill="url(#hg)" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
                <defs>
                  <linearGradient id="hg" x1="0" y1="0" x2="48" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a78bfa"/>
                    <stop offset="0.5" stopColor="#8b5cf6"/>
                    <stop offset="1" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Text content */}
          <div className="text-center sm:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Live pill */}
              <div className="inline-flex items-center gap-1.5 bg-primary-500/15 border border-primary-500/30 text-primary-300 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 sm:mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                Live Feed
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="text-3xl sm:text-4xl font-black tracking-tight leading-none"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-200 to-accent-300">
                Your World,
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-violet-400 to-accent-400">
                Amplified.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="mt-2 text-sm text-slate-400 max-w-xs leading-relaxed"
            >
              Discover stories, moments & ideas from people you follow.
            </motion.p>
          </div>
        </div>

        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
      </motion.div>

      {/* Composer (Glassmorphism) */}
      {user ? (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 mb-6 sm:mb-10 group focus-within:border-primary-500/50 transition-colors"
        >
          <div className="flex space-x-3 sm:space-x-4">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-primary-500 rounded-full blur opacity-30"></div>
               <img src={user.profileImage} alt="You" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover relative z-10 ring-2 ring-white/10" />
            </div>
            <div className="flex-1">
              <textarea
                placeholder="What's happening?"
                className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none text-lg min-h-[80px] font-medium tracking-wide custom-scrollbar"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              
              {/* Media Preview */}
              {selectedMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-4">
                  <AnimatePresence>
                    {selectedMedia.map((media, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/20"
                        >
                          <img 
                            src={media.previewUrl} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            onClick={() => removeMedia(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                <div className="flex space-x-1">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,image/gif"
                    multiple
                    onChange={handleMediaChange}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="p-2.5 text-primary-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <ImageIcon size={22} />
                  </button>
                  <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"><Link2 size={22} /></button>
                </div>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={!postText.trim() && selectedMedia.length === 0} 
                  isLoading={isPublishing}
                  className="rounded-full px-6 shadow-lg shadow-primary-500/20"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-900/40 to-accent-900/40 backdrop-blur-xl p-8 rounded-3xl border border-primary-500/30 mb-10 text-center shadow-[0_0_30px_rgba(139,92,246,0.15)]"
        >
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <LogIn className="text-white" size={28} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Join the Conversation</h3>
          <p className="text-slate-300 mb-6 max-w-sm mx-auto">Log in or sign up to share your thoughts, connect with others, and customize your feed.</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate('/login')} className="px-8 shadow-lg shadow-primary-500/30">Log In</Button>
            <Button onClick={() => navigate('/signup')} variant="secondary" className="px-8 border-white/20">Sign Up</Button>
          </div>
        </motion.div>
      )}

      {/* Feed Area */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div key="loading" exit={{ opacity: 0, y: -20 }}>
              <PostSkeleton />
              <PostSkeleton />
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 text-slate-400 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5"
            >
              <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-primary-400" size={32} />
              </div>
              <p className="text-2xl font-bold text-white mb-2 tracking-tight">Your feed is empty</p>
              <p>Follow creators to discover amazing content.</p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
