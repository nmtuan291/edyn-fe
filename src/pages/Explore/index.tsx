import React from "react";
import { Link } from "react-router-dom";
import apiSlice from "../../store/api";
import { type Realm } from "../../interfaces/interfaces";

const Explore: React.FC = () => {
    const { data: forums, isLoading, error } = apiSlice.useGetAllForumsQuery(undefined);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 py-8">
                <div className="h-8 bg-surface-200 rounded w-48 mb-6 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-surface-200 p-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-surface-200 rounded-xl" />
                                <div className="flex-1">
                                    <div className="h-5 bg-surface-200 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-surface-200 rounded w-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-xl font-bold text-surface-900 mb-2">Đã xảy ra lỗi</h2>
                <p className="text-surface-500">Không thể tải danh sách cộng đồng lúc này.</p>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-surface-900 mb-2 tracking-tight">Khám phá cộng đồng</h1>
                <p className="text-surface-500">Tìm kiếm và tham gia những không gian dành riêng cho sở thích của bạn.</p>
            </div>

            {forums && forums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forums.map((realm: Realm) => (
                        <Link
                            key={realm.id}
                            to={`/realm/${realm.name}`}
                            className="group flex items-start gap-4 p-4 bg-white border border-surface-200/80 rounded-2xl hover:border-brand-300 hover:shadow-md transition-all duration-200"
                        >
                            <img
                                src={realm.forumImage || "https://placehold.co/100"}
                                alt={realm.name}
                                className="w-16 h-16 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-surface-900 group-hover:text-brand-600 transition-colors truncate">
                                    {realm.name}
                                </h3>
                                <p className="text-sm text-surface-500 mt-1 line-clamp-2">
                                    {realm.description || "Không có mô tả"}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-3xl border border-surface-200/60 shadow-sm">
                    <div className="text-4xl mb-4">🌱</div>
                    <h3 className="text-xl font-bold text-surface-900 mb-2">Chưa có cộng đồng nào</h3>
                    <p className="text-surface-500">Hãy là người đầu tiên tạo cộng đồng trên Edyn!</p>
                </div>
            )}
        </div>
    );
};

export default Explore;
