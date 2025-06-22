import ForumBanner from "../../components/ForumBanner"
import ForumDescription from "../../components/ForumDescription"
import Sidebar from "../../components/Sidebar"
import ThreadCard from "../../components/ThreadCard"

const Forum: React.FC = () => {

    return (
        <div className="flex justify-between">
            <div className="w-72 md:block hidden">
                <Sidebar></Sidebar>
            </div>
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
    )
}

export default Forum;