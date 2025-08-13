import { useEffect, useRef, useState } from "react";
import testAvatar from "../../../components/ThreadCard/avatar_default_0.png";
import testImage from "../../../components/ThreadCard/test_image.png";
import ForumDescription from "../../../components/ForumDescription";
import apiSlice from "../../../store/api";
import { useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import ImageCarousel from "../../../components/ImageCarousel";
import CommentEditor from "../Comment/CommentEditor";
import Comment from "../Comment";
import type { Comment as CommentType } from "../../../interfaces/interfaces";

const ThreadContent: React.FC = () => {
    const [isOptionOpen, setIsOptionOpen] = useState<boolean>(false);
    const optionRef = useRef<HTMLDivElement>(null);
    const { id } = useParams();

    const { data, error, isLoading } = apiSlice.useGetThreadQuery(id);
    const { data: comments, isLoading: commentLoading} = apiSlice.useGetCommentsQuery(id)
    console.log(comments); 

    useEffect(() => {
        const closeOption = (event: MouseEvent) => {
            if (optionRef.current && !optionRef.current.contains(event.target as Node)) {
                setIsOptionOpen(false);
            }
        }

        document.addEventListener("click", closeOption);

        return () => document.removeEventListener("click", closeOption);
    }, [])

    if (isLoading)
        return <Loader />

    return (
        <div className="md:flex p-4 gap-4 justify-between gap">
            <div className="w-3xl">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <img src={testAvatar} className="w-8 h-8 rounded-full"></img>
                        <div>
                            <p className="font-semibold inline text-xs">r/{"asdas"}</p>
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
                    <h1 className="font-bold">{data?.title}</h1>
                    <div className="text-sm mt-4" dangerouslySetInnerHTML={{ __html: data?.content }}/>
                    <ImageCarousel images={data?.images ?? []}></ImageCarousel>
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
                <CommentEditor threadId={id ?? ""} parentComment={null} closeEditor={() => {}}></CommentEditor>
                {
                    (comments ?? []).map((comment: CommentType) => <Comment comment={comment}></Comment>)
                }
            </div>
            <div className="w-80 hidden md:block">
                <ForumDescription></ForumDescription>
            </div>
        </div>
    )
}

export default ThreadContent;