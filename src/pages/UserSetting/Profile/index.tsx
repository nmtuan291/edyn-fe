const ChevronRight = () => (
    <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const Profile: React.FC = () => {
    return (
        <div className="p-5">
            <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Tổng quát</h2>
            <div className="space-y-1">
                {["Tên hiển thị", "Mô tả", "Ảnh đại diện"].map((item) => (
                    <button key={item} className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer">
                        <span className="text-sm text-surface-700">{item}</span>
                        <ChevronRight />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Profile;
