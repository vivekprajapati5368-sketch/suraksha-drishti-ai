import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle, 
  KeyRound, RefreshCw, Smartphone, Sparkles, Sun, Moon, User, 
  UserPlus, UserCheck, Code2, ShieldAlert, Radio, Building2, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IndianFlagLogo } from '../components/common/IndianFlagLogo';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { LiveIndianSkyBackground } from '../components/common/LiveIndianSkyBackground';

export function LoginPage({ onLoginSuccess }) {
  const { login, register, sendOtp, verifyOtp, loading, DEMO_USERS } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Primary Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');

  // Login Method Tab within Sign In: 'otp' | 'password'
  const [loginMethod, setLoginMethod] = useState('otp');

  // OTP Login States
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Password Login States
  const [email, setEmail] = useState('admin@surakshadrishti.in');
  const [password, setPassword] = useState('Admin123');

  // Sign Up (New User) States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('user');
  const [regDepartment, setRegDepartment] = useState('Civilian & Community Disaster Response');

  // Status & Error Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  // Handle Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Gmail/Email address or 10-digit mobile number.');
      return;
    }

    try {
      const res = await sendOtp(identifier);
      if (res.success) {
        setOtpSent(true);
        setDemoOtpCode(res.demoOtp || '582191');
        setSuccessMsg(res.message);
        setCountdown(60);
        setCanResend(false);
      } else {
        setErrorMsg(res.message || 'Failed to dispatch verification OTP.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error requesting OTP.');
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      const res = await verifyOtp(identifier, otpInput.trim());
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMsg(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify code.');
    }
  };

  // Handle Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const res = await login(email, password);
    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg(res.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  // Handle New User Registration / Sign Up
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in your full name, email, and password.');
      return;
    }

    try {
      const res = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        role: regRole,
        department: regDepartment.trim()
      });

      if (res.success) {
        setSuccessMsg('Account registered successfully! Entering Command Center...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 800);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create new account.');
    }
  };

  // 1-Click Fast Evaluator Persona Login
  const handleQuickLogin = async (credEmail, credPass) => {
    setErrorMsg('');
    setSuccessMsg('');
    setEmail(credEmail);
    setPassword(credPass);
    const res = await login(credEmail, credPass);
    if (res.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  // Shortcut Persona List
  const evaluatorPersonas = [
    {
      id: 'admin',
      roleTag: 'Admin',
      name: 'Dr. Rajesh Verma, IAS',
      title: 'Principal Secretary & Commissioner',
      department: 'National Disaster Management Authority (NDMA)',
      email: 'admin@surakshadrishti.in',
      phone: '+91 98110 20261',
      pass: 'Admin123',
      icon: ShieldAlert,
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-cyberyellow-300 border-amber-500/40',
      borderHover: 'hover:border-amber-400 dark:hover:border-cyberyellow-400',
      iconColor: 'text-amber-500 dark:text-cyberyellow-400'
    },
    {
      id: 'authority',
      roleTag: 'Authority',
      name: 'Col. Sunita Rawat',
      title: 'Commanding Officer & SDRF Liaison',
      department: 'State Disaster Response Force (SDRF)',
      email: 'authority@surakshadrishti.in',
      phone: '+91 98220 20262',
      pass: 'Authority123',
      icon: Shield,
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-cyan-300 border-blue-500/40',
      borderHover: 'hover:border-blue-400 dark:hover:border-cyan-400',
      iconColor: 'text-blue-500 dark:text-cyan-400'
    },
    {
      id: 'officer',
      roleTag: 'Officer',
      name: 'Inspector Vikram Negi',
      title: 'Field Team Commander',
      department: 'Chamoli Quick Response Field Command',
      email: 'officer@surakshadrishti.in',
      phone: '+91 98330 20263',
      pass: 'Officer123',
      icon: Radio,
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-400',
      iconColor: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      id: 'user',
      roleTag: 'User',
      name: 'Aarav Sharma',
      title: 'Civilian Observer & Warden',
      department: 'Civil Defense & Community Volunteer Network',
      email: 'user@surakshadrishti.in',
      phone: '+91 98440 20264',
      pass: 'User123',
      icon: UserCheck,
      badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40',
      borderHover: 'hover:border-purple-400 dark:hover:border-purple-400',
      iconColor: 'text-purple-500 dark:text-purple-400'
    },
    {
      id: 'developer',
      roleTag: 'Developer',
      name: 'Vivek Kumar',
      title: 'Lead System Architect & AI Engineer',
      department: 'Chief AI Architect & Core System Engineering',
      email: 'developer@surakshadrishti.in',
      phone: '+91 98550 20265',
      pass: 'Dev123',
      icon: Code2,
      badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40',
      borderHover: 'hover:border-sky-400 dark:hover:border-sky-400',
      iconColor: 'text-sky-500 dark:text-sky-400'
    },
    {
      id: 'newUser',
      roleTag: 'New User',
      name: 'Pooja Joshi',
      title: 'Registered Observer (First Login)',
      department: 'Newly Enrolled Field Observer (Demo Provisioned)',
      email: 'newuser@surakshadrishti.in',
      phone: '+91 98660 20266',
      pass: 'NewUser123',
      icon: UserPlus,
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40',
      borderHover: 'hover:border-rose-400 dark:hover:border-rose-400',
      iconColor: 'text-rose-500 dark:text-rose-400'
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-command-950 text-slate-100' : 'bg-slate-50 text-slate-900 multi-color-bg-light'} flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300`}>
      {/* Live Patriotic Indian Sky Background Engine */}
      <LiveIndianSkyBackground />

      {/* Top Floating Dark/White Mode Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all text-xs font-mono font-bold shadow-md cursor-pointer select-none ${
            isDark
              ? 'bg-command-950/90 border-cyberyellow-400/50 text-cyberyellow-300 hover:border-cyberyellow-400 hover:bg-command-900'
              : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
          }`}
          title={isDark ? "Switch to White / Light Mode" : "Switch to Dark Command Mode"}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-cyberyellow-400" />
              <span className="text-[11px] text-cyberyellow-300 font-extrabold">LIGHT MODE</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] text-slate-800 font-extrabold">DARK MODE</span>
            </>
          )}
        </button>
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/6 -right-32 w-96 h-96 bg-amber-400/15 dark:bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-5 my-6">
        {/* Government Emblem & Branding Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <IndianFlagLogo size="xl" showGlow={true} animated={true} />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-700 dark:text-cyberyellow-400">
              NATIONAL DISASTER INTELLIGENCE PLATFORM
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
            <DynamicMouseText variant="brand" className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
              SURAKSHA DRISHTI . AI
            </DynamicMouseText>
          </h1>
          <p className="text-xs font-mono font-black text-amber-600 dark:text-cyberyellow-400 tracking-wider max-w-xs mx-auto">
            surakshadrishti.ai • Autonomous Decision System
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white/95 dark:bg-command-900/95 backdrop-blur-xl border border-slate-200 dark:border-blue-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          
          {/* PRIMARY TOGGLE: [ SIGN IN ] vs [ SIGN UP (NEW USER) ] */}
          <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-command-950 border border-slate-200 dark:border-blue-900/60 text-xs font-mono font-black">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white shadow-md dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>SIGN IN (LOGIN)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>SIGN UP (NEW USER)</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-600/70 text-xs text-red-900 dark:text-red-200 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-600/70 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* ========================================================
              VIEW 1: SIGN IN MODE (OTP OR PASSWORD)
             ======================================================== */}
          {authMode === 'signin' && (
            <div className="space-y-4">
              {/* Method Switch: OTP vs Password */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-command-950/70 p-1 rounded-xl border border-slate-200 dark:border-blue-900/40 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-extrabold transition flex items-center justify-center gap-1.5 ${
                    loginMethod === 'otp'
                      ? 'bg-white dark:bg-blue-950 text-blue-900 dark:text-cyberyellow-300 shadow-sm border border-slate-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                  <span>OTP (Gmail / Phone)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-lg font-extrabold transition flex items-center justify-center gap-1.5 ${
                    loginMethod === 'password'
                      ? 'bg-white dark:bg-blue-950 text-blue-900 dark:text-cyberyellow-300 shadow-sm border border-slate-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Password Login</span>
                </button>
              </div>

              {/* OTP Form Flow */}
              {loginMethod === 'otp' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1.5 font-bold uppercase tracking-wide">
                          GMAIL / OFFICIAL EMAIL OR MOBILE NUMBER:
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-blue-500 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. officer@gmail.com or 9876543210"
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold transition"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-blue-200/70 mt-1 font-mono">
                          Enter any Gmail address or Indian mobile number (+91).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="rounded border-slate-300 dark:border-blue-800 bg-white dark:bg-command-950 text-amber-500 focus:ring-0"
                        />
                        <label htmlFor="rememberMe" className="text-[11px] text-slate-600 dark:text-blue-200/80 cursor-pointer font-medium">
                          Keep data saved & stay signed in on this device
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black tracking-wider uppercase transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-xs cursor-pointer"
                      >
                        {loading ? 'Dispatching 2FA OTP...' : 'Send Secure Government OTP'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Enter Verification Code */
                    <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/60 dark:border-blue-500/40 text-blue-900 dark:text-blue-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold flex items-center gap-1.5 text-xs text-blue-950 dark:text-white">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            OTP Dispatched Successfully
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-blue-200/80 mt-0.5 font-mono">
                            To: <strong className="text-slate-900 dark:text-white">{identifier}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpInput('');
                          }}
                          className="text-[11px] text-blue-700 dark:text-cyberyellow-400 font-bold hover:underline"
                        >
                          Change
                        </button>
                      </div>

                      {/* Demo OTP Auto-Fill Code */}
                      {demoOtpCode && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-command-950 border border-amber-300 dark:border-cyberyellow-400/50 flex items-center justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase text-amber-800 dark:text-cyberyellow-400 block">
                              DEMO 2FA CODE:
                            </span>
                            <span className="text-xl font-black font-mono tracking-widest text-slate-900 dark:text-white">
                              {demoOtpCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpInput(demoOtpCode)}
                            className="px-3 py-1.5 rounded-lg bg-amber-400 dark:bg-cyberyellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow hover:bg-amber-300 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Auto-Fill
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1.5 font-bold uppercase">
                          ENTER 6-DIGIT VERIFICATION CODE:
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          placeholder="• • • • • •"
                          value={otpInput}
                          onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 dark:bg-command-950 border border-slate-300 dark:border-blue-900 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-slate-900 dark:text-white font-mono font-black focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 transition"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-blue-300/80 font-mono">
                          {countdown > 0 ? `Resend available in ${countdown}s` : 'Code expired?'}
                        </span>
                        <button
                          type="button"
                          disabled={!canResend || loading}
                          onClick={handleRequestOtp}
                          className={`font-bold flex items-center gap-1 ${
                            canResend ? 'text-amber-700 dark:text-cyberyellow-400 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <RefreshCw className="w-3 h-3" />
                          Resend Code
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black tracking-wider uppercase transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-xs cursor-pointer"
                      >
                        {loading ? 'Verifying Code...' : 'Verify OTP & Enter Command Center'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Password Login Flow */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1.5 font-bold uppercase">
                      GOVERNMENT IDENTIFIER / EMAIL:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-blue-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1.5 font-bold uppercase">
                      SECURITY PASSPHRASE:
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-blue-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black tracking-wider uppercase transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : 'Enter Command Center'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================
              VIEW 2: SIGN UP (NEW USER REGISTRATION)
             ======================================================== */}
          {authMode === 'signup' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="border-b border-slate-200 dark:border-blue-900/50 pb-2">
                <span className="text-xs font-mono font-black uppercase text-amber-700 dark:text-cyberyellow-400 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  NEW CREDENTIAL ONBOARDING
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Register as a civilian observer, field responder, authority liaison, or AI engineer.
                </p>
              </div>

              {/* Full Legal Name */}
              <div>
                <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1 font-bold">
                  FULL LEGAL NAME:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-blue-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1 font-bold">
                    EMAIL ADDRESS:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue-500 absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rohan@gmail.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1 font-bold">
                    PHONE (+91):
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-blue-500 absolute left-3.5 top-2.5" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Designation / Role Selector */}
              <div>
                <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1.5 font-bold">
                  ASSIGNED ROLE / CLEARANCE LEVEL:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'user', label: 'Civilian User', icon: UserCheck, color: 'border-purple-400 text-purple-700 dark:text-purple-300' },
                    { id: 'field_officer', label: 'Field Officer', icon: Radio, color: 'border-emerald-400 text-emerald-700 dark:text-emerald-300' },
                    { id: 'authority', label: 'Authority', icon: Shield, color: 'border-blue-400 text-blue-700 dark:text-blue-300' },
                    { id: 'admin', label: 'Administrator', icon: ShieldAlert, color: 'border-amber-400 text-amber-700 dark:text-amber-300' },
                    { id: 'developer', label: 'AI Developer', icon: Code2, color: 'border-sky-400 text-sky-700 dark:text-sky-300' }
                  ].map(roleItem => {
                    const Icon = roleItem.icon;
                    const isSelected = regRole === roleItem.id;
                    return (
                      <button
                        key={roleItem.id}
                        type="button"
                        onClick={() => setRegRole(roleItem.id)}
                        className={`p-2 rounded-xl border text-left transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/80 border-2 border-amber-500 dark:border-cyberyellow-400 shadow-sm'
                            : 'bg-white dark:bg-command-950 border-slate-200 dark:border-blue-900/60 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                        <span className="font-extrabold text-[10.5px] truncate text-slate-900 dark:text-white">
                          {roleItem.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department / Organization */}
              <div>
                <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1 font-bold">
                  DEPARTMENT / CITIZEN UNIT:
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-blue-500 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Civil Defense Unit / District Control"
                    value={regDepartment}
                    onChange={e => setRegDepartment(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold"
                  />
                </div>
              </div>

              {/* Passphrase */}
              <div>
                <label className="block text-slate-800 dark:text-cyberyellow-300 font-mono mb-1 font-bold">
                  CREATE SECURITY PASSWORD:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-500 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-300 dark:border-blue-900/80 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-cyberyellow-400 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black tracking-wider uppercase transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
              >
                {loading ? 'Creating Official Account...' : 'Register Account & Launch'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================
              3. 1-CLICK FAST EVALUATOR SHORTCUTS
              (Admin, User, New User, Authority, Developer)
             ======================================================== */}
          <div className="pt-4 border-t border-slate-200 dark:border-blue-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-black text-amber-800 dark:text-cyberyellow-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-CLICK EVALUATOR SHORTCUTS
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700">
                INSTANT ACCESS
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Select any verified official persona to simulate specific role permissions:
            </p>

            {/* Persona Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {evaluatorPersonas.map((persona) => {
                const Icon = persona.icon;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleQuickLogin(persona.email, persona.pass)}
                    className={`p-3 rounded-2xl bg-slate-50 hover:bg-white dark:bg-command-950/80 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-blue-900/60 ${persona.borderHover} text-left transition-all flex items-start justify-between gap-2 group shadow-sm hover:shadow-md cursor-pointer`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 rounded-xl bg-white dark:bg-command-900 border border-slate-200 dark:border-blue-900/60 flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                        <Icon className={`w-4 h-4 ${persona.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-950 dark:text-white text-xs block truncate group-hover:text-amber-700 dark:group-hover:text-cyberyellow-300 transition-colors">
                          {persona.name}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium block truncate">
                          {persona.department}
                        </span>
                        <span className="text-[9.5px] text-slate-500 dark:text-blue-300/70 font-mono block truncate mt-0.5">
                          {persona.email}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full border text-[10.5px] font-sans font-black uppercase tracking-wider flex-shrink-0 whitespace-nowrap shadow-sm ${persona.badgeClass}`}>
                      {persona.roleTag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security & Regulatory Footer */}
        <div className="text-center space-y-1 text-[11px] text-slate-600 dark:text-blue-300/60 font-mono font-medium">
          <p className="flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-cyberyellow-400" />
            Protected by Government 256-Bit Cryptographic Session Encryption
          </p>
          <p>National Disaster Risk Intelligence & Autonomous Relocation Decision Platform</p>
        </div>
      </div>
    </div>
  );
}

