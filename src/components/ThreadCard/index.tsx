import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "../ImageCarousel";
import apiSlice from "../../store/api";
import { timeAgo, formatVoteCount } from "../../utils/timeAgo";
import Avatar from "../Avatar";
import type { ForumTag } from "../../interfaces/interfaces";
import Modal from "../Modal";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { openLoginModal } from "../../store/ui";

interface ThreadCardProps {
    title: string,
    content: string,
    images: string[],
    videos?: string[],
    createdAt: string,
    threadId: string,
    voteCount: number,
    realm: string,
    vote: number,
    forumName?: string,
    forumImage?: string,
    tags?: ForumTag[],
    isPinned?: boolean,
    creatorName?: string,
    creatorAvatar?: string,
    creatorId?: string,
    showRealmAsAuthor?: boolean,
}

const ThreadCard: React.FC<ThreadCardProps> = ({
    title,
    content,
    images,
    videos,
    createdAt,
    threadId,
    voteCount,
    realm,
    vote,
    forumName,
    forumImage,
    tags,
    isPinned,
    creatorName,
    creatorAvatar,
    creatorId,
    showRealmAsAuthor = false,
}) => {
    const navigate = useNavigate();
    const [voteThread] = apiSlice.useVoteThreadMutation();
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.user);
    const [localVote, setLocalVote] = useState(vote);
    const [localUpvote, setLocalUpvote] = useState(voteCount);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    // Fallback to fetch profile if creatorName is missing or generic "User"
    const skipQuery = !creatorId || (!!creatorName && creatorName !== "User" && creatorName.trim() !== "");
    const { data: creatorProfile } = apiSlice.useGetUserProfileQuery(creatorId ?? "", {
        skip: skipQuery
    });

    const resolvedCreatorName = (creatorName && creatorName !== "User" && creatorName.trim() !== "")
        ? creatorName 
        : (creatorProfile?.userName || "User");

    const resolvedCreatorAvatar = (creatorName && creatorName !== "User" && creatorName.trim() !== "")
        ? creatorAvatar 
        : (creatorProfile?.avatar || creatorAvatar || "");

    const displayName = showRealmAsAuthor ? (forumName || realm) : resolvedCreatorName;
    const displayRealm = forumName || realm;
    const avatarSrc = showRealmAsAuthor ? forumImage : resolvedCreatorAvatar;

    const handleVote = async (e: React.MouseEvent, voteValue: number) => {
        e.stopPropagation();
        if (!currentUser?.id) {
            dispatch(openLoginModal());
            return;
        }
        const newVote = localVote === voteValue ? 0 : voteValue;
        const delta = newVote - localVote;
        setLocalVote(newVote);
        setLocalUpvote(prev => prev + delta);
        try {
            await voteThread({ threadId, vote: newVote }).unwrap();
        } catch (error: any) {
            setLocalVote(localVote);
            setLocalUpvote(localUpvote);
            if (error?.status === 403) {
                setWarningMessage("Bạn cần tham gia cộng đồng (realm) này để bình chọn bài viết!");
                setShowWarningModal(true);
            } else if (error?.status === 401) {
                setWarningMessage("Bạn cần đăng nhập để bình chọn bài viết!");
                setShowWarningModal(true);
            }
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/r/${displayRealm}/${threadId}`;
        navigator.clipboard.writeText(url).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <>
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
                        name={displayName}
                    />
                    <div className="flex items-center gap-1.5 text-sm min-w-0">
                        <span className="font-semibold text-surface-900 truncate">{displayName}</span>
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

            {/* Videos */}
            {videos && videos.length > 0 && (
                <div className="px-4 pb-3" onClick={(e) => e.stopPropagation()}>
                    {videos.map((src, idx) => (
                        <video
                            key={idx}
                            src={src}
                            controls
                            className="w-full max-h-64 rounded-xl object-contain bg-black"
                        />
                    ))}
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
                <button 
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-surface-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-full transition-colors text-xs font-medium cursor-pointer"
                >
                    {isCopied ? (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                        </svg>
                    )}
                    {isCopied ? "Đã sao chép!" : "Chia sẻ"}
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

        <Modal show={showWarningModal} closeModal={() => setShowWarningModal(false)}>
            <div className="flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
                <h3 className="text-base font-bold text-surface-900 mb-2">Yêu cầu tham gia</h3>
                <p className="text-sm text-surface-500 mb-6 leading-relaxed">
                    {warningMessage}
                </p>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowWarningModal(false); }}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-sm font-semibold transition-colors cursor-pointer"
                >
                    Đóng
                </button>
            </div>
        </Modal>
    </>
)
}

export default ThreadCard;
