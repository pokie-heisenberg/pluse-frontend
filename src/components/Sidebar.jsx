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
    <div className="flex flex-col h-full pt-8 pb-6 px-4">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center px-4 mb-12 relative group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full scale-50" />
        <img
          src="/logo.png"
          alt="Pluse"
          className="w-32 h-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden flex-col items-center relative z-10">
          <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-primary-400 via-primary-500 to-accent-400 tracking-tighter">
            P<span className="text-primary-500 inline-block translate-x-[-15px]">+</span>
          </div>
          <h1 className="text-xl font-bold tracking-[0.3em] mt-2 text-white">PLUSE</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.07 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
                ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-500/10 border border-white/10 rounded-2xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative">
                    <item.icon
                      size={22}
                      className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-400' : ''}`}
                    />
                    {item.label === 'Notifications' && hasUnread && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1a1a] z-20 animate-pulse" />
                    )}
                  </div>
                  <span className="relative z-10 font-medium tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User / Auth */}
      {user ? (
        <motion.div
          onClick={handleLogout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-auto border-t border-white/10 pt-6 flex items-center px-4 hover:bg-red-500/10 p-3 rounded-2xl cursor-pointer transition-all group"
          title="Click to logout"
        >
          <div className="relative">
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-11 h-11 rounded-full mr-3 object-cover ring-2 ring-white/10 group-hover:ring-red-500/50 transition-all"
            />
            <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-white truncate group-hover:text-red-400 transition-colors">{user.name}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5 group-hover:text-red-400/70 transition-colors">{user.email}</p>
          </div>
          <LogOut size={18} className="text-slate-500 group-hover:text-red-400 transition-colors" />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-auto border-t border-white/10 pt-6 flex flex-col space-y-3 px-2"
        >
          <button
            onClick={() => { close(); navigate('/login'); }}
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
          >
            Log In
          </button>
          <button
            onClick={() => { close(); navigate('/signup'); }}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors border border-white/10"
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
      <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-dark/40 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col z-50 shadow-2xl">
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
            transition={{ duration: 0.22 }}
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
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed left-0 top-0 h-screen w-72 bg-[#0a0a0f]/95 backdrop-blur-2xl border-r border-white/8 flex flex-col z-50 shadow-[4px_0_40px_rgba(0,0,0,0.6)] md:hidden"
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
