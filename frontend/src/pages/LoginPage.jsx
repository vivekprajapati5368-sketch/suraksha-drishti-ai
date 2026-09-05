import React, { useState, useEffect } from 'react';
import { Shield, Lock, Mail, Phone, ArrowRight, CheckCircle2, AlertCircle, KeyRound, RefreshCw, Smartphone, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Badge } from '../components/common/Badge';
import { IndianFlagLogo } from '../components/common/IndianFlagLogo';
import { DynamicMouseText } from '../components/common/DynamicMouseText';
import { LiveIndianSkyBackground } from '../components/common/LiveIndianSkyBackground';

export function LoginPage({ onLoginSuccess }) {
  const { login, sendOtp, verifyOtp, quickSwitch, loading, DEMO_USERS } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Login Mode Tab: 'otp' | 'password'
  const [loginMode, setLoginMode] = useState('otp');

  // OTP Login States
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Password Login States
  const [email, setEmail] = useState('admin@surakshadrishti.in');
  const [password, setPassword] = useState('Admin123');

  // Status & Error Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

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
    setInfoMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Gmail/Email address or 10-digit mobile number.');
      return;
    }

    try {
      const res = await sendOtp(identifier);
      if (res.success) {
        setOtpSent(true);
        setDemoOtpCode(res.demoOtp || '582191');
        setInfoMsg(res.message);
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
    const res = await login(email, password);
    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setErrorMsg(res.message || 'Invalid government credentials.');
    }
  };

  // 1-Click Fast Evaluator Login
  const handleQuickLogin = async (roleKey, credEmail, credPass) => {
    setErrorMsg('');
    setEmail(credEmail);
    setPassword(credPass);
    const res = await login(credEmail, credPass);
    if (res.success && onLoginSuccess) {
      onLoginSuccess();
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-command-950 text-slate-100' : 'bg-slate-50 text-slate-900 multi-color-bg-light'} flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300`}>
      {/* Live Patriotic Indian Sky Background Engine (Hoisting Flag, IAF Jets, India Map) */}
      <LiveIndianSkyBackground />

      {/* Top Floating Dark/White Mode Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all text-xs font-mono font-bold shadow-md cursor-pointer select-none ${
            isDark
              ? 'bg-command-950/90 border-yellow-400/50 text-yellow-300 hover:border-yellow-400 hover:bg-command-900'
              : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
          }`}
          title={isDark ? "Switch to White / Light Mode" : "Switch to Dark Command Mode"}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[11px] text-yellow-300">LIGHT MODE</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] text-slate-800">DARK MODE</span>
            </>
          )}
        </button>
      </div>

      {/* Ambient multi-color background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/6 -right-32 w-96 h-96 bg-amber-400/15 dark:bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-emerald-400/10 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-200/20 dark:bg-blue-950/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Government Emblem & Branding Header with Dynamic Indian Flag Logo */}
        <div className="text-center space-y-2">
          {/* Dynamic Indian Flag Logo */}
          <div className="flex justify-center mb-1">
            <IndianFlagLogo size="xl" showGlow={true} animated={true} />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-700 dark:text-yellow-400">
              NATIONAL DISASTER INTELLIGENCE PLATFORM
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
            <DynamicMouseText variant="brand" className="text-3xl sm:text-4xl font-black tracking-tight font-heading">
              SURAKSHA DRISHTI . AI
            </DynamicMouseText>
          </h1>
          <p className="text-xs font-mono font-black text-amber-600 dark:text-yellow-400 tracking-wider max-w-xs mx-auto">
            surakshadrishti.ai
          </p>
        </div>

        {/* Main Authentication Card */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0c1836]/95 dark:via-command-900/90 dark:to-[#071126]/95 backdrop-blur-xl border border-slate-200/90 dark:border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-5 dark:border-blue-glow">
          {/* Mode Tabs: OTP vs Password */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-command-950/90 p-1.5 rounded-2xl border border-slate-200 dark:border-blue-900/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setLoginMode('otp');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                loginMode === 'otp'
                  ? 'bg-blue-600 text-white shadow-md dark:bg-gradient-to-r dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 dark:border dark:border-yellow-400/40'
                  : 'text-slate-600 hover:text-slate-900 dark:text-blue-200/70 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400" />
              OTP (Gmail / Phone)
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                loginMode === 'password'
                  ? 'bg-blue-600 text-white shadow-md dark:bg-gradient-to-r dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 dark:border dark:border-yellow-400/40'
                  : 'text-slate-600 hover:text-slate-900 dark:text-blue-200/70 dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500 dark:text-yellow-400" />
              Password Login
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/50 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: OTP LOGIN (GMAIL / PHONE) */}
          {loginMode === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                /* Step 1: Request OTP Form */
                <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 dark:text-yellow-300 font-mono mb-1.5 font-bold">
                      GMAIL / OFFICIAL EMAIL OR MOBILE NUMBER:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. officer@gmail.com or 9876543210"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-blue-200/70 mt-1">
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
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black tracking-wider uppercase transition shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-400 flex items-center justify-center gap-2 text-xs"
                  >
                    {loading ? 'Generating 2FA OTP...' : 'Send Secure Government OTP'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP Form */
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 dark:bg-blue-950/60 dark:border-blue-500/40 text-blue-900 dark:text-blue-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 dark:text-white text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-yellow-400" />
                        OTP Dispatched Successfully
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpInput('');
                        }}
                        className="text-[11px] text-blue-700 dark:text-yellow-400 hover:underline font-bold"
                      >
                        Change
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-blue-200/90">
                      Dispatched to: <strong className="text-slate-900 dark:text-white font-mono">{identifier}</strong>
                    </p>
                  </div>

                  {/* Demo Simulated Verification Code Card */}
                  {demoOtpCode && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 dark:bg-gradient-to-r dark:from-yellow-400/15 dark:via-amber-500/15 dark:to-yellow-400/15 dark:border-yellow-400/50 flex items-center justify-between shadow-sm dark:shadow-inner">
                      <div>
                        <span className="text-[10px] font-bold uppercase font-mono text-amber-800 dark:text-yellow-400 block">
                          DEMO VERIFICATION CODE:
                        </span>
                        <span className="text-xl font-black font-mono tracking-widest text-slate-900 dark:text-white drop-shadow">
                          {demoOtpCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpInput(demoOtpCode)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 dark:bg-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 hover:bg-amber-300 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 dark:text-yellow-300 font-mono mb-1.5 font-bold">
                      ENTER 6-DIGIT VERIFICATION CODE:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-slate-900 dark:text-white font-mono font-black focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 transition-colors shadow-sm dark:shadow-inner"
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
                        canResend ? 'text-amber-700 dark:text-yellow-400 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-black tracking-wider uppercase transition shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-400 flex items-center justify-center gap-2 text-xs"
                  >
                    {loading ? 'Validating Token...' : 'Verify OTP & Enter Command Center'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: PASSWORD LOGIN */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-yellow-300 font-mono mb-1.5 font-bold">
                  GOVERNMENT IDENTIFIER / EMAIL:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-yellow-300 font-mono mb-1.5 font-bold">
                  SECURITY PASSPHRASE:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-blue-500 dark:text-blue-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-command-950/90 border border-slate-200 dark:border-blue-900/60 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-blue-300/40 focus:outline-none focus:border-amber-500 dark:focus:border-yellow-400 font-semibold transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black tracking-wider uppercase transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-xs"
              >
                {loading ? 'Authenticating...' : 'Enter Command Center'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 1-CLICK FAST EVALUATOR LOGIN CARDS */}
          <div className="pt-4 border-t border-slate-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-800 dark:text-yellow-400 flex items-center gap-1">
                ⚡ 1-CLICK EVALUATOR SHORTCUT
              </span>
              <span className="text-[10px] text-amber-700 dark:text-yellow-300 font-mono font-bold">INSTANT ACCESS</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin@surakshadrishti.in', 'Admin123')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-400/60 dark:bg-command-950/90 dark:hover:bg-blue-950/70 dark:border-blue-900/60 dark:hover:border-yellow-400/60 text-left transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-amber-700 dark:group-hover:text-yellow-300 transition-colors">
                    Administrator (Dr. Rajesh Verma, IAS)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-blue-200/70 block font-mono">
                    admin@surakshadrishti.in • +91 98110 20261
                  </span>
                </div>
                <Badge variant="yellow" size="sm">Admin</Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('authority', 'authority@surakshadrishti.in', 'Authority123')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-400/60 dark:bg-command-950/90 dark:hover:bg-blue-950/70 dark:border-blue-900/60 dark:hover:border-yellow-400/60 text-left transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-amber-700 dark:group-hover:text-yellow-300 transition-colors">
                    Disaster Authority (Col. Sunita Rawat)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-blue-200/70 block font-mono">
                    authority@surakshadrishti.in • +91 98220 20262
                  </span>
                </div>
                <Badge variant="blue" size="sm">Authority</Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('officer', 'officer@surakshadrishti.in', 'Officer123')}
                className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-400/60 dark:bg-command-950/90 dark:hover:bg-blue-950/70 dark:border-blue-900/60 dark:hover:border-yellow-400/60 text-left transition flex items-center justify-between group shadow-sm"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-amber-700 dark:group-hover:text-yellow-300 transition-colors">
                    Field Officer (Inspector Vikram Negi)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-blue-200/70 block font-mono">
                    officer@surakshadrishti.in • +91 98330 20263
                  </span>
                </div>
                <Badge variant="white" size="sm">Officer</Badge>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Footer */}
        <div className="text-center space-y-1 text-[11px] text-slate-600 dark:text-blue-300/60 font-mono font-medium">
          <p className="flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-600 dark:text-cyberyellow-400" />
            Protected by Government 256-Bit Cryptographic Session Encryption
          </p>
          <p>National Disaster Risk Intelligence & Autonomous Relocation Decision Platform</p>
        </div>
      </div>
    </div>
  );
}
