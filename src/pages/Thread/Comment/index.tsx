import { useState } from "react";
import CommentEditor from "./CommentEditor";
import type { Comment } from "../../../interfaces/interfaces";
import { timeAgo, formatVoteCount } from "../../../utils/timeAgo";
import { useChatContext } from '../../../contexts/ChatContext';
import apiSlice from "../../../store/api";
import defaultAvatar from "../../../constants/defaultAvatar";

interface CommentProps {
    comment: Comment
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
    const [showChildrenComment, setShowChildrenComment] = useState<boolean>(true);
    const [isReplying, setIsReplying] = useState<boolean>(false);
    const { openChatWithUser } = useChatContext();
    const [voteComment] = apiSlice.useVoteCommentMutation();

    const [localVote, setLocalVote] = useState(comment.vote ?? 0);
    const [localUpvote, setLocalUpvote] = useState(comment.upvote ?? 0);

    const handleChatClick = () => {
        openChatWithUser(comment.ownerId, comment.ownerName || "User");
    };

    const handleVote = async (voteValue: number) => {
        const newVote = localVote === voteValue ? 0 : voteValue;
        const delta = newVote - localVote;
        setLocalVote(newVote);
        setLocalUpvote(prev => prev + delta);
        try {
            await voteComment({ commentId: comment.id, vote: newVote }).unwrap();
        } catch {
            setLocalVote(localVote);
            setLocalUpvote(localUpvote);
        }
    };

    return (
        <div className="relative">
            {/* Thread line */}
            {comment.childrenComments.length > 0 && showChildrenComment && (
                <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-surface-200 hover:bg-brand-300 transition-colors" />
            )}

            <div className="flex gap-3 py-3">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className="w-9 h-9 rounded-full bg-surface-300 overflow-hidden">
                        <img
                            src={defaultAvatar}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Author row */}
                    <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="font-semibold text-surface-900">
                            {comment.ownerName || "User"}
                        </span>
                        <span className="text-surface-400">·</span>
                        <span className="text-surface-400 text-xs">
                            {timeAgo(comment.createdAt)}
                        </span>
                    </div>

                    {/* Comment body */}
                    <div className="text-sm text-surface-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: comment.content }} />

                    {/* Action row */}
                    <div className="flex items-center gap-0.5 mt-2 -ml-2">
                        {/* Vote */}
                        <div className="flex items-center rounded-full">
                            <button
                                className={`p-1.5 rounded-full transition-colors cursor-pointer ${localVote === 1 ? "text-upvote bg-orange-50" : "text-surface-400 hover:text-upvote hover:bg-orange-50"}`}
                                onClick={() => handleVote(1)}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                </svg>
                            </button>
                            <span className={`text-xs font-bold min-w-[16px] text-center ${localVote === 1 ? "text-upvote" : localVote === -1 ? "text-downvote" : "text-surface-500"}`}>
                                {formatVoteCount(localUpvote)}
                            </span>
                            <button
                                className={`p-1.5 rounded-full transition-colors cursor-pointer ${localVote === -1 ? "text-downvote bg-indigo-50" : "text-surface-400 hover:text-downvote hover:bg-indigo-50"}`}
                                onClick={() => handleVote(-1)}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </div>

                        <button 
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-surface-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors cursor-pointer"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                            </svg>
                            Trả lời
                        </button>

                        <button className="px-2.5 py-1.5 text-xs font-medium text-surface-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors cursor-pointer">
                            Chia sẻ
                        </button>

                        <button 
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-surface-500 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors cursor-pointer"
                            onClick={handleChatClick}
                            title={`Chat với ${comment.ownerName || "User"}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 6 21a5.969 5.969 0 0 0 1.936-1.094A3.61 3.61 0 0 1 6.768 18.5c-1.414-1.457-2.268-3.376-2.268-5.5 0-4.556 4.03-8.25 9-8.25S21 7.444 21 12Z" />
                            </svg>
                            Chat
                        </button>

                        <button className="p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-full transition-colors cursor-pointer ml-auto">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="4" cy="10" r="1.5" />
                                <circle cx="10" cy="10" r="1.5" />
                                <circle cx="16" cy="10" r="1.5" />
                            </svg>
                        </button>
                    </div>

                    {/* Reply editor */}
                    {isReplying && (
                        <div className="mt-3">
                            <CommentEditor 
                                threadId={comment.threadId} 
                                parentComment={comment.id} 
                                closeEditor={() => setIsReplying(false)}
                            />
                        </div>
                    )}

                    {/* Collapse toggle */}
                    {comment.childrenComments.length > 0 && (
                        <button
                            className="flex items-center gap-1.5 mt-2 text-xs font-medium text-surface-400 hover:text-brand-600 transition-colors cursor-pointer"
                            onClick={() => setShowChildrenComment(!showChildrenComment)}
                        >
                            <svg className={`w-3.5 h-3.5 transition-transform ${showChildrenComment ? "rotate-90" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            {showChildrenComment ? "Ẩn" : "Hiện"} {comment.childrenComments.length} trả lời
                        </button>
                    )}
                </div>
            </div>

            {/* Children comments */}
            {showChildrenComment && comment.childrenComments.length > 0 && (
                <div className="ml-[18px] pl-5 border-l-2 border-surface-100">
                    {comment.childrenComments.map((child) => (
                        <CommentComponent key={child.id} comment={child} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommentComponent;
