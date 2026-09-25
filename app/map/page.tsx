"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapIssue, CATEGORY_COLORS } from "@/components/IssueMap";
import { getIssues, parseLocation, type IssueRecord } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

// Dynamically import Leaflet IssueMap to avoid SSR 'window is not defined'
const IssueMap = dynamic(() => import("@/components/IssueMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e8ece7] text-[#4b5563]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#ee7c2d] border-t-transparent"></div>
        <span className="text-sm font-medium">Loading interactive map...</span>
      </div>
    </div>
  ),
});

const FALLBACK_MAP_ISSUES: MapIssue[] = [
  {
    id: "fallback-1",
    title: "Sample Issue",
    category: "Others",
    location: "Uyo, Akwa Ibom",
    lat: 5.037,
    lng: 7.926,
    status: "Submitted",
    time: "Recently",
    votes: 0,
    comments: 0,
    image:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
  },
];

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function toMapIssue(issue: IssueRecord): MapIssue | null {
  const lat = issue.lat;
  const lng = issue.lng;
  if (lat == null || lng == null) return null;

  return {
    id: issue.id,
    title: issue.title,
    category: issue.category as MapIssue["category"],
    location: parseLocation(issue.location).address || issue.location,
    lat,
    lng,
    status: issue.status,
    time: formatRelativeTime(issue.created_at),
    votes: 0,
    comments: issue.issue_comments?.length ?? 0,
    image:
      issue.issue_images?.[0]?.image_url ??
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
  };
}

const ALL_CATEGORIES: MapIssue["category"][] = [
  "Bad Road / Pothole",
  "Broken Streetlight",
  "Flooding",
  "Waste Disposal",
  "Water Shortage",
  "Power / Electricity",
  "Security Concern",
  "Others",
];

export default function MapPage() {
  const [issues, setIssues] = useState<MapIssue[]>(FALLBACK_MAP_ISSUES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, boolean>>({
    "Submitted": true,
    "Under Review": true,
    "Resolved": true,
  });
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
  const [userUpvoted, setUserUpvoted] = useState<Record<string, boolean>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null>(null);

  // Sync auth state with Supabase
  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      setUser(session?.user ?? null);
    };

    void syncUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isSignedIn = Boolean(user);
  const userName = user?.user_metadata?.full_name?.trim() || user?.email?.split("@")[0]?.trim() || "Resident";
  const userInitials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const loadIssues = async () => {
    setLoading(true);
    try {
      const dbIssues = await getIssues();
      const mapped = dbIssues
        .map(toMapIssue)
        .filter((issue): issue is MapIssue => issue !== null);
      if (mapped.length > 0) {
        setIssues(mapped);
      }
    } catch (error) {
      console.error("Failed to load map issues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadIssues();
  }, []);

  // Toggle status filter
  const toggleStatus = (statusName: string) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [statusName]: !prev[statusName],
    }));
  };

  // Toggle upvote
  const handleUpvote = (id: string) => {
    setUserUpvoted((prev) => {
      const isUpvoted = !!prev[id];
      setIssues((list) =>
        list.map((item) =>
          item.id === id
            ? { ...item, votes: isUpvoted ? item.votes - 1 : item.votes + 1 }
            : item
        )
      );
      return { ...prev, [id]: !isUpvoted };
    });
  };

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesCategory =
        selectedCategory === "All Categories" || issue.category === selectedCategory;
      const matchesStatus = !!selectedStatuses[issue.status];
      const query = searchLocation.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        issue.location.toLowerCase().includes(query) ||
        issue.title.toLowerCase().includes(query) ||
        issue.category.toLowerCase().includes(query);
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [issues, selectedCategory, selectedStatuses, searchLocation]);

  // Stats summary
  const stats = useMemo(() => {
    const total = issues.length;
    const submitted = issues.filter((i) => i.status === "Submitted").length;
    const underReview = issues.filter((i) => i.status === "Under Review").length;
    const resolved = issues.filter((i) => i.status === "Resolved").length;
    return { total, submitted, underReview, resolved };
  }, [issues]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_rgba(247,243,239,0.95)_40%,_rgba(236,231,225,1))] text-[#111111]">
      {/* Glass Header */}
      <header className="z-40 border-b border-[rgba(17,17,17,0.08)] bg-[rgba(255,255,255,0.3)] backdrop-blur-xl px-4 py-3 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          {/* CIRP Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#ee7c2d] bg-[rgba(255,255,255,0.45)] text-[#ee7c2d] shadow-sm transition group-hover:scale-105">
              <img src="/logo.svg" alt="CIRP logo" className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-[1.2rem] font-black tracking-tight text-[#111111]">
                CIRP
              </div>
              <div className="hidden text-[0.68rem] font-medium leading-[1.15] text-[#4b5563] sm:block">
                Community Issues
                <br />
                Report Platform
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-2 rounded bg-[rgba(17,17,17,0.05)] p-1 md:flex" aria-label="Map Navigation">
            <Link href="/" className="rounded px-4 py-2 text-[0.9rem] font-medium text-[#4b5563] transition hover:text-[#0f5d4a]">Home</Link>
            <Link href="/issues" className="rounded px-4 py-2 text-[0.9rem] font-medium text-[#4b5563] transition hover:text-[#0f5d4a]">Issues</Link>
            <Link href="/map" className="rounded bg-[rgba(17,17,17,0.08)] px-4 py-2 text-[0.9rem] font-bold text-[#111111] shadow-sm">Map</Link>
            <Link href="/about" className="rounded px-4 py-2 text-[0.9rem] font-medium text-[#4b5563] transition hover:text-[#0f5d4a]">About</Link>
          </nav>

          {/* Search Location Input */}
          <div className="flex flex-1 max-w-[420px] mx-2">
            <div className="relative w-full">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9ca3af]">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                aria-label="Search location"
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full rounded border border-[rgba(73,86,125,0.16)] bg-white/80 py-2 pl-9 pr-9 text-sm text-[#111111] placeholder:text-[#8d95a5] shadow-xs transition focus:border-[#ee7c2d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ee7c2d]/20"
              />
              {searchLocation && (
                <button
                  type="button"
                  onClick={() => setSearchLocation("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#9ca3af] hover:text-[#4b5563]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons / User Avatar */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                aria-label="Open dashboard"
                className="flex items-center gap-2 rounded border border-[rgba(73,86,125,0.16)] bg-white/80 px-2 py-1.5 shadow-sm transition hover:border-[#ee7c2d] hover:shadow-md"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full border border-[rgba(73,86,125,0.14)] bg-[rgba(234,220,197,0.7)] text-[#ee7c2d]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[0.72rem] font-bold">{userInitials}</div>
                  )}
                </div>
                <span className="hidden xl:inline text-sm font-semibold text-[#111111]">{userName}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded border border-[rgba(73,86,125,0.12)] bg-black text-white/70 px-4 py-1.5 text-sm font-medium shadow-xs transition hover:border-[#ee7c2d] hover:bg-white hover:text-[#ee7c2d]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded bg-[linear-gradient(135deg,#ee7c2d,#d76a1a)] px-4.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 hover:shadow-md active:scale-98"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex md:hidden items-center gap-1.5 rounded border border-[#ee7c2d] bg-[rgba(255,243,232,0.8)] px-3 py-1.5 text-xs font-bold text-[#ee7c2d] shadow-xs backdrop-blur-xl"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
          </button>
        </div>
      </header>

      {/* Main Map View Area */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(255,255,255,0.4)] backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#ee7c2d] border-t-transparent"></div>
              <span className="text-sm font-medium text-[#4b5563]">Loading community issues...</span>
            </div>
          </div>
        )}

        {/* Active Search Chip (shows the current search term) */}
        {searchLocation.trim() && (
          <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded border border-white/50 bg-white/30 px-3 py-1.5 shadow-[0_8px_30px_rgba(15,16,19,0.08)] backdrop-blur-xl">
              <svg className="h-3.5 w-3.5 text-[#ee7c2d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="text-xs font-semibold text-[#111111]">Searching:</span>
              <span className="max-w-[200px] truncate text-xs text-[#4b5563]">"{searchLocation.trim()}"</span>
              <span className="rounded bg-[#fff3e8] px-2 py-0.5 text-[0.68rem] font-bold text-[#ee7c2d]">{filteredIssues.length} found</span>
              <button
                type="button"
                onClick={() => setSearchLocation("")}
                className="text-[#9ca3af] hover:text-[#4b5563]"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Stats Bar (top center, shown when no search) */}
        {!searchLocation.trim() && (
          <div className="absolute left-1/2 top-4 z-30 hidden -translate-x-1/2 md:flex items-center gap-2 rounded-2xl border border-white/50 bg-white/30 px-4 py-2 shadow-[0_8px_30px_rgba(15,16,19,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-1.5 px-2">
              <span className="text-xs font-bold text-[#0f172a]">{stats.total}</span>
              <span className="text-[0.68rem] text-[#64748b]">Total</span>
            </div>
            <div className="h-4 w-px bg-[rgba(17,17,17,0.08)]" />
            <div className="flex items-center gap-1.5 px-2">
              <span className="h-2 w-2 rounded-full bg-[#ee7c2d]" />
              <span className="text-xs font-bold text-[#d96515]">{stats.submitted}</span>
              <span className="text-[0.68rem] text-[#64748b]">Submitted</span>
            </div>
            <div className="h-4 w-px bg-[rgba(17,17,17,0.08)]" />
            <div className="flex items-center gap-1.5 px-2">
              <span className="h-2 w-2 rounded-full bg-[#b45309]" />
              <span className="text-xs font-bold text-[#b45309]">{stats.underReview}</span>
              <span className="text-[0.68rem] text-[#64748b]">Review</span>
            </div>
            <div className="h-4 w-px bg-[rgba(17,17,17,0.08)]" />
            <div className="flex items-center gap-1.5 px-2">
              <span className="h-2 w-2 rounded-full bg-[#15803d]" />
              <span className="text-xs font-bold text-[#15803d]">{stats.resolved}</span>
              <span className="text-[0.68rem] text-[#64748b]">Resolved</span>
            </div>
            <div className="h-4 w-px bg-[rgba(17,17,17,0.08)]" />
            <button
              type="button"
              onClick={() => void loadIssues()}
              disabled={loading}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[0.68rem] font-semibold text-[#ee7c2d] transition hover:bg-[#fff3e8] disabled:opacity-50"
              title="Refresh issues"
            >
              <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
          </div>
        )}

        {/* DESKTOP: Glass Map Filters + Issues List */}
        <aside className="absolute left-6 top-6 z-30 hidden md:flex flex-col w-80 rounded-[28px] border border-white/50 bg-white/25 p-5 shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl max-h-[calc(100%-3rem)] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/40">
            <h3 className="text-base font-bold text-[#0f172a]">Map Filters</h3>
            <span className="rounded-full bg-[#fff3e8] px-2 py-0.5 text-xs font-semibold text-[#ee7c2d]">
              {filteredIssues.length} found
            </span>
          </div>

          {/* Category Dropdown */}
          <div className="mt-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-[rgba(73,86,125,0.16)] bg-white/70 py-2 px-3 text-xs font-medium text-[#111111] transition focus:border-[#ee7c2d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ee7c2d]/20"
            >
              <option value="All Categories">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Category List with Colored Marker Dots */}
          <div className="mt-3 space-y-1.5 pr-1">
            {ALL_CATEGORIES.map((cat) => {
              const cfg = CATEGORY_COLORS[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(isSelected ? "All Categories" : cat)
                  }
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${isSelected
                    ? "bg-[#fff3e8] font-bold text-[#ee7c2d]"
                    : "text-[#4b5563] hover:bg-white/40"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: cfg.pinColor }}
                    />
                    <span>{cat}</span>
                  </div>
                  <span className="text-[0.68rem] text-[#9ca3af]">
                    {issues.filter((i) => i.category === cat).length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Checkboxes */}
          <div className="mt-4 pt-3 border-t border-white/40">
            <span className="block text-xs font-bold text-[#374151] mb-2">Show:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Submitted", color: "bg-[#feece2] text-[#d96515] border-[#f9d2b1]" },
                { name: "Under Review", color: "bg-[#fef3c7] text-[#b45309] border-[#ead8c5]" },
                { name: "Resolved", color: "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]" },
              ].map((status) => (
                <button
                  key={status.name}
                  type="button"
                  onClick={() => toggleStatus(status.name)}
                  className={`rounded-lg border px-2.5 py-1 text-[0.68rem] font-semibold transition ${selectedStatuses[status.name]
                    ? status.color
                    : "border-[#e5e8e3] bg-white/30 text-[#9ca3af] hover:bg-white/50 backdrop-blur-xl"
                    }`}
                >
                  {status.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Issues List */}
          <div className="mt-4 pt-3 border-t border-white/40 flex-1 overflow-hidden flex flex-col">
            <span className="block text-xs font-bold text-[#374151] mb-2 shrink-0">Recent Issues</span>
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
              {filteredIssues.length === 0 ? (
                <p className="text-xs text-[#9ca3af] py-3 text-center">No issues match your filters.</p>
              ) : (
                filteredIssues.map((issue) => {
                  const cfg = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS["Others"];
                  const isSelected = selectedIssue?.id === issue.id;
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssue(isSelected ? null : issue)}
                      className={`flex w-full items-start gap-2 rounded-lg p-2 text-left transition ${isSelected
                        ? "bg-[#fff3e8] ring-1 ring-[#ee7c2d]/30"
                        : "hover:bg-white/40"
                        }`}
                    >
                      <span
                        className="mt-0.5 h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.pinColor }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[#0f172a]">{issue.title}</p>
                        <p className="truncate text-[0.68rem] text-[#64748b]">{issue.location}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-[0.62rem] text-[#9ca3af]">
                          <span>{issue.time}</span>
                          <span>·</span>
                          <span>{issue.comments} comments</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Report New Issue Link */}
          <Link
            href="/report"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#0f5d4a,#0b4d3e)] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Report a New Issue
          </Link>
        </aside>

        {/* MOBILE: Glass Filters Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-x-0 bottom-0 z-40 block md:hidden rounded-t-3xl border-t border-white/40 bg-white/40 p-5 shadow-2xl backdrop-blur-xl max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/40">
              <h3 className="text-base font-bold text-[#0f172a]">Map Filters</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full bg-white/50 p-1.5 text-[#4b5563] backdrop-blur-xl"
              >
                ✕
              </button>
            </div>

            {/* Quick stats */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white/40 px-3 py-2 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-[#0f172a]">{stats.total}</span>
                <span className="text-[#64748b]">Total</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#d96515]">{stats.submitted}</span>
                <span className="text-[#64748b]">Sub.</span>
                <span className="font-bold text-[#15803d]">{stats.resolved}</span>
                <span className="text-[#64748b]">Res.</span>
              </div>
            </div>

            {/* Category selection */}
            <div className="mt-3">
              <label className="text-xs font-bold text-[#374151]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[rgba(73,86,125,0.16)] bg-white/70 py-2 px-3 text-xs font-medium text-[#111111]"
              >
                <option value="All Categories">All Categories</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Statuses */}
            <div className="mt-4 pt-3 border-t border-white/40">
              <span className="block text-xs font-bold text-[#374151] mb-2">Status</span>
              <div className="grid grid-cols-3 gap-2">
                {["Submitted", "Under Review", "Resolved"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStatus(st)}
                    className={`rounded-xl py-1.5 px-2 text-center text-xs font-semibold transition ${selectedStatuses[st]
                      ? "bg-[#ee7c2d] text-white"
                      : "bg-white/30 text-[#4b5563] backdrop-blur-xl"
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Issues on Mobile */}
            <div className="mt-4 pt-3 border-t border-white/40">
              <span className="block text-xs font-bold text-[#374151] mb-2">Recent Issues ({filteredIssues.length})</span>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {filteredIssues.length === 0 ? (
                  <p className="text-xs text-[#9ca3af] py-3 text-center">No issues match your filters.</p>
                ) : (
                  filteredIssues.slice(0, 10).map((issue) => {
                    const cfg = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS["Others"];
                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setMobileFilterOpen(false);
                        }}
                        className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-white/40"
                      >
                        <span className="mt-0.5 h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.pinColor }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-[#0f172a]">{issue.title}</p>
                          <p className="truncate text-[0.68rem] text-[#64748b]">{issue.location}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileFilterOpen(false)}
              className="mt-5 w-full rounded-xl bg-[#ee7c2d] py-2.5 text-xs font-bold text-white shadow-sm"
            >
              Apply Filters ({filteredIssues.length} issues)
            </button>
          </div>
        )}

        {/* Mobile floating action button for report */}
        <Link
          href="/report"
          className="absolute bottom-24 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/30 text-[#0f5d4a] shadow-[0_8px_30px_rgba(15,16,19,0.12)] backdrop-blur-xl transition hover:bg-white/50 active:scale-95 md:hidden"
          aria-label="Report a new issue"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>

        {/* The Interactive Map */}
        <IssueMap
          issues={filteredIssues}
          selectedIssue={selectedIssue}
          onSelectIssue={setSelectedIssue}
          onUpvote={handleUpvote}
          userUpvoted={userUpvoted}
          searchLocation={searchLocation}
        />
      </div>
    </div>
  );
}
