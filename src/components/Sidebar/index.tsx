import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { RootState } from "../../store";
import apiSlice from "../../store/api";
import type { ForumUser } from "../../interfaces/interfaces";

const Sidebar: React.FC = () => {
    const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
    const navigate = useNavigate();
    const location = useLocation();

    const isLoggedIn = !!localStorage.getItem("jwt");
    const { data: joinedForums } = apiSlice.useGetJoinedForumsQuery(undefined, { skip: !isLoggedIn });

    const navItems = [
        {
            label: "Trang chủ",
            path: "/",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            ),
        },
        {
            label: "Phổ biến",
            path: "/popular",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
            ),
        },
        {
            label: "Khám phá",
            path: "/explore",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            ),
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="flex flex-col items-center py-4 gap-1">
            {navItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`group relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer
                        ${isActive(item.path) 
                            ? "bg-brand-100 text-brand-700" 
                            : "text-surface-500 hover:bg-surface-100 hover:text-surface-700"
                        }`}
                    title={item.label}
                >
                    {item.icon}
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none">
                        {item.label}
                    </div>
                </button>
            ))}
            
            {/* Joined Forums */}
            {isLoggedIn && joinedForums && joinedForums.length > 0 && (
                <>
                    <div className="w-8 h-px bg-surface-200 my-2" />
                    <p className="text-[9px] text-surface-400 uppercase tracking-wider font-semibold mb-1">Forums</p>
                    {(joinedForums as ForumUser[]).map((forum) => (
                        <button
                            key={forum.forumId}
                            onClick={() => navigate(`/realm/${forum.name}`)}
                            className={`group relative w-10 h-10 rounded-xl overflow-hidden transition-all cursor-pointer hover:ring-2 hover:ring-brand-200 ${
                                location.pathname === `/realm/${forum.name}` ? "ring-2 ring-brand-400" : ""
                            }`}
                            title={forum.name}
                        >
                            <img
                                src={forum.forumImage}
                                alt={forum.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none z-10">
                                {forum.name}
                            </div>
                        </button>
                    ))}
                </>
            )}

            <div className="w-8 h-px bg-surface-200 my-2" />

            <div className="flex flex-col items-center gap-1 text-[10px] text-surface-400 mt-auto">
                <span className="cursor-pointer hover:text-surface-600 transition-colors">Giới thiệu</span>
                <span className="cursor-pointer hover:text-surface-600 transition-colors">Trợ giúp</span>
            </div>
        </nav>
    )
}

export default Sidebar;
