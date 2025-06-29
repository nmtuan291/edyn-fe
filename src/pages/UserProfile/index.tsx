import type React from "react";
import testAvatar from "../../components/ThreadCard/avatar_default_0.png";

import { NavLink, Outlet } from "react-router-dom";

const UserProfile: React.FC = () => {

  return (
    <div>
      <div className="flex gap-4 items-center p-2 md:p-4">
        <img src={testAvatar} className="w-30 rounded-full"/> 
        <div>
          <p className="font-bold text-xl">testuser</p>
          <p className="text-gray-500 font-semibold text-sm">u/testuser</p>
        </div>
      </div>
      <div className="flex mt-2">
        <NavLink to="" className="p-2 w-full text-sm text-center font-bold text-gray-500">Tổng quan</NavLink>
        <NavLink to="" className="p-2 w-full text-sm text-center font-bold text-gray-500">Bài đăng</NavLink>
        <NavLink to="comment" className="p-2 w-full text-sm text-center font-bold text-gray-500">Bình luận</NavLink>
        <NavLink to="" className="p-2 w-full text-sm text-center font-bold text-gray-500">Đã lưu</NavLink>
        <NavLink to="" className="p-2 w-full text-sm text-center font-bold text-gray-500">Đã thích</NavLink>
      </div>
      <div>
          <Outlet />
      </div>
    </div>
  )
}

export default UserProfile;