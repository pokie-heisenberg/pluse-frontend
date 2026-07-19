import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { verifyOTP } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const TwoFactorVerify = () => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // userId is passed via router state from Login page
  const userId = location.state?.userId;

  // Redirect if no userId
  useEffect(() => {
    if (!userId) navigate('/login', { replace: true });
  }, [userId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) return setError('Please enter the complete 6-digit code');

    setIsLoading(true);
    setError('');
    try {
      const response = await verifyOTP(userId, otp);
      const userData = response.data?.user || response.data?.doc;
      login(userData, response.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/30 to-accent-500/30 border border-primary-500/30 flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="text-primary-400" size={32} />
            </motion.div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
              Two-Factor Authentication
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Timer */}
          <div className="flex justify-center mb-6">
            <div className={`px-4 py-2 rounded-full border text-sm font-mono font-bold ${
              timeLeft < 60
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-white/10 bg-white/5 text-slate-300'
            }`}>
              ⏰ {formatTime(timeLeft)}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP digit inputs */}
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border bg-white/5 text-white focus:outline-none transition-all ${
                    digit
                      ? 'border-primary-500/70 bg-primary-500/10 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                      : 'border-white/10 focus:border-primary-500/50'
                  }`}
                />
              ))}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={digits.join('').length !== 6 || timeLeft === 0}
              className="w-full bg-gradient-to-r from-primary-600 to-accent-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            >
              Verify Code
            </Button>
          </form>

          <button
            onClick={() => navigate('/login')}
            className="mt-6 flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mx-auto"
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};
