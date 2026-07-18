import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto relative z-10 pb-20">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 bg-[#030303]/60 backdrop-blur-xl pb-4 pt-4 mb-8 border-b border-white/5"
      >
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
          Search Users <SearchIcon className="ml-2 text-primary-400" size={20} />
        </h2>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-lg"
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />
          </div>
        )}
      </motion.div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {query.trim() && !isLoading && results.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
            >
              <p className="text-slate-400">No users found for "{query}"</p>
            </motion.div>
          ) : (
            results.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={`/profile/${user._id}`}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={user.profileImage} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-primary-500/50 transition-all"
                    />
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-primary-400 transition-colors">{user.name}</h3>
                      <p className="text-sm text-slate-400">@{user.email.split('@')[0]}</p>
                    </div>
                  </div>
                  <div className="text-slate-500 group-hover:text-primary-400 transition-colors">
                    <ArrowRight size={20} />
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
