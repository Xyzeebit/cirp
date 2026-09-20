"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmail(email.trim(), password);
      setSuccessMessage("Login successful! Redirecting to your dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousContinue = () => {
    router.push("/report");
  };

  return (
    <div className="min-h-screen bg-[#f4f5f3] flex flex-col justify-between text-[#0f172a] selection:bg-[#0f5d4a]/20">
      <header className="border-b border-[#e2e6e1] bg-white/80 backdrop-blur-xs py-4 px-4 sm:px-8">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0f5d4a] bg-[#eaf4ef] text-[#0f5d4a] shadow-2xs transition group-hover:scale-105">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="#0f5d4a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <circle cx="11" cy="11" r="2.5" fill="#0f5d4a" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-[1.2rem] font-black tracking-tight text-[#0f5d4a]">CIRP</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-[#64748b]">Community Issues Report Platform</span>
            </div>
          </Link>

          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f5d4a] transition">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[460px]">
          <div className="rounded-2xl sm:rounded-3xl border border-[#dfe4de] bg-white p-6 sm:p-9 shadow-md">
            <div className="text-center">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-[#eaf4ef] text-[#0f5d4a] ring-8 ring-[#eaf4ef]/50">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-[#0f172a] sm:text-3xl">Welcome back</h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#64748b]">Sign in to track reported issues, upvote, and receive status notifications.</p>
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2">
                <svg className="h-4 w-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-start gap-2">
                <svg className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#374151]">Email Address</label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input id="email" type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 pl-10 pr-3.5 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#374151]">Password</label>
                  <a href="#forgot-password" onClick={(e) => { e.preventDefault(); alert("Password reset instructions will be sent to your email."); }} className="text-xs font-medium text-[#0f5d4a] hover:underline">Forgot password?</a>
                </div>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input id="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 pl-10 pr-10 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9ca3af] hover:text-[#4b5563]" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-[#d1d5db] text-[#0f5d4a] focus:ring-[#0f5d4a]" />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-[#4b5563]">Remember this device for 30 days</label>
              </div>

              <button type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5d4a] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c4c3c] hover:shadow-md active:scale-98 disabled:opacity-60">
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e2e6e1]" /></div>
              <span className="relative bg-white px-3 text-[0.72rem] font-medium uppercase tracking-wider text-[#9ca3af]">Or</span>
            </div>

            <div className="space-y-3">
              <button type="button" onClick={handleAnonymousContinue} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 text-xs font-semibold text-[#374151] transition hover:bg-white hover:border-[#0f5d4a] hover:text-[#0f5d4a]">
                <svg className="h-4 w-4 text-[#0f5d4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Continue as Anonymous User</span>
              </button>

              <div className="rounded-xl bg-[#ecf5f0] p-3 text-center text-[0.72rem] leading-relaxed text-[#0f5d4a]">🛡️ You can browse issues and submit non-emergency reports anonymously without an account.</div>
            </div>

            <p className="mt-6 text-center text-xs text-[#64748b]">Don&apos;t have an account? <Link href="/register" className="font-bold text-[#0f5d4a] hover:underline">Create an account</Link></p>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-[#64748b] border-t border-[#e2e6e1] bg-white/50">
        <p>© {new Date().getFullYear()} CIRP • Community Issues Report Platform</p>
      </footer>
    </div>
  );
}
