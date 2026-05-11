import { useState, useEffect } from "react";
import apiSlice from "../../../store/api";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import Loader from "../../../components/Loader";
import Avatar from "../../../components/Avatar";

const Profile: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const { data: profile, isLoading } = apiSlice.useGetUserProfileQuery(user.id, { skip: !user.id });
    const [updateProfile, { isLoading: isUpdating }] = apiSlice.useUpdateUserProfileMutation();

    const [bio, setBio] = useState("");
    const [gender, setGender] = useState<number>(0);
    const [birthday, setBirthday] = useState("");
    const [avatar, setAvatar] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (profile) {
            setBio(profile.bio || "");
            setGender(profile.gender || 0);
            setBirthday(profile.birthday ? profile.birthday.split('T')[0] : "");
            setAvatar(profile.avatar || "");
        }
    }, [profile]);

    const handleSave = async () => {
        try {
            await updateProfile({
                bio,
                gender,
                birthday: birthday ? new Date(birthday).toISOString() : null,
                avatar: avatar || null
            }).unwrap();
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="p-6 max-w-2xl">
            <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                    <Avatar 
                        src={avatar} 
                        name={user.userName || "User"} 
                        className="w-24 h-24 rounded-2xl border-4 border-white shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-surface-900">{user.userName}</h2>
                    <p className="text-sm text-surface-500">Cập nhật ảnh đại diện và thông tin cá nhân của bạn.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Ảnh đại diện (URL)</label>
                    <input 
                        type="text" 
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                        placeholder="Dán link ảnh vào đây..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-2">Mô tả bản thân</label>
                    <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                        placeholder="Hãy viết gì đó về bạn..."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Giới tính</label>
                        <select 
                            value={gender}
                            onChange={(e) => setGender(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                        >
                            <option value={0}>Chưa xác định</option>
                            <option value={1}>Nam</option>
                            <option value={2}>Nữ</option>
                            <option value={3}>Khác</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Ngày sinh</label>
                        <input 
                            type="date" 
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button 
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full shadow-sm shadow-brand-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    {isSuccess && (
                        <span className="text-sm font-medium text-success flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Đã cập nhật hồ sơ!
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
