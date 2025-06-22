import testAvatar from "./avatar_default_0.png";
import testImage from "./test_image.png";

const ThreadCard: React.FC = () => {

    return (
        <div className="border-t border-gray-300 p-2">
            <div className="flex justify-between md:flex-row-reverse md:justify-end md: gap-3 lg:block">
                <div>
                    <div className="flex gap-2 items-center">
                        <img className="max-w-6 rounded-xl" src={testAvatar}/>
                        <p className="font-bold text-xs">testusername</p>
                        <p className="text-gray-500 text-xs">2h ago</p>
                    </div>
                    <p className="font-bold">Test thread title title title title title title title title title title title</p>
                </div>
                <div className="w-24 flex items-center lg:w-96 hidden"> 
                    <img className="w-full rounded" src={testImage}/>
                </div>
                <p className="w-3xl text-justify text-sm hidden lg:block">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
            </div>
            <div className="flex gap-4 mt-3 text-xs font-bold text-gray-500 items-center">
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
                <p>250 Bình luận</p>
                <p className="cursor-pointer">Chia sẻ</p>
                <p className="cursor-pointer">Báo cáo</p>
            </div>
        </div>
    )
}

export default ThreadCard;