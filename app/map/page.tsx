"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { MapIssue, CATEGORY_COLORS } from "@/components/IssueMap";
import { getIssues, parseLocation, type IssueRecord } from "@/lib/supabase";

// Dynamically import Leaflet IssueMap to avoid SSR 'window is not defined'
const IssueMap = dynamic(() => import("@/components/IssueMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e8ece7] text-[#4b5563]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0f5d4a] border-t-transparent"></div>
        <span className="text-sm font-medium">Loading interactive Uyo map...</span>
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

  useEffect(() => {
    const loadIssues = async () => {
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
      // Category filter
      const matchesCategory =
        selectedCategory === "All Categories" || issue.category === selectedCategory;

      // Status filter
      const matchesStatus = !!selectedStatuses[issue.status];

      // Search location or title
      const query = searchLocation.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        issue.location.toLowerCase().includes(query) ||
        issue.title.toLowerCase().includes(query) ||
        issue.category.toLowerCase().includes(query);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [issues, selectedCategory, selectedStatuses, searchLocation]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f7f3ef] text-[#111111]">
      {/* Top Header (Matching UI/map.png) */}
      <header className="z-40 border-b border-[#e7ddd3] bg-white/90 px-4 py-3 sm:px-8 lg:px-12 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          {/* CIRP Brand Logo */}
          <Link href="/" className="group flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#ee7c2d] bg-[#fff3e8] text-[#ee7c2d] shadow-2xs transition group-hover:scale-105">
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
          <nav className="hidden items-center gap-7 md:flex" aria-label="Map Navigation">
            <Link
              href="/"
              className="text-[0.96rem] font-medium text-[#4b5563] transition hover:text-[#0f5d4a]"
            >
              Home
            </Link>
            <Link
              href="/issues"
              className="text-[0.96rem] font-medium text-[#4b5563] transition hover:text-[#0f5d4a]"
            >
              Issues
            </Link>
            <Link
              href="/map"
              className="relative py-1 text-[0.96rem] font-bold text-[#ee7c2d] after:absolute after:bottom-[-2px] after:left-0 after:h-[2.5px] after:w-full after:rounded-full after:bg-[#ee7c2d]"
            >
              Map
            </Link>
            <Link
              href="/about"
              className="text-[0.96rem] font-medium text-[#4b5563] transition hover:text-[#0f5d4a]"
            >
              About
            </Link>
          </nav>

          {/* Search Location Input (as shown in UI/map.png) */}
          <div className="flex flex-1 max-w-[420px] mx-2">
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
                aria-label="Search location"
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full rounded-full border border-[#e7ddd3] bg-white py-2 pl-9 pr-8 text-sm text-[#111111] placeholder:text-[#8d95a5] shadow-xs transition focus:border-[#ee7c2d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ee7c2d]/20"
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

          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <Link
              href="/login"
              className="rounded-full border border-[#e7ddd3] bg-white/80 px-4 py-1.5 text-sm font-medium text-[#1e293b] shadow-xs transition hover:border-[#ee7c2d] hover:bg-white hover:text-[#ee7c2d]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#ee7c2d] px-4.5 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d76a1a] hover:shadow-md active:scale-98"
            >
              Register
            </Link>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex md:hidden items-center gap-1.5 rounded-full border border-[#ee7c2d] bg-[#fff3e8] px-3 py-1.5 text-xs font-bold text-[#ee7c2d] shadow-xs"
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
        {/* DESKTOP: Floating Map Filters Card (Left Side, exactly matching UI/map.png) */}
        <aside className="absolute left-6 top-6 z-30 hidden md:block w-72 rounded-2xl border border-[#dfe4de] bg-white p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-[#eef1ec]">
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
              className="w-full rounded-xl border border-[#e7ddd3] bg-[#fffaf5] py-2 px-3 text-xs font-medium text-[#111111] transition focus:border-[#ee7c2d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ee7c2d]/20"
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
          <div className="mt-3 space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
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
                    : "text-[#4b5563] hover:bg-[#f9f3ee]"
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

          {/* Status Checkboxes (as in UI/map.png) */}
          <div className="mt-4 pt-3 border-t border-[#eef1ec]">
            <span className="block text-xs font-bold text-[#374151] mb-2">Show:</span>
            <div className="space-y-2">
              {[
                { name: "Submitted", color: "text-[#d96515]" },
                { name: "Under Review", color: "text-[#b45309]" },
                { name: "Resolved", color: "text-[#15803d]" },
              ].map((status) => (
                <label
                  key={status.name}
                  className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#4b5563]"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedStatuses[status.name]}
                    onChange={() => toggleStatus(status.name)}
                    className="h-4 w-4 rounded border-[#d7c7b8] text-[#ee7c2d] focus:ring-[#ee7c2d]"
                  />
                  <span>{status.name}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* MOBILE: Floating Filters Drawer (bottom sheet on mobile) */}
        {mobileFilterOpen && (
          <div className="fixed inset-x-0 bottom-16 z-40 block md:hidden rounded-t-3xl border-t border-[#dfe4de] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eef1ec]">
              <h3 className="text-base font-bold text-[#0f172a]">Map Filters</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full bg-[#f4f5f3] p-1.5 text-[#4b5563]"
              >
                ✕
              </button>
            </div>

            {/* Category selection */}
            <div className="mt-3">
              <label className="text-xs font-bold text-[#374151]">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#e7ddd3] bg-[#fffaf5] py-2 px-3 text-xs font-medium text-[#111111]"
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
            <div className="mt-4 pt-3 border-t border-[#eef1ec]">
              <span className="block text-xs font-bold text-[#374151] mb-2">Status</span>
              <div className="grid grid-cols-3 gap-2">
                {["Submitted", "Under Review", "Resolved"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleStatus(st)}
                    className={`rounded-xl py-1.5 px-2 text-center text-xs font-semibold transition ${selectedStatuses[st]
                      ? "bg-[#ee7c2d] text-white"
                      : "bg-[#f7f3ef] text-[#4b5563]"
                      }`}
                  >
                    {st}
                  </button>
                ))}
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

        {/* The Interactive Leaflet Map */}
        <IssueMap
          issues={filteredIssues}
          selectedIssue={selectedIssue}
          onSelectIssue={setSelectedIssue}
          onUpvote={handleUpvote}
          userUpvoted={userUpvoted}
        />
      </div>

    </div>
  );
}
