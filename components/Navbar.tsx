"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) return;
      if (error) {
        setUser(null);
        return;
      }

      setUser(session?.user ?? null);
    };

    void syncUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Issues", href: "/issues" },
    { label: "Map", href: "/map" },
    { label: "About", href: "/about" },
  ];

  const name = user?.user_metadata?.full_name?.trim() || user?.email?.split("@")[0]?.trim() || "Resident";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const isSignedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(17,17,17,0.08)] bg-[rgba(255,255,255,0.3)] backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3.5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#ee7c2d] bg-[rgba(255,255,255,0.45)] text-[var(--primary-strong)] shadow-sm transition group-hover:scale-105">
            <img src="/logo.svg" alt="CIRP logo" className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-[1.22rem] font-black tracking-tight text-[var(--foreground)]">CIRP</div>
            <div className="hidden text-[0.68rem] font-medium leading-[1.15] text-[var(--muted)] sm:block">
              Community Issues
              <br />
              Report Platform
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded bg-[rgba(17,17,17,0.05)] p-1 md:flex" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded px-4 py-2 text-[0.9rem] font-medium transition ${isActive
                  ? "bg-[rgba(17,17,17,0.08)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex flex-1 max-w-[360px] mx-2">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              aria-label="Search issues, categories, or locations"
              placeholder="Search issues, categories, or locations..."
              value={searchQuery ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded border border-[rgba(73,86,125,0.16)] bg-white/80 py-2 pl-9 pr-8 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] shadow-xs transition focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* <Link
            href="/dashboard"
            className="relative flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-[#dce0da] bg-white text-[#374151] hover:bg-[#edf2ee] transition"
            aria-label="Open dashboard"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </Link> */}

          {isSignedIn ? (
            <Link
              href="/dashboard"
              aria-label="Open dashboard"
              className="flex items-center gap-2 rounded-full border border-[rgba(73,86,125,0.16)] bg-white/80 px-2 py-1.5 shadow-sm transition hover:border-[var(--primary)] hover:shadow-md"
            >
              <div className="h-8 w-8 overflow-hidden rounded-full border border-[rgba(73,86,125,0.14)] bg-[rgba(234,220,197,0.7)] text-[var(--primary)]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[0.72rem] font-bold">{initials}</div>
                )}
              </div>
              <span className="hidden xl:inline text-sm font-semibold text-[var(--foreground)]">{name}</span>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded border border-[rgba(73,86,125,0.12)] bg-black text-white/70 px-4 py-1.5 text-sm font-medium shadow-xs transition hover:border-[var(--primary)] hover:bg-white hover:text-[var(--primary)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] px-4.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 hover:shadow-md active:scale-98"
              >
                Register
              </Link>
            </div>
          )}

          {/* <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-[#dce0da] bg-white text-[#374151] hover:bg-[#edf2ee] transition"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button> */}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#e2e6e1] bg-[#f4f5f3] px-4 py-4 sm:px-8 md:hidden">
          <div className="mb-3">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#9ca3af]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search issues, categories, or locations..."
                value={searchQuery ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full rounded-full border border-[#d8dcd6] bg-white py-2 pl-9 pr-4 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
              />
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded px-3 py-2 text-sm font-medium transition ${pathname === item.href
                  ? "bg-[#e5f0e9] font-semibold text-[#ee7c2d]"
                  : "text-[#374151] hover:bg-[#e9ece8]"
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-[#e0e4df] pt-2">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-[#0f5d4a] py-2 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-lg border border-[#d5dad3] bg-white py-2 text-center text-sm font-medium text-[#1e293b]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-lg bg-[#0f5d4a] py-2 text-center text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
