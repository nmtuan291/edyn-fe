import { useState, useEffect, useRef } from "react";
import LoginForm from "../LoginForm";

const Header: React.FC = () => {
    const [isOptionOpen, setIsOptionOpen] = useState<boolean>(false);
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
    const optionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeOption = (event: MouseEvent) => {
            if (optionRef.current && !optionRef.current.contains(event.target as Node)) {
                setIsOptionOpen(false);
            }
        }

        document.addEventListener("click", closeOption);

        return () => document.removeEventListener("click", closeOption);
    }, [])

    return (
        <>
            <LoginForm showForm={showLoginForm} closeForm={() => setShowLoginForm(false)} />
            <div className="flex w-full gap-1 px-4 py-2 justify-between">
                <svg
                    className="w-6 h-8 md:hidden"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <input 
                    type="text"
                    className="bg-gray-200 rounded-3xl px-2 w-60 md:w-3xl" 
                    placeholder="Tìm kiếm trên Edyn" />
                <div className="flex gap-1">
                    <button 
                        className="rounded-3xl text-sm bg-orange-600 text-white h-8 px-2 cursor-pointer" 
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowLoginForm(true);
                        }}>
                            Đăng nhập
                        </button>
                    <div ref={optionRef}>
                        <svg
                            className="w-6 h-8 text-gray-700 cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            onClick={() => setIsOptionOpen(true)}
                        >
                            <circle cx="4" cy="10" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="16" cy="10" r="2" />
                        </svg>
                        <div 
                                className={`border border-gray-300 rounded-lg shadow-gray-500 
                                    shadow-md z-10 absolute top-12 right-3 flex flex-col bg-white w-36
                                    ${!isOptionOpen ? "hidden" : ""}`}
                            >
                                <button 
                                    className="hover:bg-gray-100 cursor-pointer p-2"
                                    >
                                        Đăng nhập
                                </button>
                                <button className="hover:bg-gray-100 cursor-pointer p-2">Đăng ký</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header;