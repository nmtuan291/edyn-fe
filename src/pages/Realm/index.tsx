import { useParams } from "react-router-dom"
import ForumBanner from "../../components/ForumBanner"
import ForumDescription from "../../components/ForumDescription"
import ThreadCard from "../../components/ThreadCard"
import type { Realm } from "../../interfaces/interfaces"
import apiSlice from "../../store/api";

const Realm: React.FC = () => {
    const { name } = useParams();
    const { useGetRealmQuery } = apiSlice;
    const { data, error, isLoading } = useGetRealmQuery(name);

    if (isLoading) return <div>Loading...</div>;
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
                    <ThreadCard></ThreadCard>
                    <ThreadCard></ThreadCard>
                    <ThreadCard></ThreadCard>
                    <ThreadCard></ThreadCard>
                </div>
                <div className="w-72 hidden md:block">
                    <ForumDescription></ForumDescription>
                </div>
            </div>
        </div>
    )
}

export default Realm;