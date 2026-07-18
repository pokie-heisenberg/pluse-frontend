import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '../components/Button';
import { forgotPassword } from '../services/api';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      await forgotPassword(email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">Forgot Password</h1>
            <p className="text-slate-400 mt-2">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-6 text-sm text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-400 transition-colors" size={20} />
              <input 
                type="email" 
                required
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Send Reset Link
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            Remember your password? <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
