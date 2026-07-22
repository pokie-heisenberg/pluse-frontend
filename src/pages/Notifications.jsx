import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Check, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationsRead, markNotificationRead, deleteNotification, acceptFollow, declineFollow } from '../services/api';
import { Button } from '../components/Button';
import toast from 'react-hot-toast';

const getIconForType = (type) => {
  switch (type) {
    case 'like': return <Heart size={20} className="text-pink-500 fill-pink-500" />;
    case 'comment': return <MessageCircle size={20} className="text-blue-500 fill-blue-500/20" />;
    case 'follow': return <UserPlus size={20} className="text-green-500" />;
    default: return <Bell size={20} className="text-primary-500" />;
  }
};

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const removeNotification = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove notification');
    }
  };

  const handleAcceptFollow = async (senderId, notificationId) => {
    try {
      await acceptFollow(senderId);
      toast.success('Follow request accepted!');
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      toast.error('Failed to accept follow request.');
      console.error(error);
    }
  };

  const handleDeclineFollow = async (senderId, notificationId) => {
    try {
      await declineFollow(senderId);
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Follow request declined.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to decline request.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-0 py-4 sm:py-8">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-500 tracking-tight">Notifications</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Stay updated with your latest interactions.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button variant="ghost" onClick={handleMarkAllRead} className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 flex items-center text-sm">
            <Check size={16} className="mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl"
          >
            <Bell size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-slate-400">No new notifications right now.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification, idx) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                className={`relative overflow-hidden flex items-start p-5 rounded-2xl border transition-all duration-300 ${notification.isRead ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.06] border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]'}`}
              >
                {!notification.isRead && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500 to-accent-500" />
                )}
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mr-4 shrink-0 shadow-inner">
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-[15px] leading-relaxed ${notification.isRead || notification.read ? 'text-slate-300' : 'text-white font-medium'}`}>
                    <span className="font-bold">{notification.sender?.name}</span> {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {notification.type === 'follow_request' && (
                    <div className="mt-3 flex space-x-2">
                      <Button 
                        onClick={() => handleAcceptFollow(notification.sender?._id, notification._id)}
                        className="py-1.5 px-4 text-xs shadow-lg shadow-primary-500/20"
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => handleDeclineFollow(notification.sender?._id, notification._id)}
                        className="py-1.5 px-4 text-xs"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeNotification(notification._id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
