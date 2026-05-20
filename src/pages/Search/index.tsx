import { useSearchParams, useNavigate } from "react-router-dom";
import apiSlice from "../../store/api";
import Loader from "../../components/Loader";
import ThreadCard from "../../components/ThreadCard";
import Avatar from "../../components/Avatar";
import { type Thread } from "../../interfaces/interfaces";

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q") || "";
    const navigate = useNavigate();

    const { data: forums, isLoading: forumsLoading } = apiSlice.useSearchForumsQuery(q, { skip: !q });
    const { data: threadsData, isLoading: threadsLoading } = apiSlice.useSearchThreadsQuery({ q, page: 1, pageSize: 20 }, { skip: !q });

    const threads: Thread[] = threadsData?.items ?? threadsData ?? [];

    if (!q) {
        return (
            <div className="text-center py-20">
                <p className="text-surface-500">Nhập từ khóa để tìm kiếm trên Edyn.</p>
            </div>
        );
    }

    if (forumsLoading && threadsLoading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-surface-900 mb-6">
                Kết quả tìm kiếm cho "{q}"
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main results: Threads */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Bài đăng</h2>
                    {threadsLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : threads.length > 0 ? (
                        threads.map((thread) => (
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
                                creatorName={thread.creatorName}
                                creatorAvatar={thread.creatorAvatar}
                                creatorId={thread.creatorId}
                            />
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl border border-surface-200/80 p-10 text-center text-surface-400">
                            Không tìm thấy bài đăng nào.
                        </div>
                    )}
                </div>

                {/* Sidebar results: Forums */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-4">Cộng đồng</h2>
                    <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                        {forumsLoading ? (
                            <div className="p-6 flex justify-center">
                                <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : forums && forums.length > 0 ? (
                            <div className="divide-y divide-surface-50">
                                {forums.map((forum: any) => (
                                    <div 
                                        key={forum.id} 
                                        className="p-4 hover:bg-surface-50 transition-colors cursor-pointer flex items-center gap-3"
                                        onClick={() => navigate(`/r/${forum.name}`)}
                                    >
                                        <Avatar src={forum.forumImage} name={forum.name} className="w-10 h-10 rounded-xl" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-surface-900 truncate">{forum.name}</p>
                                            <p className="text-xs text-surface-500 truncate">{forum.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-xs text-surface-400">
                                Không tìm thấy cộng đồng nào.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
