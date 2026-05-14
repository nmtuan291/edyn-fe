import React, { useState, useEffect } from "react";
import ThreadCard from "../../components/ThreadCard";
import apiSlice from "../../store/api";
import { type Thread } from "../../interfaces/interfaces";

const PAGE_SIZE = 10;

const Home: React.FC = () => {
    const isLoggedIn = !!localStorage.getItem("jwt");
    const [page, setPage] = useState(1);
    const [allThreads, setAllThreads] = useState<Thread[]>([]);
    
    const { data: threadsData, isLoading, isFetching } = apiSlice.useGetHomeFeedQuery(
        { page, pageSize: PAGE_SIZE },
        { skip: !isLoggedIn }
    );

    useEffect(() => {
        if (threadsData?.items) {
            console.log("Home Feed API JSON:", threadsData);
            if (page === 1) {
                setAllThreads(threadsData.items);
            } else {
                // Deduplicate items just in case
                setAllThreads(prev => {
                    const existingIds = new Set(prev.map(t => t.id));
                    const newItems = threadsData.items.filter((t: Thread) => !existingIds.has(t.id));
                    return [...prev, ...newItems];
                });
            }
        }
    }, [threadsData, page]);

    const hasMore = threadsData?.hasNextPage ?? false;

    const handleLoadMore = () => {
        if (!isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-8">
                    <span className="font-logo font-extrabold text-6xl tracking-tighter bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent animate-pulse-slow">
                        edyn
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-surface-900 mb-3 tracking-tight">Khám phá không gian của riêng bạn</h1>
                <p className="text-surface-500 max-w-md mb-8 leading-relaxed">
                    Tham gia cộng đồng Edyn để bắt đầu chia sẻ ý tưởng, kết nối với những tâm hồn đồng điệu và xây dựng không gian sáng tạo của bạn.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => document.getElementById('login-button')?.click()}
                        className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-200 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                        Bắt đầu ngay
                    </button>
                    <button className="px-8 py-3 bg-white border border-surface-200 text-surface-700 font-bold rounded-2xl hover:bg-surface-50 transition-all cursor-pointer">
                        Tìm hiểu thêm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Feed header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-surface-900">Bảng tin</h2>
                <div className="flex gap-1">
                    <button className="px-3 py-1.5 text-xs font-medium bg-brand-100 text-brand-700 rounded-full cursor-pointer">
                        Mới nhất
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 rounded-full transition-colors cursor-pointer">
                        Phổ biến
                    </button>
                </div>
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
                        createdAt={thread.createdAt}
                        voteCount={thread.upvote}
                        realm={thread.forumName || ""}
                        vote={thread.vote}
                        forumName={thread.forumName}
                        forumImage={thread.forumImage}
                        tags={thread.tags}
                        isPinned={thread.isPinned}
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
                        <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-6 text-3xl">
                            📭
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
