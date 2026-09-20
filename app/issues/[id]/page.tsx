"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { addIssueComment, getIssueById, type IssueCommentRecord, type IssueRecord, supabase } from "@/lib/supabase";

const statusClasses: Record<IssueRecord["status"], string> = {
    Submitted: "bg-[#feece2] text-[#d96515]",
    "Under Review": "bg-[#fef3c7] text-[#b45309]",
    Resolved: "bg-[#dcfce7] text-[#15803d]",
};

export default function IssueDetailPage() {
    const params = useParams();
    const router = useRouter();
    const issueId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

    const [issue, setIssue] = useState<IssueRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!issueId) return;

        const loadIssue = async () => {
            try {
                const issueData = await getIssueById(issueId);
                setIssue(issueData);
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

        setSubmitting(true);
        setErrorMessage("");

        try {
            await addIssueComment({
                issueId: issue.id,
                content: comment,
                authorName: authorName.trim() || undefined,
            });

            const refreshed = await getIssueById(issue.id);
            setIssue(refreshed);
            setComment("");
            setAuthorName("");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to add comment.";
            setErrorMessage(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f5f3] p-6 text-sm text-[#475569]">
                Loading issue details...
            </div>
        );
    }

    if (!issue) {
        return (
            <div className="min-h-screen bg-[#f4f5f3] p-6">
                <div className="mx-auto max-w-xl rounded-2xl border border-[#dfe4de] bg-white p-6 text-center shadow-sm">
                    <h1 className="text-2xl font-black text-[#0f172a]">Issue not found</h1>
                    <p className="mt-3 text-sm text-[#64748b]">This report may have been removed or the link is invalid.</p>
                    <button
                        type="button"
                        onClick={() => router.push("/issues")}
                        className="mt-5 rounded-xl bg-[#0f5d4a] px-4 py-2 text-sm font-semibold text-white"
                    >
                        Back to issues
                    </button>
                </div>
            </div>
        );
    }

    const images = issue.issue_images ?? [];
    const comments = (issue.issue_comments ?? []).slice().sort(
        (a: IssueCommentRecord, b: IssueCommentRecord) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="min-h-screen bg-[#f4f5f3] text-[#0f172a]">
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <nav className="flex items-center gap-2 text-sm text-[#64748b]">
                        <Link href="/" className="hover:text-[#0f5d4a]">Home</Link>
                        <span>&gt;</span>
                        <Link href="/issues" className="hover:text-[#0f5d4a]">Issues</Link>
                        <span>&gt;</span>
                        <span className="font-medium text-[#0f172a]">Report detail</span>
                    </nav>
                    <button
                        type="button"
                        onClick={() => router.push("/issues")}
                        className="rounded-xl border border-[#d8dcd6] bg-white px-3 py-2 text-sm font-medium text-[#0f172a]"
                    >
                        Back to list
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
                    <section className="rounded-[20px] border border-[#e2e6e1] bg-white p-4 shadow-sm sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">{issue.category}</p>
                                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0f172a]">{issue.title}</h1>
                            </div>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[issue.status]}`}>
                                {issue.status}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#475569]">
                            <span>{issue.location}</span>
                            <span>•</span>
                            <span>{new Date(issue.created_at).toLocaleString()}</span>
                            <span>•</span>
                            <span>{issue.is_anonymous ? "Anonymous report" : issue.reporter_name ?? "Signed report"}</span>
                        </div>

                        <p className="mt-5 text-base leading-7 text-[#334155]">{issue.description}</p>

                        {images.length > 0 ? (
                            <div className="mt-6">
                                <h2 className="text-lg font-bold text-[#0f172a]">Images</h2>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {images.map((image) => (
                                        <img
                                            key={image.id}
                                            src={image.image_url}
                                            alt="Issue evidence"
                                            className="h-52 w-full rounded-2xl border border-[#e2e6e1] object-cover"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 rounded-2xl border border-dashed border-[#d8dcd6] bg-[#f9faf9] p-4 text-sm text-[#64748b]">
                                No supporting images were uploaded.
                            </div>
                        )}
                    </section>

                    <aside className="space-y-6">
                        <div className="rounded-[20px] border border-[#e2e6e1] bg-white p-4 shadow-sm sm:p-5">
                            <h2 className="text-lg font-black text-[#0f172a]">Report status</h2>
                            <ul className="mt-4 space-y-3 text-sm text-[#475569]">
                                <li className="flex items-center justify-between rounded-xl bg-[#f8faf8] px-3 py-2">
                                    <span>Status</span>
                                    <span className="font-semibold text-[#0f172a]">{issue.status}</span>
                                </li>
                                <li className="flex items-center justify-between rounded-xl bg-[#f8faf8] px-3 py-2">
                                    <span>Category</span>
                                    <span className="font-semibold text-[#0f172a]">{issue.category}</span>
                                </li>
                                <li className="flex items-center justify-between rounded-xl bg-[#f8faf8] px-3 py-2">
                                    <span>Location</span>
                                    <span className="font-semibold text-[#0f172a]">{issue.location}</span>
                                </li>
                                {issue.contact_info ? (
                                    <li className="flex items-center justify-between rounded-xl bg-[#f8faf8] px-3 py-2">
                                        <span>Contact</span>
                                        <span className="font-semibold text-[#0f172a]">{issue.contact_info}</span>
                                    </li>
                                ) : null}
                            </ul>
                        </div>

                        <div className="rounded-[20px] border border-[#e2e6e1] bg-white p-4 shadow-sm sm:p-5">
                            <h2 className="text-lg font-black text-[#0f172a]">Comments</h2>
                            <div className="mt-4 space-y-3">
                                {comments.length === 0 ? (
                                    <p className="text-sm text-[#64748b]">No comments yet. Start the conversation.</p>
                                ) : (
                                    comments.map((commentItem) => (
                                        <div key={commentItem.id} className="rounded-xl bg-[#f8faf8] p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-semibold text-[#0f172a]">{commentItem.author_name}</span>
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
                                    className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2.5 text-sm text-[#0f172a] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15"
                                />
                                <textarea
                                    rows={4}
                                    value={comment}
                                    onChange={(event) => setComment(event.target.value)}
                                    placeholder="Add a comment about the issue or progress update"
                                    className="w-full resize-none rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3 py-2.5 text-sm text-[#0f172a] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15"
                                />

                                {errorMessage ? (
                                    <p className="text-xs text-red-600">{errorMessage}</p>
                                ) : null}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-xl bg-[#0f5d4a] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                    {submitting ? "Posting comment..." : "Add comment"}
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
