import React, { useEffect } from "react";
import { Circle, CheckCircle, AccessTime } from "@mui/icons-material";
import apiSlice from "../../store/api";

interface NotificationBoardProps {
    notifications: any[]
}

const NotificationBoard: React.FC<NotificationBoardProps> = ({ notifications }) => {
    const formatTimeAgo = (timestamp: string) => {
        // Simple time formatting - you can enhance this
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return "Vừa xong";
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        return `${Math.floor(diffInHours / 24)} ngày trước`;
    };

    return (
        <div className="w-80 max-h-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {notifications.slice().reverse().map((noti: any, index: number) => (
                            <li 
                                key={index} 
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                                    !noti.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                            >
                                <div className="flex items-start space-x-3">
                                    {/* Notification Icon */}
                                    <div className="flex-shrink-0 mt-1">
                                        {noti.isRead ? (
                                            <CheckCircle className="text-gray-400" fontSize="small" />
                                        ) : (
                                            <Circle className="text-blue-500" fontSize="small" />
                                        )}
                                    </div>

                                    {/* Notification Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${noti.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                            {noti.message}
                                        </p>
                                        
                                        {/* Timestamp */}
                                        <div className="flex items-center mt-1 text-xs text-gray-500">
                                            <AccessTime fontSize="inherit" className="mr-1" />
                                            {noti.createdAt ? formatTimeAgo(noti.createdAt) : 'Vừa xong'}
                                        </div>
                                    </div>

                                    {/* Unread indicator */}
                                    {!noti.isRead && (
                                        <div className="flex-shrink-0">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    /* Empty State */
                    <div className="px-4 py-8 text-center">
                        <div className="text-gray-400 mb-2">
                            <Circle fontSize="large" />
                        </div>
                        <p className="text-sm text-gray-500">Không có thông báo nào</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications && notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1">
                        Xem tất cả thông báo
                    </button>
                </div>
            )}
        </div>
    )
}

export default NotificationBoard;