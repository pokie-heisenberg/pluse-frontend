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
    <div className="max-w-full mx-auto relative z-10">
      {/* ── Minimal Hero Banner ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 px-4 py-8 border-b border-border-subtle"
      >
        <div className="flex items-center gap-5">
          {/* Logo icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="shrink-0"
          >
            <div className="w-14 h-14 flex items-center justify-center bg-accent-500/10 rounded-2xl border border-accent-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 46" fill="none" className="w-8 h-8">
                <path fill="url(#hg2)" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"/>
                <defs>
                  <linearGradient id="hg2" x1="0" y1="0" x2="48" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#a5b4fc"/>
                    <stop offset="0.5" stopColor="#6366f1"/>
                    <stop offset="1" stopColor="#4f46e5"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="inline-flex items-center gap-1.5 bg-accent-500/10 border border-accent-500/20 text-accent-300 text-[10px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400" style={{ animation: 'subtlePulse 2s infinite' }} />
                Live Feed
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl sm:text-4xl tracking-tight leading-none text-text-primary"
            >
              Your World, Amplified.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-1.5 text-sm text-text-tertiary"
            >
              Discover stories, moments & ideas from people you follow.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Composer */}
      {user ? (
        <motion.div 
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-tertiary p-4 sm:p-5 mx-4 rounded-xl border border-border-default mb-6 focus-within:border-border-focus focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all"
        >
          <div className="flex space-x-3">
            <img src={user.profileImage} alt="You" className="w-10 h-10 rounded-full object-cover ring-2 ring-border-subtle shrink-0" />
            <div className="flex-1">
              <textarea
                placeholder="What's happening?"
                className="w-full bg-transparent text-text-primary placeholder-text-muted resize-none outline-none text-[15px] min-h-[72px] font-medium leading-relaxed"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              
              {/* Media Preview */}
              {selectedMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  <AnimatePresence>
                    {selectedMedia.map((media, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-border-default"
                        >
                          <img 
                            src={media.previewUrl} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            onClick={() => removeMedia(idx)}
                            className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white hover:bg-danger transition-colors z-10"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-2">
                <div className="flex space-x-0.5">
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
                    className="p-2 text-accent-400 hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all"><Link2 size={20} /></button>
                </div>
                <button 
                  onClick={handleCreatePost} 
                  disabled={(!postText.trim() && selectedMedia.length === 0) || isPublishing} 
                  className="bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold text-sm rounded-full px-5 py-2 shadow-lg shadow-accent-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isPublishing ? (
                    <div className="flex items-center">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Posting...
                    </div>
                  ) : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-tertiary border border-border-default p-8 mx-4 rounded-xl mb-6 text-center"
        >
          <div className="w-14 h-14 bg-accent-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-accent-500/20">
            <LogIn className="text-accent-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Join the Conversation</h3>
          <p className="text-text-tertiary mb-6 max-w-sm mx-auto text-sm">Log in or sign up to share your thoughts, connect with others, and customize your feed.</p>
          <div className="flex justify-center space-x-3">
            <Button onClick={() => navigate('/login')} className="px-6">Log In</Button>
            <Button onClick={() => navigate('/signup')} variant="secondary" className="px-6">Sign Up</Button>
          </div>
        </motion.div>
      )}

      {/* Feed Area */}
      <div className="border-t border-border-subtle">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div key="loading" exit={{ opacity: 0 }}>
              <PostSkeleton />
              <PostSkeleton />
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-4"
            >
              <div className="w-16 h-16 bg-accent-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-accent-500/20">
                <Sparkles className="text-accent-400" size={28} />
              </div>
              <p className="text-xl font-bold text-text-primary mb-2 tracking-tight">Your feed is empty</p>
              <p className="text-text-tertiary text-sm">Follow creators to discover amazing content.</p>
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
