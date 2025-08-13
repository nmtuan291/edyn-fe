import { useState } from "react";
import CommentEditor from "./CommentEditor";
import type { Comment } from "../../../interfaces/interfaces";
import TimeAgo from 'react-timeago';
import vietnameseStrings from 'react-timeago/lib/language-strings/vi';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';
import { useChatContext } from '../../../contexts/ChatContext';

interface CommentProps {
    comment: Comment
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
    const [showChildrenComment, setShowChildrenComment] = useState<boolean>(true);
    const [isReplying, setIsReplying] = useState<boolean>(false);
    const { openChatWithUser } = useChatContext();

    const formatter = buildFormatter(vietnameseStrings);

    const handleChatClick = () => {
        openChatWithUser(comment.ownerId, comment.ownerName || "testuser");
    };

    return (
        <div className="border-l border-gray-300 pl-4 mt-2 relative">
            {/* Parent comment box (no negative margin) */}
            <div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 rounded-full bg-black"></div>
                    <span>{comment.ownerName === "" ? "testuser" : comment.ownerName}</span>
                    <div className="w-1 h-1 bg-green-500 rotate-45" />
                    <span>
                        <TimeAgo date={comment.createdAt} formatter={formatter}></TimeAgo>
                    </span>
                </div>
                <div className="p-4 relative">
                    <div  dangerouslySetInnerHTML={{ __html: comment.content }}/>
                    <div className={`${comment.childrenComments.length < 1 ? "hidden" : ""} absolute border-gray-400 text-gray-400 bottom-0 -left-7 bg-white
                    w-5 h-5 border flex items-center justify-center rounded-full cursor-pointer hover:border-gray-600 hover:text-gray-600`}
                    onClick={() => setShowChildrenComment(!showChildrenComment)}
                    >
                        +
                    </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs font-bold text-gray-500 items-center ml-4">
                    <div className="border flex items-center rounded-3xl">
                        <svg
                            className="w-6 h-6 text-gray-400 hover:text-orange-500 cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <polygon points="10,5 5,15 15,15" />
                        </svg>
                        <p>{0}</p>
                        <svg
                            className="w-6 h-6 text-gray-400 hover:tQext-blue-500 cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <polygon points="10,15 5,5 15,5" />
                        </svg>
                    </div>
                    <button 
                        className="cursor-pointer hover:bg-black"
                        onClick={() => setIsReplying(!isReplying)}
                    >
                        Trả lời
                    </button>
                    <p className="cursor-pointer">Chia sẻ</p>
                    <p className="cursor-pointer">Báo cáo</p>
                    <button 
                        className="cursor-pointer hover:text-green-600 flex items-center gap-1"
                        onClick={handleChatClick}
                        title={`Chat với ${comment.ownerName || "testuser"}`}
                    >
                        <svg 
                            className="w-4 h-4" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        Chat
                    </button>
                </div>
            </div>
            <div className={`${isReplying ? "" : "hidden"}`}>
                <CommentEditor 
                    threadId={comment.threadId} 
                    parentComment={comment.id} 
                    closeEditor={() => setIsReplying(false)}
                />
            </div>
            <div className={`${showChildrenComment ? "" : "hidden"}`}>
                {comment.childrenComments.length > 0 && (
                    <div className="ml-10">
                        {comment.childrenComments.map((comment, idx) => (
                            <Comment key={idx} comment={comment} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Comment;