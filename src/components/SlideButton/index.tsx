import { Translate } from "@mui/icons-material";
import { useState } from "react";

interface SlideButtonProps {
    on: boolean,
    changeButtonState: () => void
}

const SlideButton: React.FC<SlideButtonProps> = ({ on, changeButtonState }) => {

    return (
        <div 
            className={`${on ? "bg-gradient-to-r from-amber-500 to-yellow-600" : "bg-gray-400"} w-13 h-7 rounded-full flex items-center cursor-pointer transition-all duration-300`}
            onClick={() => changeButtonState()}>
            <div className={`w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300 ${on ? "translate-x-6" : ""}`}>
            </div>
        </div>
    )
}

export default SlideButton;