import { useNavigate, useLocation } from "react-router-dom";

const MobileSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
        <div className="h-full bg-white pt-16">
            <div className="px-4 py-2">
                <div className="flex items-center gap-2 mb-6">
                    <span className="font-logo font-extrabold text-2xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                        edyn
                    </span>
                </div>
            </div>
            <nav className="flex flex-col gap-0.5 px-2">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                            ${isActive(item.path) 
                                ? "bg-brand-50 text-brand-700" 
                                : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="mt-8 px-4">
                <div className="h-px bg-surface-200 mb-4" />
                <div className="flex flex-col gap-2 text-xs text-surface-400">
                    <span className="cursor-pointer hover:text-surface-600">Giới thiệu về Edyn</span>
                    <span className="cursor-pointer hover:text-surface-600">Trợ giúp</span>
                    <span className="cursor-pointer hover:text-surface-600">Cộng đồng</span>
                    <span className="cursor-pointer hover:text-surface-600">Chủ đề</span>
                </div>
            </div>
        </div>
    )
}

export default MobileSidebar;
