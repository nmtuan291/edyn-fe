import { useParams } from "react-router-dom"
import ForumBanner from "../../components/ForumBanner"
import ForumDescription from "../../components/ForumDescription"
import ThreadCard from "../../components/ThreadCard"
import type { Realm } from "../../interfaces/interfaces"
import apiSlice from "../../store/api";
import { type Thread } from "../../interfaces/interfaces";
import Loader from "../../components/Loader"

const Realm: React.FC = () => {
    const { name } = useParams();
    const { useGetRealmQuery } = apiSlice;
    const { data, error, isLoading } = useGetRealmQuery(name);
    const { data: threads, error: threadsError, isLoading: threadLoading } = apiSlice.useGetThreadsQuery(data?.id, { skip: !data?.id });
    console.log(threads);
    if (isLoading) return <Loader />;
    if (error) return <div>Error loading forum data.</div>;
    if (!data) return null; // or a fallback

    return (
        <div className="">
            <ForumBanner 
                forumId={data.id ?? ""}
                forumName={data.name ?? ""}
                forumBanner={data.forumBanner ?? ""}
                forumImage={data.forumImage ?? ""}/>
            <div className="flex">
                <div className="">
                    {
                        (threads ?? []).map((thread: Thread)  => 
                        <ThreadCard 
                            threadId={thread.id} 
                            title={thread.title} 
                            content={thread.content} 
                            images={thread.images} 
                            createdAt={thread.createdAt} 
                            voteCount={thread.upvote}
                            realm={name ?? ""}
                            vote={thread.vote}
                        />)
                    }
                </div>
                <div className="w-72 hidden md:block">
                    <ForumDescription></ForumDescription>
                </div>
            </div>
        </div>
    )
}

export default Realm;