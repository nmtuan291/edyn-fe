import testAvatar from "../ThreadCard/avatar_default_0.png";
import testImage from "../ThreadCard/test_image.png";


const ProfileCommentBox: React.FC = () => {

  return (
    <div>
      <div className="border-t border-b border-gray-300 p-4">
        <div className="flex gap-2 text-xs items-center">
          <img src={testAvatar} className="w-7 rounded-full"/>
          <span className="font-semibold">forumname</span>
          <span className="text-gray-500">title</span>
        </div>
        <div className="px-9 py-2 hidden">
          <div className="text-xs">
            <span className="font-bold">testuser</span>
            <span className="text-gray-500"> đã trả lời </span>
            <span className="font-bold">testuser02</span>
            <span className="text-gray-500"> 1 năm trước</span>
          </div>
        </div>
        <div className="px-9 py-2">
          <div className="text-xs">
            <span className="font-bold">testuser</span>
            <span className="text-gray-500"> đã bình luận </span>
            <span className="text-gray-500"> 1 năm trước</span>
          </div>
        </div>
        <div className="px-9 py-2 text-sm">
          <img src={testImage} className="w-60 mb-2"></img>
          <p>
            ádasdasdada
            ádasdasdasdasdas
          </p>
        </div>
        <div className="flex gap-4 mt-3 text-xs font-bold text-gray-500 items-center px-9">
            <div className="border flex items-center rounded-3xl">
                <svg
                    className="w-6 h-6 text-gray-400 hover:text-orange-500 cursor-pointer"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <polygon points="10,5 5,15 15,15" />
                </svg>
                <p>2K</p>
                <svg
                    className="w-6 h-6 text-gray-400 hover:text-blue-500 cursor-pointer"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <polygon points="10,15 5,5 15,5" />
                </svg>
            </div>
            <p className="cursor-pointer">Chia sẻ</p>
            <p className="cursor-pointer">Báo cáo</p>
        </div>
      </div>
    </div>
  )
}

export default ProfileCommentBox;