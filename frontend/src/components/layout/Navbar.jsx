import React, { useState, useEffect } from 'react';
import { Shield, Bell, User, ChevronDown, Check, LogOut, Radio, Save, X, Phone, Mail, Building, CheckCircle2, Lock, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';
import { IndianFlagLogo } from '../common/IndianFlagLogo';
import { DynamicMouseText } from '../common/DynamicMouseText';

export function Navbar({ onOpenMobileMenu }) {
  const { user, quickSwitch, updateProfile, logout, DEMO_USERS } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Editable Profile States
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDept, setEditDept] = useState(user?.department || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditDept(user.department || '');
    }
  }, [user]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSavedMsg('');
    try {
      const res = await updateProfile({
        name: editName,
        phone: editPhone,
        department: editDept
      });
      if (res.success) {
        setProfileSavedMsg('Profile successfully saved to secure database!');
        setTimeout(() => setProfileSavedMsg(''), 3000);
      }
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const roleLabel = {
    admin: 'Administrator',
    developer: 'Lead AI Architect',
    guest: 'Guest Explorer',
    new_user: 'New Registered User',
    user: 'Citizen User'
  };

  const roleBadgeColor = {
    admin: 'critical',
    developer: 'high',
    guest: 'info',
    new_user: 'low',
    user: 'low'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border-b border-slate-200/90 dark:border-cyberblue-900/50 text-slate-800 dark:text-white shadow-sm dark:shadow-xl dark:shadow-black/30 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding & Dynamic Indian Flag Logo */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-blue-950/60 focus:outline-none border border-slate-200 dark:border-blue-900/40"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            {/* Dynamic Indian Flag Emblem */}
            <IndianFlagLogo size="md" />

            <div>
              <div className="flex items-center gap-2">
                <DynamicMouseText variant="brand" className="font-display font-black text-xl sm:text-2xl tracking-tight text-slate-950 dark:text-white drop-shadow-sm">
                  SURAKSHA DRISHTI . AI
                </DynamicMouseText>
              </div>
              <div className="text-[11px] sm:text-xs font-mono font-black text-amber-600 dark:text-yellow-400 tracking-wider">
                surakshadrishti.ai
              </div>
            </div>
          </div>
        </div>

        {/* Right: Dark/White Mode Toggle, Telemetry, Profile & Quick Role Switch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / White Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all text-xs font-mono font-extrabold shadow-sm cursor-pointer select-none ${
              isDark
                ? 'bg-command-950/90 border-cyberyellow-400/60 text-cyberyellow-300 hover:border-cyberyellow-400 hover:bg-command-900'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
            }`}
            title={isDark ? "Switch to White / Light Mode" : "Switch to Dark Command Mode"}
            aria-label="Toggle Theme Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-cyberyellow-400 animate-spin-slow" />
                <span className="hidden md:inline text-[11px] text-cyberyellow-300 font-black">WHITE MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline text-[11px] text-slate-950 font-black">DARK MODE</span>
              </>
            )}
          </button>

          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-command-950/80 border-2 border-slate-200 dark:border-blue-900/60 text-xs font-mono text-slate-800 dark:text-blue-200 shadow-inner">
            <Radio className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400 animate-pulse" />
            <span className="text-slate-950 dark:text-white font-black">{currentTime}</span>
          </div>

          {/* User Profile Card Button */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-900 dark:bg-gradient-to-r dark:from-blue-950/80 dark:to-command-900/90 dark:hover:from-blue-900/60 dark:hover:to-command-850 dark:border-blue-500/40 dark:hover:border-yellow-400/60 dark:text-white transition text-xs shadow-sm group"
            title="View & Edit Saved User Data"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 border border-amber-500 flex items-center justify-center font-black text-xs shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="font-black text-slate-950 dark:text-white block truncate max-w-[130px] leading-tight group-hover:text-blue-600 dark:group-hover:text-yellow-300 transition-colors">
                {user?.name || 'Authorized User'}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-yellow-400 block font-mono font-bold">
                ✓ SQLite Synced
              </span>
            </div>
          </button>

          {/* Quick Role & Clearance Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-900 dark:bg-blue-950/70 dark:hover:bg-blue-900/60 dark:border-blue-700/60 dark:text-white transition text-xs text-left shadow-sm cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-yellow-400 animate-pulse"></div>
              <div className="hidden sm:block">
                <span className="text-[9px] uppercase tracking-wider text-slate-600 dark:text-blue-300/80 block font-mono font-extrabold">Clearance</span>
                <span className="font-black text-slate-950 dark:text-blue-200 leading-none">{roleLabel[user?.role] || 'Authorized'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-blue-400 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/80 rounded-2xl shadow-2xl py-3 px-3.5 z-50 text-xs backdrop-blur-xl animate-in fade-in duration-150">
                {/* Header: Authenticated Identity */}
                <div className="pb-2.5 mb-2.5 border-b border-slate-200 dark:border-blue-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-700 dark:text-cyberyellow-400 block">
                      AUTHENTICATED IDENTITY
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Active Authorized Session
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    ONLINE
                  </div>
                </div>

                {/* ONLY Logged-in Person Data */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-command-950/80 border border-slate-200 dark:border-blue-900/60 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-950 dark:text-white text-xs block truncate">
                          {user?.name || 'Authorized User'}
                        </span>
                        <Badge variant={roleBadgeColor[user?.role] || 'info'} size="sm">
                          {user?.role}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-cyberyellow-300 block truncate mt-0.5">
                        {roleLabel[user?.role] || 'Authorized User'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        {user?.department || 'National Command'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-blue-900/40 text-[10.5px] font-mono space-y-1 text-slate-600 dark:text-blue-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">EMAIL:</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">{user?.email || 'N/A'}</span>
                    </div>
                    {user?.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">PHONE:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">CLEARANCE:</span>
                      <span className="font-extrabold text-amber-700 dark:text-cyberyellow-400 uppercase">
                        {user?.role === 'admin' ? 'LEVEL-5 EXECUTIVE (NDMA)' : user?.role === 'developer' ? 'LEVEL-4 AI ARCHITECT (ROOT)' : user?.role === 'guest' ? 'LEVEL-1 VISITOR (READ-ONLY)' : 'LEVEL-2 CITIZEN OBSERVER'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-blue-900/60 space-y-1">
                  <button
                    onClick={() => {
                      setProfileModalOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-blue-950/60 transition flex items-center gap-2 font-bold text-xs cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Manage Saved Profile
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition flex items-center gap-2 font-bold text-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out / Switch Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved User Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c1935] dark:via-command-900 dark:to-[#071126] border border-slate-200/90 dark:border-blue-500/40 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 dark:border-blue-glow">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold uppercase text-amber-800 dark:text-yellow-300 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-yellow-400/15 border border-amber-300 dark:border-yellow-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-yellow-400" />
                    SQLITE PERSISTENT REGISTRY
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                  {user?.name || 'Authorized Personnel'} Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-blue-200/80">
                  Your identity details are permanently synchronized with the backend database.
                </p>
              </div>

              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 dark:text-slate-300 dark:hover:text-white transition border border-slate-200 dark:border-blue-800/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileSavedMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-yellow-400/15 border border-emerald-300 dark:border-yellow-400/40 rounded-2xl text-xs text-emerald-800 dark:text-yellow-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-yellow-400 flex-shrink-0" />
                <span className="font-semibold">{profileSavedMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-yellow-300/90 font-mono mb-1 font-bold">FULL NAME:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-yellow-300/90 font-mono mb-1 font-bold">GMAIL / OFFICIAL EMAIL (PERMANENT ID):</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-blue-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 dark:bg-command-950/50 border border-slate-200 dark:border-blue-950 rounded-xl pl-9 pr-3 py-2.5 text-slate-500 dark:text-blue-300/60 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-yellow-300/90 font-mono mb-1 font-bold">REGISTERED PHONE NO. (+91):</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-yellow-300/90 font-mono mb-1 font-bold">DEPARTMENT / JURISDICTION:</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-command-950/80 rounded-2xl border border-slate-200 dark:border-blue-900/60 text-[11px] font-mono space-y-1.5 text-slate-600 dark:text-blue-200/80 shadow-sm dark:shadow-inner">
                <div className="flex justify-between">
                  <span>SECURITY CLEARANCE:</span>
                  <span className="text-amber-700 dark:text-yellow-400 font-bold uppercase">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATABASE RECORD ID:</span>
                  <span className="text-blue-700 dark:text-blue-300 font-bold">#{user?.id || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>LAST ACTIVE SESSION:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{user?.last_login ? new Date(user.last_login).toLocaleTimeString() : 'Current Session'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-blue-900/50">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-blue-950/70 dark:border-blue-800/40 dark:text-slate-200 dark:hover:text-white transition font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black tracking-wide uppercase transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-400"
                >
                  <Save className="w-4 h-4" />
                  {savingProfile ? 'Saving...' : 'Save Changes to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
