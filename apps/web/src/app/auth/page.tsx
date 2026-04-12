'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Lock, Phone, Chrome, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult,
  signInAnonymously
} from 'firebase/auth';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMode, setAuthMode] = useState<'email' | 'phone' | 'otp'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } catch (error: any) {
      console.error('Firebase Email Auth Error:', error);
      let message = 'An error occurred during authentication.';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email. Please Sign Up.';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password. Please try again.';
      if (error.code === 'auth/email-already-in-use') message = 'This email is already registered. Please Sign In.';
      if (error.code === 'auth/invalid-email') message = 'Please enter a valid email address.';
      if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      alert(message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        localStorage.setItem('isAuthenticated', 'true');
        router.push('/');
      }
    } catch (error: any) {
      console.error('Firebase Google Login Error:', error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } catch (error: any) {
      console.error('Firebase Guest Login Error:', error);
      alert('Could not sign in as guest. Please try another method.');
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Reuse existing RecaptchaVerifier or create a new one (prevents double-render)
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
        });
      }
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setAuthMode('otp');
    } catch (error: any) {
      console.error('Firebase Phone Auth (Send OTP) Error:', error);
      // Clear the stale verifier so a fresh one can be created on retry
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (_) { /* already cleared */ }
        (window as any).recaptchaVerifier = null;
      }
      alert(error.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    try {
      await confirmationResult.confirm(otp);
      localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } catch (error: any) {
      console.error('Firebase Phone Auth (Verify OTP) Error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-6 bg-[#0a0a0c] overflow-y-auto w-full custom-scrollbar">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[#0f1115]" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#53ddfc]/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#ba9eff]/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s]" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
            <motion.div 
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-[#53ddfc] shadow-[0_0_40px_rgba(83,221,252,0.3)] flex items-center justify-center mb-6 group cursor-pointer"
            >
                <span className="text-3xl font-black text-[#0f1218] group-hover:scale-110 transition-transform">G</span>
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
              {authMode === 'otp' ? 'Verify OTP' : 
               authMode === 'phone' ? 'Phone Login' :
               isSignUp ? 'Join Groovra' : 'Welcome to Groovra'}
            </h1>
            <p className="text-white/40 font-bold text-xs uppercase tracking-[0.3em]">
              {authMode === 'otp' ? 'Check your messages' : 'Your sound capsule awaits'}
            </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#53ddfc] to-transparent opacity-50" />
          
          {authMode === 'email' && (
            <>
              <div className="space-y-4">
                {/* Social Buttons */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-4 px-6 bg-white/[0.05] hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all">
                            <Chrome className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest px-1">Continue with Google</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all transform translate-x-[-4px] group-hover:translate-x-0 group-hover:opacity-100 opacity-0" />
                </button>

                <button 
                  onClick={handleGuestLogin}
                  className="w-full py-4 px-6 bg-white/[0.05] hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest px-1">Continue as Guest</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all transform translate-x-[-4px] group-hover:translate-x-0 group-hover:opacity-100 opacity-0" />
                </button>

                <button 
                  onClick={() => setAuthMode('phone')}
                  className="w-full py-4 px-6 bg-white/[0.05] hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all">
                            <Phone className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest px-1">Continue with Phone</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all transform translate-x-[-4px] group-hover:translate-x-0 group-hover:opacity-100 opacity-0" />
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">OR</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleEmailAuth}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Username / Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#53ddfc] transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-[#53ddfc]/30 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#ba9eff] transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-[#ba9eff]/30 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-[#53ddfc] hover:bg-[#4bcceb] text-[#0f1218] text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#53ddfc]/10 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  {isSignUp ? 'Sign Up for Groovra' : 'Sign In to Groovra'}
                </button>
              </form>

              <div className="mt-8 text-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"} {' '}
                <button 
                  onClick={toggleAuthMode}
                  className="text-[#53ddfc] hover:underline bg-transparent border-none p-0"
                >
                  {isSignUp ? 'Sign In' : 'Create One'}
                </button>
              </div>
            </>
          )}

          {authMode === 'phone' && (
             <form className="space-y-5" onSubmit={handleSendOtp}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#53ddfc] transition-colors" />
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      required
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-[#53ddfc]/30 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-[#53ddfc] hover:bg-[#4bcceb] text-[#0f1218] text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#53ddfc]/10 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  Send OTP
                </button>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setAuthMode('email')}
                    className="text-[10px] font-bold text-[#53ddfc] hover:underline bg-transparent border-none p-0 uppercase tracking-widest"
                  >
                    Back to Email
                  </button>
                </div>
             </form>
          )}

          {authMode === 'otp' && (
             <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Verification Code</label>
                  <div className="relative group">
                    <ArrowRight className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#53ddfc] transition-colors" />
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-[#53ddfc]/30 focus:bg-white/[0.05] transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-[#ba9eff] hover:bg-[#ac88ff] text-[#0f1218] text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#ba9eff]/10 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  Verify OTP
                </button>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setAuthMode('phone')}
                    className="text-[10px] font-bold text-[#53ddfc] hover:underline bg-transparent border-none p-0 uppercase tracking-widest"
                  >
                    Resend / Change Number
                  </button>
                </div>
             </form>
          )}
        </div>

        {/* Recaptcha Container */}
        <div id="recaptcha-container" className="hidden"></div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-6">
            <Link href="/" className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <Link href="/" className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">Terms of Service</Link>
        </div>
      </motion.div>
    </div>
  );
}
