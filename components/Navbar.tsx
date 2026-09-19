"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Issues", href: "/issues" },
    { label: "Map", href: "/map" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e8e4] bg-[#f4f5f3]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3.5 sm:px-8 lg:px-12">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0f5d4a] bg-[#eaf4ef] text-[#0f5d4a] shadow-sm transition group-hover:scale-105">
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
            <div className="text-[1.22rem] font-black tracking-tight text-[#0f5d4a]">
              CIRP
            </div>
            <div className="hidden text-[0.68rem] font-medium leading-[1.15] text-[#4b5563] sm:block">
              Community Issues
              <br />
              Report Platform
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main Navigation">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative py-1 text-[0.96rem] font-medium transition hover:text-[#0f5d4a] ${
                  isActive
                    ? "font-semibold text-[#0f5d4a] after:absolute after:bottom-[-2px] after:left-0 after:h-[2.5px] after:w-full after:rounded-full after:bg-[#0f5d4a]"
                    : "text-[#4b5563]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar (Desktop) */}
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
              className="w-full rounded-full border border-[#d8dcd6] bg-white py-2 pl-9 pr-8 text-sm text-[#0f172a] placeholder:text-[#8d95a5] shadow-xs transition focus:border-[#0f5d4a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5d4a]/20"
            />
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9ca3af]">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Bell Notification (from mobile view) */}
          <Link
            href="/dashboard/notifications"
            className="relative flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-[#dce0da] bg-white text-[#374151] hover:bg-[#edf2ee] transition"
            aria-label="Notifications"
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-[#ef4444] ring-2 ring-white" />
          </Link>

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-full border border-[#d5dad3] bg-white/80 px-4 py-1.5 text-sm font-medium text-[#1e293b] shadow-xs transition hover:border-[#0f5d4a] hover:bg-white hover:text-[#0f5d4a]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#0f5d4a] px-4.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c4c3c] hover:shadow-md active:scale-98"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
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
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
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
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-[#e5f0e9] font-semibold text-[#0f5d4a]"
                    : "text-[#374151] hover:bg-[#e9ece8]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 pt-2 border-t border-[#e0e4df]">
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
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
