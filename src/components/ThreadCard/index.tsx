import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "../ImageCarousel";
import apiSlice from "../../store/api";
import { timeAgo, formatVoteCount } from "../../utils/timeAgo";
import Avatar from "../Avatar";
import type { ForumTag } from "../../interfaces/interfaces";

interface ThreadCardProps {
    title: string,
    content: string,
    images: string[],
    createdAt: string,
    threadId: string,
    voteCount: number,
    realm: string,
    vote: number,
    forumName?: string,
    forumImage?: string,
    tags?: ForumTag[],
    isPinned?: boolean,
}

const ThreadCard: React.FC<ThreadCardProps> = ({ 
    title, 
    content, 
    images, 
    createdAt, 
    threadId, 
    voteCount, 
    realm,
    vote,
    forumName,
    forumImage,
    tags,
    isPinned,
}) => {
    const navigate = useNavigate();
    const [voteThread] = apiSlice.useVoteThreadMutation();
    const [localVote, setLocalVote] = useState(vote);
    const [localUpvote, setLocalUpvote] = useState(voteCount);

    const displayRealm = forumName || realm;
    const avatarSrc = forumImage;

    const handleVote = async (e: React.MouseEvent, voteValue: number) => {
        e.stopPropagation();
        const newVote = localVote === voteValue ? 0 : voteValue;
        const delta = newVote - localVote;
        setLocalVote(newVote);
        setLocalUpvote(prev => prev + delta);
        try {
            await voteThread({ threadId, vote: newVote }).unwrap();
        } catch {
            setLocalVote(localVote);
            setLocalUpvote(localUpvote);
        }
    };

    return (
        <article 
            className="bg-white rounded-2xl border border-surface-200/80 hover:border-surface-300 hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => navigate(`/r/${displayRealm}/${threadId}`)}
        >
            <div className="p-4 pb-3">
                {/* Author row */}
                <div className="flex items-center gap-2.5 mb-3">
                    <Avatar 
                        className="w-8 h-8" 
                        src={avatarSrc}
                        name={displayRealm}
                    />
                    <div className="flex items-center gap-1.5 text-sm min-w-0">
                        <span className="font-semibold text-surface-900 truncate">{displayRealm}</span>
                        <span className="text-surface-400">·</span>
                        <span className="text-surface-400 shrink-0">
                            {timeAgo(createdAt)}
                        </span>
                    </div>
                    <span
                        className="ml-auto text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full shrink-0 cursor-pointer hover:bg-brand-100 transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/realm/${displayRealm}`); }}
                    >
                        {displayRealm}
                    </span>
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map(tag => (
                            <span
                                key={tag.id}
                                className="px-2 py-0.5 text-[10px] font-medium rounded-full"
                                style={{
                                    backgroundColor: tag.color ? `${tag.color}18` : '#f3f4f6',
                                    color: tag.color || '#6b7280',
                                    border: `1px solid ${tag.color ? `${tag.color}30` : '#e5e7eb'}`,
                                }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-surface-900 text-base leading-snug mb-1.5 flex items-center gap-1.5">
                    {isPinned && (
                        <svg className="w-4 h-4 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z" />
                        </svg>
                    )}
                    {title}
                </h3>

                {/* Body excerpt */}
                <div 
                    className="text-sm text-surface-600 leading-relaxed line-clamp-3" 
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>

            {/* Images */}
            {images.length > 0 && (
                <div className="px-4 pb-3" onClick={(e) => e.stopPropagation()}>
                    <div className="rounded-xl overflow-hidden">
                        <ImageCarousel images={images} />
                    </div>
                </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-1 px-3 pb-3">
                {/* Vote */}
                <div className="flex items-center bg-surface-50 rounded-full">
                    <button
                        className={`p-2 rounded-full transition-colors cursor-pointer
                            ${localVote === 1 ? "text-upvote bg-orange-50" : "text-surface-400 hover:text-upvote hover:bg-orange-50"}`}
                        onClick={(e) => handleVote(e, 1)}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                    </button>
                    <span className={`text-xs font-bold min-w-[24px] text-center ${localVote === 1 ? "text-upvote" : localVote === -1 ? "text-downvote" : "text-surface-600"}`}>
                        {formatVoteCount(localUpvote)}
                    </span>
                    <button
                        className={`p-2 rounded-full transition-colors cursor-pointer
                            ${localVote === -1 ? "text-downvote bg-indigo-50" : "text-surface-400 hover:text-downvote hover:bg-indigo-50"}`}
                        onClick={(e) => handleVote(e, -1)}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>

                {/* Comment */}
                <button className="flex items-center gap-1.5 text-surface-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-full transition-colors text-xs font-medium cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg>
                    Bình luận
                </button>

                {/* Share */}
                <button className="flex items-center gap-1.5 text-surface-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-full transition-colors text-xs font-medium cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                    Chia sẻ
                </button>

                {/* More */}
                <button className="ml-auto p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-full transition-colors cursor-pointer">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="4" cy="10" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="16" cy="10" r="1.5" />
                    </svg>
                </button>
            </div>
        </article>
    )
}

export default ThreadCard;
