import { useState } from "react";
import apiSlice from "../../../store/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../../../store/user";

const Account: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [changePassword, { isLoading: isChanging }] = apiSlice.useChangePasswordMutation();
    const [revokeAllSessions, { isLoading: isRevoking }] = apiSlice.useRevokeAllSessionsMutation();
    
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (passwords.new !== passwords.confirm) {
            setError("Mật khẩu mới không khớp.");
            return;
        }

        try {
            await changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
                newPasswordVerify: passwords.confirm
            }).unwrap();
            setSuccess("Đổi mật khẩu thành công!");
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (err: any) {
            setError(err.data?.message || "Đổi mật khẩu thất bại.");
        }
    };

    const handleRevokeSessions = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tất cả các thiết bị khác?")) return;
        try {
            await revokeAllSessions({}).unwrap();
            alert("Đã thu hồi tất cả các phiên làm việc. Bạn sẽ được đăng xuất.");
            // Log out locally too
            localStorage.removeItem("jwt");
            localStorage.removeItem("refreshToken");
            dispatch(clearUser());
            navigate("/");
        } catch (err) {
            alert("Thu hồi phiên làm việc thất bại.");
        }
    };

    return (
        <div className="p-6 max-w-2xl space-y-8">
            <section>
                <h2 className="text-lg font-bold text-surface-900 mb-4">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Mật khẩu hiện tại</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                            value={passwords.current}
                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Mật khẩu mới</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                                value={passwords.new}
                                onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-xs text-danger font-medium">{error}</p>}
                    {success && <p className="text-xs text-success font-medium">{success}</p>}

                    <button 
                        type="submit"
                        disabled={isChanging}
                        className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-full transition-all disabled:opacity-50"
                    >
                        {isChanging ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                    </button>
                </form>
            </section>

            <div className="h-px bg-surface-100" />

            <section>
                <h2 className="text-lg font-bold text-surface-900 mb-2">Bảo mật phiên làm việc</h2>
                <p className="text-sm text-surface-500 mb-4">
                    Nếu bạn cảm thấy tài khoản bị xâm nhập, hãy thu hồi tất cả các phiên làm việc đang hoạt động.
                </p>
                <button 
                    onClick={handleRevokeSessions}
                    disabled={isRevoking}
                    className="px-6 py-2 border border-danger text-danger hover:bg-red-50 text-sm font-semibold rounded-full transition-all disabled:opacity-50"
                >
                    {isRevoking ? "Đang xử lý..." : "Đăng xuất khỏi tất cả thiết bị"}
                </button>
            </section>

            <div className="h-px bg-surface-100" />

            <section>
                <h2 className="text-lg font-bold text-danger mb-2">Vùng nguy hiểm</h2>
                <p className="text-sm text-surface-500 mb-4">
                    Một khi bạn xóa tài khoản, mọi dữ liệu sẽ không thể khôi phục.
                </p>
                <button className="px-6 py-2 bg-danger hover:bg-red-600 text-white text-sm font-semibold rounded-full transition-all">
                    Xóa tài khoản
                </button>
            </section>
        </div>
    );
};

export default Account;
