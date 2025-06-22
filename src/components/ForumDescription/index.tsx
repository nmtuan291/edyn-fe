import testAvatar from "../ThreadCard/avatar_default_0.png"

const ForumDescription: React.FC = () => {

    return (
        <div className="bg-gray-50 p-4 w-full">
            <div>
                <p className="font-bold">r/switch</p>
                <p className="text-gray-500">The Number One Gaming forum on the Internet.</p>
                <div className="flex items-center text-gray-500 mt-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                    >
                        <path d="M12 2c.552 0 1 .447 1 1v1h-2V3c0-.553.448-1 1-1zm6 3v2H6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1zm-1 4v2H7V9h10zm-9 4v2h8v-2H8zm-2 4v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2H6z"/>
                    </svg>
                    <p>Đã tạo 22 th 6, 2025</p>
                </div>
                <div className="flex mt-2 justify-between">
                    <div>
                        <p>57tr</p>
                        <p>thành viên</p>
                    </div>
                    <div>
                        <p>1.4N</p>
                        <p>trực tuyến</p>
                    </div>
                </div>
            </div>
            <hr className="text-gray-300 mt-4"/>
            <div className="mt-4">
                <p className="font-semibold text-gray-500">Thông tin cộng đồng</p>
                <p className="mt-2">If your submission does not appear, do not delete it. Simply message the moderators and ask us to look into it.

                    Please note, you are required to have some r/gaming Community Karma to make a post. Please comment around before posting.

                    Do NOT private message or use reddit chat to contact moderators about moderator actions. Only message the team via the link above. 
                    Directly messaging individual moderators may result in a temporary ban
                </p>
            </div>
            <hr className="text-gray-300 mt-4"/>
            <div className="mt-4">
                <p className="font-semibold text-gray-500">Kiểm duyệt viên</p>
                <ul className="mt-4 flex flex-col gap-3">
                    <li className="flex items-center gap-1 hover:underline cursor-pointer text-gray-500">
                        <img className="w-10 rounded-full" src={testAvatar} />
                        <p>testuser</p>
                    </li>
                    <li className="flex items-center gap-1 text-gray-500">
                        <img className="w-10 rounded-full" src={testAvatar} />
                        <p>testuser</p>
                    </li>
                    <li className="flex items-center gap-1 text-gray-500">
                        <img className="w-10 rounded-full" src={testAvatar} />
                        <p>testuser</p>
                    </li>
                    <li className="flex items-center gap-1 text-gray-500">
                        <img className="w-10 rounded-full" src={testAvatar} />
                        <p>testuser</p>
                    </li>
                </ul>
                <button className="bg-gray-200 w-full h-10 mt-2 font-bold rounded-3xl hover:bg-gray-300 cursor-pointer text-sm">Xem tất cả kiểm duyệt viên</button>
            </div>
        </div>
    )
}

export default ForumDescription;