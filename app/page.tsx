"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getIssues, parseLocation, type IssueRecord } from "@/lib/supabase";

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

const fallbackImage = "/logo.svg";

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
}

const mapIssueRecord = (issue: IssueRecord): IssueItem => {
  const statusColor =
    issue.status === "Resolved"
      ? { bg: "bg-[#f3eee7]", text: "text-[#4a3c2d]", border: "border-[#e5d7ca]" }
      : issue.status === "Under Review"
        ? { bg: "bg-[#fef3c7]", text: "text-[#b45309]", border: "border-[#fde68a]" }
        : { bg: "bg-[#feece2]", text: "text-[#d96515]", border: "border-[#fcd7c3]" };

  const comments = issue.issue_comments?.length ?? 0;
  const votes = Math.max(1, comments + 1);
  const filterTags = ["all"];

  if (issue.status !== "Resolved") filterTags.push("nearby");
  if (issue.status === "Under Review" || comments > 0) filterTags.push("trending");
  if (issue.status === "Resolved") filterTags.push("resolved");

  return {
    id: issue.id,
    title: issue.title,
    category: issue.category,
    location: parseLocation(issue.location).address,
    time: formatRelativeTime(issue.created_at),
    votes,
    comments,
    status: issue.status,
    statusColor,
    image: issue.issue_images?.[0]?.image_url ?? fallbackImage,
    filterTags: Array.from(new Set(filterTags)),
  };
};

export default function HomePage() {
  const router = useRouter();
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await getIssues();
        setIssues(data.map(mapIssueRecord));
      } catch (error) {
        console.error("Failed to load live feed issues:", error);
        setIssues([]);
      }
    };

    void loadIssues();
  }, []);

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
    <div className="min-h-screen bg-transparent text-[var(--foreground)] flex flex-col selection:bg-[var(--primary)]/20">
      {/* Desktop / Mobile Top Navigation */}
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-16 pt-4 sm:px-8 lg:px-12">


        <section className="hero-showcase">
          <div className="hero-copy">
            <h1>
              Report <span className="pl-4 text-[#ee7c2d]">Issues</span>
              <br />
              <span className="text-[#ee7c2d]">Track</span> <span className="pl-4">Progress</span>
              <br />
              <span>Make <span className="pl-4 text-[#ee7c2d]">a</span> </span>
              <br />
              <span className="text-[#ee7c2d]">Difference</span>
            </h1>
            <p>
              Help improve your community by reporting issues around you. Together we can build a safer, cleaner, and better place to live.
            </p>
            <div className="hero-actions">
              <Link href="/report" className="hero-button">
                Report an Issue
              </Link>
              <Link href="/map" className="hero-button-secondary">
                View Map
              </Link>
            </div>
          </div>

          <div className="hero-art" aria-label="Robot illustration">
            <div className="hero-tools" />
            <div className="robot-scene">
              <div className="hero-float-card sm-hidden md:hidden">
                <div className="hero-stat">
                  <strong>132%</strong>
                  <small>growth</small>
                </div>
                <p>Stronger Communities, Better Tomorrow</p>
              </div>

              <div className="robot-chip" />
              <div className="robot-chip" />
              <div className="robot-chip" />

              <div className="robot-terminal">
                <div className="robot-camera" />
                <div className="robot-screen" />
                <div className="robot-keyboard" />
              </div>
            </div>

            <div className="hero-name">PLATFORM</div>
            <div className="hero-tilt">CIRP</div>
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
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ee7c2d] opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ee7c2d]"></span>
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
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${activeTab === tab.id
                      ? "bg-[#ee7c2d] text-white shadow-2xs"
                      : "text-[#4b5563] hover:text-[#0f172a]"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <Link
                href="/issues"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#ee7c2d] hover:underline"
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
            <div className="rounded-[28px] border border-white/40 bg-white/20 p-10 text-center shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3e8] text-[#ee7c2d]">
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
                      onClick={() => router.push(`/issues/${issue.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/issues/${issue.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      className="flex cursor-pointer items-center gap-3 rounded-[26px] border border-white/50 bg-white/25 p-2.5 shadow-[0_18px_45px_rgba(15,16,19,0.08)] backdrop-blur-xl transition duration-200 active:scale-[0.99] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#ee7c2d]/30"
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
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleUpvote(issue.id);
                              }}
                              className={`flex items-center gap-0.5 ${isUpvoted ? "font-bold text-[#ef4444]" : "hover:text-[#ef4444]"
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
                      onClick={() => router.push(`/issues/${issue.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/issues/${issue.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      className="group flex cursor-pointer flex-col overflow-hidden rounded-[28px] border border-white/50 bg-white/25 shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-[#ee7c2d]/40 hover:shadow-[0_25px_65px_rgba(238,124,45,0.16)] focus:outline-none focus:ring-2 focus:ring-[#ee7c2d]/30"
                    >
                      {/* Card Media with Status Badge */}
                      <div className="relative h-44 w-full overflow-hidden bg-[#e5e7eb]">
                        <img
                          src={issue.image}
                          alt={issue.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

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
                          <h3 className="text-base font-bold tracking-tight text-[#0f172a] group-hover:text-[#ee7c2d] transition">
                            {issue.title}
                          </h3>

                          {/* Location */}
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#525d6f]">
                            <svg
                              className="h-3.5 w-3.5 flex-shrink-0 text-[#ee7c2d]"
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
                        <div className="mt-4 flex items-center justify-between border-t border-white/60 pt-3 text-xs text-[#717b8a]">
                          <span className="font-medium">{issue.time}</span>

                          <div className="flex items-center gap-3">
                            {/* Upvote heart button */}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleUpvote(issue.id);
                              }}
                              className={`flex items-center gap-1 transition ${isUpvoted
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
    </div>
  );
}
