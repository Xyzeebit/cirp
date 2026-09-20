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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    <div className="min-h-screen bg-[#f4f5f3] flex flex-col justify-between text-[#0f172a] selection:bg-[#0f5d4a]/20">
      {/* Top Header */}
      <header className="border-b border-[#e2e6e1] bg-white/80 backdrop-blur-xs py-4 px-4 sm:px-8">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0f5d4a] bg-[#eaf4ef] text-[#0f5d4a] shadow-2xs transition group-hover:scale-105">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0f5d4a"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <circle cx="11" cy="11" r="2.5" fill="#0f5d4a" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-[1.2rem] font-black tracking-tight text-[#0f5d4a]">
                CIRP
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-[#64748b]">
                Community Issues Report Platform
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f5d4a] transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[520px]">
          {/* Card Container */}
          <div className="rounded-2xl sm:rounded-3xl border border-[#dfe4de] bg-white p-6 sm:p-9 shadow-md">
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-[#eaf4ef] text-[#0f5d4a] ring-8 ring-[#eaf4ef]/50">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>

              <h1 className="mt-4 text-2xl font-black tracking-tight text-[#0f172a] sm:text-3xl">
                Create an Account
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#64748b]">
                Join community residents in Uyo and surrounding neighbourhoods reporting and tracking real change.
              </p>
            </div>

            {/* Error & Success Feedback Alerts */}
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    placeholder="e.g. Chinelo Okeke"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 pl-10 pr-3.5 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 pl-10 pr-3.5 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                  >
                    Phone Number
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 pl-10 pr-3.5 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
                    />
                  </div>
                </div>
              </div>

              {/* City / Neighborhood */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                >
                  City / Neighborhood
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    list="city-options"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Uyo, Eket, Ikot Ekpene, Oron"
                    className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 px-3.5 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
                  />
                  <datalist id="city-options">
                    <option value="Uyo" />
                    <option value="Eket" />
                    <option value="Ikot Ekpene" />
                    <option value="Oron" />
                    <option value="Abak" />
                    <option value="Etinan" />
                    <option value="Itu" />
                    <option value="Nsit Atai" />
                    <option value="Onna" />
                    <option value="Mbo" />
                    <option value="Ini" />
                  </datalist>
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min. 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 px-3.5 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[0.7rem] text-[#0f5d4a] hover:underline"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] py-2.5 px-3.5 text-sm text-[#0f172a] placeholder:text-[#9ca3af] transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-start">
                  <input
                    id="agreedToTerms"
                    name="agreedToTerms"
                    type="checkbox"
                    required
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#0f5d4a] focus:ring-[#0f5d4a]"
                  />
                  <label htmlFor="agreedToTerms" className="ml-2 block text-xs text-[#4b5563]">
                    I agree to the{" "}
                    <span className="font-semibold text-[#0f5d4a] cursor-pointer hover:underline">
                      Community Guidelines
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-[#0f5d4a] cursor-pointer hover:underline">
                      Terms of Service
                    </span>
                    .
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="alertOptIn"
                    name="alertOptIn"
                    type="checkbox"
                    checked={formData.alertOptIn}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-[#d1d5db] text-[#0f5d4a] focus:ring-[#0f5d4a]"
                  />
                  <label htmlFor="alertOptIn" className="ml-2 block text-xs text-[#4b5563]">
                    Receive emergency alerts and status updates regarding reported issues in my area.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5d4a] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c4c3c] hover:shadow-md active:scale-98 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Anonymous Report Notice */}
            <div className="mt-5 rounded-xl border border-[#d8dcd6] bg-[#f9faf9] p-3 text-center text-xs text-[#4b5563]">
              Need to file a report right now without an account?{" "}
              <Link href="/report" className="font-bold text-[#0f5d4a] hover:underline">
                Report Anonymously &rarr;
              </Link>
            </div>

            {/* Login Link */}
            <p className="mt-5 text-center text-xs text-[#64748b]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#0f5d4a] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Auth Simple Footer */}
      <footer className="py-5 text-center text-xs text-[#64748b] border-t border-[#e2e6e1] bg-white/50">
        <p>© {new Date().getFullYear()} CIRP • Community Issues Report Platform</p>
      </footer>
    </div>
  );
}
