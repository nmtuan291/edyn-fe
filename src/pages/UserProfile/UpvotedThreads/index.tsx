import ThreadCard from "../../../components/ThreadCard"

const UpvotedThreads: React.FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <ThreadCard 
                title="" content="" images={[]} createdAt="" 
                threadId="" voteCount={0} realm="" vote={0} 
            />
            <ThreadCard 
                title="" content="" images={[]} createdAt="" 
                threadId="" voteCount={0} realm="" vote={0} 
            />
            <ThreadCard 
                title="" content="" images={[]} createdAt="" 
                threadId="" voteCount={0} realm="" vote={0} 
            />
        </div>
    )
}

export default UpvotedThreads;
