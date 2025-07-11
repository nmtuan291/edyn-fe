import { forwardRef, useRef } from "react"

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

    return (
        <div 
            className={`fixed w-screen h-screen top-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center ${!show ? "hidden" : ""}`}
            onClick={handleCloseModal}>
            <div className="w-96 h-auto bg-white rounded-3xl p-4 relative" ref={modalRef}>
                {/* X button in the top right corner */}
                <button
                    onClick={closeModal}
                    className="absolute top-0 right-2 text-gray-400 hover:text-gray-700 text-3xl font-bold focus:outline-none cursor-pointer"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                <div className="">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal;