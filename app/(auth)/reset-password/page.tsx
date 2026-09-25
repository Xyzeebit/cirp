"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Exchange the recovery code for a session on mount
  useEffect(() => {
    const exchangeCode = async () => {
      try {
        // PKCE flow: code is in the query string (?code=...)
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const hashCode = hashParams.get("code");
        const hashType = hashParams.get("type");

        const codeToUse = code || hashCode;

        if (codeToUse) {
          const { error } = await supabase.auth.exchangeCodeForSession(codeToUse);
          if (error) {
            setErrorMessage(error.message);
          }
          // Session is now established — user can update their password
        } else if (hashType === "recovery") {
          // Implicit flow — session should already be in the hash
          // No code exchange needed, the hash contains the access token
        } else {
          // No code/token present — user navigated here directly
          setErrorMessage("This password reset link is invalid or has expired. Please request a new one.");
        }
      } catch {
        setErrorMessage("Unable to verify your reset link. Please request a new one.");
      } finally {
        setIsVerifying(false);
      }
    };

    void exchangeCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!password) {
      setErrorMessage("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccessMessage("Password updated! Redirecting to your dashboard...");

      // Sign out the recovery session, then redirect to login
      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update password. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show a spinner while verifying the recovery code
  if (isVerifying) {
    return (
      <div className="auth-page">
        <div className="auth-shell">
          <div className="auth-art-panel">
            <div className="auth-brand">
              <img src="/logo.svg" alt="CIRP logo" className="auth-brand-mark" />
              <span>CIRP</span>
            </div>
            <div className="auth-illustration-wrap">
              <img src="/hero-image.png" alt="Community issue reporting illustration" className="auth-illustration" />
            </div>
          </div>
          <div className="auth-form-panel">
            <h1 className="auth-title">Verifying...</h1>
            <p className="auth-subtitle">Please wait while we verify your password reset link.</p>
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ee7c2d] border-t-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-art-panel">
          <div className="auth-brand">
            <img src="/logo.svg" alt="CIRP logo" className="auth-brand-mark" />
            <span>CIRP</span>
          </div>
          <div className="auth-illustration-wrap">
            <img src="/hero-image.png" alt="Community issue reporting illustration" className="auth-illustration" />
          </div>
        </div>

        <div className="auth-form-panel">
          <h1 className="auth-title">Set new password</h1>
          <p className="auth-subtitle">Enter a new password for your CIRP account.</p>

          {errorMessage && (
            <div className="auth-alert">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert" style={{ borderColor: "rgba(238, 124, 45, 0.2)", background: "rgba(255, 244, 235, 0.96)", color: "#9a4b13" }}>
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="password" className="auth-label">New Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(17,17,17,0.52)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
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

              <div className="auth-field">
                <label htmlFor="confirmPassword" className="auth-label">Confirm New Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <p className="auth-foot pt-3">
            Remembered your password? <Link href="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
