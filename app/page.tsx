"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";

interface IssueItem {
  id: string;
  title: string;
  category: string;
  location: string;
  time: string;
  votes: number;
  comments: number;
  status: "Submitted" | "Under Review" | "Resolved";
  statusColor: {
    bg: string;
    text: string;
    border?: string;
  };
  image: string;
  filterTags: string[];
}

const INITIAL_ISSUES: IssueItem[] = [
  {
    id: "1",
    title: "Bad Road / Pothole",
    category: "Road Infrastructure",
    location: "Unity Road, GRA, Enugu",
    time: "10 mins ago",
    votes: 12,
    comments: 3,
    status: "Submitted",
    statusColor: {
      bg: "bg-[#feece2]",
      text: "text-[#d96515]",
      border: "border-[#fcd7c3]",
    },
    image:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    filterTags: ["all", "nearby"],
  },
  {
    id: "2",
    title: "Broken Streetlight",
    category: "Electricity & Lighting",
    location: "Park Avenue, GRA, Enugu",
    time: "30 mins ago",
    votes: 8,
    comments: 1,
    status: "Under Review",
    statusColor: {
      bg: "bg-[#fef3c7]",
      text: "text-[#b45309]",
      border: "border-[#fde68a]",
    },
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    filterTags: ["all", "nearby", "trending"],
  },
  {
    id: "3",
    title: "Waste Disposal",
    category: "Sanitation",
    location: "Abakpa Nike, Enugu",
    time: "1 hour ago",
    votes: 15,
    comments: 2,
    status: "Submitted",
    statusColor: {
      bg: "bg-[#feece2]",
      text: "text-[#d96515]",
      border: "border-[#fcd7c3]",
    },
    image:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    filterTags: ["all", "trending"],
  },
  {
    id: "4",
    title: "Flooding",
    category: "Drainage & Water",
    location: "Independence Layout, Enugu",
    time: "2 hours ago",
    votes: 20,
    comments: 6,
    status: "Submitted",
    statusColor: {
      bg: "bg-[#feece2]",
      text: "text-[#d96515]",
      border: "border-[#fcd7c3]",
    },
    image:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    filterTags: ["all", "trending"],
  },
  {
    id: "5",
    title: "Water Shortage",
    category: "Public Utilities",
    location: "New Haven, Enugu",
    time: "1 day ago",
    votes: 16,
    comments: 4,
    status: "Resolved",
    statusColor: {
      bg: "bg-[#dcfce7]",
      text: "text-[#15803d]",
      border: "border-[#bbf7d0]",
    },
    image:
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80",
    filterTags: ["all", "resolved"],
  },
  {
    id: "6",
    title: "Power Grid Instability",
    category: "Power Supply",
    location: "Achara Layout, Enugu",
    time: "3 hours ago",
    votes: 24,
    comments: 9,
    status: "Under Review",
    statusColor: {
      bg: "bg-[#fef3c7]",
      text: "text-[#b45309]",
      border: "border-[#fde68a]",
    },
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
    filterTags: ["all", "nearby", "trending"],
  },
];

