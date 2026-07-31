import React, { useState } from 'react';
import { soundFx } from '../lib/sound';
import { authenticateUser, resetUserPassword, DEFAULT_RECOVERY_KEY } from '../lib/auth';
import { KeyRound, User, Lock, Sparkles, UserCheck, Eye, ShieldAlert, X, ShieldCheck, RefreshCw, Info } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (username: string) => void;
  onGuestLogin: () => void;
  onClose?: () => void;
  sfxEnabled?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  onGuestLogin,
  onClose,
  sfxEnabled = true
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'reset'>('login');
  
  // Login State
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Reset State
  const [resetUsername, setResetUsername] = useState<string>('');
  const [recoveryKey, setRecoveryKey] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter a username.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter a passcode.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authenticateUser(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        if (sfxEnabled) soundFx.playPostSuccess();
        onLogin(res.user.username);
      } else {
        if (sfxEnabled) soundFx.playClick();
        setErrorMsg(res.error || 'Authentication failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('An unexpected error occurred during authentication.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetUsername.trim()) {
      setErrorMsg('Please enter the username to reset.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('Please enter a new passcode.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passcodes do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetUserPassword({
        username: resetUsername,
        recoveryKeyOrOldPass: recoveryKey,
        newPasscode: newPassword
      });
      setIsLoading(false);

      if (res.success) {
        if (sfxEnabled) soundFx.playPostSuccess();
        setSuccessMsg(res.message);
        setUsername(resetUsername);
        setPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setActiveTab('login');
        }, 1500);
      } else {
        if (sfxEnabled) soundFx.playClick();
        setErrorMsg(res.message);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Failed to reset password.');
    }
  };

  const handleGuestClick = () => {
    if (sfxEnabled) soundFx.playClick();
    onGuestLogin();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-pixel">
      <div className="w-full max-w-md bg-[#fef2f8] dark:bg-[#1d1233] border-4 border-pink-400 dark:border-purple-600 shadow-[0_0_30px_rgba(244,184,228,0.7)] p-0 rounded-none overflow-hidden relative">
        
        {/* Top Retro System Header Bar */}
        <div className="bg-[#2a1740] text-pink-200 px-4 py-2.5 flex justify-between items-center border-b-2 border-purple-800 font-bold text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse shadow-[0_0_8px_#f4b8e4]"></span>
            <span className="tracking-wider text-pink-300">USER AUTHENTICATION PORTAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-purple-300">SHA-256 SECURE</span>
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  if (sfxEnabled) soundFx.playClick();
                  onClose();
                }}
                className="p-0.5 hover:bg-pink-400/30 text-pink-300 hover:text-white transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 bg-[#1b0e33] border-b-2 border-purple-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              if (sfxEnabled) soundFx.playClick();
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'login'
                ? 'bg-[#fef2f8] dark:bg-[#1d1233] text-pink-600 dark:text-pink-300 border-b-2 border-pink-500'
                : 'text-purple-400 hover:text-pink-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>LOG IN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (sfxEnabled) soundFx.playClick();
              setActiveTab('reset');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'reset'
                ? 'bg-[#fef2f8] dark:bg-[#1d1233] text-pink-600 dark:text-pink-300 border-b-2 border-pink-500'
                : 'text-purple-400 hover:text-pink-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RESET PASSCODE</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4 text-purple-950 dark:text-pink-100">

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/90 border-2 border-rose-400 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/90 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold text-pink-600 dark:text-pink-300 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>MEMBER ACCESS PORTAL</span>
                  <Sparkles className="w-4 h-4 text-pink-400" />
                </h2>
                <p className="text-[11px] text-purple-700 dark:text-pink-300/80">
                  Enter your registered username and passcode to log in.
                </p>
              </div>

              {/* Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-900 dark:text-pink-200 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-pink-500" />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="e.g. Clairwonderland, Arc..."
                    className="w-full bg-white dark:bg-[#150b28] text-purple-950 dark:text-pink-100 px-3 py-2 text-xs border-2 border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 font-pixel"
                  />
                </div>

                {/* Passcode Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-purple-900 dark:text-pink-200 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-pink-500" />
                    <span>Passcode</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter passcode..."
                    className="w-full bg-white dark:bg-[#150b28] text-purple-950 dark:text-pink-100 px-3 py-2 text-xs border-2 border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 font-pixel"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-pink-500 hover:bg-pink-400 active:bg-pink-600 text-slate-950 font-bold text-xs pixel-border-outset flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(244,184,228,0.6)] transition-all disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 text-slate-950" />
                  <span>{isLoading ? 'VERIFYING...' : '🔑 LOG IN'}</span>
                </button>
              </form>

              {/* Password Hint & Reset Switch */}
              <div className="flex items-center justify-between text-[10px] text-purple-700 dark:text-pink-300 pt-1">
                <span className="opacity-80">Enter your registered username & passcode</span>
                <button
                  type="button"
                  onClick={() => {
                    if (sfxEnabled) soundFx.playClick();
                    setActiveTab('reset');
                  }}
                  className="underline hover:text-pink-500 cursor-pointer font-bold"
                >
                  Forgot / Reset Passcode?
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RESET PASSCODE */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold text-pink-600 dark:text-pink-300 flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-pink-400" />
                  <span>SECURE PASSCODE RECOVERY</span>
                </h2>
                <p className="text-[11px] text-purple-700 dark:text-pink-300/80">
                  Reset passcode using your Recovery Key or current passcode.
                </p>
              </div>

              {/* Target Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-900 dark:text-pink-200">
                  Target Username:
                </label>
                <input
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  placeholder="e.g. Clairwonderland, Arc..."
                  className="w-full bg-white dark:bg-[#150b28] text-purple-950 dark:text-pink-100 px-3 py-2 text-xs border-2 border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 font-pixel"
                />
              </div>

              {/* Master Security Key or Old Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-900 dark:text-pink-200 flex items-center justify-between">
                  <span>Recovery Key or Current Passcode</span>
                </label>
                <input
                  type="password"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="Enter Recovery Key or Old Passcode..."
                  className="w-full bg-white dark:bg-[#150b28] text-purple-950 dark:text-pink-100 px-3 py-2 text-xs border-2 border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 font-pixel"
                />
              </div>

              {/* New Passcode */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-900 dark:text-pink-200">
                  New Passcode:
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new passcode..."
                  className="w-full bg-white dark:bg-[#150b28] text-purple-950 dark:text-pink-100 px-3 py-2 text-xs border-2 border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 font-pixel"
                />
              </div>

              {/* Confirm New Passcode */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-purple-900 dark:text-pink-200">
                  Confirm New Passcode:
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new passcode..."
                  className="w-full bg-white dark:bg-[#150b28] text-purple-950 dark:text-pink-100 px-3 py-2 text-xs border-2 border-pink-300 dark:border-purple-700 focus:outline-none focus:border-pink-500 font-pixel"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-400 active:bg-pink-600 text-slate-950 font-bold text-xs pixel-border-outset flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(244,184,228,0.6)] transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>{isLoading ? 'UPDATING...' : 'UPDATE & SAVE PASSCODE'}</span>
              </button>
            </form>
          )}

          {/* Security Guarantee Box */}
          <div className="p-2.5 bg-purple-100/80 dark:bg-[#251540] border border-purple-300 dark:border-purple-700 text-[10px] space-y-1">
            <div className="font-bold text-purple-900 dark:text-pink-300 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-pink-500" />
              <span>SECURITY ARCHITECTURE</span>
            </div>
            <p className="text-purple-800 dark:text-pink-200/80">
              Passcodes are securely salted & hashed using <strong>SHA-256 (Web Crypto API)</strong>.
            </p>
          </div>

          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-pink-300 dark:border-purple-800"></div>
            <span className="flex-shrink mx-3 text-[10px] text-purple-600 dark:text-pink-400 font-bold uppercase tracking-wider">
              OR READ-ONLY ACCESS
            </span>
            <div className="flex-grow border-t border-pink-300 dark:border-purple-800"></div>
          </div>

          {/* Guest Mode Option */}
          <button
            type="button"
            onClick={handleGuestClick}
            className="w-full py-2 bg-purple-900 hover:bg-purple-800 active:bg-purple-950 text-pink-100 font-bold text-xs pixel-border-outset flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Eye className="w-4 h-4 text-pink-300" />
            <span>👻 CONTINUE AS READ-ONLY GUEST</span>
          </button>

        </div>
      </div>
    </div>
  );
};


