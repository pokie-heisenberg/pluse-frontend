import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Trash2, Edit2, Flag, Link, X, Check, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Button } from './Button';
import { likePost, getComments, addComment, updatePost, deletePost, addReply, getReplies, likeComment, deleteComment, updateComment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CommentItem = ({ comment, postId, user }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleted, setIsDeleted] = useState(false);
  const inputRef = useRef(null);

  const handleLike = async () => {
    if (!user) return toast('Please log in', { icon: '👋' });
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    try {
      await likeComment(comment._id);
    } catch (err) {
      setIsLiked(isLiked);
      setLikes(likes);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    try {
      await updateComment(comment._id, editContent);
      comment.content = editContent;
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to edit comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete comment?")) return;
    try {
      await deleteComment(comment._id);
      setIsDeleted(true);
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleReplyTag = (name) => {
    setNewReply(`@${name} `);
    setShowReplies(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  if (isDeleted) return null;

  const handleToggleReplies = async () => {
    setShowReplies(!showReplies);
    if (!showReplies && replies.length === 0) {
      setIsLoadingReplies(true);
      try {
        const data = await getReplies(comment._id);
        setReplies(data);
      } catch (err) {
        console.error("Failed to load replies", err);
      } finally {
        setIsLoadingReplies(false);
      }
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setIsSubmittingReply(true);
    try {
      const added = await addReply(comment._id, postId, newReply);
      setReplies(prev => [...prev, added]);
      setNewReply("");
    } catch (err) {
      console.error("Failed to post reply", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-3">
        <img src={comment.author.profileImage} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover mt-1" />
        <div className="flex-1 bg-white/5 p-3 rounded-2xl rounded-tl-sm">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-semibold text-sm text-white">{comment.author.name}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          {isEditing ? (
            <div className="mt-2">
              <input 
                type="text" 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)} 
                className="w-full bg-white/10 border border-white/20 rounded-md py-1 px-2 text-xs text-white focus:outline-none focus:border-primary-500"
              />
              <div className="flex space-x-2 mt-2">
                <button onClick={handleEdit} className="text-[10px] bg-primary-500 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-[10px] bg-white/10 text-white px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300">{comment.content}</p>
          )}
        </div>
      </div>
      <div className="flex justify-start pl-11 space-x-4 items-center mt-1">
        <button onClick={handleLike} className={`text-xs flex items-center space-x-1 ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-white'}`}>
          <Heart size={12} className={isLiked ? "fill-rose-500" : ""} />
          <span>{likes > 0 ? likes : ''}</span>
        </button>
        <button onClick={handleToggleReplies} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
          {showReplies ? "Hide Replies" : "Reply"}
        </button>
        {user && user._id === comment.author._id && (
          <>
            <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-slate-400 hover:text-white">Edit</button>
            <button onClick={handleDelete} className="text-xs text-slate-400 hover:text-rose-500">Delete</button>
          </>
        )}
      </div>
      
      <AnimatePresence>
        {showReplies && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-11 space-y-3 mt-2 border-l-2 border-white/10 ml-4 overflow-hidden"
          >
            {isLoadingReplies ? (
               <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            ) : replies.map(reply => (
               <div key={reply._id} className="mb-2">
                 <div className="flex space-x-2">
                   <img src={reply.author?.profileImage || 'https://i.pravatar.cc/150'} alt={reply.author?.name} className="w-6 h-6 rounded-full object-cover mt-1" />
                   <div className="flex-1 bg-white/5 p-2 rounded-xl rounded-tl-sm">
                     <div className="flex justify-between items-baseline mb-1">
                       <span className="font-semibold text-xs text-white">{reply.author?.name || 'User'}</span>
                       {reply.createdAt && <span className="text-[10px] text-slate-500 uppercase tracking-wider">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                     </div>
                     <p className="text-xs text-slate-300">{reply.content}</p>
                   </div>
                 </div>
                 <div className="flex justify-start pl-9 space-x-3 mt-0.5">
                   <button onClick={() => handleReplyTag(reply.author?.name)} className="text-[10px] text-slate-500 hover:text-white transition-colors">
                     Reply
                   </button>
                 </div>
               </div>
            ))}
            
            <form onSubmit={handleSubmitReply} className="flex space-x-2 mt-2">
              <input
                ref={inputRef}
                type="text"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full py-1.5 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500/50"
              />
              <button 
                type="submit" 
                disabled={!newReply.trim() || isSubmittingReply}
                className="p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [postContent, setPostContent] = useState(post.content);
  const [postMedia, setPostMedia] = useState(post.media || []);
  const [editMedia, setEditMedia] = useState(post.media || []);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const fileInputRef = useRef(null);
  
  const { user } = useAuth();

  const handleLike = async () => {
    setIsLiking(true);
    // Optimistic Update with spring animation trigger
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    try {
      await likePost(post._id);
    } catch (error) {
      setIsLiked(isLiked);
      setLikes(likes);
      console.error("Failed to like post", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && commentsList.length === 0) {
      setIsLoadingComments(true);
      try {
        const data = await getComments(post._id);
        setCommentsList(data);
      } catch (error) {
        console.error("Failed to load comments", error);
      } finally {
        setIsLoadingComments(false);
      }
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const added = await addComment(post._id, newComment);
      setCommentsList(prev => [...prev, added]);
      setCommentCount(prev => prev + 1);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEditMediaChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems = filesArray.map(file => ({
        file,
        type: file.type,
        previewUrl: URL.createObjectURL(file)
      }));
      setNewMediaFiles(prev => [...prev, ...newItems]);
    }
  };

  const removeEditMedia = (indexToRemove) => {
    setEditMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeNewMedia = (indexToRemove) => {
    setNewMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim() && editMedia.length === 0 && newMediaFiles.length === 0) {
      setIsEditing(false);
      return;
    }
    
    // Check if anything actually changed
    const contentChanged = editContent !== postContent;
    const mediaChanged = JSON.stringify(editMedia) !== JSON.stringify(postMedia) || newMediaFiles.length > 0;
    
    if (!contentChanged && !mediaChanged) {
      setIsEditing(false);
      return;
    }

    setIsSavingEdit(true);
    try {
      const filesToUpload = newMediaFiles.map(m => m.file);
      const response = await updatePost(post._id, editContent, editMedia, filesToUpload);
      const updatedPost = response.data?.doc || response.data?.post || response;
      setPostContent(updatedPost.content || editContent);
      setPostMedia(updatedPost.media || editMedia); // Server returns actual URLs
      setNewMediaFiles([]);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post", error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      setIsDeleted(true);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Failed to delete post", error);
      toast.error("Failed to delete post");
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.author.name} on Pluse`,
          text: post.content,
          url: postUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback if share fails for non-cancellation reasons
          await navigator.clipboard.writeText(postUrl);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  if (isDeleted) return null;

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-white/5 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/10 mb-8 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div 
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => navigate(`/profile/${post.author._id}`)}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
            <img 
              src={post.author.profileImage} 
              alt={post.author.name} 
              className="w-12 h-12 rounded-full object-cover relative z-10 ring-2 ring-white/10"
            />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-wide hover:text-primary-400 transition-colors">{post.author.name}</h3>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">
              {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="text-slate-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <MoreHorizontal size={20} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-1"
                >
                  {user?._id === post.author._id ? (
                    <>
                      <button 
                        onClick={() => { setShowMenu(false); setIsEditing(true); setEditContent(postContent); setEditMedia(postMedia); setNewMediaFiles([]); }} 
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center transition-colors"
                      >
                        <Edit2 size={16} className="mr-3" /> Edit Post
                      </button>
                      <button 
                        onClick={() => { setShowMenu(false); handleDeletePost(); }} 
                        disabled={isDeleting}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} className="mr-3" /> {isDeleting ? 'Deleting...' : 'Delete Post'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors"
                    >
                      <Flag size={16} className="mr-3" /> Report Post
                    </button>
                  )}
                  <div className="h-px bg-white/10 my-1"></div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + "/post/" + post._id);
                      toast.success("Link copied to clipboard!");
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center transition-colors"
                  >
                    <Link size={16} className="mr-3" /> Copy Link
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 relative"
        >
          <textarea 
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={isSavingEdit}
            className="w-full min-h-[100px] bg-black/20 border border-white/20 rounded-xl p-4 text-[15px] text-white leading-relaxed focus:outline-none focus:border-primary-500/50 focus:bg-black/40 transition-all resize-y custom-scrollbar"
            placeholder="Edit your post..."
          />
          
          {/* Edit Media Preview */}
          {(editMedia.length > 0 || newMediaFiles.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              <AnimatePresence>
                {/* Existing media */}
                {editMedia.map((mediaUrl, idx) => {
                  const cleanUrl = mediaUrl.split('#')[0];
                  return (
                    <motion.div 
                      key={cleanUrl}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/20"
                    >
                      <img src={cleanUrl} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeEditMedia(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  );
                })}
                
                {/* New media files */}
                {newMediaFiles.map((media, idx) => {
                  return (
                    <motion.div 
                      key={media.previewUrl}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-accent-500/50"
                    >
                      <img 
                        src={media.previewUrl} 
                        alt="preview" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => removeNewMedia(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex space-x-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,image/gif"
                multiple
                onChange={handleEditMediaChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2 text-primary-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Add Image"
              >
                <ImageIcon size={18} />
              </button>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                disabled={isSavingEdit}
                className="text-slate-400 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm"
              >
                <X size={16} className="mr-1.5" /> Cancel
              </Button>
              <Button 
                onClick={handleUpdatePost}
                disabled={isSavingEdit || (!editContent.trim() && editMedia.length === 0 && newMediaFiles.length === 0)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-lg shadow-primary-500/20 flex items-center"
              >
                {isSavingEdit ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                ) : (
                  <Check size={16} className="mr-1.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <p className="text-slate-300 mb-6 text-[15px] leading-relaxed whitespace-pre-wrap">
          {postContent}
        </p>
      )}

      {/* Media */}
      {postMedia.length > 0 && (
        <div className={`mb-6 grid gap-2 ${postMedia.length === 1 ? 'grid-cols-1' : postMedia.length === 2 ? 'grid-cols-2' : postMedia.length === 3 ? 'grid-cols-2' : 'grid-cols-2'} rounded-2xl overflow-hidden bg-black/50 border border-white/5 shadow-inner`}>
          {postMedia.map((mediaUrl, idx) => {
            const cleanUrl = mediaUrl.split('#')[0];
            
            // For 3 items, make the first item full width
            const isFullWidth = postMedia.length === 3 && idx === 0;

            return (
              <div key={idx} className={`relative overflow-hidden ${isFullWidth ? 'col-span-2' : ''}`}>
                <img 
                  src={cleanUrl} 
                  alt={`Post media ${idx + 1}`} 
                  className="w-full h-full object-cover max-h-[450px] hover:scale-[1.02] transition-transform duration-700 ease-out cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-1 pt-4 border-t border-white/10">
        <motion.div whileTap={{ scale: 0.8 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            disabled={isLiking}
            className={`rounded-xl px-4 ${isLiked ? "text-primary-400 hover:text-primary-300" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.5, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Heart size={20} className={`mr-2.5 ${isLiked ? 'fill-primary-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''}`} />
            </motion.div>
            <span className="font-semibold">{likes}</span>
          </Button>
        </motion.div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleToggleComments}
          className="rounded-xl px-4 text-slate-400 hover:text-white hover:bg-white/10"
        >
          <MessageCircle size={20} className="mr-2.5" />
          <span className="font-semibold">{commentCount}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className="rounded-xl px-4 text-slate-400 hover:text-white hover:bg-white/10 ml-auto"
        >
          <Share2 size={20} />
        </Button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-white/10 mt-4 space-y-4">
              {/* Comment Input */}
              <div className="flex items-center space-x-3 mb-6">
                <img src={user?.profileImage || 'https://i.pravatar.cc/150'} alt="You" className="w-9 h-9 rounded-full object-cover" />
                <form onSubmit={handleSubmitComment} className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500/50 focus:bg-white/10 transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
              
              {/* Comments List */}
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                </div>
              ) : commentsList.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {commentsList.map(comment => (
                    <CommentItem key={comment._id} comment={comment} postId={post._id} user={user} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500 py-4">No comments yet. Be the first!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
