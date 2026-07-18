import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { resetPassword } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await resetPassword(token, password, passwordConfirm);
      
      const userData = response.data?.user || response.data?.doc || response;
      if (userData) {
        login(userData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link might be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl text-center relative z-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Password Reset Successfully!</h2>
          <p className="text-slate-300">You are now logged in and will be redirected to the home page shortly.</p>
          <Link to="/" className="inline-block mt-6 text-primary-400 hover:text-primary-300 transition-colors">Go to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">Reset Password</h1>
            <p className="text-slate-400 mt-2">Enter your new password below</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" size={20} />
              <input 
                type="password" 
                required
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                minLength="8"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" size={20} />
              <input 
                type="password" 
                required
                placeholder="Confirm New Password" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                minLength="8"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Reset Password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
