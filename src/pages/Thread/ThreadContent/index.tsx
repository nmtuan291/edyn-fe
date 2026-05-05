import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ForumDescription from "../../../components/ForumDescription";
import apiSlice from "../../../store/api";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import ImageCarousel from "../../../components/ImageCarousel";
import CommentEditor from "../Comment/CommentEditor";
import Comment from "../Comment";
import type { Comment as CommentType } from "../../../interfaces/interfaces";
import { timeAgo, formatVoteCount } from "../../../utils/timeAgo";
import defaultAvatar from "../../../constants/defaultAvatar";

const ThreadContent: React.FC = () => {
    const [isOptionOpen, setIsOptionOpen] = useState<boolean>(false);
    const [localVote, setLocalVote] = useState<number | null>(null);
    const [localUpvote, setLocalUpvote] = useState<number | null>(null);
    const optionRef = useRef<HTMLDivElement>(null);
    const { id, name: realmSlug } = useParams();
    const navigate = useNavigate();
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    const { data: realm } = apiSlice.useGetRealmQuery(realmSlug!, { skip: !realmSlug });
    const { data, isLoading } = apiSlice.useGetThreadQuery(id!);
    const { data: comments } = apiSlice.useGetCommentsQuery(id!);
    const { data: creatorProfile } = apiSlice.useGetUserProfileQuery(data?.creatorId!, { skip: !data?.creatorId });
    const [voteThread] = apiSlice.useVoteThreadMutation();

    const currentVote = localVote ?? data?.vote ?? 0;
    const currentUpvote = localUpvote ?? data?.upvote ?? 0;

    const creatorName = data?.forumName || creatorProfile?.userName || "User";
    const creatorAvatar = data?.forumImage || creatorProfile?.avatar;

    useEffect(() => {
        const el = document.getElementById("context-panel");
        setPortalTarget(el);
        if (el) el.classList.remove("hidden");
        return () => { if (el) el.classList.add("hidden"); };
    }, []);

    useEffect(() => {
        const closeOption = (event: MouseEvent) => {
            if (optionRef.current && !optionRef.current.contains(event.target as Node)) {
                setIsOptionOpen(false);
            }
        }
        document.addEventListener("click", closeOption);
        return () => document.removeEventListener("click", closeOption);
    }, []);

    useEffect(() => {
        if (data) {
            setLocalVote(data.vote);
            setLocalUpvote(data.upvote);
        }
    }, [data]);

    const handleVote = async (voteValue: number) => {
        if (!data) return;
        const newVote = currentVote === voteValue ? 0 : voteValue;
        const delta = newVote - currentVote;
        setLocalVote(newVote);
        setLocalUpvote(currentUpvote + delta);
        try {
            await voteThread({ threadId: data.id, vote: newVote }).unwrap();
        } catch {
            setLocalVote(currentVote);
            setLocalUpvote(currentUpvote);
        }
    };

    if (isLoading)
        return <Loader />

    const commentCount = comments?.length ?? 0;

    return (
        <>
            <article className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                <div className="p-5">
                    {/* Author header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={creatorAvatar || defaultAvatar}
                                className="w-10 h-10 rounded-full object-cover"
                                alt=""
                            />
                            <div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-surface-900">{creatorName}</span>
                                    <span className="text-surface-400">·</span>
                                    <span className="text-surface-400">{timeAgo(data?.createdAt)}</span>
                                </div>
                                {data?.forumName && (
                                    <p
                                        className="text-xs text-brand-600 font-medium cursor-pointer hover:underline"
                                        onClick={() => navigate(`/realm/${data.forumName}`)}
                                    >
                                        {data.forumName}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="relative" ref={optionRef}>
                            <button
                                className="p-2 rounded-full hover:bg-surface-100 transition-colors cursor-pointer"
                                onClick={() => setIsOptionOpen(true)}
                            >
                                <svg className={`w-5 h-5 text-surface-400 ${isOptionOpen ? "text-surface-600" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                                    <circle cx="4" cy="10" r="1.5" />
                                    <circle cx="10" cy="10" r="1.5" />
                                    <circle cx="16" cy="10" r="1.5" />
                                </svg>
                            </button>
                            <div className={`absolute right-0 top-full mt-1 bg-white rounded-xl shadow-dropdown border border-surface-200 w-40 overflow-hidden z-10 ${!isOptionOpen ? "hidden" : ""}`}>
                                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors cursor-pointer">Lưu</button>
                                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors cursor-pointer border-t border-surface-100">Ẩn</button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors cursor-pointer border-t border-surface-100">Báo cáo</button>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-xl font-bold text-surface-900 mb-3">{data?.title}</h1>

                    {/* Body */}
                    <div className="text-sm text-surface-700 leading-relaxed mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data?.content }} />
                    
                    {/* Images */}
                    {data?.images && data.images.length > 0 && (
                        <div className="rounded-xl overflow-hidden mb-4">
                            <ImageCarousel images={data.images} />
                        </div>
                    )}

                    {/* Action bar */}
                    <div className="flex items-center gap-1 pt-3 border-t border-surface-100">
                        <div className="flex items-center bg-surface-50 rounded-full">
                            <button
                                className={`p-2 rounded-full transition-colors cursor-pointer ${currentVote === 1 ? "text-upvote bg-orange-50" : "text-surface-400 hover:text-upvote hover:bg-orange-50"}`}
                                onClick={() => handleVote(1)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                </svg>
                            </button>
                            <span className={`text-xs font-bold min-w-[24px] text-center ${currentVote === 1 ? "text-upvote" : currentVote === -1 ? "text-downvote" : "text-surface-600"}`}>
                                {formatVoteCount(currentUpvote)}
                            </span>
                            <button
                                className={`p-2 rounded-full transition-colors cursor-pointer ${currentVote === -1 ? "text-downvote bg-indigo-50" : "text-surface-400 hover:text-downvote hover:bg-indigo-50"}`}
                                onClick={() => handleVote(-1)}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                        </div>
                        <button className="flex items-center gap-1.5 text-surface-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-full transition-colors text-xs font-medium cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                            </svg>
                            {commentCount}
                        </button>
                        <button className="flex items-center gap-1.5 text-surface-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-full transition-colors text-xs font-medium cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                            </svg>
                            Chia sẻ
                        </button>
                        <button className="flex items-center gap-1.5 text-surface-500 hover:text-danger hover:bg-red-50 px-3 py-2 rounded-full transition-colors text-xs font-medium cursor-pointer">
                            Báo cáo
                        </button>
                    </div>
                </div>
            </article>

            {/* Comment editor */}
            <div className="mt-4">
                <CommentEditor threadId={id ?? ""} parentComment={null} closeEditor={() => {}} />
            </div>

            {/* Comments */}
            <div className="mt-6 space-y-1">
                {(comments ?? []).map((comment: CommentType) => (
                    <Comment key={comment.id} comment={comment} />
                ))}
            </div>

            {portalTarget && createPortal(
                <ForumDescription realm={realm ?? null} />,
                portalTarget
            )}
        </>
    )
}

export default ThreadContent;
