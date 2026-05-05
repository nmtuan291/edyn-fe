import { useState } from "react";
import type { Realm } from "../../interfaces/interfaces";
import { timeAgo } from "../../utils/timeAgo";
import defaultAvatar from "../../constants/defaultAvatar";

interface ForumDescriptionProps {
    realm?: Realm | null;
}

const ForumDescription: React.FC<ForumDescriptionProps> = ({ realm }) => {
    const [rulesExpanded, setRulesExpanded] = useState(false);

    const name = realm?.name?.trim() || "—";
    const description = realm?.description?.trim() || "Chưa có mô tả.";
    const image = realm?.forumImage?.trim() || defaultAvatar;

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
                <p className="text-sm text-surface-400">Danh sách sẽ hiển thị khi API cung cấp.</p>
            </div>
        </div>
    );
};

export default ForumDescription;
