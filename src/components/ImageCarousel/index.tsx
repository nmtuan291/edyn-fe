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

    if (images.length === 0) return null;

    return (
        <div>
            <div className="relative rounded-xl overflow-hidden bg-surface-100">
                <div className="relative h-64 overflow-hidden">
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
                            className="w-full h-full object-contain"
                        />
                    </div>
                    
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={imageActions.prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-surface-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <button
                                onClick={imageActions.nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-surface-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
                
                {images.length > 1 && (
                    <div className="flex justify-center gap-1.5 py-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => imageActions.goToImage(index)}
                                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                                    index === currentImageIndex ? 'bg-brand-500 scale-125' : 'bg-surface-300 hover:bg-surface-400'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ImageCarousel;
