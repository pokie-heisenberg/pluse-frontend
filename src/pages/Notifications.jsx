import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Check, Trash2 } from 'lucide-react';
import { getNotifications, markNotificationsRead, markNotificationRead, deleteNotification, acceptFollow, declineFollow } from '../services/api';
import { Button } from '../components/Button';
import toast from 'react-hot-toast';

const getIconForType = (type) => {
  switch (type) {
    case 'like': return <Heart size={18} className="text-danger fill-danger" />;
    case 'comment': return <MessageCircle size={18} className="text-info fill-info/20" />;
    case 'follow': 
    case 'follow_request': return <UserPlus size={18} className="text-success" />;
    default: return <Bell size={18} className="text-accent-400" />;
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

  const handleAcceptFollow = async (sender, notificationId) => {
    try {
      const senderId = typeof sender === 'object' ? sender?._id : sender;
      await acceptFollow(senderId);
      toast.success('Follow request accepted!');
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      toast.error('Failed to accept follow request.');
      console.error(error);
    }
  };

  const handleDeclineFollow = async (sender, notificationId) => {
    try {
      const senderId = typeof sender === 'object' ? sender?._id : sender;
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
    <div className="max-w-3xl mx-auto px-0 py-4 sm:py-6">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6 px-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Notifications</h1>
          <p className="text-text-tertiary mt-1 text-sm">Stay updated with your latest interactions.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllRead} 
            className="text-text-secondary hover:text-text-primary bg-bg-elevated hover:bg-bg-elevated/80 rounded-xl px-3 py-2 flex items-center text-sm transition-colors border border-border-subtle"
          >
            <Check size={15} className="mr-1.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="border-t border-border-subtle">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 text-center"
          >
            <div className="w-14 h-14 bg-bg-elevated rounded-xl flex items-center justify-center mx-auto mb-4 border border-border-subtle">
              <Bell size={24} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">You're all caught up!</h3>
            <p className="text-text-tertiary text-sm">No new notifications right now.</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification, idx) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.03, duration: 0.3 }}
                className={`relative flex items-start px-4 py-4 border-b border-border-subtle transition-colors duration-200 hover:bg-bg-secondary/50 ${notification.isRead ? '' : 'bg-accent-500/[0.03]'}`}
              >
                {/* Unread indicator bar */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-accent-500" />
                )}
                <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center mr-3 shrink-0 border border-border-subtle">
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className={`text-sm leading-relaxed ${notification.isRead || notification.read ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                    <span className="font-semibold">{notification.sender?.name}</span> {notification.message}
                  </p>
                  <p className="font-mono text-[10px] text-text-muted mt-1 uppercase tracking-wider">
                    {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {notification.type === 'follow_request' && (
                    <div className="mt-2.5 flex space-x-2">
                      <Button 
                        onClick={() => handleAcceptFollow(notification.sender, notification._id)}
                        className="py-1 px-3 text-xs"
                        size="sm"
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => handleDeclineFollow(notification.sender, notification._id)}
                        className="py-1 px-3 text-xs"
                        size="sm"
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeNotification(notification._id)}
                  className="p-2 text-text-muted hover:text-danger hover:bg-danger/[0.06] rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
