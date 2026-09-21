"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "Uyo",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
    alertOptIn: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (!formData.agreedToTerms) {
      setErrorMessage("Please agree to the Community Guidelines & Terms of Service.");
      return;
    }

    setIsLoading(true);

    try {
      await signUpWithEmail({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
      });

      setSuccessMessage("Account created successfully! Check your email to confirm signup, then sign in.");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create your account.";
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
          <button type="button" className="auth-close" aria-label="Close dialog">×</button>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join the CIRP community and start reporting issues that matter.</p>

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
              <label htmlFor="fullName" className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} placeholder="Chinelo Okeke" className="auth-input" />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" className="auth-input" />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="phone" className="auth-label">Phone Number</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234 800 000 0000" className="auth-input" />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="city" className="auth-label">City / Neighborhood</label>
              <div className="auth-input-wrap">
                <input id="city" name="city" type="text" list="city-options" value={formData.city} onChange={handleChange} placeholder="Uyo" className="auth-input" style={{ paddingLeft: "0.9rem" }} />
                <datalist id="city-options">
                  <option value="Uyo" />
                  <option value="Eket" />
                  <option value="Ikot Ekpene" />
                  <option value="Oron" />
                  <option value="Abak" />
                </datalist>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} placeholder="Min. 6 chars" className="auth-input" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(17,17,17,0.52)]" aria-label={showPassword ? "Hide password" : "Show password"}>
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
              <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className="auth-input" style={{ paddingLeft: "0.9rem" }} />
              </div>
            </div>

            <label className="auth-checkbox">
              <input id="agreedToTerms" name="agreedToTerms" type="checkbox" checked={formData.agreedToTerms} onChange={handleChange} />
              <span>I agree to the Community Guidelines and Terms of Service.</span>
            </label>

            <label className="auth-checkbox">
              <input id="alertOptIn" name="alertOptIn" type="checkbox" checked={formData.alertOptIn} onChange={handleChange} />
              <span>Receive emergency alerts and status updates in my area.</span>
            </label>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-foot" style={{ marginTop: "1.5rem" }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
