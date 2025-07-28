import { useState } from "react";

interface ImageCarouselProps {
    images: string[]
} 

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

    const imageActions = {
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
    };

    return (
    <div className="mb-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center ">
                <div className="relative">
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
                                src={images[currentImageIndex]}
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
                </div>
        </div>
    </div>
    )
}

export default ImageCarousel;