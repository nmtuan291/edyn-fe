import ProfileCommentBox from "../../../components/ProfileCommentBox";
import testAvatar from "../../../components/ThreadCard/avatar_default_0.png";
import testImage from "../../../components/ThreadCard/test_image.png";

const ProfileComment: React.FC = () => {

  return (
    <div className="">
      <button className="flex items-center gap-1 text-xs mt-4 font-semibold text-gray-500 p-2 ml-2">
        <p>Mới</p>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="rotate-90">
          <path d="M8 4l8 8-8 8" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
      <ProfileCommentBox />
    </div>
  )
}

export default ProfileComment;