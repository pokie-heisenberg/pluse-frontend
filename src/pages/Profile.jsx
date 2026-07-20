import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Settings, MapPin, Link as LinkIcon, Calendar, Loader2, UserPlus, UserMinus, UserCheck } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { FollowListModal } from '../components/FollowListModal';
import { getUserProfile, followUser, unfollowUser, getUserPosts } from '../services/api';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState('none'); // none, requested, following
  const [userPosts, setUserPosts] = useState([]);
  const [followModal, setFollowModal] = useState({ open: false, mode: 'followers' });

  useEffect(() => {
    const fetchProfile = async () => {
      const targetId = id || (currentUser ? currentUser._id : null);
      if (!targetId) return;
      
      setIsLoading(true);
      try {
        if (currentUser && targetId === currentUser._id) {
          setProfileUser(currentUser);
        } else {
          const res = await getUserProfile(targetId);
          if (res.status === 'success') {
            const userData = res.data.doc;
            setProfileUser(userData);
            
            if (userData.isFollowed) {
              setFollowStatus('following');
            } else if (userData.isRequested) {
              setFollowStatus('requested');
            } else {
              setFollowStatus('none');
            }
          }
        }
        
        const posts = await getUserPosts(targetId);
        setUserPosts(posts);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast('Please log in to follow users', { icon: '👋' });
      navigate('/login');
      return;
    }
    if (!profileUser) return;

    // Requested state: button should do nothing
    if (followStatus === 'requested') return;

    setIsFollowLoading(true);
    try {
      if (followStatus === 'none') {
        // Send a follow request
        const res = await followUser(profileUser._id);
        if (res.status === 'success') {
          setFollowStatus('requested');
          toast.success(`Follow request sent to ${profileUser.name}`);
        }
      } else if (followStatus === 'following') {
        // Unfollow the user
        const res = await unfollowUser(profileUser._id);
        if (res.status === 'success') {
          setFollowStatus('none');
          toast.success(`Unfollowed ${profileUser.name}`);
        }
      }
    } catch (err) {
      toast.error('Action failed. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-xl">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser && profileUser._id === currentUser._id;

  return (
    <div className="max-w-3xl mx-auto relative z-10 pb-20">
      {/* Cover Photo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-48 md:h-64 rounded-b-3xl bg-gradient-to-r from-primary-600 to-accent-500 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </motion.div>

      {/* Profile Info */}
      <div className="px-6 relative -mt-16 sm:-mt-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="relative inline-block">
            <img 
              src={profileUser.profileImage} 
              alt={profileUser.name} 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-[#030303] object-cover bg-[#030303]"
            />
            {profileUser.role === 'admin' && (
              <div className="absolute bottom-2 right-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border-2 border-[#030303]">
                Admin
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-3">
            {isOwnProfile ? (
              <Link to="/settings">
                <Button variant="secondary" className="rounded-full shadow-lg border-white/10 bg-white/5 backdrop-blur-md">
                  <Settings size={18} className="mr-2" /> Edit Profile
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={handleFollowToggle}
                isLoading={isFollowLoading && followStatus !== 'requested'}
                disabled={followStatus === 'requested'}
                variant={followStatus !== 'none' ? 'secondary' : 'primary'}
                className={`rounded-full shadow-lg ${followStatus === 'requested' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {followStatus === 'none' && <><UserPlus size={18} className="mr-2" /> Follow</>}
                {followStatus === 'requested' && <><UserCheck size={18} className="mr-2" /> Requested</>}
                {followStatus === 'following' && <><UserMinus size={18} className="mr-2" /> Unfollow</>}
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <h1 className="text-3xl font-bold text-white">{profileUser.name}</h1>
          <p className="text-slate-400 font-medium">@{profileUser.email.split('@')[0]}</p>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center"><MapPin size={16} className="mr-1" /> {profileUser.location || 'Unknown Location'}</div>
            <div className="flex items-center"><LinkIcon size={16} className="mr-1 text-primary-400" /> <span className="text-primary-400 cursor-pointer hover:underline">pluse.app/{profileUser.email.split('@')[0]}</span></div>
            <div className="flex items-center"><Calendar size={16} className="mr-1" /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>

          <div className="mt-6 flex gap-6 border-b border-white/10 pb-6">
            <button
              className="follow-stat-btn"
              onClick={() => setFollowModal({ open: true, mode: 'following' })}
              aria-label="View following"
            >
              <span className="text-2xl font-bold text-white">{profileUser.following}</span>
              <span className="text-sm text-slate-400 uppercase tracking-wider font-medium">Following</span>
            </button>
            <button
              className="follow-stat-btn"
              onClick={() => setFollowModal({ open: true, mode: 'followers' })}
              aria-label="View followers"
            >
              <span className="text-2xl font-bold text-white">{profileUser.follower}</span>
              <span className="text-sm text-slate-400 uppercase tracking-wider font-medium">Followers</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* User Posts Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 px-4 sm:px-0"
      >
        <h2 className="text-xl font-bold text-white mb-6 tracking-tight">{isOwnProfile ? 'Your Recent Posts' : 'Recent Posts'}</h2>
        {userPosts.length > 0 ? (
          userPosts.map(post => <PostCard key={post._id} post={post} />)
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-slate-400">{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
          </div>
        )}
      </motion.div>

      {/* Followers / Following Modal */}
      <FollowListModal
        isOpen={followModal.open}
        onClose={() => setFollowModal((s) => ({ ...s, open: false }))}
        userId={profileUser._id}
        mode={followModal.mode}
      />
    </div>
  );
};
