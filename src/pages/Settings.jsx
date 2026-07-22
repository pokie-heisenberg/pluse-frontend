import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Shield, User, Bell, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { updateProfile, updatePassword, toggleTwoFactor } from '../services/api';

export const Settings = () => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profileImage);
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnable || false);
  const [isToggling2FA, setIsToggling2FA] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState(null);

  const handleToggle2FA = async () => {
    setIsToggling2FA(true);
    setTwoFAMsg(null);
    try {
      const res = await toggleTwoFactor();
      setTwoFactorEnabled(res.twoFactorEnable);
      setTwoFAMsg({
        type: 'success',
        text: res.twoFactorEnable
          ? '2FA enabled! Your account is now more secure.'
          : '2FA disabled.',
      });
    } catch (err) {
      setTwoFAMsg({ type: 'error', text: 'Failed to toggle 2FA. Please try again.' });
    } finally {
      setIsToggling2FA(false);
    }
  };

  if (!user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg('');
    try {
      const res = await updateProfile({ name, location }, photo);
      // Update local context state
      login(res.data.updateUser || res.data.doc || res.data.user);
      setSuccessMsg('Profile updated successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordNew !== passwordConfirm) {
      return setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
    }
    setIsUpdatingPassword(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const res = await updatePassword(passwordCurrent, passwordNew, passwordConfirm);
      login(res.data.user);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
    } catch (error) {
      setPasswordMsg({ type: 'error', text: 'Failed to update password. Check your current password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto relative z-10 pb-20">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">Manage your account preferences and settings.</p>
      </motion.div>

      {/* Role-Based UI: Admin Dashboard */}
      {user.role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-primary-900/40 to-accent-900/20 backdrop-blur-xl p-6 rounded-3xl border border-primary-500/30 mb-8 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={100} />
          </div>
          <div className="flex items-center space-x-3 mb-4 relative z-10">
            <div className="bg-primary-500/20 p-2 rounded-xl text-primary-400">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Admin Dashboard</h3>
          </div>
          <p className="text-slate-300 mb-6 relative z-10">You have administrator privileges. You can manage platform users, view analytics, and moderate content.</p>
          <div className="flex space-x-3 relative z-10">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white">Manage Users</Button>
            <Button variant="secondary">View Analytics</Button>
          </div>
        </motion.div>
      )}

      {/* General Settings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl"
      >
        <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
          <User className="text-primary-400" size={24} />
          <h3 className="text-xl font-bold text-white">Public Profile</h3>
        </div>

        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-6 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="relative">
              <img 
                src={photoPreview} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white/10 bg-black/50"
              />
              <label className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                <User size={16} />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setPhoto(e.target.files[0]);
                      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <h4 className="text-white font-medium">Profile Picture</h4>
              <p className="text-sm text-slate-400 mt-1">Upload a new avatar (JPEG, PNG).</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address (Cannot be changed)</label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
      
      {/* Placeholder Sections */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 opacity-70">
        <div className="flex items-center space-x-3 mb-6 border-b border-white/10 pb-4">
          <Lock className="text-slate-400" size={24} />
          <h3 className="text-xl font-bold text-white">Security</h3>
        </div>
        <p className="text-slate-400 mb-4">Update your password and secure your account.</p>
        {passwordMsg.text && (
          <div className={`p-3 rounded-xl mb-6 text-sm ${passwordMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {passwordMsg.text}
          </div>
        )}
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
            <input 
              type="password" 
              required
              value={passwordCurrent}
              onChange={(e) => setPasswordCurrent(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
            <input 
              type="password" 
              required
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>
          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isUpdatingPassword}>Change Password</Button>
          </div>
        </form>

        {/* 2FA Toggle */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Shield size={18} className="text-primary-400" />
                Two-Factor Authentication
              </h4>
              <p className="text-slate-400 text-sm mt-1">
                {twoFactorEnabled
                  ? '2FA is active. Your account is extra secure.'
                  : 'Add an extra layer of security to your account.'}
              </p>
            </div>
            <button
              id="toggle-2fa-btn"
              onClick={handleToggle2FA}
              disabled={isToggling2FA}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${
                twoFactorEnabled
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                  : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                  twoFactorEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {twoFAMsg && (
            <p className={`mt-3 text-sm ${
              twoFAMsg.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {twoFAMsg.text}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
