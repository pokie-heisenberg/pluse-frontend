import { Menu, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getNotifications } from '../services/api';

/**
 * MobileHeader — shown only on mobile (< md).
 * Contains hamburger toggle, logo text, quick notifications, and quick avatar link.
 */
export const MobileHeader = () => {
  const { toggle } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (user) {
      if (location.pathname === '/notifications') {
        setHasUnread(false);
      } else {
        const fetchUnread = async () => {
          try {
            const data = await getNotifications();
            setHasUnread(data.some(n => !n.read));
          } catch (err) {
            console.error(err);
          }
        };
        fetchUnread();
      }
    }
  }, [user, location.pathname]);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4
                 bg-bg-primary/90 backdrop-blur-xl border-b border-border-subtle"
    >
      {/* Hamburger */}
      <button
        onClick={toggle}
        aria-label="Open menu"
        className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-bg-elevated active:bg-bg-elevated/80 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* Logo / Brand */}
      <Link to="/" className="flex items-center gap-1.5 select-none">
        <span className="text-lg font-extrabold text-text-primary tracking-tight">
          Pluse
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-0.5" />
      </Link>

      {/* Avatar / Bell */}
      <div className="flex items-center gap-2.5">
        {user ? (
          <>
            <Link to="/notifications" aria-label="Notifications" className="relative p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-elevated rounded-xl transition-all">
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full z-20" style={{ animation: 'subtlePulse 2s infinite' }} />
              )}
            </Link>
            <Link to="/profile" aria-label="My profile">
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-border-default hover:ring-accent-500/50 transition-all"
              />
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm font-semibold text-accent-400 hover:text-accent-300 transition-colors px-3 py-1.5 rounded-xl bg-accent-500/10 hover:bg-accent-500/15"
          >
            Log In
          </Link>
        )}
      </div>
    </motion.header>
  );
};
