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
        login(userData, response.token);
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

  const inputClasses = "w-full bg-bg-secondary border border-border-default rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all text-sm";

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/[0.06] rounded-full blur-[120px]" />
        <div className="bg-bg-tertiary p-8 rounded-2xl border border-border-default shadow-2xl text-center relative z-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-success mb-4">Password Reset Successfully!</h2>
          <p className="text-text-secondary text-sm">You are now logged in and will be redirected to the home page shortly.</p>
          <Link to="/" className="inline-block mt-6 text-accent-400 hover:text-accent-300 transition-colors text-sm">Go to Home</Link>
        </div>
      </div>
    );
  }

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
            <h1 className="font-display text-3xl text-text-primary">Reset Password</h1>
            <p className="text-text-tertiary mt-2 text-sm">Enter your new password below</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-400 transition-colors" size={18} />
              <input 
                type="password" 
                required
                placeholder="New Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                minLength="8"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-400 transition-colors" size={18} />
              <input 
                type="password" 
                required
                placeholder="Confirm New Password" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={inputClasses}
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
