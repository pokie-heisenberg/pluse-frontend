import { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, User as UserIcon, Bell, Bookmark,
  Settings as SettingsIcon, LogOut, Search as SearchIcon, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { getNotifications } from '../services/api';
import { useState } from 'react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, close } = useSidebar();
  const [hasUnread, setHasUnread] = useState(false);

  // Close drawer on route change (mobile)
  useEffect(() => { close(); }, [location.pathname]);

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

  const handleLogout = () => {
    close();
    navigate('/');
    setTimeout(() => { logout(); }, 10);
  };

  const navItems = [
    { icon: Home,        label: 'Home',          path: '/' },
    { icon: SearchIcon,  label: 'Search',        path: '/search' },
    ...(user ? [
      { icon: Bell,         label: 'Notifications', path: '/notifications' },
      { icon: Bookmark,     label: 'Bookmarks',     path: '/bookmarks' },
      { icon: UserIcon,     label: 'Profile',       path: '/profile' },
      { icon: SettingsIcon, label: 'Settings',      path: '/settings' },
    ] : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full pt-8 pb-6 px-5">
      {/* Logo */}
      <div className="px-4 mb-10">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <span className="text-2xl font-extrabold text-text-primary tracking-tight">
            Pluse
          </span>
          <span className="w-2 h-2 rounded-full bg-accent-500 group-hover:bg-accent-400 transition-colors mt-1" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 + i * 0.06, duration: 0.35 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden
                ${isActive 
                  ? 'bg-accent-500/10 text-text-primary' 
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-elevated'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Left accent bar for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBar"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent-500"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <div className="relative">
                    <item.icon
                      size={20}
                      className={`transition-colors duration-200 ${isActive ? 'text-accent-400' : ''}`}
                    />
                    {item.label === 'Notifications' && hasUnread && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full z-20" style={{ animation: 'subtlePulse 2s infinite' }} />
                    )}
                  </div>
                  <span className="font-medium text-[14.5px] tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-border-subtle mx-2 my-2" />

      {/* User / Auth */}
      {user ? (
        <motion.div
          onClick={handleLogout}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group hover:bg-danger/[0.06]"
          title="Click to logout"
        >
          <div className="relative">
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full mr-3 object-cover ring-2 ring-border-default group-hover:ring-danger/40 transition-all"
            />
            <div className="absolute bottom-0 right-3 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-text-primary truncate group-hover:text-danger transition-colors">{user.name}</p>
            <p className="text-xs text-text-tertiary truncate mt-0.5 group-hover:text-danger/60 transition-colors">{user.email}</p>
          </div>
          <LogOut size={16} className="text-text-muted group-hover:text-danger transition-colors" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col space-y-2.5 px-2"
        >
          <button
            onClick={() => { close(); navigate('/login'); }}
            className="w-full py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-accent-500/20 text-sm"
          >
            Log In
          </button>
          <button
            onClick={() => { close(); navigate('/signup'); }}
            className="w-full py-2.5 bg-bg-elevated hover:bg-bg-elevated/80 text-text-primary font-semibold rounded-xl transition-colors border border-border-default text-sm"
          >
            Sign Up
          </button>
        </motion.div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ md) ─────────────────────── */}
      <aside className="fixed left-0 top-0 h-screen w-[280px] bg-bg-tertiary border-r border-border-subtle hidden md:flex flex-col z-50">
        {sidebarContent}
      </aside>

      {/* ── Mobile: backdrop ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile: sliding drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-screen w-[280px] bg-bg-tertiary border-r border-border-subtle flex flex-col z-50 shadow-[4px_0_40px_rgba(0,0,0,0.6)] md:hidden"
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 p-2 rounded-xl bg-bg-elevated hover:bg-bg-elevated/80 text-text-tertiary hover:text-text-primary transition-all z-10"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
