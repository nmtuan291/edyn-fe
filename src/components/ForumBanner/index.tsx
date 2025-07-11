import testBanner from "./banner.png";
import testAvatar from "../ThreadCard/avatar_default_0.png"
import { useEffect } from "react";
import { Edit } from "@mui/icons-material";

interface ForumBannerProps {
    forumId: string,
    forumName: string,
    forumBanner: string,
    forumImage: string
}

const ForumBanner: React.FC<ForumBannerProps> = ({ forumId, forumName, forumImage, forumBanner }) => {
    const joined = false;

    console.log(forumName);

    return (
        <div className="">
            <div className="w-full relative">
                <img className="w-full h-28" src={testBanner}></img>
                <button className="absolute bottom-0 right-0 bg-white rounded-full cursor-pointer hover:opacity-80">
                    <Edit />
                </button>
            </div>
            <div className="md:flex md:justify-between">
                <div className="flex items-center gap-4 p-4">
                    <div className="relative">
                        <img className="rounded-full w-14 h-14 md:w-20 md:h-20" src={testAvatar}></img>
                        <div className="bg-black cursor-pointer opacity-0 absolute w-full h-full rounded-full top-0 hover:opacity-60 flex justify-center items-center">
                            <Edit className="text-white w-5 h-5 md:w-6 md:h-6" />
                        </div>
                    </div>
                    <div className="md:h-full md:flex md:items-end">
                        <p className="font-bold md:text-2xl">r/{forumName}</p>
                        <div className="flex gap-2 md:hidden">
                            <p className="text-xs text-gray-500">527k thành viên</p>
                            <p className="text-xs text-green-600">183 trực tuyến</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 flex gap-2 md:h-20">
                    <button className="border rounded-3xl p-2">Tạo bài đăng</button>
                    <button className={`rounded-3xl p-2 cursor-pointer ${ joined ? "bg-white border border-gray-700": "bg-gray-700 text-white"}`}>{joined ? "Đã tham gia" : "Tham gia"}</button>
                    <div className="flex items-center border rounded-full w-10 justify-center md:w-12">
                        <svg
                            className="w-6 h-8 text-gray-700"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                        >
                            <circle cx="4" cy="10" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="16" cy="10" r="2" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForumBanner