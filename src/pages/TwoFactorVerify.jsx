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
      const userData = response.data?.user || response.data?.doc || response.data?.data?.user || response.data || response;
      const token = response.token || response.data?.token || response.accessToken || (response.data && response.data.token);
      login(userData, token);
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
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent-500/[0.06] rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-bg-tertiary p-8 rounded-2xl border border-border-default shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-14 h-14 rounded-xl bg-accent-500/15 border border-accent-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <Shield className="text-accent-400" size={28} />
            </motion.div>
            <h1 className="font-display text-2xl text-text-primary">
              Two-Factor Authentication
            </h1>
            <p className="text-text-tertiary mt-2 text-sm">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Timer */}
          <div className="flex justify-center mb-6">
            <div className={`px-4 py-2 rounded-full border text-sm font-mono font-bold ${
              timeLeft < 60
                ? 'border-danger/30 bg-danger/10 text-danger'
                : 'border-border-default bg-bg-secondary text-text-secondary'
            }`}>
              ⏰ {formatTime(timeLeft)}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl mb-6 text-sm text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP digit inputs */}
            <div className="flex gap-2.5 justify-center mb-8" onPaste={handlePaste}>
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border text-text-primary focus:outline-none transition-all ${
                    digit
                      ? 'border-accent-500/60 bg-accent-500/10 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
                      : 'border-border-default bg-bg-secondary focus:border-border-focus'
                  }`}
                />
              ))}
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              disabled={digits.join('').length !== 6 || timeLeft === 0}
              className="w-full"
            >
              Verify Code
            </Button>
          </form>

          <button
            onClick={() => navigate('/login')}
            className="mt-6 flex items-center gap-2 text-text-tertiary hover:text-text-primary text-sm transition-colors mx-auto"
          >
            <ArrowLeft size={15} /> Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};
