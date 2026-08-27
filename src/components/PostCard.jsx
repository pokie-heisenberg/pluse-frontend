import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Trash2, Edit2, Flag, Link, X, Check, Image as ImageIcon, Video as VideoIcon, Bookmark } from 'lucide-react';
import { Button } from './Button';
import { likePost, getComments, addComment, updatePost, deletePost, addReply, getReplies, likeComment, deleteComment, updateComment, bookmarkPost, unbookmarkPost } from '../services/api';
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
    <div className="flex flex-col space-y-1.5">
      <div className="flex space-x-3">
        <img src={comment.author.profileImage} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover mt-0.5 ring-1 ring-border-subtle" />
        <div className="flex-1 bg-bg-elevated p-3 rounded-xl rounded-tl-sm">
          <div className="flex justify-between items-baseline mb-1">
            <span className="font-semibold text-sm text-text-primary">{comment.author.name}</span>
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          {isEditing ? (
            <div className="mt-2">
              <input 
                type="text" 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)} 
                className="w-full bg-bg-secondary border border-border-default rounded-lg py-1.5 px-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-500/50 transition-colors"
              />
              <div className="flex space-x-2 mt-2">
                <button onClick={handleEdit} className="text-[10px] bg-accent-500 text-white px-2.5 py-1 rounded-md font-medium">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-[10px] bg-bg-elevated text-text-secondary px-2.5 py-1 rounded-md">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
          )}
        </div>
      </div>
      <div className="flex justify-start pl-11 space-x-4 items-center">
        <button onClick={handleLike} className={`text-xs flex items-center space-x-1 transition-colors ${isLiked ? 'text-danger' : 'text-text-muted hover:text-text-primary'}`}>
          <Heart size={12} className={isLiked ? "fill-danger" : ""} />
          <span>{likes > 0 ? likes : ''}</span>
        </button>
        <button onClick={handleToggleReplies} className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
          {showReplies ? "Hide Replies" : "Reply"}
        </button>
        {user && user._id === comment.author._id && (
          <>
            <button onClick={() => setIsEditing(!isEditing)} className="text-xs text-text-muted hover:text-text-primary transition-colors">Edit</button>
            <button onClick={handleDelete} className="text-xs text-text-muted hover:text-danger transition-colors">Delete</button>
          </>
        )}
      </div>
      
      <AnimatePresence>
        {showReplies && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-11 space-y-3 mt-1 border-l-2 border-border-subtle ml-4 overflow-hidden"
          >
            {isLoadingReplies ? (
               <div className="w-4 h-4 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin"></div>
            ) : replies.map(reply => (
               <div key={reply._id} className="mb-2">
                 <div className="flex space-x-2">
                   <img src={reply.author?.profileImage || 'https://i.pravatar.cc/150'} alt={reply.author?.name} className="w-6 h-6 rounded-full object-cover mt-0.5 ring-1 ring-border-subtle" />
                   <div className="flex-1 bg-bg-elevated p-2.5 rounded-xl rounded-tl-sm">
                     <div className="flex justify-between items-baseline mb-1">
                       <span className="font-semibold text-xs text-text-primary">{reply.author?.name || 'User'}</span>
                       {reply.createdAt && <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                     </div>
                     <p className="text-xs text-text-secondary">{reply.content}</p>
                   </div>
                 </div>
                 <div className="flex justify-start pl-9 space-x-3 mt-0.5">
                   <button onClick={() => handleReplyTag(reply.author?.name)} className="text-[10px] text-text-muted hover:text-text-primary transition-colors">
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
                className="flex-1 bg-bg-secondary border border-border-default rounded-full py-1.5 px-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-500/50 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!newReply.trim() || isSubmittingReply}
                className="p-1.5 bg-accent-500 text-white rounded-full hover:bg-accent-600 disabled:opacity-50 transition-colors"
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
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isBookmarking, setIsBookmarking] = useState(false);
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

  const handleBookmark = async () => {
    if (!user) return toast('Please log in to bookmark posts', { icon: '🔖' });
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    setIsBookmarking(true);
    try {
      if (prev) {
        await unbookmarkPost(post._id);
        toast.success('Removed from bookmarks');
      } else {
        await bookmarkPost(post._id);
        toast.success('Bookmarked!');
      }
    } catch (error) {
      setIsBookmarked(prev);
      toast.error('Failed to update bookmark');
      console.error("Failed to bookmark post", error);
    } finally {
      setIsBookmarking(false);
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="px-4 py-4 border-b border-border-subtle hover:bg-bg-secondary/50 transition-colors duration-200 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.author._id}`)}
        >
          <img 
            src={post.author.profileImage} 
            alt={post.author.name} 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-border-subtle group-hover:ring-accent-500/30 transition-all duration-300"
          />
          <div>
            <h3 className="font-semibold text-text-primary text-[14.5px] tracking-wide hover:text-accent-400 transition-colors">{post.author.name}</h3>
            <p className="font-mono text-[11px] text-text-muted tracking-wider uppercase">
              {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="text-text-muted hover:text-text-primary transition-colors p-2 rounded-xl hover:bg-bg-elevated"
          >
            <MoreHorizontal size={18} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1 w-48 bg-bg-tertiary border border-border-default rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                >
                  {user?._id === post.author._id ? (
                    <>
                      <button 
                        onClick={() => { setShowMenu(false); setIsEditing(true); setEditContent(postContent); setEditMedia(postMedia); setNewMediaFiles([]); }} 
                        className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary flex items-center transition-colors"
                      >
                        <Edit2 size={15} className="mr-3" /> Edit Post
                      </button>
                      <button 
                        onClick={() => { setShowMenu(false); handleDeletePost(); }} 
                        disabled={isDeleting}
                        className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 flex items-center transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} className="mr-3" /> {isDeleting ? 'Deleting...' : 'Delete Post'}
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 flex items-center transition-colors"
                    >
                      <Flag size={15} className="mr-3" /> Report Post
                    </button>
                  )}
                  <div className="h-px bg-border-subtle my-1"></div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + "/post/" + post._id);
                      toast.success("Link copied to clipboard!");
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary flex items-center transition-colors"
                  >
                    <Link size={15} className="mr-3" /> Copy Link
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <textarea 
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            disabled={isSavingEdit}
            className="w-full min-h-[100px] bg-bg-secondary border border-border-default rounded-xl p-4 text-[15px] text-text-primary leading-relaxed focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all resize-y"
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
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-border-default"
                    >
                      <img src={cleanUrl} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeEditMedia(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-danger transition-colors z-10"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  );
                })}
                
                {/* New media files */}
                {newMediaFiles.map((media, idx) => {
                  return (
                    <motion.div 
                      key={media.previewUrl}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative w-24 h-24 rounded-lg overflow-hidden border border-accent-500/40"
                    >
                      <img 
                        src={media.previewUrl} 
                        alt="preview" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        onClick={() => removeNewMedia(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-danger transition-colors z-10"
                      >
                        <X size={12} />
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
                className="p-2 text-accent-400 hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-all"
                title="Add Image"
              >
                <ImageIcon size={18} />
              </button>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(false)}
                disabled={isSavingEdit}
                className="text-text-secondary hover:text-text-primary hover:bg-bg-elevated px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center"
              >
                <X size={14} className="mr-1.5" /> Cancel
              </button>
              <button 
                onClick={handleUpdatePost}
                disabled={isSavingEdit || (!editContent.trim() && editMedia.length === 0 && newMediaFiles.length === 0)}
                className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-lg shadow-accent-500/15 flex items-center disabled:opacity-50 transition-colors"
              >
                {isSavingEdit ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                ) : (
                  <Check size={14} className="mr-1.5" />
                )}
                Save
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <p className="text-text-secondary mb-4 text-[15px] leading-relaxed whitespace-pre-wrap">
          {postContent}
        </p>
      )}

      {/* Media */}
      {postMedia.length > 0 && (
        <div className={`mb-4 grid gap-1 ${postMedia.length === 1 ? 'grid-cols-1' : postMedia.length === 2 ? 'grid-cols-2' : postMedia.length === 3 ? 'grid-cols-2' : 'grid-cols-2'} rounded-xl overflow-hidden border border-border-subtle`}>
          {postMedia.map((mediaUrl, idx) => {
            const cleanUrl = mediaUrl.split('#')[0];
            
            // For 3 items, make the first item full width
            const isFullWidth = postMedia.length === 3 && idx === 0;

            return (
              <div key={idx} className={`relative overflow-hidden ${isFullWidth ? 'col-span-2' : ''}`}>
                <img 
                  src={cleanUrl} 
                  alt={`Post media ${idx + 1}`} 
                  className="w-full h-full object-cover max-h-[500px] hover:scale-[1.02] transition-transform duration-500 ease-out cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-1 pt-3">
        <motion.div whileTap={{ scale: 0.85 }}>
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${isLiked ? "text-danger" : "text-text-muted hover:text-danger hover:bg-danger/[0.06]"}`}
          >
            <motion.div
              animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart size={18} className={isLiked ? 'fill-danger' : ''} />
            </motion.div>
            <span className="font-medium">{likes}</span>
          </button>
        </motion.div>
        
        <button 
          onClick={handleToggleComments}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-accent-400 hover:bg-accent-500/[0.06] transition-all duration-200"
        >
          <MessageCircle size={18} />
          <span className="font-medium">{commentCount}</span>
        </button>
        
        <div className="flex-1" />
        
        <button 
          onClick={handleShare}
          className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
        >
          <Share2 size={18} />
        </button>

        {/* Bookmark Button */}
        <motion.div whileTap={{ scale: 0.85 }}>
          <button
            onClick={handleBookmark}
            disabled={isBookmarking}
            className={`p-2 rounded-lg transition-all duration-200 ${isBookmarked ? 'text-accent-400' : 'text-text-muted hover:text-accent-400 hover:bg-accent-500/[0.06]'}`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
          >
            <motion.div
              animate={isBookmarked ? { scale: [1, 1.25, 1], rotate: [0, -12, 0] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Bookmark
                size={18}
                className={isBookmarked ? 'fill-accent-400' : ''}
              />
            </motion.div>
          </button>
        </motion.div>
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
            <div className="pt-4 border-t border-border-subtle mt-3 space-y-4">
              {/* Comment Input */}
              <div className="flex items-center space-x-3 mb-4">
                <img src={user?.profileImage || 'https://i.pravatar.cc/150'} alt="You" className="w-8 h-8 rounded-full object-cover ring-1 ring-border-subtle" />
                <form onSubmit={handleSubmitComment} className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-bg-secondary border border-border-default rounded-full py-2.5 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-accent-500 text-white rounded-full hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={13} />
                  </button>
                </form>
              </div>
              
              {/* Comments List */}
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin"></div>
                </div>
              ) : commentsList.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {commentsList.map(comment => (
                    <CommentItem key={comment._id} comment={comment} postId={post._id} user={user} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-text-muted py-4">No comments yet. Be the first!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
