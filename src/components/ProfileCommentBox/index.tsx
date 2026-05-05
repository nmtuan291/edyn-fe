const ProfileCommentBox: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
            <div className="p-8 text-center text-sm text-surface-500">
                Chưa có bình luận để hiển thị. Dữ liệu sẽ được tải từ API khi có endpoint phù hợp.
            </div>
        </div>
    );
};

export default ProfileCommentBox;
