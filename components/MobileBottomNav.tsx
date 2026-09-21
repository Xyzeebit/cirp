"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: (active: boolean) => (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? "1.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "Issues",
      href: "/issues",
      icon: (active: boolean) => (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      label: "Map",
      href: "/map",
      icon: (active: boolean) => (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
    
    {
      label: "Profile",
      href: "/dashboard",
      icon: (active: boolean) => (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? "2.5" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 md:hidden"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around gap-1 rounded-[1.75rem] border border-white/50 bg-[rgba(255,255,255,0.32)] p-2 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = isRouteActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-1.5 transition-all ${item.highlight
                  ? "bg-[linear-gradient(135deg,var(--primary),var(--primary-strong))] text-white shadow-[0_10px_24px_rgba(238,124,45,0.35)]"
                  : isActive
                    ? "bg-white/70 text-[var(--primary)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--primary)]"
                } ${isActive ? "scale-[1.02]" : ""}`}
              style={item.highlight ? { minWidth: "3.5rem" } : undefined}
            >
              <div className="flex h-5 w-5 items-center justify-center">
                {item.icon(isActive || !!item.highlight)}
              </div>
              <span className="text-[0.62rem] font-medium tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
