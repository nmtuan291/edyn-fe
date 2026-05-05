import React, { useState, useEffect } from 'react';
import { AttachFile, Image, Poll, Close, Delete } from '@mui/icons-material';
import { createPortal } from 'react-dom';
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
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    const [title, setTitle] = useState<string>("");
    const [editorContent, setEditorContent] = useState<string>("");
    const [pollItems, setPollItems] = useState<PollType[]>([])

    const [uploadImage] = apiSlice.useUploadImageMutation();
    const [createThread] = apiSlice.useCreateThreadMutation();
    const { data, error, isLoading } = apiSlice.useGetRealmQuery(name);

    useEffect(() => {
        const el = document.getElementById("context-panel");
        setPortalTarget(el);
        if (el) el.classList.remove("hidden");
        return () => { if (el) el.classList.add("hidden"); };
    }, []);

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
                pollItems,
                vote: 0
            }

            await createThread(forumThread).unwrap();
        } catch (error) {
            console.log(error);
        }
    }

    const tabs = [
        { id: 'text' as const, label: 'Văn bản', icon: <AttachFile style={{ fontSize: 18 }} /> },
        { id: 'image' as const, label: 'Hình ảnh', icon: <Image style={{ fontSize: 18 }} /> },
        { id: 'poll' as const, label: 'Bình chọn', icon: <Poll style={{ fontSize: 18 }} /> },
    ];

    return (
        <>
            <div className="bg-white rounded-2xl border border-surface-200/80 overflow-hidden">
                {/* Header */}
                <div className="p-5 pb-4">
                    <h1 className="text-lg font-bold text-surface-900">Tạo bài đăng</h1>
                    <p className="text-sm text-brand-600 font-medium mt-0.5">{name}</p>
                </div>

                {/* Tab selector */}
                <div className="px-5 pb-4 flex gap-2">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                                ${activeTab === tab.id 
                                    ? 'bg-brand-100 text-brand-700 border border-brand-300' 
                                    : 'bg-surface-50 text-surface-600 border border-surface-200 hover:bg-surface-100'
                                }`}
                        >
                            <span className="hidden md:block">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="px-5 pb-5">
                    {/* Title */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Tiêu đề"
                            className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400"
                            onChange={e => setTitle(e.target.value)}
                            value={title}
                        />
                        <div className="text-right text-xs text-surface-400 mt-1.5">
                            {title.length}/300
                        </div>
                    </div>

                    {/* Text editor */}
                    {activeTab === 'text' && (
                        <div>
                            <div className="border border-surface-200 rounded-xl overflow-hidden">
                                <TiptapEditor isCommentEditor={false} onContentChange={(content: string) => setEditorContent(content)} />
                            </div>
                            <div className="text-right text-xs text-surface-400 mt-1.5">
                                {getTextLength(editorContent)}/300
                            </div>
                        </div>
                    )}

                    {/* Image upload */}
                    {activeTab === 'image' && (
                        <div>
                            <div className="border-2 border-dashed border-surface-300 rounded-xl p-8 text-center bg-surface-50/50">
                                {images.length < 1 ? (
                                    <div>
                                        <div className="w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Image className="text-surface-400" style={{ fontSize: 24 }} />
                                        </div>
                                        <p className="text-sm text-surface-600 mb-1">Kéo thả hình ảnh vào đây</p>
                                        <p className="text-xs text-surface-400 mb-4">hoặc</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            id="image-upload"
                                            onChange={event => imageActions.handleImageUpload(event)}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors"
                                        >
                                            Chọn hình ảnh
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative h-64 mb-4 overflow-hidden rounded-xl">
                                            <div className={`w-full h-full ${slideDirection ? 'transition-transform duration-500 ease-in-out' : ''} ${slideDirection === 'left' ? 'transform -translate-x-full' : slideDirection === 'right' ? 'transform translate-x-full' : 'transform translate-x-0'}`}>
                                                <img
                                                    src={URL.createObjectURL(images[currentImageIndex])}
                                                    alt={`Image ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-contain rounded-xl"
                                                />
                                            </div>
                                            
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={imageActions.prevImage}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4 text-surface-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={imageActions.nextImage}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4 text-surface-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                            
                                            <button
                                                className="absolute top-2 right-2 bg-danger hover:bg-red-600 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                                                onClick={() => imageActions.deleteImage(currentImageIndex)}
                                            >
                                                <Delete style={{ fontSize: 16 }} />
                                            </button>
                                        </div>
                                        
                                        {images.length > 1 && (
                                            <div className="flex justify-center gap-1.5 mb-4">
                                                {images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => imageActions.goToImage(index)}
                                                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${index === currentImageIndex ? 'bg-brand-500 scale-125' : 'bg-surface-300 hover:bg-surface-400'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        
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
                                            className="inline-flex items-center gap-1.5 bg-surface-100 hover:bg-surface-200 text-surface-700 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            Thêm ảnh
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Poll */}
                    {activeTab === 'poll' && (
                        <div>
                            <div className="space-y-2 mb-3">
                                {pollItems.map((item, index) => 
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder={`Lựa chọn ${index + 1}`}
                                            className="flex-1 px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400"
                                            value={item.pollContent}
                                            onChange={event => setPollItems(prev => prev.map((i, idx) => idx === index ? {
                                                ...i, 
                                                pollContent: event.target.value} 
                                                : i
                                            ))}
                                        />
                                        {pollItems.length >= 3 && (
                                            <button 
                                                className="p-2 text-surface-400 hover:text-danger hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                                onClick={() => setPollItems(prev => prev.filter((_, idx) => idx !== index))}
                                            >
                                                <Delete style={{ fontSize: 18 }} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button 
                                className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
                                onClick={() => setPollItems(prev => [
                                    ...prev, {
                                        pollContent: "",
                                        voteCount: 0
                                    }
                                ])}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Thêm lựa chọn
                            </button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-5 mt-5 border-t border-surface-100">
                        <button className="px-5 py-2 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-full transition-colors cursor-pointer">
                            Hủy
                        </button>
                        <button 
                            className="px-6 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-colors cursor-pointer"
                            onClick={handleSubmit}
                        >
                            Đăng bài
                        </button>
                    </div>
                </div>
            </div>

            {portalTarget && createPortal(
                <ForumDescription realm={data} />,
                portalTarget
            )}
        </>
    );
};

export default CreateThread;
