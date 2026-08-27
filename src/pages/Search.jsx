import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../services/api';

export const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const res = await searchUsers(query);
        if (res.status === 'success') {
          setResults(res.data.result);
        }
      } catch (err) {
        setError('Failed to fetch search results.');
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(() => {
      fetchResults();
    }, 500);

    return () => clearTimeout(timerId);
  }, [query]);

  return (
    <div className="max-w-full mx-auto relative z-10 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-2 pb-4 mb-4"
      >
        <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          Search Users <SearchIcon className="text-accent-400" size={18} />
        </h2>
      </motion.div>

      {/* Search Input */}
      <motion.div 
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="relative mx-4 mb-6"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-text-muted" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3.5 bg-bg-secondary border border-border-default rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all text-sm"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="w-5 h-5 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
          </div>
        )}
      </motion.div>

      {error && <div className="text-danger mb-4 text-sm px-4">{error}</div>}

      {/* Results */}
      <div className="border-t border-border-subtle">
        <AnimatePresence mode="popLayout">
          {query.trim() && !isLoading && results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-text-tertiary text-sm">No users found for "{query}"</p>
            </motion.div>
          ) : (
            results.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link 
                  to={`/profile/${user._id}`}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-bg-secondary/50 border-b border-border-subtle transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-border-subtle group-hover:ring-accent-500/30 transition-all"
                    />
                    <div>
                      <h3 className="text-text-primary font-semibold text-sm group-hover:text-accent-400 transition-colors">{user.name}</h3>
                      <p className="text-xs text-text-tertiary">@{user.email.split('@')[0]}</p>
                    </div>
                  </div>
                  <div className="text-text-muted group-hover:text-accent-400 transition-colors">
                    <ArrowRight size={18} />
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
