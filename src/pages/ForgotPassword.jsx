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
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/[0.06] rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-bg-tertiary p-8 rounded-2xl border border-border-default shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-text-primary">Forgot Password</h1>
            <p className="text-text-tertiary mt-2 text-sm">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-success/10 border border-success/20 text-success p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-400 transition-colors" size={18} />
              <input 
                type="email" 
                required
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-secondary border border-border-default rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all text-sm"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Send Reset Link
            </Button>
          </form>

          <p className="mt-8 text-center text-text-tertiary text-sm">
            Remember your password? <Link to="/login" className="text-accent-400 font-semibold hover:text-accent-300 transition-colors">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
