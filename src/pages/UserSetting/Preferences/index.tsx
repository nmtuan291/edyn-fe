import SlideButton from "../../../components/SlideButton"

const ChevronRight = () => (
    <svg className="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);

const Preferences: React.FC = () => {
    return (
        <div className="divide-y divide-surface-100">
            <div className="p-5">
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Ngôn ngữ</h2>
                <button className="w-full flex items-center justify-between py-3 px-2 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer">
                    <span className="text-sm text-surface-700">Ngôn ngữ hiển thị</span>
                    <ChevronRight />
                </button>
            </div>
            <div className="p-5">
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Nội dung</h2>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-3 px-2">
                        <span className="text-sm text-surface-700">Hiển thị nội dung kiểm duyệt</span>
                        <SlideButton on={false} changeButtonState={() => {}} />
                    </div>
                    <div className="flex items-center justify-between py-3 px-2">
                        <span className="text-sm text-surface-700">Làm mờ nội dung 18+</span>
                        <SlideButton on={false} changeButtonState={() => {}} />
                    </div>
                </div>
            </div>
            <div className="p-5">
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Trải nghiệm</h2>
                <div className="space-y-1">
                    <div className="flex items-center justify-between py-3 px-2">
                        <span className="text-sm text-surface-700">Mở bài viết trong tab mới</span>
                        <SlideButton on={false} changeButtonState={() => {}} />
                    </div>
                    <div className="flex items-center justify-between py-3 px-2">
                        <span className="text-sm text-surface-700">Dùng theme cộng đồng</span>
                        <SlideButton on={false} changeButtonState={() => {}} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Preferences;
