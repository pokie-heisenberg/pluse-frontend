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
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 bg-[#030303]/60 backdrop-blur-xl pb-4 pt-4 mb-8 border-b border-white/5"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
          Feed <Sparkles className="ml-2 text-primary-400" size={20} />
        </h2>
      </motion.div>

      {/* Composer (Glassmorphism) */}
      {user ? (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/10 mb-10 group focus-within:border-primary-500/50 transition-colors"
        >
          <div className="flex space-x-4">
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-primary-500 rounded-full blur opacity-30"></div>
               <img src={user.profileImage} alt="You" className="w-12 h-12 rounded-full object-cover relative z-10 ring-2 ring-white/10" />
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
