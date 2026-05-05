import type React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import apiSlice from "../../store/api";
import Loader from "../../components/Loader";
import defaultAvatar from "../../constants/defaultAvatar";

const UserProfile: React.FC = () => {
    const { username } = useParams();
    const current = useSelector((state: RootState) => state.user);
    const accountId = username?.trim() || current.id || "";
    const { data: profile, isLoading, isError } = apiSlice.useGetUserProfileQuery(accountId, { skip: !accountId });

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
            isActive
                ? "bg-brand-100 text-brand-700"
                : "text-surface-500 hover:bg-surface-100 hover:text-surface-700"
        }`;

    if (!accountId) {
        return (
            <div className="text-center py-12 text-sm text-surface-500">
                Đăng nhập để xem hồ sơ.
            </div>
        );
    }

    if (isLoading) return <Loader />;

    if (isError || !profile) {
        return (
            <div className="text-center py-12 text-sm text-surface-500">
                Không tải được hồ sơ người dùng.
            </div>
        );
    }

    const displayName = profile.userName || "—";
    const avatarSrc = profile.avatar?.trim() ? profile.avatar : defaultAvatar;

    return (
        <div>
            <div className="bg-white rounded-2xl border border-surface-200/80 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <img src={avatarSrc} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                    <div>
                        <h1 className="font-bold text-xl text-surface-900">{displayName}</h1>
                        <p className="text-sm text-surface-400">@{displayName}</p>
                        {profile.bio && (
                            <p className="text-sm text-surface-600 mt-2 max-w-xl leading-relaxed">{profile.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                <NavLink to="" end className={navLinkClass}>Tổng quan</NavLink>
                <NavLink to="" className={navLinkClass}>Bài đăng</NavLink>
                <NavLink to="comment" className={navLinkClass}>Bình luận</NavLink>
                <NavLink to="" className={navLinkClass}>Đã lưu</NavLink>
                <NavLink to="upvoted" className={navLinkClass}>Đã thích</NavLink>
            </div>

            <Outlet />
        </div>
    );
};

export default UserProfile;
