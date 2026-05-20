import { useParams } from "react-router-dom"
import { createPortal } from "react-dom"
import { useEffect, useState, useCallback } from "react"
import ForumBanner from "../../components/ForumBanner"
import ForumDescription from "../../components/ForumDescription"
import ThreadCard from "../../components/ThreadCard"

import apiSlice from "../../store/api";
import { type Thread, SortBy, SortDate } from "../../interfaces/interfaces";
import Loader from "../../components/Loader"

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
    { label: "Mới nhất", value: SortBy.Latest },
    { label: "Phổ biến", value: SortBy.Hot },
    { label: "Hàng đầu", value: SortBy.Top },
] as const;

const SORT_DATE_OPTIONS = [
    { label: "Hôm nay", value: SortDate.Day },
    { label: "Tháng này", value: SortDate.Month },
    { label: "Năm nay", value: SortDate.Year },
    { label: "Mọi lúc", value: SortDate.All },
] as const;

const RealmPage: React.FC = () => {
    const { name } = useParams();
    const { useGetRealmQuery } = apiSlice;
    const { data, error, isLoading } = useGetRealmQuery(name ?? "");
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortBy>(SortBy.Hot);
    const [sortDate, setSortDate] = useState<SortDate>(SortDate.All);

    const { data: threadsData, isFetching } = apiSlice.useGetThreadsQuery(
        { forumId: data?.id, page, pageSize: PAGE_SIZE, sortBy, sortDate },
        { skip: !data?.id }
    );

    const threads: Thread[] = threadsData?.items ?? [];
    const hasNextPage = threadsData?.hasNextPage ?? false;
    const hasPreviousPage = threadsData?.hasPreviousPage ?? false;
    const totalCount = threadsData?.totalCount ?? 0;

    useEffect(() => {
        const el = document.getElementById("context-panel");
        setPortalTarget(el);
        if (el) el.classList.remove("hidden");
        return () => { if (el) el.classList.add("hidden"); };
    }, []);

    // Reset to page 1 when sort changes
    const handleSortChange = useCallback((newSort: SortBy) => {
        setSortBy(newSort);
        setPage(1);
    }, []);

    const handleSortDateChange = useCallback((newDate: SortDate) => {
        setSortDate(newDate);
        setPage(1);
    }, []);

    if (isLoading) return <Loader />;
    if (error) return <div className="text-center py-12 text-surface-500">Error loading forum data.</div>;
    if (!data) return null;

    return (
        <>
            <ForumBanner 
                forumId={data.id ?? ""}
                forumName={data.name ?? ""}
                forumBanner={data.forumBanner ?? ""}
                forumImage={data.forumImage ?? ""}/>

            {/* Sort controls */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex gap-1">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                                sortBy === opt.value
                                    ? "bg-brand-100 text-brand-700"
                                    : "text-surface-500 hover:bg-surface-100"
                            }`}
                            onClick={() => handleSortChange(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                {sortBy === SortBy.Top && (
                    <div className="flex gap-1">
                        {SORT_DATE_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                                    sortDate === opt.value
                                        ? "bg-surface-200 text-surface-800"
                                        : "text-surface-400 hover:bg-surface-100"
                                }`}
                                onClick={() => handleSortDateChange(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
                {totalCount > 0 && (
                    <span className="text-xs text-surface-400">{totalCount} bài đăng</span>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {isFetching && threads.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {threads.map((thread: Thread) => 
                            <ThreadCard 
                                key={thread.id}
                                threadId={thread.id} 
                                title={thread.title} 
                                content={thread.content} 
                                images={thread.images} 
                                createdAt={thread.createdAt} 
                                voteCount={thread.upvote}
                                realm={name ?? ""}
                                vote={thread.vote}
                                forumName={thread.forumName}
                                forumImage={thread.forumImage}
                                tags={thread.tags}
                                isPinned={thread.isPinned}
                                creatorName={thread.creatorName}
                                creatorAvatar={thread.creatorAvatar}
                                creatorId={thread.creatorId}
                            />
                        )}
                        {threads.length === 0 && !isFetching && (
                            <div className="text-center py-16 text-surface-400">
                                <svg className="w-12 h-12 mx-auto mb-3 text-surface-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <p className="text-sm">Chưa có bài đăng nào</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination controls */}
            {(hasNextPage || hasPreviousPage) && (
                <div className="flex items-center justify-center gap-3 mt-6 mb-4">
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-surface-200 text-surface-600 hover:bg-surface-100"
                        disabled={!hasPreviousPage || isFetching}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        ← Trước
                    </button>
                    <span className="text-sm text-surface-500">
                        Trang {threadsData?.page ?? page} / {threadsData?.totalPages ?? 1}
                    </span>
                    <button
                        className="px-4 py-2 text-sm font-medium rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-surface-200 text-surface-600 hover:bg-surface-100"
                        disabled={!hasNextPage || isFetching}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Tiếp →
                    </button>
                </div>
            )}

            {/* Portal ForumDescription into the right context panel */}
            {portalTarget && createPortal(
                <ForumDescription realm={data} />,
                portalTarget
            )}
        </>
    )
}

export default RealmPage;
