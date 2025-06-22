import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const Sidebar: React.FC = () => {
    const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
    

    return (
        <div className="border-r h-screen p-4 border-gray-300 w-full">
            <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-500"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
                    </svg>
                    Trang chủ
                </li>
                <li className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-gray-500 rotate-45"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M12 16V8M12 8l-4 4M12 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Phổ biến
                </li>
                <li className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Khám phá
                </li>
                <hr className="text-gray-300"></hr>
                <li>Giới thiệu về Edyn</li>
                <li>Trợ giúp</li>
                <li>Cộng đồng</li>
                <li>Chủ đề</li>
            </ul>
        </div>
    )
}

export default Sidebar;