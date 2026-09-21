"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getIssues, type IssueRecord } from "@/lib/supabase";

interface IssueItem {
    id: string;
    title: string;
    category: string;
    description: string;
    location: string;
    createdAt: string;
    time: string;
    votes: number;
    comments: number;
    status: "Submitted" | "Under Review" | "Resolved";
    image: string;
    filterTags: string[];
}

const tabs = [
    { id: "all", label: "All Issues" },
    { id: "nearby", label: "Nearby Issues" },
    { id: "trending", label: "Trending" },
    { id: "resolved", label: "Resolved" },
];

const statusStyles: Record<IssueItem["status"], string> = {
    Submitted: "bg-[#feece2] text-[#d96515]",
    "Under Review": "bg-[#fef3c7] text-[#b45309]",
    Resolved: "bg-[#dcfce7] text-[#15803d]",
};

const fallbackImage =
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80";

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

function mapIssueRecord(issue: IssueRecord): IssueItem {
    const image = issue.issue_images?.[0]?.image_url ?? fallbackImage;
    const comments = issue.issue_comments?.length ?? 0;
    const votes = Math.max(1, comments + 1);
    const filterTags = ["all"];

    if (issue.status !== "Resolved") {
        filterTags.push("nearby");
    }

    if (issue.status === "Under Review" || comments > 0) {
        filterTags.push("trending");
    }

    if (issue.status === "Resolved") {
        filterTags.push("resolved");
    }

    return {
        id: issue.id,
        title: issue.title,
        category: issue.category,
        description: issue.description,
        location: issue.location,
        createdAt: issue.created_at,
        time: formatRelativeTime(issue.created_at),
        votes,
        comments,
        status: issue.status,
        image,
        filterTags: Array.from(new Set(filterTags)),
    };
}

