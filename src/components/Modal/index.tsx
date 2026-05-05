import { useRef } from "react"

interface ModalProps {
    children: React.ReactNode,
    show: boolean,
    closeModal: () => void
}

const Modal: React.FC<ModalProps> = ({ children, show, closeModal }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleCloseModal = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            closeModal();
        }
    }

    if (!show) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleCloseModal}
        >
            <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-modal relative" ref={modalRef}>
                <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
                    aria-label="Close modal"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="p-6 pt-10">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;
