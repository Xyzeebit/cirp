"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { signOut, supabase } from "@/lib/supabase";

const stats = [
    { label: "My Reports", value: 12, accent: "bg-[rgba(17,17,17,0.04)] text-[var(--foreground)]" },
    { label: "Under Review", value: 5, accent: "bg-[rgba(238,124,45,0.08)] text-[var(--primary)]" },
    { label: "Resolved", value: 7, accent: "bg-[rgba(15,93,74,0.08)] text-[var(--muted)]" },
    { label: "Saved Issues", value: 9, accent: "bg-[rgba(255,255,255,0.35)] text-[var(--foreground)]" },
];

const recentReports = [
    {
        title: "Bad Road / Pothole",
        location: "Unity Road, GRA, Uyo",
        time: "2 days ago",
        status: "Under Review",
        statusClass: "bg-[#fef3c7] text-[#b45309]",
        image:
            "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Broken Streetlight",
        location: "Park Avenue, GRA, Uyo",
        time: "3 days ago",
        status: "Submitted",
        statusClass: "bg-[#feece2] text-[#d96515]",
        image:
            "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80",
    },
    {
        title: "Flooding",
        location: "Ewet Housing Estate, Uyo",
        time: "1 week ago",
        status: "Under Review",
        statusClass: "bg-[#fef3c7] text-[#b45309]",
        image:
            "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    },
];

const menuItems = [
    { id: "overview", label: "Dashboard", icon: "▣" },
    { id: "reports", label: "My Reports", icon: "▤" },
    { id: "saved", label: "Saved Issues", icon: "☆" },
    { id: "notifications", label: "Notifications", icon: "◌", badge: 3 },
    { id: "profile", label: "Profile Settings", icon: "⚙" },
    { id: "logout", label: "Logout", icon: "↩" },
] as const satisfies ReadonlyArray<
    | { id: "overview"; label: string; icon: string }
    | { id: "reports"; label: string; icon: string }
    | { id: "saved"; label: string; icon: string }
    | { id: "notifications"; label: string; icon: string; badge: number }
    | { id: "profile"; label: string; icon: string }
    | { id: "logout"; label: string; icon: string }
>;

type DashboardView = (typeof menuItems)[number]["id"];

export default function DashboardPage() {
    const router = useRouter();
    const [activeView, setActiveView] = useState<DashboardView>("overview");
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
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
            const { data: { session }, error } = await supabase.auth.getSession();

            if (!isMounted) return;

            if (error) {
                setUser(null);
                setIsCheckingAuth(false);
                return;
            }

            setUser(session?.user ?? null);
            setIsCheckingAuth(false);
        };

        void syncUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return;
            setUser(session?.user ?? null);
            setIsCheckingAuth(false);
        });

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!isCheckingAuth && !user) {
            router.replace("/login");
        }
    }, [router, isCheckingAuth, user]);

    const displayName = user?.user_metadata?.full_name?.trim() || user?.email?.split("@")[0]?.trim() || "Resident";
    const avatarUrl = user?.user_metadata?.avatar_url;
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "U";

    const handleMenuClick = async (id: DashboardView) => {
        if (id === "logout") {
            await signOut();
            router.push("/");
            return;
        }

        setActiveView(id);
    };

    const renderView = () => {
        switch (activeView) {
            case "reports":
                return (
                    <div className="rounded-[18px] border border-[#e2e6e1] bg-white p-5">
                        <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">My Reports</h2>
                        <div className="mt-4 space-y-3">
                            {[
                                { title: "Open Drainage Issue", status: "Under Review", date: "May 4, 2026" },
                                { title: "Broken Streetlight", status: "Submitted", date: "Apr 26, 2026" },
                                { title: "Pothole on Unity Road", status: "Resolved", date: "Mar 12, 2026" },
                            ].map((item) => (
                                <div key={item.title} className="flex items-center justify-between rounded-2xl border border-[#edf1ee] bg-[#fafcfb] p-4">
                                    <div>
                                        <div className="font-semibold text-[#0f172a]">{item.title}</div>
                                        <div className="text-sm text-[#64748b]">Reported on {item.date}</div>
                                    </div>
                                    <span className="rounded-full bg-[#eaf4ef] px-2.5 py-1 text-xs font-semibold text-[#0f5d4a]">
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "saved":
                return (
                    <div className="rounded-[18px] border border-[#e2e6e1] bg-white p-5">
                        <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">Saved Issues</h2>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {[
                                "Uncollected Waste Near Market Square",
                                "Waterlogged Road at Ewet Housing",
                                "Unsafe Pedestrian Crossing",
                                "Missing Road Sign at Ikot Ekpene Road",
                            ].map((item) => (
                                <div key={item} className="rounded-2xl border border-[#edf1ee] bg-[#fafcfb] p-4">
                                    <div className="mb-2 text-lg font-semibold text-[#0f172a]">{item}</div>
                                    <button type="button" className="text-sm font-semibold text-[#0f5d4a] hover:text-[#0c4c3c]">
                                        View details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "notifications":
                return (
                    <div className="rounded-[18px] border border-[#e2e6e1] bg-white p-5">
                        <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">Notifications</h2>
                        <div className="mt-4 space-y-3">
                            {[
                                { info: "Your pothole report has been assigned to the roads team.", time: "2 hours ago" },
                                { info: "A resident commented on your streetlight report.", time: "Yesterday" },
                                { info: "Issue status updated to resolved.", time: "3 days ago" },
                            ].map((item) => (
                                <div key={item.info} className="rounded-2xl border border-[#edf1ee] bg-[#fafcfb] p-4">
                                    <div className="font-medium text-[#0f172a]">{item.info}</div>
                                    <div className="mt-1 text-sm text-[#64748b]">{item.time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "profile":
                return (
                    <div className="rounded-[18px] border border-[#e2e6e1] bg-white p-5">
                        <h2 className="text-2xl font-black tracking-tight text-[#0f172a]">Profile Settings</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="block text-sm font-medium text-[#374151]">
                                Full name
                                <input defaultValue={displayName} className="mt-1 w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2.5 text-[#0f172a] outline-none focus:border-[#0f5d4a] focus:ring-2 focus:ring-[#0f5d4a]/20" />
                            </label>
                            <label className="block text-sm font-medium text-[#374151]">
                                Email
                                <input defaultValue={user?.email || "resident@example.com"} className="mt-1 w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2.5 text-[#0f172a] outline-none focus:border-[#0f5d4a] focus:ring-2 focus:ring-[#0f5d4a]/20" />
                            </label>
                            <label className="block text-sm font-medium text-[#374151]">
                                Phone number
                                <input defaultValue="+234 812 345 6789" className="mt-1 w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2.5 text-[#0f172a] outline-none focus:border-[#0f5d4a] focus:ring-2 focus:ring-[#0f5d4a]/20" />
                            </label>
                            <label className="block text-sm font-medium text-[#374151]">
                                Community
                                <input defaultValue="Uyo" className="mt-1 w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2.5 text-[#0f172a] outline-none focus:border-[#0f5d4a] focus:ring-2 focus:ring-[#0f5d4a]/20" />
                            </label>
                        </div>
                        <button type="button" className="mt-5 rounded-xl border border-[rgba(17,17,17,0.08)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-xs transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
                            Save changes
                        </button>
                    </div>
                );
            case "overview":
            default:
                return (
                    <>
                        <div className="rounded-[18px] border border-[#e2e6e1] bg-white p-4 sm:p-5">
                            <h1 className="text-[clamp(1.8rem,2vw,2.1rem)] font-black tracking-tight text-[#0f172a]">
                                Dashboard Overview
                            </h1>
                            <p className="mt-2 text-sm text-[#475569]">Welcome back, {displayName.split(" ")[0]}.</p>
                            <p className="mt-1 text-sm text-[#64748b]">Here&apos;s what&apos;s happening in your community.</p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {stats.map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-[#e2e6e1] bg-[#fbfbfa] p-4 shadow-sm">
                                        <div className={`inline-flex rounded-xl px-2.5 py-1.5 text-xs font-semibold ${item.accent}`}>
                                            {item.label}
                                        </div>
                                        <div className="mt-3 text-3xl font-black text-[#0f172a]">{item.value}</div>
                                        <button type="button" className="mt-2 text-xs font-medium text-[#0f5d4a] hover:text-[#0c4c3c]">
                                            View all
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_0.95fr]">
                            <section className="rounded-[18px] border border-[#e2e6e1] bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-black tracking-tight text-[#0f172a]">Recent Reports</h2>
                                </div>

                                <div className="space-y-3">
                                    {recentReports.map((report) => (
                                        <div key={report.title} className="flex items-center gap-3 rounded-2xl border border-[#edf1ee] bg-[#fafcfb] p-2.5">
                                            <img src={report.image} alt={report.title} className="h-14 w-14 rounded-xl object-cover" />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-sm font-bold text-[#0f172a]">{report.title}</h3>
                                                        <p className="truncate text-xs text-[#64748b]">{report.location}</p>
                                                    </div>
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-[0.62rem] font-semibold ${report.statusClass}`}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="whitespace-nowrap text-right text-[0.7rem] text-[#64748b]">{report.time}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex justify-center sm:justify-start">
                                    <button type="button" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)]">
                                        View all reports
                                    </button>
                                </div>
                            </section>

                            <aside className="space-y-5">
                                <section className="rounded-[18px] border border-[#e2e6e1] bg-white p-4 shadow-sm sm:p-5">
                                    <h2 className="text-xl font-black tracking-tight text-[#0f172a]">Issue Status Overview</h2>

                                    <div className="mt-5 flex items-center justify-center gap-4">
                                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#ef4444_0_50%,#f59e0b_50%_76%,#22c55e_76%_100%)]">
                                            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white text-center">
                                                <div>
                                                    <div className="text-2xl font-black text-[#0f172a]">24</div>
                                                    <div className="text-[0.62rem] uppercase tracking-[0.08em] text-[#64748b]">Total</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs text-[#475569]">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                                                <span>Submitted</span>
                                                <span className="font-semibold text-[#0f172a]">12 (50%)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                                                <span>Under Review</span>
                                                <span className="font-semibold text-[#0f172a]">5 (21%)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                                                <span>Resolved</span>
                                                <span className="font-semibold text-[#0f172a]">7 (29%)</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-[18px] border border-[#e2e6e1] bg-white p-4 shadow-sm sm:p-5">
                                    <h2 className="text-xl font-black tracking-tight text-[#0f172a]">Impact in Your Community</h2>

                                    <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[rgba(255,255,255,0.4)] p-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(238,124,45,0.08)] text-lg font-bold text-[var(--primary)]">+</div>
                                        <p className="text-sm font-medium text-[#1f2937]">
                                            Thank you for helping improve your community!
                                        </p>
                                    </div>
                                </section>
                            </aside>
                        </div>
                    </>
                );
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_rgba(238,242,236,0.95)_45%,_rgba(231,234,228,0.9))] px-3 py-4 sm:px-5 lg:px-8">
                <div className="mx-auto max-w-[1200px] overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.28)] shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="flex min-h-[860px] flex-col lg:flex-row">
                        <aside className="w-full border-b border-[rgba(17,17,17,0.08)] bg-[rgba(255,255,255,0.2)] p-4 lg:w-[240px] lg:border-b-0 lg:border-r">
                            <div className="flex items-center gap-3 pb-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,17,17,0.08)] bg-white/70 text-[var(--primary)] shadow-sm">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="7" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        <circle cx="11" cy="11" r="2.5" fill="currentColor" stroke="none" />
                                    </svg>
                                </div>
                                <div className="leading-tight">
                                    <div className="text-[1.55rem] font-black tracking-tight text-[var(--foreground)]">Dashboard</div>
                                    <div className="text-[0.7rem] leading-[1.2] text-[var(--muted)]">
                                        Account
                                        <br />
                                        Overview
                                    </div>
                                </div>
                            </div>

                            <nav className="mt-5 space-y-1.5">
                                {menuItems.map((item) => {
                                    const isActive = activeView === item.id;
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleMenuClick(item.id)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isActive ? "bg-white/70 text-[var(--foreground)] shadow-sm ring-1 ring-[rgba(17,17,17,0.05)]" : "text-[var(--muted)] hover:bg-[rgba(17,17,17,0.04)] hover:text-[var(--foreground)]"
                                                }`}
                                        >
                                            <span className="flex h-5 w-5 items-center justify-center text-[0.95rem] text-[var(--primary)]">{item.icon}</span>
                                            <span>{item.label}</span>
                                            {"badge" in item && item.badge ? (
                                                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[rgba(238,124,45,0.14)] px-1.5 text-[0.62rem] font-bold text-[var(--primary)]">
                                                    {item.badge}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </nav>
                        </aside>

                        <main className="flex-1 bg-[rgba(255,255,255,0.12)] p-4 sm:p-5 lg:p-7">
                            <header className="flex items-center justify-between gap-3 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-[rgba(17,17,17,0.08)] bg-white/60 text-lg text-[var(--primary)] shadow-sm sm:flex">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                                            <path d="M10 21a2 2 0 0 0 4 0" />
                                        </svg>
                                    </div>
                                    <div className="h-10 w-10 overflow-hidden rounded-full border border-[rgba(17,17,17,0.08)] bg-white/60 shadow-sm">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-[rgba(238,124,45,0.08)] text-sm font-bold text-[var(--primary)]">
                                                {initials}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-sm font-medium text-[var(--muted)]">
                                        <div className="text-[0.7rem] uppercase tracking-[0.08em] text-[var(--muted)]">Resident</div>
                                        <div className="text-base font-semibold text-[var(--foreground)]">{displayName}</div>
                                    </div>
                                </div>
                            </header>

                            {renderView()}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
