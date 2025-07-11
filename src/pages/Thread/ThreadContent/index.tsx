import { useEffect, useRef, useState } from "react";
import testAvatar from "../../../components/ThreadCard/avatar_default_0.png";
import testImage from "../../../components/ThreadCard/test_image.png";

const ThreadContent: React.FC = () => {
    const [isOptionOpen, setIsOptionOpen] = useState<boolean>(false);
    const optionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeOption = (event: MouseEvent) => {
            if (optionRef.current && !optionRef.current.contains(event.target as Node)) {
                setIsOptionOpen(false);
            }
        }

        document.addEventListener("click", closeOption);

        return () => document.removeEventListener("click", closeOption);
    }, [])

    return ( 
        <div className="p-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                    <img src={testAvatar} className="w-8 h-8 rounded-full"></img>
                    <div>
                        <p className="font-semibold inline text-xs">r/gaming</p>
                        <p className="inline ml-1 text-xs">- 3 giờ trước</p>
                        <p className="text-sm">testuser</p>
                    </div>
                </div>
                <div 
                    className="rounded-full w-6 h-6 flex items-center justify-center cursor-pointer relative"
                    ref={optionRef}
                >
                    <svg
                        className={`w-6 h-6 text-gray-700 hover:bg-gray-300 rounded-full ${isOptionOpen && "bg-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        onClick={() => setIsOptionOpen(true)}
                    >
                        <circle cx="4" cy="10" r="1" />
                        <circle cx="9" cy="10" r="1" />
                        <circle cx="14" cy="10" r="1" />
                    </svg>
                    <div 
                        className={`border border-gray-300 rounded-lg shadow-black 
                            shadow-xl z-10 absolute top-10   right-0 flex flex-col bg-white w-36
                            ${!isOptionOpen ? "hidden" : ""}`}
                    >
                        <button className="hover:bg-gray-100 cursor-pointer p-2">Lưu</button>
                        <button className="hover:bg-gray-100 cursor-pointer p-2">Ẩn</button>
                        <button className="hover:bg-gray-100 cursor-pointer p-2">Báo cáo</button>
                    </div>
                </div>
            </div>
            <div>
                <h1 className="font-bold">When you have access to adult money, but no self control </h1>
                <img src={testImage} className="rounded-3xl"></img>
                <p className="text-sm mt-4">
                    Here's how I got nearly 100% in Tears of the Kingdom before Zelda Notes existed
                    Here's how I got nearly 100% in Tears of the Kingdom before Zelda Notes existed
                    Here's how I got nearly 100% in Tears of the Kingdom before Zelda Notes existed
                    Here's how I got nearly 100% in Tears of the Kingdom before Zelda Notes existed
                    Here's how I got nearly 100% in Tears of the Kingdom before Zelda Notes existed
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

export default ThreadContent;