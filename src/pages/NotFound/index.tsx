import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <div className="mb-8">
                <span className="font-logo font-extrabold text-8xl tracking-tighter bg-gradient-to-r from-brand-600/20 to-brand-400/20 bg-clip-text text-transparent select-none">
                    404
                </span>
                <div className="relative -mt-16">
                    <span className="font-logo font-extrabold text-4xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                        edyn
                    </span>
                </div>
            </div>

            <h1 className="text-3xl font-bold text-surface-900 mb-3">Trang này không tồn tại</h1>
            <p className="text-surface-500 max-w-md mb-8 leading-relaxed">
                Có vẻ như bạn đã đi lạc vào một vùng đất chưa được khai phá. 
                Đừng lo lắng, hãy để chúng tôi đưa bạn trở về nhà.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={() => navigate("/")}
                    className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-brand-500/20 cursor-pointer"
                >
                    Về trang chủ
                </button>
                <button 
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold rounded-full transition-all cursor-pointer"
                >
                    Quay lại
                </button>
            </div>

            {/* Decorative elements */}
            <div className="mt-16 flex gap-4 text-brand-200">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    );
};

export default NotFound;
