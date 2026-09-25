"use client";

import React, { useState } from "react";
import Link from "next/link";
import { resetPasswordWithEmail } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordWithEmail(email.trim());
      setSuccessMessage("Check your inbox — we've sent a password reset link to your email.");
      setEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send reset link. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send you a link to reset your password.</p>

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

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="auth-input" />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>

          <p className="auth-foot pt-3">
            Remembered your password? <Link href="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
