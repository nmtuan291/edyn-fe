import { useState, useEffect, useRef } from "react";
import LoginForm from "../LoginForm";
import RegistrationForm from "../RegistrationForm";
import { Notifications, Person, Logout, Settings, Add } from "@mui/icons-material";
import tesAvatar from "../ThreadCard/avatar_default_0.png"
import MobileSidebar from "../MobileSidebar/MobileSidebar";
import { useNavigate } from "react-router-dom";
import CreateForum from "../CreateForum";

const Header: React.FC = () => {
    const [modalState, setModalState] = useState({
        isOptionOpen: false,
        showLoginForm: false,
        showRegistrationForm: false,
        showCreateForum: false,
        isUserOpen: false,
    });
    
    const optionRef = useRef<HTMLDivElement>(null);
	const userProfileRef= useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const closeOption = (event: MouseEvent) => {
            setModalState(prev => ({ ...prev, isOptionOpen: false }));
        }

		const closeUserProfile = (event: MouseEvent) => {
            setModalState(prev => ({ ...prev, isUserOpen: false }));
		}

        document.addEventListener("click", closeOption);
        document.addEventListener("click", closeUserProfile);

        return () => {
			document.removeEventListener("click", closeOption);
			document.removeEventListener("click", closeUserProfile);
		}
    }, [])

    return (
        <>
			{/* <MobileSidebar /> */}
            <LoginForm 
                showForm={modalState.showLoginForm} 
                closeForm={() => setModalState(prev => ({ ...prev, showLoginForm: false }))} 
                openRegistrationForm={() => setModalState(prev => ({ ...prev, showRegistrationForm: true }))}/>
            <RegistrationForm 
                showForm={modalState.showRegistrationForm}
                closeForm={() => setModalState(prev => ({ ...prev, showRegistrationForm: false }))}/>
            <CreateForum 
                show={modalState.showCreateForum} 
                closeModal={() => setModalState(prev => ({ ...prev, showCreateForum: false }))} />
            <div className="flex w-full gap-1 px-4 py-2 justify-between border-b border-gray-300">
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
                            setModalState(prev => ({ ...prev, showLoginForm: true }));
                        }}>
                            Đăng nhập
                        </button>
                    <div ref={optionRef}>
                        <svg
                            className="w-6 h-8 text-gray-700 cursor-pointer"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            onClick={() => setModalState(prev => ({ ...prev, isOptionOpen: true }))}
                        >
                            <circle cx="4" cy="10" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="16" cy="10" r="2" />
                        </svg>
                        <div 
                                className={`border border-gray-300 rounded-lg shadow-gray-500 
                                    shadow-md z-10 absolute top-12 right-3 flex flex-col bg-white w-36
                                    ${!modalState.isOptionOpen ? "hidden" : ""}`}
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
                <div className="flex gap-2">
					<Add 
                        style={{ fontSize: 30, color: "gray"}}
                        onClick={() => setModalState(prev => ({ ...prev, showCreateForum: true }))}/>
					<Notifications style={{ fontSize: 30, color: "gray", cursor: "pointer" }}/>
					<div className="relative">
						<img 
							className="w-8 rounded-full cursor-pointer" 
							src={tesAvatar}
							onClick={(event) => {
								event.stopPropagation();
								setModalState(prev => ({ ...prev, isUserOpen: true }));
							}} />
						<div className="w-2 h-2 right-0 top-6 rounded-full absolute bg-green-500"></div>
						<div 
							className={`absolute w-50 right-1 top-10 rounded-2xl shadow-gray-300 bg-white shadow-xl ${modalState.isUserOpen ? "" : "hidden"}`}
							ref={userProfileRef}>
							<div className="border-b border-gray-300 flex flex-col items-start">
								<button className="cursor-pointer hover:bg-gray-300 rounded-t-2xl w-full h-full text-left p-2 text-sm">
									<Person />
									<span className="ml-1">Thông tin cá nhân</span>
								</button>
								<button className="cursor-pointer hover:bg-gray-300 w-full h-full p-2 text-left text-sm">
									<Logout />
									<span className="ml-1">Đăng xuất</span>
								</button>
							</div>
							<div>
								<button 
                                    className="cursor-pointer hover:bg-gray-300 w-full h-full p-2 text-left rounded-b-2xl text-sm"
                                    onClick={() => navigate("settings/account")}>
									<Settings />
									<span className="ml-1">Thiết lập</span>
								</button>
							</div>
						</div>
					</div>	
                </div> 
            </div>
        </>
    )
}

export default Header;