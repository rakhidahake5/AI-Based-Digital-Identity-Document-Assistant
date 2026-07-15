import React, { useState } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Fingerprint, 
  Sparkles, 
  ShieldAlert, 
  Chrome, 
  Send 
} from "lucide-react";
import GlassCard from "./GlassCard";

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"login" | "otp" | "two_factor">("login");
  const [otpCode, setOtpCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        setTempUser(data.user);
        // OTP is enabled by default on mock profiles for visual compliance
        if (data.user.otpEnabled) {
          setStep("otp");
        } else if (data.user.twoFactorEnabled) {
          setStep("two_factor");
        } else {
          onLoginSuccess(data.user);
        }
      } else {
        setErrorMessage(data.error || "Failed to login.");
      }
    } catch (err) {
      setErrorMessage("Connection to secure auth node failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpCode })
      });
      const data = await response.json();

      if (response.ok) {
        if (tempUser.twoFactorEnabled) {
          setStep("two_factor");
        } else {
          onLoginSuccess(tempUser);
        }
      } else {
        setErrorMessage(data.error || "Invalid OTP code. Please enter 483920 or any 6-digit code.");
      }
    } catch (err) {
      setErrorMessage("OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (twoFactorCode.length === 6) {
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(tempUser);
      }, 800);
    } else {
      setErrorMessage("Invalid Authenticator token.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Simulate standard prompt
    setTimeout(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "rakhidahake5@gmail.com", password: "google-oauth-mock" })
        });
        const data = await response.json();
        
        // Immediate entry for frictionless Google Auth preview
        onLoginSuccess(data.user);
      } catch (err) {
        setErrorMessage("OAuth channel setup failed.");
      } finally {
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Visual Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full z-10 space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-1">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
            <Fingerprint className="h-7 w-7" />
          </div>
          <h1 className="font-sans font-bold text-xl text-slate-900 dark:text-white tracking-tight mt-3">
            SecureID Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            AI-Based Digital Identity & Document Vault
          </p>
        </div>

        {/* Auth Forms */}
        <GlassCard className="p-6">
          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/5 border border-red-100/30 text-red-500 text-xs flex gap-2 items-center">
              <ShieldAlert className="h-4.5 w-4.5" />
              {errorMessage}
            </div>
          )}

          {/* STEP 1: Main Login */}
          {step === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rakhidahake5@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Passphrase</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                {isLoading ? "Authenticating with Vault..." : "Access Secure Vault"}
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Google LogIn */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200/50 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-mono uppercase">Or sign in with</span>
                <div className="flex-grow border-t border-slate-200/50 dark:border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 cursor-pointer transition-colors"
              >
                <Chrome className="h-4 w-4 text-red-500" />
                Continue with Google Secure Login
              </button>
            </form>
          )}

          {/* STEP 2: OTP Entry */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl inline-block">
                  <Send className="h-5 w-5 animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">OTP Verification Code Sent</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  We've sent a 6-digit one-time passcode to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>. Use <span className="font-bold text-indigo-500">483920</span> or enter code below.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 483920"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white text-center font-mono font-bold tracking-widest text-sm py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                {isLoading ? "Verifying..." : "Verify OTP Passcode"}
              </button>

              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
              >
                Back to credentials
              </button>
            </form>
          )}

          {/* STEP 3: Authenticator 2FA Verification */}
          {step === "two_factor" && (
            <form onSubmit={handleVerifyTwoFactorSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl inline-block">
                  <Fingerprint className="h-5 w-5 animate-pulse" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Enter 2FA Security Token</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Open your Authenticator application to retrieve the active 6-digit verification code.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 text-slate-850 dark:text-white text-center font-mono font-bold tracking-widest text-sm py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                {isLoading ? "Validating Node..." : "Verify Authenticator Token"}
              </button>

              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
              >
                Back to login
              </button>
            </form>
          )}
        </GlassCard>

        {/* Footer security badge */}
        <div className="flex justify-center items-center gap-1.5 text-slate-400 text-[10px] font-mono">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          End-to-End Zero-Knowledge Sandbox
        </div>
      </div>
    </div>
  );
}
