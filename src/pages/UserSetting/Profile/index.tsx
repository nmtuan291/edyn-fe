
const Profile: React.FC = () => {

    return (
        <div>
            <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-500">Tổng quát</h2>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Tên hiển thị</p>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M8 4l8 8-8 8" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Mô tả</p>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M8 4l8 8-8 8" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <p className="text-sm">Ảnh đại diện</p>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M8 4l8 8-8 8" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default Profile;