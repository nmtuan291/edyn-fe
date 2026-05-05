import { NavLink, Outlet } from "react-router-dom"

const UserSetting: React.FC = () => {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
            isActive
                ? "bg-brand-100 text-brand-700"
                : "text-surface-500 hover:bg-surface-100 hover:text-surface-700"
        }`;

    return (
        <div>
            <h1 className="text-2xl font-bold text-surface-900 mb-6">Thiết lập</h1>
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
                <NavLink to="account" className={navLinkClass}>Tài khoản</NavLink>
                <NavLink to="profile" className={navLinkClass}>Hồ sơ</NavLink>
                <NavLink to="privacy" className={navLinkClass}>Quyền riêng tư</NavLink>
                <NavLink to="preferences" className={navLinkClass}>Tùy chọn</NavLink>
            </div>
            <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                <Outlet />
            </div>
        </div>
    )
}

export default UserSetting;
