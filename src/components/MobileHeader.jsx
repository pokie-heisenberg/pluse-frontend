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
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4
                 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 shadow-lg"
    >
      {/* Hamburger */}
      <button
        onClick={toggle}
        aria-label="Open menu"
        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/8 active:bg-white/12 transition-all"
      >
        <Menu size={22} />
      </button>

      {/* Logo / Brand */}
      <Link to="/" className="flex items-center gap-1.5 select-none">
        <img
          src="/logo.png"
          alt="Pluse"
          className="h-7 w-auto"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <span
          className="hidden text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400 tracking-tight"
        >
          PLUSE
        </span>
      </Link>

      {/* Avatar / Bell */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/notifications" aria-label="Notifications" className="relative p-1.5 text-slate-300 hover:text-white transition-colors">
              <Bell size={22} />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1a1a] z-20 animate-pulse"></span>
              )}
            </Link>
            <Link to="/profile" aria-label="My profile">
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 hover:ring-primary-500/60 transition-all"
              />
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors px-3 py-1.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20"
          >
            Log In
          </Link>
        )}
      </div>
    </motion.header>
  );
};
