import { NavLink, Outlet } from "react-router-dom"
import Account from "./Account";
import Profile from "./Profile";
import { useState } from "react";
import Preferences from "./Preferences";

const UserSetting: React.FC = () => {

    return (
        <div className="px-6 py-10">
            <h1 className="text-3xl font-bold">Thiết lập</h1>
            <div className="mt-3 flex justify-center">
                <NavLink to="/settings/account" className="p-2 w-full text-sm text-center font-bold text-gray-500">Tài khoản</NavLink>
                <NavLink to="/settings/profile" className="p-2 w-full text-sm text-center font-bold text-gray-500">Hồ sơ</NavLink>
                <NavLink to="/settings/privacy" className="p-2 w-full text-sm text-center font-bold text-gray-500">Quyền riêng tư</NavLink>
                <NavLink to="/settings/preferences" className="p-2 w-full text-sm text-center font-bold text-gray-500">Tùy chọn</NavLink>
            </div>
            <Outlet></Outlet>
        </div>
    )
}

export default UserSetting;