import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserCheck, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserFollowers, getUserFollowing } from '../services/api';

/**
 * FollowListModal
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - userId: string  – whose followers/following to load
 *  - mode: 'followers' | 'following'
 *  - title: string   – display title override (optional)
 */
export const FollowListModal = ({ isOpen, onClose, userId, mode = 'followers', title }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const overlayRef = useRef(null);

  // Fetch list whenever modal opens or mode / userId change
  useEffect(() => {
    if (!isOpen || !userId) return;
    setUsers([]);
    setQuery('');
    setIsLoading(true);

    const fetch = mode === 'followers' ? getUserFollowers : getUserFollowing;
    fetch(userId)
      .then((res) => setUsers(res?.data?.users || []))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, [isOpen, userId, mode]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const filtered = users.filter((u) =>
    u?.name?.toLowerCase().includes(query.toLowerCase()) ||
    u?.email?.toLowerCase().includes(query.toLowerCase())
  );

  const displayTitle = title || (mode === 'followers' ? 'Followers' : 'Following');
  const Icon = mode === 'followers' ? Users : UserCheck;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          key="follow-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="follow-modal-overlay"
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          <motion.div
            key="follow-modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 40 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="follow-modal-panel"
          >
            {/* Header */}
            <div className="follow-modal-header">
              <div className="follow-modal-title">
                <Icon size={20} className="follow-modal-icon" />
                <span>{displayTitle}</span>
              </div>
              <button className="follow-modal-close" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="follow-modal-search-wrap">
              <Search size={16} className="follow-modal-search-icon" />
              <input
                type="text"
                className="follow-modal-search"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="follow-modal-list">
              {isLoading ? (
                <div className="follow-modal-loading">
                  <Loader2 size={28} className="animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="follow-modal-empty">
                  <Icon size={40} style={{ opacity: 0.25, marginBottom: '12px' }} />
                  <p>{query ? 'No results found.' : `No ${displayTitle.toLowerCase()} yet.`}</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((u, i) => (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/profile/${u._id}`}
                        className="follow-modal-user-row"
                        onClick={onClose}
                      >
                        <img
                          src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff`}
                          alt={u.name}
                          className="follow-modal-avatar"
                        />
                        <div className="follow-modal-user-info">
                          <span className="follow-modal-user-name">{u.name}</span>
                          <span className="follow-modal-user-handle">
                            @{u.email?.split('@')[0]}
                          </span>
                        </div>
                        <div className="follow-modal-user-badge">
                          <UserCheck size={14} />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowListModal;
