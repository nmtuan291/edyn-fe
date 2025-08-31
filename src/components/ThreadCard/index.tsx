import { useNavigate } from "react-router-dom";
import testAvatar from "./avatar_default_0.png";
import testImage from "./test_image.png";
import ImageCarousel from "../ImageCarousel";
import TimeAgo from 'react-timeago';
import vietnameseStrings from 'react-timeago/lib/language-strings/vi';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import apiSlice from "../../store/api";

interface ThreadCardProps {
    title: string,
    content: string,
    images: string[],
    createdAt: string,
    threadId: string,
    voteCount: number,
    realm: string,
    vote: number
}

const ThreadCard: React.FC<ThreadCardProps> = ({ 
    title, 
    content, 
    images, 
    createdAt, 
    threadId, 
    voteCount, 
    realm,
    vote 
}) => {
    const navigate = useNavigate();
    const formatter = buildFormatter(vietnameseStrings);
    const [voteThread] = apiSlice.useVoteThreadMutation();

    const handleVoteThread = async (isDownVote: boolean) => {
        voteThread({
            threadId,
            isDownvote: false 
        })
    }
    
    return (
        <div 
            className="border-t border-gray-300 p-2 cursor-pointer hover:bg-gray-200"
            onClick={() => navigate(`/r/${realm}/${threadId}`)}
        >
            <div className="flex justify-between md:flex-row-reverse md:justify-end md: gap-3 lg:block">
                <div>
                    <div className="flex gap-2 items-center">
                        <img className="max-w-6 rounded-xl" src={testAvatar}/>
                        <span className="font-bold text-xs">testusername</span>
                        <span className="text-gray-500 text-xs">
                            <TimeAgo date={createdAt} formatter={formatter}/>
                        </span>
                    </div>
                    <p className="font-bold">{title}</p>
                </div>
                <div className="w-24 flex items-center lg:w-96">
                    <div className="hidden md:block">
                        {
                            images.length > 0 && <ImageCarousel images={images}></ImageCarousel>
                        }
                    </div>
                    <div className="md:hidden">
                        <img src={images?.[0]}></img>
                    </div>
                </div>
                <div 
                    className="w-3xl text-justify text-sm hidden lg:block" 
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
            <div className="flex gap-4 mt-3 text-xs font-bold text-gray-500 items-center">
                <div className="border flex items-center rounded-3xl">
                    <svg
                        className={`w-6 h-6  hover:text-orange-500 
                            cursor-pointer ${vote === 1 ? "text-orange-500" : "text-gray-400"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20" 
                        onClick={(e) => {
                            e.stopPropagation();
                            voteThread({
                                id: threadId,
                                isDownvote: false
                            })}
                        }
                    >
                        <polygon points="10,5 5,15 15,15" />
                    </svg>
                    <p>{voteCount}</p>
                    <svg
                        className={`w-6 h-6 hover:text-blue-500 
                            cursor-pointer ${vote === -1 ? "text-blue-500" : "text-gray-400"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        onClick={(e) => {
                            e.stopPropagation();
                            voteThread({
                                id: threadId,
                                isDownvote: true
                            })}
                        }
                    >
                        <polygon points="10,15 5,5 15,5" />
                    </svg>
                </div>
                <p>250 Bình luận</p>
                <p className="cursor-pointer">Chia sẻ</p>
                <p className="cursor-pointer">Báo cáo</p>
            </div>
        </div>
    )
}

export default ThreadCard;