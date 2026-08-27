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
        <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20 text-text-tertiary">
        <p className="text-xl font-medium">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser && profileUser._id === currentUser._id;

  return (
    <div className="max-w-3xl mx-auto relative z-10 pb-20">
      {/* Cover Photo */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="h-36 sm:h-48 md:h-56 rounded-xl bg-gradient-to-br from-accent-600 via-accent-500 to-accent-700 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </motion.div>

      {/* Profile Info */}
      <div className="px-4 sm:px-6 relative -mt-12 sm:-mt-16 md:-mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="relative inline-block">
            <img 
              src={profileUser.profileImage} 
              alt={profileUser.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 border-bg-primary object-cover bg-bg-primary"
            />
            {profileUser.role === 'admin' && (
              <div className="absolute bottom-1 right-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border-2 border-bg-primary">
                Admin
              </div>
            )}
          </div>

          <div className="mt-3 sm:mt-0 flex space-x-2.5">
            {isOwnProfile ? (
              <Link to="/settings">
                <Button variant="secondary" className="rounded-full text-sm py-2 px-4">
                  <Settings size={15} className="mr-1.5" /> Edit Profile
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={handleFollowToggle}
                isLoading={isFollowLoading && followStatus !== 'requested'}
                disabled={followStatus === 'requested'}
                variant={followStatus !== 'none' ? 'secondary' : 'primary'}
                className={`rounded-full text-sm py-2 px-4 ${followStatus === 'requested' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {followStatus === 'none' && <><UserPlus size={15} className="mr-1.5" /> Follow</>}
                {followStatus === 'requested' && <><UserCheck size={15} className="mr-1.5" /> Requested</>}
                {followStatus === 'following' && <><UserMinus size={15} className="mr-1.5" /> Unfollow</>}
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">{profileUser.name}</h1>
          <p className="text-text-tertiary font-medium text-sm mt-0.5">@{profileUser.email.split('@')[0]}</p>
          
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-tertiary">
            <div className="flex items-center"><MapPin size={13} className="mr-1" /> {profileUser.location || 'Unknown Location'}</div>
            <div className="flex items-center"><LinkIcon size={13} className="mr-1 text-accent-400" /> <span className="text-accent-400 cursor-pointer hover:underline">pluse.app/{profileUser.email.split('@')[0]}</span></div>
            <div className="flex items-center"><Calendar size={13} className="mr-1" /> Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
          </div>

          <div className="mt-5 flex gap-4 border-b border-border-subtle pb-5">
            <button
              className="follow-stat-btn"
              onClick={() => setFollowModal({ open: true, mode: 'following' })}
              aria-label="View following"
            >
              <span className="text-xl font-bold text-text-primary">{profileUser.following}</span>
              <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">Following</span>
            </button>
            <button
              className="follow-stat-btn"
              onClick={() => setFollowModal({ open: true, mode: 'followers' })}
              aria-label="View followers"
            >
              <span className="text-xl font-bold text-text-primary">{profileUser.follower}</span>
              <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium">Followers</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* User Posts Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-6"
      >
        <h2 className="text-lg font-bold text-text-primary mb-4 px-4 tracking-tight">{isOwnProfile ? 'Your Recent Posts' : 'Recent Posts'}</h2>
        <div className="border-t border-border-subtle">
          {userPosts.length > 0 ? (
            userPosts.map(post => <PostCard key={post._id} post={post} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-text-tertiary text-sm">{isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>
            </div>
          )}
        </div>
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
