import React from "react";

interface NotificationBoardProps {
    notifications: any[]
}

const NotificationBoard: React.FC<NotificationBoardProps> = ({ notifications }) => {
    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return "Vừa xong";
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return `${Math.floor(diffInHours / 24)} ngày trước`;
    };

    return (
        <div className="w-80 bg-white rounded-2xl shadow-dropdown border border-surface-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="font-semibold text-sm text-surface-900">Thông báo</h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                    <div>
                        {notifications.slice().reverse().map((noti: any, index: number) => (
                            <div 
                                key={index} 
                                className={`px-4 py-3 hover:bg-surface-50 cursor-pointer transition-colors border-b border-surface-50 ${
                                    !noti.isRead ? 'bg-brand-50/50' : ''
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 mt-0.5">
                                        {!noti.isRead && (
                                            <div className="w-2 h-2 bg-brand-500 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-relaxed ${noti.isRead ? 'text-surface-600' : 'text-surface-900 font-medium'}`}>
                                            {noti.message}
                                        </p>
                                        <p className="text-xs text-surface-400 mt-1">
                                            {noti.createdAt ? formatTimeAgo(noti.createdAt) : 'Vừa xong'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-4 py-12 text-center">
                        <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-surface-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                        </div>
                        <p className="text-sm text-surface-500">Không có thông báo nào</p>
                    </div>
                )}
            </div>

            {notifications && notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-surface-100">
                    <button className="w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer">
                        Xem tất cả thông báo
                    </button>
                </div>
            )}
        </div>
    )
}

export default NotificationBoard;