export default function HomePage() {
  const [issues, setIssues] = useState<IssueItem[]>(INITIAL_ISSUES);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  const toggleUpvote = (id: string) => {
    setUpvotedIds((prev) => {
      const isCurrentlyUpvoted = !!prev[id];
      const nextState = !isCurrentlyUpvoted;

      setIssues((list) =>
        list.map((item) =>
          item.id === id
            ? { ...item, votes: isCurrentlyUpvoted ? item.votes - 1 : item.votes + 1 }
            : item
        )
      );

      return { ...prev, [id]: nextState };
    });
  };

  // Filter issues according to tab and search query
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesTab =
        activeTab === "all" ? true : issue.filterTags.includes(activeTab);

      const matchesSearch =
        searchQuery.trim() === "" ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.status.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [issues, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f4f5f3] text-[#0f172a] flex flex-col selection:bg-[#0f5d4a]/20">
      {/* Desktop / Mobile Top Navigation */}
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-16 pt-4 sm:px-8 lg:px-12">
        {/* MOBILE VIEW ONLY: Resident Greeting Header & Quick Actions (matching UI/mobile view.png) */}
        <div className="mb-6 block md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#0f172a] flex items-center gap-1.5">
                Hello, John <span className="text-xl">👋</span>
              </h2>
              <p className="text-xs text-[#6b7280]">
                Let&apos;s build a better community together.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Link
              href="/report"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f5d4a] py-3 text-sm font-semibold text-white shadow-sm active:scale-98 transition"
            >
              Report an Issue
            </Link>
          </div>

          {/* Quick Filter Circles (from UI/mobile view.png) */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              {
                id: "nearby",
                label: "Nearby",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
              },
              {
                id: "trending",
                label: "Trending",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
              },
              {
                id: "resolved",
                label: "Resolved",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
              {
                id: "all",
                label: "All Issues",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                ),
              },
            ].map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition ${
                    isSelected
                      ? "bg-[#e5f1ea] text-[#0f5d4a] font-semibold ring-1 ring-[#0f5d4a]"
                      : "bg-white text-[#4b5563] shadow-2xs hover:bg-[#eef2ee]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isSelected ? "bg-[#0f5d4a] text-white" : "bg-[#ecf5f0] text-[#0f5d4a]"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[0.72rem]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HERO SECTION (Matching UI/home.png exactly) */}
        <section className="relative grid items-center gap-8 py-4 sm:py-6 lg:grid-cols-12 lg:gap-8 lg:py-10">
          {/* Left Text Column */}
          <div className="lg:col-span-6 xl:col-span-6">
            {/* Tagline Badge */}
            <div className="inline-flex flex-col rounded-xl bg-[#e3efe7] px-3.5 py-1.5 text-xs font-semibold text-[#0f5d4a] shadow-2xs sm:text-sm">
              <span>Stronger Communities,</span>
              <span>Better Tomorrow</span>
            </div>

            {/* Headline */}
            <h1 className="mt-4 text-[2.4rem] font-black leading-[1.08] tracking-[-0.04em] text-[#0f172a] sm:text-[3.2rem] lg:text-[3.8rem] xl:text-[4.2rem]">
              Report Issues.
              <br />
              Track Progress.
              <br />
              Make a Difference.
            </h1>

            {/* Subtext */}
            <p className="mt-4 max-w-[500px] text-sm leading-relaxed text-[#4b5563] sm:text-base lg:text-[1.05rem]">
              Help improve your community by reporting issues around you.
              Together, we can build a safer, cleaner, and better place to live.
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                href="/report"
                className="inline-flex items-center justify-center rounded-xl bg-[#0f5d4a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c4c3c] hover:shadow-md active:scale-98 sm:text-base"
              >
                Report an Issue
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d5ded6] bg-[#f4f5f3] px-6 py-3 text-sm font-semibold text-[#0f172a] transition hover:border-[#0f5d4a] hover:bg-white hover:text-[#0f5d4a] active:scale-98 sm:text-base shadow-2xs"
              >
                <span>View Map</span>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="22" y1="12" x2="18" y2="12" />
                  <line x1="6" y1="12" x2="2" y2="12" />
                  <line x1="12" y1="6" x2="12" y2="2" />
                  <line x1="12" y1="22" x2="12" y2="18" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Hero Illustration (Clean, crisp, no CSS clutter) */}
          <div className="relative flex items-center justify-center lg:col-span-6 xl:col-span-6">
            <div className="relative w-full max-w-[620px]">
              <img
                src="/hero-image.png"
                alt="Community members reporting issues on smartphone with map pin illustration"
                className="h-auto w-full object-contain drop-shadow-xs transition duration-500 hover:scale-[1.01]"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* LIVE FEED SECTION */}
        <section className="mt-8 pt-4 sm:mt-12 sm:pt-6 border-t border-[#e2e6e0]">
          {/* Section Header */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight text-[#0f172a] sm:text-3xl">
                  Live Feed
                </h2>
                <span className="relative flex h-3 w-3" title="Live updates active">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0f5d4a] opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#0f5d4a]"></span>
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#6b7280] sm:text-sm">
                Latest reported issues in your community
              </p>
            </div>

            {/* View All Issues link & Desktop Filter Tabs */}
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#d8dcd6] bg-white p-1 shadow-2xs">
                {[
                  { id: "all", label: "All" },
                  { id: "nearby", label: "Nearby" },
                  { id: "trending", label: "Trending" },
                  { id: "resolved", label: "Resolved" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                      activeTab === tab.id
                        ? "bg-[#0f5d4a] text-white shadow-2xs"
                        : "text-[#4b5563] hover:text-[#0f172a]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Link
                href="/issues"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f5d4a] hover:underline"
              >
                <span>View All Issues</span>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Issue Cards: Desktop Grid (matching UI/home.png) & Mobile Horizontal Cards (matching UI/mobile view.png) */}
          {filteredIssues.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4ef] text-[#0f5d4a]">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#0f172a]">No issues found</h3>
              <p className="mt-1 text-xs text-[#6b7280]">
                Try adjusting your search query or switching tabs.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE COMPACT CARDS (Matching UI/mobile view.png) */}
              <div className="flex flex-col gap-3 sm:hidden">
                {filteredIssues.map((issue) => {
                  const isUpvoted = !!upvotedIds[issue.id];
                  return (
                    <article
                      key={`mobile-${issue.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-[#e2e6e1] bg-white p-2.5 shadow-2xs transition active:scale-99"
                    >
                      {/* Left Thumbnail */}
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#e5e7eb]">
                        <img
                          src={issue.image}
                          alt={issue.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Right Details */}
                      <div className="flex flex-1 min-w-0 flex-col justify-between py-0.5">
                        <div>
                          <h3 className="truncate text-sm font-bold tracking-tight text-[#0f172a]">
                            {issue.title}
                          </h3>
                          <div className="mt-0.5 flex items-center gap-1 text-[0.72rem] text-[#64748b]">
                            <svg
                              className="h-3 w-3 shrink-0 text-[#0f5d4a]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="truncate">{issue.location}</span>
                          </div>
                        </div>

                        {/* Status Badge & Timestamp / Upvotes */}
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[0.68rem] font-bold ${issue.statusColor.bg} ${issue.statusColor.text}`}
                          >
                            {issue.status}
                          </span>

                          <div className="flex items-center gap-2.5 text-[0.72rem] text-[#64748b]">
                            <span>{issue.time}</span>
                            <button
                              type="button"
                              onClick={() => toggleUpvote(issue.id)}
                              className={`flex items-center gap-0.5 ${
                                isUpvoted ? "font-bold text-[#ef4444]" : "hover:text-[#ef4444]"
                              }`}
                              aria-label={`Upvote ${issue.title}`}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill={isUpvoted ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                              <span>{issue.votes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* DESKTOP & TABLET GRID CARDS (Matching UI/home.png) */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredIssues.map((issue) => {
                  const isUpvoted = !!upvotedIds[issue.id];
                  return (
                    <article
                      key={`desktop-${issue.id}`}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-[#e2e6e1] bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-[#0f5d4a]/30 hover:shadow-md"
                    >
                      {/* Card Media with Status Badge */}
                      <div className="relative h-44 w-full overflow-hidden bg-[#e5e7eb]">
                        <img
                          src={issue.image}
                          alt={issue.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Gradient overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                        {/* Status Badge */}
                        <span
                          className={`absolute left-3 bottom-3 inline-flex items-center rounded-md px-2.5 py-0.75 text-[0.72rem] font-bold shadow-xs ${issue.statusColor.bg} ${issue.statusColor.text} ${issue.statusColor.border ? `border ${issue.statusColor.border}` : ""}`}
                        >
                          {issue.status}
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <h3 className="text-base font-bold tracking-tight text-[#0f172a] group-hover:text-[#0f5d4a] transition">
                            {issue.title}
                          </h3>

                          {/* Location */}
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#525d6f]">
                            <svg
                              className="h-3.5 w-3.5 flex-shrink-0 text-[#0f5d4a]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className="truncate">{issue.location}</span>
                          </div>
                        </div>

                        {/* Card Footer: Timestamp, Upvotes & Comments */}
                        <div className="mt-4 flex items-center justify-between border-t border-[#f0f2ef] pt-3 text-xs text-[#717b8a]">
                          <span className="font-medium">{issue.time}</span>

                          <div className="flex items-center gap-3">
                            {/* Upvote heart button */}
                            <button
                              type="button"
                              onClick={() => toggleUpvote(issue.id)}
                              className={`flex items-center gap-1 transition ${
                                isUpvoted
                                  ? "font-bold text-[#ef4444]"
                                  : "text-[#717b8a] hover:text-[#ef4444]"
                              }`}
                              aria-label={`Upvote ${issue.title}`}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill={isUpvoted ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                              <span>{issue.votes}</span>
                            </button>

                            {/* Comments count */}
                            <div className="flex items-center gap-1 text-[#717b8a]">
                              <svg
                                className="h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                              <span>{issue.comments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar (matches UI/mobile view.png) */}
      <MobileBottomNav />
    </div>
  );
}
