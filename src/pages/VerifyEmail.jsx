import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';
import { verifyEmail } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'pending'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      // No token - show "pending verification" screen
      setStatus('pending');
      return;
    }

    const doVerify = async () => {
      try {
        setStatus('loading');
        const response = await verifyEmail(token);
        // Backend returns user + token on success
        const userData = response.data?.user || response.data?.doc;
        if (userData) {
          login(userData, response.token);
        }
        setStatus('success');
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || 'Verification failed. The link may be invalid or expired.'
        );
        setStatus('error');
      }
    };

    doVerify();
  }, [token]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/[0.06] rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-bg-tertiary p-8 rounded-2xl border border-border-default shadow-2xl text-center">
          
          {/* LOADING */}
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl bg-accent-500/15 border border-accent-500/20 flex items-center justify-center">
                <Loader className="text-accent-400 animate-spin" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Verifying your email...</h1>
              <p className="text-text-tertiary text-sm">Please wait a moment.</p>
            </motion.div>
          )}

          {/* PENDING (just signed up, no token) */}
          {status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-accent-500/15 border border-accent-500/20 flex items-center justify-center">
                <Mail className="text-accent-400" size={32} />
              </div>
              <h1 className="font-display text-2xl text-text-primary">
                Check Your Email
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                We've sent a verification link to your email address.
                Click the link in the email to activate your account.
              </p>
              <div className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-4 mt-2">
                <p className="text-text-muted text-xs">
                  Didn't receive the email? Check your spam folder, or{' '}
                  <Link to="/signup" className="text-accent-400 hover:text-accent-300 underline">
                    try signing up again.
                  </Link>
                </p>
              </div>
              <Link
                to="/login"
                className="mt-2 text-text-tertiary hover:text-text-primary text-sm transition-colors"
              >
                Already verified? Sign in →
              </Link>
            </motion.div>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-xl bg-success/15 border border-success/20 flex items-center justify-center"
              >
                <CheckCircle className="text-success" size={32} />
              </motion.div>
              <h1 className="text-2xl font-bold text-success">Email Verified!</h1>
              <p className="text-text-secondary text-sm">
                Your account is now active. Redirecting you to the home page...
              </p>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-success rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <Link to="/" className="mt-2 text-accent-400 hover:text-accent-300 text-sm transition-colors">
                Go to Home →
              </Link>
            </motion.div>
          )}

          {/* ERROR */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-danger/15 border border-danger/20 flex items-center justify-center">
                <XCircle className="text-danger" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-danger">Verification Failed</h1>
              <p className="text-text-tertiary text-sm">{errorMessage}</p>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Link
                  to="/signup"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold text-center text-sm hover:brightness-110 transition-all"
                >
                  Sign Up Again
                </Link>
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl border border-border-default text-text-secondary font-semibold text-center text-sm hover:bg-bg-elevated transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
