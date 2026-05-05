import { useParams } from "react-router-dom"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import ForumBanner from "../../components/ForumBanner"
import ForumDescription from "../../components/ForumDescription"
import ThreadCard from "../../components/ThreadCard"
import type { Realm } from "../../interfaces/interfaces"
import apiSlice from "../../store/api";
import { type Thread } from "../../interfaces/interfaces";
import Loader from "../../components/Loader"

const RealmPage: React.FC = () => {
    const { name } = useParams();
    const { useGetRealmQuery } = apiSlice;
    const { data, error, isLoading } = useGetRealmQuery(name);
    const { data: threads } = apiSlice.useGetThreadsQuery(data?.id, { skip: !data?.id });
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const el = document.getElementById("context-panel");
        setPortalTarget(el);
        if (el) el.classList.remove("hidden");
        return () => { if (el) el.classList.add("hidden"); };
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

            <div className="flex flex-col gap-4">
                {(threads ?? []).map((thread: Thread) => 
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
                    />
                )}
                {threads && threads.length === 0 && (
                    <div className="text-center py-16 text-surface-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-surface-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        <p className="text-sm">Chưa có bài đăng nào</p>
                    </div>
                )}
            </div>

            {/* Portal ForumDescription into the right context panel */}
            {portalTarget && createPortal(
                <ForumDescription realm={data} />,
                portalTarget
            )}
        </>
    )
}

export default RealmPage;
