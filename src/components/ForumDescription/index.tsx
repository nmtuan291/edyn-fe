import { useState } from "react";
import type { Realm } from "../../interfaces/interfaces";
import { timeAgo } from "../../utils/timeAgo";
import defaultAvatar from "../../constants/defaultAvatar";
import apiSlice from "../../store/api";
import Avatar from "../Avatar";

interface ForumDescriptionProps {
    realm?: Realm | null;
}

const ForumDescription: React.FC<ForumDescriptionProps> = ({ realm }) => {
    const [rulesExpanded, setRulesExpanded] = useState(false);
    const { data: members, isLoading } = apiSlice.useGetForumMembersQuery(realm?.id ?? "", { skip: !realm?.id });

    const name = realm?.name?.trim() || "—";
    const description = realm?.description?.trim() || "Chưa có mô tả.";
    const image = realm?.forumImage?.trim() || defaultAvatar;

    const moderators = (members ?? []).filter(
        (m: any) => m.role === 0 || m.role === 1 || m.role === 2
    );

    const getRoleBadge = (role: number) => {
        switch (role) {
            case 0:
                return { text: "Admin", className: "bg-red-50 text-red-600 border border-red-200" };
            case 1:
                return { text: "Super Mod", className: "bg-amber-50 text-amber-700 border border-amber-200" };
            case 2:
                return { text: "Mod", className: "bg-brand-50 text-brand-700 border border-brand-200" };
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
            <div className="p-4 border-b border-surface-100">
                <h3 className="font-bold text-surface-900">Về cộng đồng</h3>
            </div>

            <div className="p-4 border-b border-surface-100">
                <div className="flex items-center gap-3 mb-2">
                    <img className="w-10 h-10 rounded-xl object-cover border border-surface-100" src={image} alt="" />
                    <p className="text-sm font-semibold text-surface-900">{name}</p>
                </div>
                <p className="text-sm text-surface-500 leading-relaxed">{description}</p>
                {realm?.createdAt && (
                    <div className="flex items-center gap-1.5 text-surface-400 mt-3 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        Đã tạo {timeAgo(realm.createdAt)}
                    </div>
                )}
            </div>

            <div className="border-b border-surface-100">
                <button
                    className="w-full flex items-center justify-between p-4 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors cursor-pointer"
                    onClick={() => setRulesExpanded(!rulesExpanded)}
                >
                    Thông tin cộng đồng
                    <svg className={`w-4 h-4 text-surface-400 transition-transform ${rulesExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
                {rulesExpanded && (
                    <div className="px-4 pb-4">
                        <p className="text-sm text-surface-600 leading-relaxed">
                            Quy tắc và hướng dẫn chi tiết do quản trị viên cộng đồng quản lý. Liên hệ kiểm duyệt viên nếu bạn có thắc mắc.
                        </p>
                    </div>
                )}
            </div>

            <div className="p-4">
                <p className="text-sm font-semibold text-surface-700 mb-3">Kiểm duyệt viên</p>
                {isLoading ? (
                    <div className="flex items-center gap-2 text-surface-400 text-xs">
                        <div className="w-4.5 h-4.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        Đang tải danh sách...
                    </div>
                ) : moderators.length > 0 ? (
                    <div className="space-y-3">
                        {moderators.map((mod: any) => {
                            const badge = getRoleBadge(mod.role);
                            return (
                                <div key={mod.id} className="flex items-center justify-between gap-3 text-sm">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar
                                            src={mod.avatar}
                                            name={mod.username}
                                            className="w-7 h-7 rounded-lg shrink-0"
                                        />
                                        <span className="font-medium text-surface-800 truncate">
                                            u/{mod.username}
                                        </span>
                                    </div>
                                    {badge && (
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${badge.className}`}>
                                            {badge.text}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-surface-400 italic">Chưa có kiểm duyệt viên.</p>
                )}
            </div>
        </div>
    );
};

export default ForumDescription;
