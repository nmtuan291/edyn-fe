import React, { useState, useEffect, useRef, useCallback } from "react";
import LoginForm from "../LoginForm";
import RegistrationForm from "../RegistrationForm";
import Loader from "../Loader";
import { Notifications, Person, Logout, Settings, Add } from "@mui/icons-material";
import tesAvatar from "../ThreadCard/avatar_default_0.png"
import MobileSidebar from "../MobileSidebar/MobileSidebar";
import { useNavigate } from "react-router-dom";
import CreateForum from "../CreateForum";
import * as signalR from "@microsoft/signalr";
import { useSignalR } from "../../hooks/useSignalR";
import apiSlice from "../../store/api";
import NotificationBoard from "../NotificationBoard";

const Header: React.FC = () => {
    const [modalState, setModalState] = useState({
        isOptionOpen: false,
        showLoginForm: false,
        showRegistrationForm: false,
        showCreateForum: false,
        isUserOpen: false,
    });
    const [newNoti, setNewNoti] = useState<boolean>(false);
    const [showNoti, setShowNoti] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const optionRef = useRef<HTMLDivElement>(null);
	const userProfileRef= useRef<HTMLDivElement>(null);

    const navigate = useNavigate();

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem("jwt");
            setIsLoggedIn(!!token);
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const { onMessage } = useSignalR({
        hub: "notification",
        accessTokenFactory: () => localStorage.getItem("jwt"),
        method: "ReceiveNotification"
    });
    const { data: notifications, isLoading, refetch } = apiSlice.useGetNotificationQuery({}, { skip: !isLoggedIn }); 
    const [ updateNotification ] = apiSlice.useUpdateNotificationMutation();
    
    const handleMessage = useCallback((message: string) => {
        setNewNoti(true);
        refetch();
    }, [refetch]);
    
    useEffect(() => {
        if (isLoggedIn) {
            const cleanup = onMessage(handleMessage);
            return cleanup;
        }
    }, [onMessage, handleMessage, isLoggedIn]);

    useEffect(() => {
        if (!isLoading && notifications)
            if (notifications.length > 0 && !notifications[notifications.length - 1].isRead) {
                setNewNoti(true);
            }
    }, [isLoading, notifications])
    
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

    const handleOpenNotification = async () => {
        setShowNoti(!showNoti);
        if (notifications && notifications.length > 0 && !notifications[notifications.length - 1].isRead) {
            setNewNoti(false);
            try {
                for (const notification of notifications.slice().reverse()) {
                    if (notification.isRead === true)
                        break;
                       
                    await updateNotification({
                        ...notification,
                        isRead: true
                    }).unwrap();
                }
            } catch (error) {
                console.error("Error updating notifications:", error);
            }
        }
    }

    const handleLogin = () => {
        setModalState(prev => ({ ...prev, showLoginForm: true }));
    }

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Simulate logout delay for UX
            await new Promise(resolve => setTimeout(resolve, 1000));
            localStorage.removeItem("jwt");
            setIsLoggedIn(false);
            setModalState(prev => ({ ...prev, isUserOpen: false }));
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    }

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setModalState(prev => ({ ...prev, showLoginForm: false }));
    }

    return (
        <>
            {isLoggingOut && <Loader />}
			{/* <MobileSidebar /> */}
            <LoginForm 
                showForm={modalState.showLoginForm} 
                closeForm={() => setModalState(prev => ({ ...prev, showLoginForm: false }))} 
                openRegistrationForm={() => setModalState(prev => ({ ...prev, showRegistrationForm: true }))}
                onLoginSuccess={handleLoginSuccess}/>
            <RegistrationForm 
                showForm={modalState.showRegistrationForm}
                closeForm={() => setModalState(prev => ({ ...prev, showRegistrationForm: false }))}/>
            <CreateForum 
                show={modalState.showCreateForum} 
                closeModal={() => setModalState(prev => ({ ...prev, showCreateForum: false }))} />
            <div className="flex w-full gap-1 px-4 py-2 justify-between border-b border-green-300">
                {/* Logo Section */}
                <div className="flex items-center gap-4">
                    <svg
                        className="w-6 h-8 md:hidden text-emerald-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    
                    {/* Edyn Logo */}
                    <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
                        <div className="flex items-center">
                            {/* Logo Icon */}
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-2">
                                <span className="text-white font-bold text-lg">🌱</span>
                            </div>
                            {/* Logo Text */}
                            <span className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                Edyn
                            </span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <input 
                    type="text"
                    className="bg-green-50 border border-green-200 rounded-3xl px-2 w-60 md:w-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
                    placeholder="Tìm kiếm trên Edyn" />
                
                {/* Right Section - Conditional Rendering */}
                <div className="flex gap-2 items-center">
                    {!isLoggedIn ? (
                        // Login Section - Show when not logged in
                        <div className="flex gap-1">
                            <button 
                                className="rounded-3xl text-sm bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white h-8 px-2 cursor-pointer transition-all duration-200" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleLogin(); 
                                }}>
                                    Đăng nhập
                            </button>
                            <div ref={optionRef}>
                                <svg
                                    className="w-6 h-8 text-emerald-700 hover:text-emerald-800 cursor-pointer transition-colors"
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
                                        className={`border border-green-300 rounded-lg shadow-emerald-500 
                                            shadow-md z-10 absolute top-12 right-3 flex flex-col bg-white w-36
                                            ${!modalState.isOptionOpen ? "hidden" : ""}`}
                                    >
                                        <button 
                                            className="hover:bg-green-50 cursor-pointer p-2 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); handleLogin(); }}>
                                                Đăng nhập
                                        </button>
                                        <button 
                                            className="hover:bg-green-50 cursor-pointer p-2 transition-colors"
                                            onClick={() => {
                                                setModalState(prev => ({ ...prev, isOptionOpen: false, showRegistrationForm: true }));
                                            }}>
                                            Đăng ký
                                        </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // User Section - Show when logged in
                        <>
                            <Add 
                                style={{ fontSize: 30, color: "#059669"}}
                                className="hover:text-emerald-700 cursor-pointer transition-colors"
                                onClick={() => setModalState(prev => ({ ...prev, showCreateForum: true }))}/>
                            <div className="relative">
                                <Notifications 
                                    style={{ fontSize: 30, color: "#059669", cursor: "pointer" }}
                                    className="hover:text-emerald-700 transition-colors"
                                    onClick={handleOpenNotification}
                                />
                                <div className={`bg-gradient-to-br from-red-500 to-red-600 rounded-full w-2 h-2 absolute top-0 right-0 ${newNoti ? "" : "hidden"}`}/>
                                {
                                    showNoti && 
                                    <div className="absolute w-10 h-10 top-10 -left-60 border-white z-40">
                                        <NotificationBoard notifications={notifications || []}/>
                                    </div>
                                }
                            </div>
                            <div className="relative">
                                <img 
                                    className="w-8 rounded-full cursor-pointer ring-2 ring-emerald-500 ring-offset-2" 
                                    src={tesAvatar}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setModalState(prev => ({ ...prev, isUserOpen: true }));
                                    }} />
                                <div className="w-2 h-2 right-0 top-6 rounded-full absolute bg-green-500"></div>
                                <div 
                                    className={`absolute w-50 right-1 top-10 rounded-2xl shadow-emerald-300 bg-white shadow-xl border border-green-200 ${modalState.isUserOpen ? "" : "hidden"}`}
                                    ref={userProfileRef}>
                                    <div className="border-b border-green-200 flex flex-col items-start">
                                        <button className="cursor-pointer hover:bg-green-50 rounded-t-2xl w-full h-full text-left p-2 text-sm transition-colors">
                                            <Person className="text-emerald-600" />
                                            <span className="ml-1">Thông tin cá nhân</span>
                                        </button>
                                        <button 
                                            className="cursor-pointer hover:bg-green-50 w-full h-full p-2 text-left text-sm transition-colors"
                                            onClick={handleLogout}>
                                            <Logout className="text-emerald-600" />
                                            <span className="ml-1">Đăng xuất</span>
                                        </button>
                                    </div>
                                    <div>
                                        <button 
                                            className="cursor-pointer hover:bg-green-50 w-full h-full p-2 text-left rounded-b-2xl text-sm transition-colors"
                                            onClick={() => navigate("settings/account")}>
                                            <Settings className="text-emerald-600" />
                                            <span className="ml-1">Thiết lập</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default Header;