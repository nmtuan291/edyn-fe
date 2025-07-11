import { useParams } from "react-router-dom"
import ForumBanner from "../../components/ForumBanner"
import ForumDescription from "../../components/ForumDescription"
import Sidebar from "../../components/Sidebar"
import ThreadCard from "../../components/ThreadCard"
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import type { Realm } from "../../interfaces/interfaces"

const Realm: React.FC = () => {
    const { id } = useParams();
    const [realmData, setRealmData] = useState<Realm | null>(null);

    useEffect(() => {
        const getRealm = async () => {
            try {
                const response = await axios.get(`/forum/${id}`);
                setRealmData(response.data);
                console.log(response.data);
            } catch (error) {
                console.log(error);
            }
        }

        getRealm();
    }, [id])
    return (
        <div className="">
            <ForumBanner 
                forumId={id ?? ""}
                forumName={realmData?.name ?? ""}
                forumBanner={realmData?.forumBanner ?? ""}
                forumImage={realmData?.forumImage ?? ""}/>
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