import { useState } from "react";
import SlideButton from "../../../components/SlideButton";

const ChevronRight = () => (
    <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const Privacy: React.FC = () => {
    const [button1, setButton1] = useState<boolean>(false);

    return (
        <div className="divide-y divide-surface-100">
            <div className="p-5">
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Tổng quát</h2>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-3 px-2">
                        <span className="text-sm text-surface-700">Cho phép người khác theo dõi bạn</span>
                        <SlideButton on={button1} changeButtonState={() => setButton1(!button1)}/>
                    </div>
                    <button className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer">
                        <span className="text-sm text-surface-700">Ai có thể nhắn tin</span>
                        <ChevronRight />
                    </button>
                    <button className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer">
                        <span className="text-sm text-surface-700">Chặn tài khoản</span>
                        <ChevronRight />
                    </button>
                </div>
            </div>
            <div className="p-5">
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Nâng cao</h2>
                <button className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                    <span className="text-sm text-danger">Xóa tài khoản</span>
                    <ChevronRight />
                </button>
            </div>
        </div>
    )
}

export default Privacy;
