import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { loginUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(email, password);

      if (response.status === 'otp_required') {
        navigate('/2fa', { state: { userId: response.userId } });
        return;
      }

      const userData = response.data?.user || response.data?.doc || response;
      login(userData, response.token);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/[0.06] rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-bg-tertiary p-8 rounded-2xl border border-border-default shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-text-primary">Welcome Back</h1>
            <p className="text-text-tertiary mt-2 text-sm">Log in to your Pluse account</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm text-center font-medium">
              {error}
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

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-400 transition-colors" size={18} />
              <input 
                type="password" 
                required
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-secondary border border-border-default rounded-xl py-3 pl-11 pr-4 text-text-primary placeholder-text-muted focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)] transition-all text-sm"
              />
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-accent-400 hover:text-accent-300 transition-colors">Forgot password?</Link>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-text-tertiary text-sm">
            Don't have an account? <Link to="/signup" className="text-accent-400 font-semibold hover:text-accent-300 transition-colors">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
