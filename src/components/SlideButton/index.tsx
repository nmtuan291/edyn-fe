interface SlideButtonProps {
    on: boolean,
    changeButtonState: () => void
}

const SlideButton: React.FC<SlideButtonProps> = ({ on, changeButtonState }) => {
    return (
        <button 
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${
                on ? "bg-brand-500" : "bg-surface-300"
            }`}
            onClick={() => changeButtonState()}
            role="switch"
            aria-checked={on}
        >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                on ? "translate-x-5" : ""
            }`} />
        </button>
    )
}

export default SlideButton;
