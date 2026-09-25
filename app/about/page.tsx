import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const featureCards = [
    {
        title: "User & Authentication",
        description:
            "Secure registration and login flows give residents personal access to their reports, saved issues, and account details.",
        bullets: [
            "Account registration and login",
            "Profile dashboard for My Reports and Saved Issues",
            "Anonymous reporting for sensitive cases",
        ],
    },
    {
        title: "Issue Reporting Workflow",
        description:
            "Residents can report community problems with structured details, locations, photos, and contact information for faster follow-up.",
        bullets: [
            "Issue title and category selection",
            "Detailed description and location address",
            "Photo upload and optional contact details",
            "Manual or map-based pinpointing with geolocation support",
        ],
    },
    {
        title: "Tracking & Status System",
        description:
            "Every issue can move through clear stages, helping residents understand what is happening and whether action is being taken.",
        bullets: [
            "Submitted",
            "Under Review",
            "Resolved or rejected when appropriate",
            "Live status updates across views and dashboards",
        ],
    },
    {
        title: "Feed & Public Integration",
        description:
            "Community issues are surfaced in a public feed so residents can see what is happening nearby and act collectively.",
        bullets: [
            "Live homepage issue feed",
            "Search and filtering by status or category",
            "Trending and nearby issue discovery",
            "Map-based visibility for local problems",
        ],
    },
];

const issueCategories = [
    "Bad roads / potholes",
    "Broken streetlights",
    "Flooding",
    "Waste disposal",
    "Water shortage",
    "Power / electricity instability",
    "Security concerns",
    "GBV and vulnerable youth issues",
    "Kidnapping and banditry",
    "Insurgency and militancy",
    "Oil spills and pollution",
    "Other community concerns",
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-transparent text-[var(--foreground)]">
            <Navbar />

            <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-16 pt-6 sm:px-8 lg:px-12">
                <section className="overflow-hidden rounded-[28px] border border-[#e2e6e1] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
                    <div className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
                        <div>
                            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--secondary-soft)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                                About CIRP
                            </span>

                            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0f172a] sm:text-4xl lg:text-5xl">
                                A platform built to turn local problems into action.
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-7 text-[#4b5563] sm:text-base">
                                Community Issues Report Platform enables residents to report local community problems such as bad roads, potholes, broken streetlights, flooding, waste disposal, water shortages, power grid instability, security concerns, and other issues affecting everyday life.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/report"
                                    className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
                                >
                                    Report an Issue
                                </Link>
                                <Link
                                    href="/map"
                                    className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                                >
                                    Explore the Map
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-[#e9ece7] bg-[#f8faf8] p-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[#0f172a]">Platform focus</h2>
                                <span className="rounded-full bg-[#eaf4ef] px-2.5 py-1 text-[0.7rem] font-semibold text-[#0f5d4a]">
                                    Community-first
                                </span>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#edf1ee]">
                                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#64748b]">
                                        Mission
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[#334155]">
                                        To make it easier for residents to surface public problems, track their resolution, and work together to improve local living conditions.
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#edf1ee]">
                                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#64748b]">
                                        Impact
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[#334155]">
                                        From infrastructure and utilities to safety and environmental concerns, the platform helps communities document issues that need timely attention.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#0f5d4a]">
                        Key Features
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0f172a] sm:text-3xl">
                        Comprehensive tools for effective issue reporting
                    </h2>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        {featureCards.map((card) => (
                            <div key={card.title} className="rounded-[24px] border border-[#e2e6e1] bg-white p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-[#0f172a]">{card.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-[#4b5563]">{card.description}</p>
                                <ul className="mt-4 space-y-2 text-xs text-[#334155]">
                                    {card.bullets.map((bullet) => (
                                        <li key={bullet} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#0f5d4a]" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10 rounded-[28px] border border-[#e2e6e1] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#0f5d4a]">
                        Common issue categories
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-[#0f172a] sm:text-3xl">
                        The platform is designed to cover the real problems residents face every day.
                    </h2>

                    <div className="mt-6 flex flex-wrap gap-2.5">
                        {issueCategories.map((category) => (
                            <span
                                key={category}
                                className="inline-flex items-center rounded-full border border-[#dfe5e0] bg-[#f5f7f5] px-3 py-1.5 text-xs font-medium text-[#334155]"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
