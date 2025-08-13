import React, { useState } from 'react';
import { AttachFile, Image, Poll, Link as LinkIcon, Close, Delete } from '@mui/icons-material';
import ForumDescription from '../../../components/ForumDescription';
import TiptapEditor from '../../../components/TiptapEditor';
import apiSlice from "../../../store/api";
import { useParams } from 'react-router-dom';

interface PollType {
    pollContent: string,
    voteCount: number
}

const CreateThread: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'text' | 'image' | 'poll'>('text');
    const [images, setImages] = useState<File[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
    const { name } = useParams();




    // Text form
    const [title, setTitle] = useState<string>("");
    const [editorContent, setEditorContent] = useState<string>("");
    const [pollItems, setPollItems] = useState<PollType[]>([])

    const [uploadImage] = apiSlice.useUploadImageMutation();
    const [createThread] = apiSlice.useCreateThreadMutation();
    const { data, error, isLoading } = apiSlice.useGetRealmQuery(name);

    const getTextLength = (htmlContent: string) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;
        return tempDiv.textContent?.length || 0;
    }

    const imageActions = {
        handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;
            if (files) {
                const newFiles = Array.from(files);
                setImages(prev => {
                    const newArray = [...prev, ...newFiles];
                    setCurrentImageIndex(prev.length);
                    return newArray;
                });
            }
        },
    
        prevImage: () => {
            if (images.length > 0) {
                setSlideDirection("right");
                setTimeout(() => {
                    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                    setSlideDirection(null);
                }, 150);
            }
        },
    
        nextImage: () => {
            if (images.length > 0) {
                setSlideDirection("left");
                setTimeout(() => {
                    setCurrentImageIndex((prev) => (prev + 1) % images.length);
                    setSlideDirection(null);
                }, 350);
            }
        },
    
        goToImage: (index: number) => {
            if (images.length > 0 && index !== currentImageIndex) {
                const direction = index > currentImageIndex ? 'left' : 'right';
                setSlideDirection(direction);
                setTimeout(() => {
                    setCurrentImageIndex(index);
                    setSlideDirection(null);
                }, 350);
            }
        },

        deleteImage: (index: number) => {
            setImages(prev => {
                const newImages = prev.filter((_, idx) => index !== idx);
                setCurrentImageIndex(newImages.length > 0 ? newImages.length - 1 : 0);
                return newImages;
            });
        }
    };

    const handleSubmit = async () => {
        try {
            const imageUrls: string[] = [];
            for (const image of images) {
                const formData = new FormData();
                formData.append("upload_preset", "product_upload");
                formData.append("file", image);
                const cloudName: string = "dh7jem3br";
				const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, 
					{
						method: "POST",
						body: formData
					}
				);
                const responseJson = await response.json();
                imageUrls.push(responseJson.secure_url);
            }
    
            const forumThread = {
                forumId: data.id,
                title,
                isPinned: false,
                content: editorContent,
                slug: "",
                upvote: 0,
                images: imageUrls,
                pollItems
            }

            await createThread(forumThread).unwrap();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='flex'>
            <div className="max-w-4xl mx-auto p-4 md:w-screen">
                <div className="bg-white rounded-lg shadow-sm md:shadow-none">
                    {/* Header */}
                    <div className="border-b p-4">
                        <h1 className="text-xl font-semibold">Tạo bài đăng</h1>
                        <p className="text-sm text-gray-600">r/programming</p>
                    </div>

                    {/* Post Type Selector */}
                    <div className="p-4 border-b">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveTab('text')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                                    activeTab === 'text' 
                                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="h-full hidden md:block">
                                    <AttachFile  />
                                </div>
                                Văn bản
                            </button>
                            <button 
                                onClick={() => setActiveTab('image')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                                    activeTab === 'image' 
                                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="h-full hidden md:block">
                                    <Image  />
                                </div>
                                Hình ảnh
                            </button>
                            <button 
                                onClick={() => setActiveTab('poll')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                                    activeTab === 'poll' 
                                        ? 'bg-blue-100 border-blue-500 text-blue-700' 
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="h-full hidden md:block">
                                    <Poll  />
                                </div>
                                Bình chọn
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-4">
                        {/* Title */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Tiêu đề"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onChange={e => setTitle(e.target.value)}
                                value={title}
                            />
                            <div 
                                className="text-right text-xs text-gray-500 mt-1">
                                {title.length}/300
                            </div>
                        </div>

                        {/* Content based on active tab */}
                        {activeTab === 'text' && (
                        <div>
                            <TiptapEditor isCommentEditor={false} onContentChange={(content: string) => setEditorContent(content)}></TiptapEditor>
                            <div className="text-right text-xs text-gray-500 mt-1">
                                {getTextLength(editorContent)}/300
                            </div>
                        </div>
                        )}

                        {activeTab === 'image' && (
                            <div className="mb-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    {images.length < 1 ? (
                                        <div>
                                            <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-600 mb-2">Kéo thả hoặc click để chọn hình ảnh</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="image-upload"
                                                onChange={event => imageActions.handleImageUpload(event)}
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition-all duration-200"
                                            >
                                                Chọn hình ảnh
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {/* Image Carousel */}
                                            <div className="relative h-64 mb-4 overflow-hidden">
                                                <div 
                                                    className={`w-full h-full ${
                                                        slideDirection ? 'transition-transform duration-500 ease-in-out' : ''
                                                    } ${
                                                        slideDirection === 'left' ? 'transform -translate-x-full' :
                                                        slideDirection === 'right' ? 'transform translate-x-full' :
                                                        'transform translate-x-0'
                                                    }`}
                                                >
                                                    <img
                                                        src={URL.createObjectURL(images[currentImageIndex])}
                                                        alt={`Image ${currentImageIndex + 1}`}
                                                        className="w-full h-full object-contain rounded"
                                                    />
                                                </div>
                                                
                                                {/* Navigation Arrows */}
                                                {images.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={imageActions.prevImage}
                                                            className="cursor-pointer hover:opacity-70 absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                                                        >
                                                            ‹
                                                        </button>
                                                        <button
                                                            onClick={imageActions.nextImage}
                                                            className="cursor-pointer hover:opacity-70 absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                                                        >
                                                            ›
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* Delete Button */}
                                                <button
                                                    className="absolute cursor-pointer hover:bg-red-700 top-2 right-2 bg-red-500 text-white p-1 rounded-full transition-all duration-200"
                                                    onClick={() => imageActions.deleteImage(currentImageIndex)}
                                                >
                                                    <Delete className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            {/* Image Indicators */}
                                            {images.length > 1 && (
                                                <div className="flex justify-center gap-2 mb-4">
                                                    {images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => imageActions.goToImage(index)}
                                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                                                index === currentImageIndex ? 'bg-blue-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {/* Add More Images Button */}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                id="add-more-images"
                                                onChange={imageActions.handleImageUpload}
                                            />
                                            <label
                                                htmlFor="add-more-images"
                                                className="absolute top-0 rounded-full w-4 h-8 flex justify-center items-center 
                                                left-0 bg-blue-500 text-white px-4 py-2 cursor-pointer hover:bg-blue-600 transition-all duration-200"
                                            >
                                                +
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'poll' && (
                            <div className="mb-4">
                                <div className="space-y-2 mb-3">
                                    {
                                        pollItems.map((item, index) => 
                                            <div className="flex gap-2 relative">
                                                <input
                                                    type="text"
                                                    placeholder={`Lựa chọn ${index + 1}`}
                                                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value = {item.pollContent}
                                                    onChange={event => setPollItems(prev => prev.map((i, idx) => idx === index ? {
                                                        ...i, 
                                                        pollContent: event.target.value} 
                                                        : i
                                                    ))}
                                                />
                                                <button 
                                                    className={`absolute right-0 top-2 text-red-300 cursor-pointer ${pollItems.length < 3 ? "hidden" : ""}`}
                                                    onClick={() => setPollItems(prev => prev.filter((i, idx) => idx !== index))}
                                                ><Delete />
                                                </button>
                                            </div>
                                        )
                                    }
                                </div>
                                <button 
                                    className="text-blue-500 hover:text-blue-700 text-sm cursor-pointer"
                                    onClick={() => setPollItems(prev => [
                                        ...prev, {
                                            pollContent: "",
                                            voteCount: 0
                                         }
                                        ])}
                                >
                                    + Thêm lựa chọn
                                </button>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                            <button className="px-6 py-2 border border-green-300 rounded-full text-emerald-700 hover:bg-green-50 transition-colors">
                                Hủy
                            </button>
                            <button 
                                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-full transition-all duration-200"
                                onClick={handleSubmit}
                            >
                                Đăng bài
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-72 hidden md:block">
                <ForumDescription />
            </div>
        </div>
    );
};

export default CreateThread;