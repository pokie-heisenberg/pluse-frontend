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

  const inputClasses = "w-full bg-bg-secondary border border-border-default rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all text-sm";

  return (
    <div className="max-w-2xl mx-auto relative z-10 pb-20">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 px-4">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h2>
        <p className="text-text-tertiary mt-1 text-sm">Manage your account preferences and settings.</p>
      </motion.div>

      {/* Role-Based UI: Admin Dashboard */}
      {user.role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-accent-500/[0.06] p-6 mx-4 rounded-xl border border-accent-500/15 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-[0.06]">
            <Shield size={80} />
          </div>
          <div className="flex items-center space-x-3 mb-3 relative z-10">
            <div className="bg-accent-500/15 p-2 rounded-xl text-accent-400">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-primary">Admin Dashboard</h3>
          </div>
          <p className="text-text-secondary text-sm mb-5 relative z-10">You have administrator privileges. Manage platform users, view analytics, and moderate content.</p>
          <div className="flex space-x-2.5 relative z-10">
            <Button className="text-sm">Manage Users</Button>
            <Button variant="secondary" className="text-sm">View Analytics</Button>
          </div>
        </motion.div>
      )}

      {/* General Settings — Public Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-bg-tertiary p-6 mx-4 rounded-xl border border-border-default"
      >
        <div className="flex items-center space-x-3 mb-5 border-b border-border-subtle pb-4">
          <User className="text-accent-400" size={20} />
          <h3 className="text-lg font-bold text-text-primary">Public Profile</h3>
        </div>

        {successMsg && (
          <div className="bg-success/10 border border-success/20 text-success p-3 rounded-xl mb-5 text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <img 
                src={photoPreview} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-border-default bg-bg-secondary"
              />
              <label className="absolute bottom-0 right-0 bg-accent-500 hover:bg-accent-600 text-white p-1.5 rounded-full cursor-pointer transition-colors shadow-md">
                <User size={14} />
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
              <h4 className="text-text-primary font-medium text-sm">Profile Picture</h4>
              <p className="text-xs text-text-tertiary mt-0.5">Upload a new avatar (JPEG, PNG).</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Location</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className={inputClasses}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address (Cannot be changed)</label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full bg-bg-primary border border-border-subtle rounded-xl py-3 px-4 text-text-muted cursor-not-allowed text-sm"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <Button type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
      
      {/* Security Section */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.25 }} 
        className="mt-4 bg-bg-tertiary p-6 mx-4 rounded-xl border border-border-default"
      >
        <div className="flex items-center space-x-3 mb-5 border-b border-border-subtle pb-4">
          <Lock className="text-text-tertiary" size={20} />
          <h3 className="text-lg font-bold text-text-primary">Security</h3>
        </div>
        <p className="text-text-tertiary text-sm mb-4">Update your password and secure your account.</p>
        {passwordMsg.text && (
          <div className={`p-3 rounded-xl mb-5 text-sm font-medium ${passwordMsg.type === 'success' ? 'bg-success/10 border border-success/20 text-success' : 'bg-danger/10 border border-danger/20 text-danger'}`}>
            {passwordMsg.text}
          </div>
        )}
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Current Password</label>
            <input 
              type="password" 
              required
              value={passwordCurrent}
              onChange={(e) => setPasswordCurrent(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">New Password</label>
            <input 
              type="password" 
              required
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Confirm New Password</label>
            <input 
              type="password" 
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isUpdatingPassword}>Change Password</Button>
          </div>
        </form>

        {/* 2FA Toggle */}
        <div className="mt-6 pt-5 border-t border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-text-primary font-semibold text-sm flex items-center gap-2">
                <Shield size={16} className="text-accent-400" />
                Two-Factor Authentication
              </h4>
              <p className="text-text-tertiary text-sm mt-1">
                {twoFactorEnabled
                  ? '2FA is active. Your account is extra secure.'
                  : 'Add an extra layer of security to your account.'}
              </p>
            </div>
            <button
              id="toggle-2fa-btn"
              onClick={handleToggle2FA}
              disabled={isToggling2FA}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                twoFactorEnabled
                  ? 'bg-accent-500'
                  : 'bg-bg-elevated border border-border-default'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {twoFAMsg && (
            <p className={`mt-3 text-sm font-medium ${
              twoFAMsg.type === 'success' ? 'text-success' : 'text-danger'
            }`}>
              {twoFAMsg.text}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
