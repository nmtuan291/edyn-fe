import SlideButton from "../../../components/SlideButton"

const Preferences: React.FC = () => {

    return (
        <div>
            <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-500">Ngôn ngữ</h2>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Ngôn ngữ hiển thị</p>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M8 4l8 8-8 8" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </div>
            </div>
            <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-500">Nội dung</h2>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Hiển thị nội dung kiểm duyệt</p>
                    <SlideButton on={false} changeButtonState={() => {}}></SlideButton>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Làm mờ nội dung 18+</p>
                    <SlideButton on={false} changeButtonState={() => {}}></SlideButton>
                </div>
            </div>
            <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-500">Trải nghiệm</h2>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Mở bài viết trong tab mới</p>
                    <SlideButton on={false} changeButtonState={() => {}}></SlideButton>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Dùng theme cộng đồng</p>
                    <SlideButton on={false} changeButtonState={() => {}}></SlideButton>
                </div>
            </div>
        </div>
    )
}

export default Preferences;