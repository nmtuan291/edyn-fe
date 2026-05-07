import React from "react";

interface AvatarProps {
    src?: string | null;
    name?: string;
    className?: string;
    size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, className = "", size }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
    
    // Deterministic background color based on name
    const colors = [
        "bg-blue-500", "bg-emerald-500", "bg-violet-500", 
        "bg-amber-500", "bg-rose-500", "bg-indigo-500",
        "bg-cyan-500", "bg-orange-500", "bg-pink-500"
    ];
    
    const colorIndex = name 
        ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length 
        : 0;
    
    const bgColor = colors[colorIndex];
    const sizeStyle = size ? { width: size, height: size, fontSize: size / 2 } : {};

    if (src && src.trim() !== "") {
        return (
            <img 
                src={src} 
                alt={name || "Avatar"} 
                className={`rounded-full object-cover shrink-0 ${className}`}
                style={sizeStyle}
            />
        );
    }

    return (
        <div 
            className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${bgColor} ${className}`}
            style={sizeStyle}
        >
            {firstLetter}
        </div>
    );
};

export default Avatar;