export default function IssuesPage() {
    const [issues, setIssues] = useState<IssueItem[]>([]);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("Newest");
    const [listView, setListView] = useState<"list" | "grid">("list");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadIssues = async () => {
            try {
                const data = await getIssues();
                setIssues(data.map(mapIssueRecord));
                setLoadError(null);
            } catch (error) {
                console.error("Failed to load issues:", error);
                setIssues([]);
                setLoadError("Unable to load issues right now. Please check your Supabase connection and tables.");
            } finally {
                setLoading(false);
            }
        };

        void loadIssues();
    }, []);

    const categories = useMemo(() => {
        const values = Array.from(new Set(issues.map((issue) => issue.category)));
        return ["All", ...values];
    }, [issues]);

    const filteredIssues = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return issues
            .filter((issue) => {
                const matchesTab = activeTab === "all" ? true : issue.filterTags.includes(activeTab);
                const matchesCategory = category === "All" ? true : issue.category === category;
                const matchesSearch =
                    query === "" ||
                    issue.title.toLowerCase().includes(query) ||
                    issue.location.toLowerCase().includes(query) ||
                    issue.description.toLowerCase().includes(query) ||
                    issue.category.toLowerCase().includes(query);

                return matchesTab && matchesCategory && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === "Newest") {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                if (sortBy === "Most Voted") {
                    return b.votes - a.votes;
                }
                if (sortBy === "Most Discussed") {
                    return b.comments - a.comments;
                }
                return 0;
            });
    }, [activeTab, category, issues, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-transparent text-[var(--foreground)]">
            <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <div className="mb-4 px-1">
                    <h1 className="text-[clamp(1.8rem,2vw,2.4rem)] font-black tracking-tight text-[#0f172a]">
                        Issues
                    </h1>
                    <div className="mt-2 flex items-center gap-1 text-xs text-[#64748b] sm:text-sm">
                        <Link href="/" className="transition hover:text-[#0f5d4a]">
                            Home
                        </Link>
                        <span className="text-[#94a3b8]">&nbsp;&gt;&nbsp;</span>
                        <span className="font-medium text-[#0f172a]">Issues</span>
                    </div>
                </div>

                <div className="rounded-[18px] border border-[#e2e6e1] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.03)] sm:p-4">
                    {loadError && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            {loadError}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${isActive
                                        ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                                        : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-[420px]">
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#9ca3af]">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search issues..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/15"
                            />
                        </div>

                        <div className="flex items-center gap-2 self-end lg:self-auto">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2 text-xs font-medium text-[#374151] transition hover:border-[#cfe3d8] hover:text-[#0f5d4a]"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                </svg>
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <label className="mb-1 block text-xs font-medium text-[#475569]">Category:</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full appearance-none rounded-lg border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2 text-sm text-[#0f172a] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15"
                                >
                                    {categories.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#64748b]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="relative flex-1">
                            <label className="mb-1 block text-xs font-medium text-[#475569]">Sort by:</label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full appearance-none rounded-lg border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2 text-sm text-[#0f172a] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15"
                                >
                                    <option>Newest</option>
                                    <option>Most Voted</option>
                                    <option>Most Discussed</option>
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#64748b]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="ml-auto flex gap-2 self-end">
                            <button
                                type="button"
                                onClick={() => setListView("list")}
                                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${listView === "list" ? "border-[#d5dad3] bg-[#0f5d4a] text-white" : "border-[#d8dcd6] bg-[#f9faf9] text-[#4b5563]"}`}
                                aria-label="List view"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setListView("grid")}
                                className={`flex h-10 w-10 items-center justify-center rounded-lg border ${listView === "grid" ? "border-[#d5dad3] bg-[#0f5d4a] text-white" : "border-[#d8dcd6] bg-[#f9faf9] text-[#4b5563]"}`}
                                aria-label="Grid view"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="4" rx="1" />
                                    <rect x="14" y="11" width="7" height="10" rx="1" />
                                    <rect x="3" y="12" width="7" height="9" rx="1" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <section className="mt-6 space-y-4">
                    {loading ? (
                        <div className="rounded-2xl border border-[#e2e6e1] bg-white p-10 text-center text-sm text-[#64748b] shadow-sm">
                            Loading issues from the community database...
                        </div>
                    ) : filteredIssues.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white p-10 text-center shadow-sm">
                            <h3 className="text-base font-semibold text-[#0f172a]">No issues found</h3>
                            <p className="mt-1 text-sm text-[#64748b]">Try another filter or search term.</p>
                        </div>
                    ) : (
                        filteredIssues.map((issue) => (
                            <Link
                                key={issue.id}
                                href={`/issues/${issue.id}`}
                                className={`block overflow-hidden rounded-2xl border border-[#e2e6e1] bg-white shadow-sm transition hover:shadow-md ${listView === "grid" ? "sm:flex sm:flex-col" : "sm:flex"}`}
                            >
                                <div className={`${listView === "grid" ? "w-full" : "w-full sm:w-[240px]"}`}>
                                    <img
                                        src={issue.image}
                                        alt={issue.title}
                                        className="h-40 w-full object-cover sm:h-full"
                                    />
                                </div>

                                <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">{issue.title}</h2>
                                        </div>
                                        <span className={`inline-flex rounded-full px-2 py-1 text-[0.7rem] font-semibold ${statusStyles[issue.status]}`}>
                                            {issue.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-[#64748b]">
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span>{issue.location}</span>
                                    </div>

                                    <p className="text-sm leading-6 text-[#4b5563]">{issue.description}</p>

                                    <div className="flex items-center justify-between gap-4 pt-1">
                                        <div className="flex items-center gap-4 text-[#64748b]">
                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 21s-8.5-4.35-10-9a5.5 5.5 0 0 1 10-5.5A5.5 5.5 0 0 1 22 12c-1.5 4.65-10 9-10 9z" />
                                                </svg>
                                                <span>{issue.votes}</span>
                                            </span>

                                            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                <span>{issue.comments}</span>
                                            </span>
                                        </div>

                                        <div className="text-right text-xs text-[#64748b]">{issue.time}</div>

                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe4de] bg-[#f7f8f7] text-[#374151] transition hover:border-[#0f5d4a] hover:text-[#0f5d4a]">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
