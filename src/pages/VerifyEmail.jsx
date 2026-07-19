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
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
          
          {/* LOADING */}
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center">
                <Loader className="text-accent-400 animate-spin" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
              <p className="text-slate-400">Please wait a moment.</p>
            </motion.div>
          )}

          {/* PENDING (just signed up, no token) */}
          {status === 'pending' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-accent-500/20 flex items-center justify-center">
                <Mail className="text-accent-400" size={40} />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-primary-400">
                Check Your Email
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                We've sent a verification link to your email address.
                Click the link in the email to activate your account.
              </p>
              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
                <p className="text-slate-400 text-xs">
                  Didn't receive the email? Check your spam folder, or{' '}
                  <Link to="/signup" className="text-accent-400 hover:text-accent-300 underline">
                    try signing up again.
                  </Link>
                </p>
              </div>
              <Link
                to="/login"
                className="mt-2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                Already verified? Sign in →
              </Link>
            </motion.div>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="text-green-400" size={40} />
              </motion.div>
              <h1 className="text-2xl font-bold text-green-400">Email Verified!</h1>
              <p className="text-slate-300 text-sm">
                Your account is now active. Redirecting you to the home page...
              </p>
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-green-400 rounded-full"
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="text-red-400" size={40} />
              </div>
              <h1 className="text-2xl font-bold text-red-400">Verification Failed</h1>
              <p className="text-slate-400 text-sm">{errorMessage}</p>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Link
                  to="/signup"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-600 to-primary-500 text-white font-semibold text-center hover:opacity-90 transition-opacity"
                >
                  Sign Up Again
                </Link>
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl border border-white/10 text-slate-300 font-semibold text-center hover:bg-white/5 transition-colors"
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
