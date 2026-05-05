import ProfileCommentBox from "../../../components/ProfileCommentBox";

const ProfileComment: React.FC = () => {
    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-full transition-colors cursor-pointer">
                    Mới
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </button>
            </div>
            <ProfileCommentBox />
        </div>
    )
}

export default ProfileComment;
