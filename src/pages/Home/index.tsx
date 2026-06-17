import React, { useState, useEffect } from "react";
import ThreadCard from "../../components/ThreadCard";
import apiSlice from "../../store/api";
import { type Thread } from "../../interfaces/interfaces";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const PAGE_SIZE = 10;

const Home: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const isLoggedIn = !!user.id;
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<"Hot" | "Latest" | "Top">("Hot");
    const [dateRange, setDateRange] = useState<"Day" | "Month" | "Year" | "All">("All");
    const [allThreads, setAllThreads] = useState<Thread[]>([]);

    const { data: threadsData, isLoading, isFetching } = apiSlice.useGetHomeFeedQuery(
        { page, pageSize: PAGE_SIZE, sort, date: dateRange }
    );

    // Reset feed when login status, sort, or time window changes
    useEffect(() => {
        setPage(1);
        setAllThreads([]);
    }, [isLoggedIn, sort, dateRange]);

    useEffect(() => {
        const items = Array.isArray(threadsData) ? threadsData : threadsData?.items;
        if (items) {
            if (page === 1) {
                setAllThreads(items);
            } else {
                // Deduplicate items just in case
                setAllThreads(prev => {
                    const existingIds = new Set(prev.map(t => t.id));
                    const newItems = items.filter((t: Thread) => !existingIds.has(t.id));
                    return [...prev, ...newItems];
                });
            }
        }
    }, [threadsData, page]);

    const hasMore = threadsData?.hasNextPage ?? (Array.isArray(threadsData) ? threadsData.length === PAGE_SIZE : false);

    const handleLoadMore = () => {
        if (!isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <div>
            {!isLoggedIn && (
                <div className="flex flex-col items-center justify-center py-10 text-center mb-8 bg-white rounded-3xl border border-surface-200/60 shadow-sm">
                    <div className="mb-6">
                        <span className="font-logo font-extrabold text-6xl tracking-tighter bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent animate-pulse-slow">
                            edyn
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900 mb-3 tracking-tight">Khám phá không gian của riêng bạn</h1>
                    <p className="text-surface-500 max-w-md mx-auto mb-6 leading-relaxed">
                        Tham gia cộng đồng Edyn để chia sẻ ý tưởng, kết nối với những tâm hồn đồng điệu.
                    </p>
                    <div className="flex gap-4 justify-center w-full">
                        <button
                            onClick={() => document.getElementById('login-button')?.click()}
                            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        >
                            Bắt đầu ngay
                        </button>
                    </div>
                </div>
            )}

            {/* Feed header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-surface-900">Bảng tin</h2>
                {allThreads.length > 0 && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setSort("Hot")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                            sort === "Hot"
                                ? "bg-brand-100 text-brand-700"
                                : "text-surface-500 hover:bg-surface-100"
                        }`}
                    >
                        Phổ biến
                    </button>
                    <button
                        onClick={() => setSort("Latest")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                            sort === "Latest"
                                ? "bg-brand-100 text-brand-700"
                                : "text-surface-500 hover:bg-surface-100"
                        }`}
                    >
                        Mới nhất
                    </button>
                    <button
                        onClick={() => setSort("Top")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                            sort === "Top"
                                ? "bg-brand-100 text-brand-700"
                                : "text-surface-500 hover:bg-surface-100"
                        }`}
                    >
                        Hàng đầu
                    </button>
                    {sort === "Top" && (
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as "Day" | "Month" | "Year" | "All")}
                            className="ml-1 px-2 py-1.5 text-xs font-medium text-surface-600 bg-surface-50 border border-surface-200 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        >
                            <option value="Day">Hôm nay</option>
                            <option value="Month">Tháng này</option>
                            <option value="Year">Năm nay</option>
                            <option value="All">Tất cả</option>
                        </select>
                    )}
                </div>
                )}
            </div>

            {/* Loading skeleton (only for initial load) */}
            {isLoading && page === 1 && (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-surface-200/80 p-4 animate-pulse">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-8 h-8 bg-surface-200 rounded-full" />
                                <div className="h-3 bg-surface-200 rounded w-32" />
                            </div>
                            <div className="h-4 bg-surface-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-surface-200 rounded w-full mb-1" />
                            <div className="h-3 bg-surface-200 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            )}

            {/* Thread feed */}
            <div className="flex flex-col gap-4">
                {allThreads.map((thread: Thread) => (
                    <ThreadCard
                        key={thread.id}
                        threadId={thread.id}
                        title={thread.title}
                        content={thread.content}
                        images={thread.images}
                        videos={thread.videos}
                        createdAt={thread.createdAt}
                        voteCount={thread.upvote}
                        realm={thread.forumName || ""}
                        vote={thread.vote}
                        forumName={thread.forumName}
                        forumImage={thread.forumImage}
                        tags={thread.tags}
                        isPinned={thread.isPinned}
                        creatorName={thread.creatorName}
                        creatorAvatar={thread.creatorAvatar}
                        creatorId={thread.creatorId}
                        showRealmAsAuthor={true}
                    />
                ))}

                {/* Loading spinner for more items */}
                {isFetching && page > 1 && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Load more */}
                {hasMore && !isFetching && (
                    <div className="flex justify-center py-4">
                        <button
                            className="px-6 py-2.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-full transition-colors cursor-pointer"
                            onClick={handleLoadMore}
                        >
                            Tải thêm
                        </button>
                    </div>
                )}

                {!isLoading && allThreads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-surface-200/60 shadow-sm px-6 text-center">
                        <div className="mb-6">
                            <span className="font-logo font-extrabold text-5xl tracking-tighter bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                                edyn
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-surface-900 mb-2">Bảng tin đang trống</h3>
                        <p className="text-surface-500 max-w-sm mb-8 text-sm">
                            Có vẻ như bạn chưa tham gia cộng đồng nào hoặc chưa có bài viết mới. Hãy bắt đầu bằng cách khám phá các cộng đồng thú vị!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                            <button
                                onClick={() => document.getElementById('search-input')?.focus()}
                                className="flex-1 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Khám phá cộng đồng
                            </button>
                            <button
                                onClick={() => document.getElementById('create-forum-button')?.click()}
                                className="flex-1 px-5 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Tạo cộng đồng mới
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
