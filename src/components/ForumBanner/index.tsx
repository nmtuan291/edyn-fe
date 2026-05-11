import testBanner from "./banner.png";
import Avatar from "../Avatar";
import { Edit, ExitToApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiSlice from "../../store/api";
import { canAccessForumManagement, readRoleFromApi } from "../../interfaces/interfaces";
import { useState } from "react";

interface ForumBannerProps {
    forumId: string,
    forumName: string,
    forumBanner: string,
    forumImage: string
}

const ForumBanner: React.FC<ForumBannerProps> = ({ forumId, forumName, forumImage, forumBanner }) => {
    const navigate = useNavigate();
    const [isHoveringJoined, setIsHoveringJoined] = useState(false);
    const { data: forumPerm, refetch: refetchPermissions } = apiSlice.useGetForumPermissionsQuery(forumId, { skip: !forumId });
    const [joinForum, { isLoading: joinLoading }] = apiSlice.useJoinForumMutation();
    const [leaveForum, { isLoading: leaveLoading }] = apiSlice.useLeaveForumMutation();

    const isForumMember = !!forumPerm;
    const showManage = canAccessForumManagement(readRoleFromApi(forumPerm));

    const handleJoinRealm = async () => {
        if (!forumId) return;
        try {
            await joinForum(forumId).unwrap();
            await refetchPermissions();
        } catch (error) {
            console.error("Join failed:", error);
        }
    };

    const handleLeaveRealm = async () => {
        if (!forumId) return;
        if (!window.confirm(`Bạn có chắc chắn muốn rời khỏi cộng đồng ${forumName}?`)) return;
        try {
            await leaveForum(forumId).unwrap();
            await refetchPermissions();
        } catch (error) {
            console.error("Leave failed:", error);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden mb-6">
            {/* Banner with gradient overlay */}
            <div className="relative h-36 sm:h-44 group">
                <img className="w-full h-full object-cover" src={forumBanner || testBanner} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {showManage && (
                    <button className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white shadow-sm">
                        <Edit style={{ fontSize: 16 }} className="text-surface-600" />
                    </button>
                )}
            </div>

            {/* Info section */}
            <div className="relative px-5 pb-5">
                {/* Avatar overlapping banner */}
                <div className="relative -mt-10 mb-3 flex items-end justify-between">
                    <div className="relative group">
                        <Avatar 
                            src={forumImage}
                            name={forumName}
                            className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm" 
                        />
                        {showManage && (
                            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Edit className="text-white" style={{ fontSize: 18 }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Name and stats */}
                <div className="mb-4">
                    <h1 className="text-xl font-bold text-surface-900">{forumName}</h1>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {showManage && (
                        <button
                            className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-colors cursor-pointer"
                            onClick={() => navigate(`/r/${forumName}/manage`)}
                        >
                            Quản lý
                        </button>
                    )}
                    <button
                        className="px-4 py-2 text-sm font-medium border border-surface-300 text-surface-700 hover:bg-surface-50 rounded-full transition-colors cursor-pointer"
                        onClick={() => navigate(`/r/${forumName}/create`)}
                    >
                        Tạo bài đăng
                    </button>
                    <button 
                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all cursor-pointer flex items-center gap-1.5
                            ${isForumMember
                                ? isHoveringJoined 
                                    ? "border border-danger text-danger bg-red-50" 
                                    : "border border-brand-300 text-brand-700 bg-brand-50" 
                                : "bg-brand-600 hover:bg-brand-700 text-white"
                            }
                            ${(joinLoading || leaveLoading) ? "opacity-60 pointer-events-none" : ""}`}
                        disabled={joinLoading || leaveLoading}
                        onMouseEnter={() => setIsHoveringJoined(true)}
                        onMouseLeave={() => setIsHoveringJoined(false)}
                        onClick={() => { 
                            if (isForumMember) void handleLeaveRealm(); 
                            else void handleJoinRealm(); 
                        }}
                    >
                        {isForumMember ? (
                            isHoveringJoined ? (
                                <><ExitToApp style={{ fontSize: 16 }} /> Rời khỏi</>
                            ) : "Đã tham gia"
                        ) : "Tham gia"}
                    </button>
                    <button className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-full transition-colors ml-auto cursor-pointer">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="4" cy="10" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="16" cy="10" r="2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ForumBanner;
