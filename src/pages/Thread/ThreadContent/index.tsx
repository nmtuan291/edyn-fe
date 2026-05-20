import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ForumDescription from "../../../components/ForumDescription";
import apiSlice from "../../../store/api";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import Loader from "../../../components/Loader";
import ImageCarousel from "../../../components/ImageCarousel";
import CommentEditor from "../Comment/CommentEditor";
import Comment from "../Comment";
import type { Comment as CommentType } from "../../../interfaces/interfaces";
import { timeAgo, formatVoteCount } from "../../../utils/timeAgo";
import Avatar from "../../../components/Avatar";
import Modal from "../../../components/Modal";

const ThreadContent: React.FC = () => {
    const [isOptionOpen, setIsOptionOpen] = useState<boolean>(false);
    const [localVote, setLocalVote] = useState<number | null>(null);
    const [localUpvote, setLocalUpvote] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const optionRef = useRef<HTMLDivElement>(null);
    const { id, name: realmSlug } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    const { data: realm } = apiSlice.useGetRealmQuery(realmSlug!, { skip: !realmSlug });
    const { data, isLoading } = apiSlice.useGetThreadQuery(id!);
    const { data: comments } = apiSlice.useGetCommentsQuery(id!);
    const { data: creatorProfile } = apiSlice.useGetUserProfileQuery(data?.creatorId!, { skip: !data?.creatorId });
    const [voteThread] = apiSlice.useVoteThreadMutation();
    const [editThread] = apiSlice.useEditThreadMutation();
    const [deleteThread] = apiSlice.useDeleteThreadMutation();

    const isOwner = currentUser.id && data?.creatorId === currentUser.id;
    const currentVote = localVote ?? data?.vote ?? 0;
    const currentUpvote = localUpvote ?? data?.upvote ?? 0;

    const isEdited = data?.lastUpdatedAt && data?.createdAt && 
        (new Date(data.lastUpdatedAt).getTime() - new Date(data.createdAt).getTime() > 1000);

    const creatorName = (data?.creatorName && data.creatorName !== "User" && data.creatorName.trim() !== "")
        ? data.creatorName 
        : (creatorProfile?.userName || data?.forumName || "User");
    const creatorAvatar = (data?.creatorName && data.creatorName !== "User" && data.creatorName.trim() !== "")
        ? data.creatorAvatar 
        : (creatorProfile?.avatar || data?.creatorAvatar || data?.forumImage);

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
        } catch (error: any) {
            setLocalVote(currentVote);
            setLocalUpvote(currentUpvote);
            if (error?.status === 403) {
                setWarningMessage("Bạn cần tham gia cộng đồng (realm) này để bình chọn bài viết!");
                setShowWarningModal(true);
            } else if (error?.status === 401) {
                setWarningMessage("Bạn cần đăng nhập để bình chọn bài viết!");
                setShowWarningModal(true);
            }
        }
    };

    const handleStartEdit = () => {
        if (!data) return;
        setEditTitle(data.title);
        setEditContent(data.content);
        setIsEditing(true);
        setIsOptionOpen(false);
    };

    const handleSaveEdit = async () => {
        if (!data) return;
        try {
            await editThread({
                threadId: data.id,
                title: editTitle !== data.title ? editTitle : undefined,
                content: editContent !== data.content ? editContent : undefined,
            }).unwrap();
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to edit thread:", error);
        }
    };

    const handleDelete = async () => {
        if (!data) return;
        try {
            await deleteThread(data.id).unwrap();
            navigate(`/r/${realmSlug}`);
        } catch (error) {
            console.error("Failed to delete thread:", error);
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
                            <Avatar
                                src={creatorAvatar}
                                name={creatorName}
                                className="w-10 h-10"
                            />
                            <div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-surface-900">{creatorName}</span>
                                    <span className="text-surface-400">·</span>
                                    <span className="text-surface-400">{timeAgo(data?.createdAt)}</span>
                                    {isEdited && (
                                         <>
                                             <span className="text-surface-400">·</span>
                                             <span className="text-xs text-surface-400 italic">đã chỉnh sửa</span>
                                         </>
                                     )}
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
                                {isOwner && (
                                    <>
                                        <button
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors cursor-pointer"
                                            onClick={handleStartEdit}
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors cursor-pointer border-t border-surface-100"
                                            onClick={() => { setShowDeleteConfirm(true); setIsOptionOpen(false); }}
                                        >
                                            Xóa bài đăng
                                        </button>
                                    </>
                                )}
                                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors cursor-pointer border-t border-surface-100">Lưu</button>
                                <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface-50 transition-colors cursor-pointer border-t border-surface-100">Ẩn</button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors cursor-pointer border-t border-surface-100">Báo cáo</button>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {data?.tags && data.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {data.tags.map((tag: any) => (
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
                    {isEditing ? (
                        <div className="mb-4">
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>
                    ) : (
                        <h1 className="text-xl font-bold text-surface-900 mb-3 flex items-center gap-2">
                            {data?.isPinned && (
                                <svg className="w-5 h-5 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z" />
                                </svg>
                            )}
                            {data?.title}
                        </h1>
                    )}

                    {/* Body */}
                    {isEditing ? (
                        <div className="mb-4">
                            <textarea
                                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                            <div className="flex gap-2 mt-3">
                                <button
                                    className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-colors cursor-pointer"
                                    onClick={handleSaveEdit}
                                >
                                    Lưu thay đổi
                                </button>
                                <button
                                    className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-full transition-colors cursor-pointer"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-surface-700 leading-relaxed mb-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data?.content }} />
                    )}

                    {/* Images */}
                    {data?.images && data.images.length > 0 && (
                        <div className="rounded-xl overflow-hidden mb-4">
                            <ImageCarousel images={data.images} />
                        </div>
                    )}

                    {/* Poll items */}
                    {data?.pollItems && data.pollItems.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {data.pollItems.map((item: any, idx: number) => {
                                const totalVotes = data.pollItems.reduce((sum: number, p: any) => sum + (p.voteCount ?? 0), 0);
                                const pct = totalVotes > 0 ? Math.round((item.voteCount / totalVotes) * 100) : 0;
                                return (
                                    <div key={idx} className="relative bg-surface-50 rounded-xl overflow-hidden border border-surface-200">
                                        <div
                                            className="absolute inset-y-0 left-0 bg-brand-100/60 transition-all"
                                            style={{ width: `${pct}%` }}
                                        />
                                        <div className="relative px-4 py-2.5 flex items-center justify-between">
                                            <span className="text-sm font-medium text-surface-700">{item.pollContent}</span>
                                            <span className="text-xs font-bold text-surface-500">{pct}% ({item.voteCount})</span>
                                        </div>
                                    </div>
                                );
                            })}
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

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm mx-4 p-6">
                        <h3 className="text-lg font-bold text-surface-900 mb-2">Xóa bài đăng?</h3>
                        <p className="text-sm text-surface-500 mb-5">Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không thể hoàn tác.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-full transition-colors cursor-pointer"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium bg-danger hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                onClick={handleDelete}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comment editor */}
            <div className="mt-4">
                <CommentEditor threadId={id ?? ""} parentComment={null} closeEditor={() => { }} />
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

            <Modal show={showWarningModal} closeModal={() => setShowWarningModal(false)}>
                <div className="flex flex-col items-center text-center">
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
                        onClick={() => setShowWarningModal(false)}
                        className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-sm font-semibold transition-colors cursor-pointer"
                    >
                        Đóng
                    </button>
                </div>
            </Modal>
        </>
    )
}

export default ThreadContent;
