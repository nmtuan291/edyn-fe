import { useState, useCallback } from "react";
import ThreadCard from "../../components/ThreadCard";
import apiSlice from "../../store/api";

const PAGE_SIZE = 5;

const Home: React.FC = () => {
    const isLoggedIn = !!localStorage.getItem("jwt");
    const [page, setPage] = useState(1);
    const { data: threads, isLoading, isFetching } = apiSlice.useGetHomeFeedQuery(
        { page: 1, pageSize: page * PAGE_SIZE },
        { skip: !isLoggedIn }
    );

    const hasMore = threads && threads.length >= page * PAGE_SIZE;

    const handleLoadMore = useCallback(() => {
        setPage(prev => prev + 1);
    }, []);

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                    <span className="text-3xl">🌱</span>
                </div>
                <h1 className="text-2xl font-bold text-surface-900 mb-2">Chào mừng đến với Edyn</h1>
                <p className="text-surface-500 max-w-md">
                    Khám phá cộng đồng, chia sẻ ý tưởng, và kết nối với mọi người.
                </p>
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

            {/* Loading skeleton */}
            {isLoading && (
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
            {!isLoading && threads && (
                <div className="flex flex-col gap-4">
                    {threads.map((thread: any) => (
                        <ThreadCard
                            key={thread.id}
                            threadId={thread.id}
                            title={thread.title}
                            content={thread.content}
                            images={thread.images}
                            createdAt={thread.createdAt}
                            voteCount={thread.upvote}
                            realm={thread.forumName || thread.realm || ""}
                            vote={thread.vote}
                            forumName={thread.forumName}
                            forumImage={thread.forumImage}
                        />
                    ))}

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center py-4">
                            <button
                                className="px-6 py-2.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                                onClick={handleLoadMore}
                                disabled={isFetching}
                            >
                                {isFetching ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                        Đang tải...
                                    </span>
                                ) : (
                                    "Tải thêm"
                                )}
                            </button>
                        </div>
                    )}

                    {threads.length === 0 && (
                        <div className="text-center py-16 text-surface-400">
                            <svg className="w-12 h-12 mx-auto mb-3 text-surface-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <p className="text-sm">Chưa có bài viết nào trong bảng tin</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Home;
