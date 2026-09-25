"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { addIssueComment, getIssueById, parseLocation, type IssueCommentRecord, type IssueRecord } from "@/lib/supabase";

const statusClasses: Record<IssueRecord["status"], string> = {
    Submitted: "bg-[#fff2e8] text-[#ee7c2d] border border-[#f9d2b1]",
    "Under Review": "bg-[#f8f2eb] text-[#4a3c2d] border border-[#ead8c5]",
    Resolved: "bg-[#f3eee7] text-[#4a3c2d] border border-[#e5d7ca]",
};

export default function IssueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const issueId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    const [issue, setIssue] = useState<IssueRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [optimisticComments, setOptimisticComments] = useState<IssueCommentRecord[]>([]);

    useEffect(() => {
        if (!issueId) return;

        const loadIssue = async () => {
            try {
                const issueData = await getIssueById(issueId);
                setIssue(issueData);
                setSelectedImage(issueData?.issue_images?.[0]?.image_url ?? "/logo.svg");
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        void loadIssue();
    }, [issueId]);

    const handleCommentSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!issue) return;

        const trimmedComment = comment.trim();
        if (!trimmedComment) {
            setErrorMessage("Comment cannot be empty.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            const trimmedAuthor = authorName.trim();

            // Optimistically add the comment to the UI immediately
            const optimisticComment: IssueCommentRecord = {
                id: `temp-${Date.now()}`,
                issue_id: issue.id,
                user_id: null,
                author_name: trimmedAuthor || "Anonymous resident",
                content: trimmedComment,
                created_at: new Date().toISOString(),
            };
            setOptimisticComments((prev) => [optimisticComment, ...prev]);
            setComment("");
            setAuthorName("");

            await addIssueComment({
                issueId: issue.id,
                content: trimmedComment,
                authorName: trimmedAuthor || undefined,
            });

            // Refetch to get the real data (with server-generated id and timestamp)
            const refreshed = await getIssueById(issue.id);
            if (refreshed) {
                setIssue(refreshed);
            }
            // Clear optimistic comments since the refetched issue now contains them
            setOptimisticComments([]);
        } catch (error) {
            // Rollback optimistic comment on failure
            setOptimisticComments([]);
            const message = error instanceof Error ? error.message : "Unable to add comment.";
            setErrorMessage(message);
            // Restore the comment text so the user can retry
            setComment(comment);
        } finally {
            setSubmitting(false);
        }
    };

    const images = useMemo(() => issue?.issue_images ?? [], [issue]);
    const comments = useMemo(
        () =>
            [...optimisticComments, ...(issue?.issue_comments ?? [])]
                .sort((a: IssueCommentRecord, b: IssueCommentRecord) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        [issue, optimisticComments]
    );
    const hasLocationCoords = issue ? issue.lat != null && issue.lng != null : false;
    const parsedLocation = useMemo(() => (issue ? parseLocation(issue.location) : { address: "", coords: null }), [issue]);
    const wasSubmitted = searchParams.get("submitted") === "1";

    useEffect(() => {
        if (!issue || !hasLocationCoords || !mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                name: "OpenStreetMap",
                sources: {
                    tiles: {
                        type: "raster",
                        tiles: [
                            "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        ],
                        tileSize: 256,
                        attribution: "&copy; OpenStreetMap contributors",
                    },
                },
                layers: [{ id: "base-layer", type: "raster", source: "tiles", paint: {} }],
            },
            center: [issue.lng as number, issue.lat as number],
            zoom: 14,
            attributionControl: {},
        });

        const marker = new maplibregl.Marker({ color: "#ee7c2d" })
            .setLngLat([issue.lng as number, issue.lat as number])
            .addTo(map);

        mapRef.current = map;
        requestAnimationFrame(() => map.resize());

        return () => {
            marker.remove();
            map.remove();
            mapRef.current = null;
        };
    }, [issue, hasLocationCoords]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f3ef] p-6 text-sm text-[#475569]">
                Loading issue details...
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen bg-[#f7f3ef] p-6">
                <div className="mx-auto max-w-xl rounded-[28px] border border-white/50 bg-white/30 p-6 text-center shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl">
                    <h1 className="text-2xl font-black text-[#111111]">Issue not found</h1>
                    <p className="mt-3 text-sm text-[#64748b]">This report may have been removed or the link is invalid.</p>
                    <button
                        type="button"
                        onClick={() => router.push("/issues")}
                        className="mt-5 rounded-xl bg-[#ee7c2d] px-4 py-2 text-sm font-semibold text-white"
                    >
                        Back to issues
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_rgba(247,243,239,0.95)_40%,_rgba(236,231,225,1))] text-[#111111]">
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                {wasSubmitted ? (
                    <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm">
                        Your issue was submitted successfully.
                    </div>
                ) : null}

                <div className="mb-5 flex items-center justify-between gap-3">
                    <nav className="flex items-center gap-2 text-sm text-[#64748b]">
                        <Link href="/" className="hover:text-[#ee7c2d]">Home</Link>
                        <span>&gt;</span>
                        <Link href="/issues" className="hover:text-[#ee7c2d]">Issues</Link>
                        <span>&gt;</span>
                        <span className="font-medium text-[#111111]">Report detail</span>
                    </nav>
                    <button
                        type="button"
                        onClick={() => router.push("/issues")}
                        className="rounded-xl border border-[#e7ddd3] bg-white/70 px-3 py-2 text-sm font-medium text-[#111111] shadow-sm backdrop-blur-xl"
                    >
                        Back to list
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
                    <section className="rounded-[30px] border border-white/50 bg-white/30 p-4 shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5b514d]">{issue.category}</p>
                                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#111111]">{issue.title}</h1>
                            </div>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[issue.status]}`}>
                                {issue.status}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#4b5563]">
                            <span>{parsedLocation.address}{parsedLocation.coords ? ` (${parsedLocation.coords})` : ""}</span>
                            <span>•</span>
                            <span>{new Date(issue.created_at).toLocaleString()}</span>
                            <span>•</span>
                            <span>{issue.is_anonymous ? "Anonymous report" : issue.reporter_name ?? "Signed report"}</span>
                        </div>

                        <p className="mt-5 text-base leading-7 text-[#23262d]">{issue.description}</p>

                        <div className="mt-6">
                            <h2 className="text-lg font-bold text-[#111111]">Image gallery</h2>
                            {images.length > 0 ? (
                                <>
                                    <div className="mt-3 overflow-hidden rounded-[26px] border border-white/60 bg-[#f5f2ee]">
                                        {(() => {
                                            const activeImg = selectedImage ?? images[0].image_url;
                                            const isLogo = activeImg.includes("logo.svg");
                                            return (
                                                <div className={isLogo ? "flex h-[320px] w-full items-center justify-center bg-[#fff8f3] p-8" : ""}>
                                                    <img
                                                        src={activeImg}
                                                        alt="Issue evidence"
                                                        className={isLogo ? "h-36 w-36 object-contain" : "h-[320px] w-full object-cover"}
                                                    />
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                                        {images.map((image) => {
                                            const isLogoThumb = image.image_url.includes("logo.svg");
                                            return (
                                                <button
                                                    key={image.id}
                                                    type="button"
                                                    onClick={() => setSelectedImage(image.image_url)}
                                                    className={`overflow-hidden rounded-2xl border transition ${selectedImage === image.image_url ? "border-[#ee7c2d] ring-2 ring-[#ee7c2d]/20" : "border-white/60"}`}
                                                >
                                                    <div className={isLogoThumb ? "flex h-20 w-full items-center justify-center bg-[#fff8f3] p-2" : ""}>
                                                        <img
                                                            src={image.image_url}
                                                            alt="Issue evidence thumbnail"
                                                            className={isLogoThumb ? "h-10 w-10 object-contain" : "h-20 w-full object-cover"}
                                                        />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="mt-3 flex flex-col items-center justify-center overflow-hidden rounded-[26px] border border-white/60 bg-[#fff8f3] p-8 text-center shadow-sm">
                                    <img
                                        src="/logo.svg"
                                        alt="CIRP app logo"
                                        className="h-24 w-24 object-contain"
                                    />
                                    <p className="mt-3 text-xs font-medium text-[#78716c]">
                                        No image was uploaded during report &bull; CIRP app logo used as default image
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-bold text-[#111111]">Issue location</h2>
                            {hasLocationCoords ? (
                                <div className="mt-3 overflow-hidden rounded-[26px] border border-white/60 bg-[#f5f2ee]">
                                    <div ref={mapContainerRef} className="h-[260px] w-full" />
                                </div>
                            ) : (
                                <div className="mt-3 rounded-[22px] border border-dashed border-[#d8dcd6] bg-[#f9faf9] p-4 text-sm text-[#64748b]">
                                    Location map unavailable for this report.
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="rounded-[30px] border border-white/50 bg-white/30 p-4 shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl sm:p-5">
                            <h2 className="text-lg font-black text-[#111111]">Report status</h2>
                            <ul className="mt-4 space-y-3 text-sm text-[#475569]">
                                <li className="flex items-center justify-between rounded-2xl bg-[#fffaf5] px-3 py-2.5">
                                    <span>Status</span>
                                    <span className="font-semibold text-[#111111]">{issue.status}</span>
                                </li>
                                <li className="flex items-center justify-between rounded-2xl bg-[#fffaf5] px-3 py-2.5">
                                    <span>Category</span>
                                    <span className="font-semibold text-[#111111]">{issue.category}</span>
                                </li>
                                <li className="flex items-center justify-between rounded-2xl bg-[#fffaf5] px-3 py-2.5">
                                    <span>Location</span>
                                    <span className="text-right font-semibold text-[#111111]">
                                        {parsedLocation.address}
                                        {parsedLocation.coords && (
                                            <span className="block text-xs font-normal text-[#64748b]">{parsedLocation.coords}</span>
                                        )}
                                    </span>
                                </li>
                                {issue.contact_info ? (
                                    <li className="flex items-center justify-between rounded-2xl bg-[#fffaf5] px-3 py-2.5">
                                        <span>Contact</span>
                                        <span className="font-semibold text-[#111111]">{issue.contact_info}</span>
                                    </li>
                                ) : null}
                            </ul>
                        </div>

                        <div className="rounded-[30px] border border-white/50 bg-white/30 p-4 shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl sm:p-5">
                            <h2 className="text-lg font-black text-[#111111]">Comments</h2>
                            <div className="mt-4 space-y-3">
                                {comments.length === 0 ? (
                                    <p className="text-sm text-[#64748b]">No comments yet. Start the conversation.</p>
                                ) : (
                                    comments.map((commentItem) => (
                                        <div key={commentItem.id} className="rounded-2xl bg-[#fffaf5] p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-semibold text-[#111111]">{commentItem.author_name}</span>
                                                <span className="text-[11px] text-[#64748b]">
                                                    {new Date(commentItem.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-[#475569]">{commentItem.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleCommentSubmit} className="mt-5 space-y-3">
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(event) => setAuthorName(event.target.value)}
                                    placeholder="Your name (optional)"
                                    className="w-full rounded-xl border border-[#e7ddd3] bg-white/70 px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#ee7c2d] focus:bg-white focus:ring-2 focus:ring-[#ee7c2d]/20"
                                />
                                <textarea
                                    rows={4}
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    placeholder="Add a comment about the issue or progress update"
                                    className="w-full resize-none rounded-xl border border-[#e7ddd3] bg-white/70 px-3 py-2.5 text-sm text-[#111111] outline-none transition focus:border-[#ee7c2d] focus:bg-white focus:ring-2 focus:ring-[#ee7c2d]/20"
                                />

                                {errorMessage ? (
                                    <p className="text-xs text-red-600">{errorMessage}</p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-xl bg-[#ee7c2d] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(238,124,45,0.2)] disabled:opacity-60"
                                >
                                    {submitting ? "Posting comment..." : "Add comment"}
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}
