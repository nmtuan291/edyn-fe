import React, { useState, useEffect, useRef, useCallback } from "react";
import LoginForm from "../LoginForm";
import RegistrationForm from "../RegistrationForm";
import Loader from "../Loader";
import { Notifications, Person, Logout, Settings, Add } from "@mui/icons-material";
import defaultAvatar from "../../constants/defaultAvatar";
import MobileSidebar from "../MobileSidebar/MobileSidebar";
import { useNavigate } from "react-router-dom";
import CreateForum from "../CreateForum";
import { useSignalR } from "../../hooks/useSignalR";
import apiSlice from "../../store/api";
import NotificationBoard from "../NotificationBoard";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { clearUser } from "../../store/user";

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const optionRef = useRef<HTMLDivElement>(null);
	const userProfileRef= useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const { data: headerProfile } = apiSlice.useGetUserProfileQuery(user.id, { skip: !isLoggedIn || !user.id });
    const headerAvatarSrc = headerProfile?.avatar || defaultAvatar;

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
                       
                    await updateNotification(notification.id).unwrap();
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            localStorage.removeItem("jwt");
            localStorage.removeItem("refreshToken");
            dispatch(clearUser());
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

    const unreadCount = notifications?.filter((n: any) => !n.isRead).length ?? 0;

    return (
        <>
            {isLoggingOut && <Loader />}
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
            
            {/* Sticky frosted-glass header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200/60 h-16">
                <div className="flex h-full w-full items-center justify-between gap-2 pl-2 pr-2 sm:gap-3 sm:pl-3 sm:pr-3 md:pl-4 md:pr-4">
                    
                    {/* Left: hamburger (mobile) + Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <div className="flex items-center cursor-pointer gap-2" onClick={() => navigate("/")}>
                            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-white text-lg">🌱</span>
                            </div>
                            <span className="font-bold text-xl text-surface-900 hidden sm:block">
                                Edyn
                            </span>
                        </div>
                    </div>

                    {/* Center: Search */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                            </svg>
                            <input 
                                type="text"
                                className="w-full bg-surface-100 border border-surface-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                                placeholder="Tìm kiếm trên Edyn" />
                        </div>
                    </div>
                    
                    {/* Right: actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        {!isLoggedIn ? (
                            <div className="flex gap-2 items-center">
                                <button 
                                    className="text-sm font-medium text-surface-600 hover:text-surface-900 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                                    onClick={() => setModalState(prev => ({ ...prev, showRegistrationForm: true }))}>
                                    Đăng ký
                                </button>
                                <button 
                                    className="text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full transition-colors cursor-pointer" 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleLogin(); 
                                    }}>
                                    Đăng nhập
                                </button>
                                <div ref={optionRef} className="relative">
                                    <button
                                        className="p-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                                        onClick={() => setModalState(prev => ({ ...prev, isOptionOpen: true }))}
                                    >
                                        <svg className="w-5 h-5 text-surface-500" fill="currentColor" viewBox="0 0 20 20">
                                            <circle cx="4" cy="10" r="2" />
                                            <circle cx="10" cy="10" r="2" />
                                            <circle cx="16" cy="10" r="2" />
                                        </svg>
                                    </button>
                                    <div className={`absolute right-0 top-full mt-2 bg-white rounded-xl shadow-dropdown border border-surface-200 w-44 overflow-hidden ${!modalState.isOptionOpen ? "hidden" : ""}`}>
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-surface-50 transition-colors cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleLogin(); }}>
                                            Đăng nhập
                                        </button>
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-surface-50 transition-colors cursor-pointer border-t border-surface-100"
                                            onClick={() => {
                                                setModalState(prev => ({ ...prev, isOptionOpen: false, showRegistrationForm: true }));
                                            }}>
                                            Đăng ký
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button 
                                    className="p-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                                    onClick={() => setModalState(prev => ({ ...prev, showCreateForum: true }))}
                                    title="Tạo cộng đồng"
                                >
                                    <Add style={{ fontSize: 22 }} className="text-surface-600" />
                                </button>

                                <div className="relative">
                                    <button
                                        className="p-2 rounded-lg hover:bg-surface-100 transition-colors relative cursor-pointer"
                                        onClick={handleOpenNotification}
                                    >
                                        <Notifications style={{ fontSize: 22 }} className="text-surface-600" />
                                        {newNoti && unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                                {unreadCount > 99 ? "99+" : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {showNoti && (
                                        <div className="absolute right-0 top-full mt-2 z-50">
                                            <NotificationBoard notifications={notifications || []}/>
                                        </div>
                                    )}
                                </div>

                                <div className="relative" ref={userProfileRef}>
                                    <button
                                        className="p-1 rounded-full hover:ring-2 hover:ring-brand-200 transition-all cursor-pointer"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setModalState(prev => ({ ...prev, isUserOpen: true }));
                                        }}
                                    >
                                        <img 
                                            className="w-8 h-8 rounded-full object-cover" 
                                            src={headerAvatarSrc}
                                            alt="Avatar"
                                        />
                                        <div className="w-2.5 h-2.5 rounded-full absolute bottom-0 right-0 bg-success border-2 border-white" />
                                    </button>
                                    
                                    <div className={`absolute right-0 top-full mt-2 bg-white rounded-xl shadow-dropdown border border-surface-200 w-52 overflow-hidden ${modalState.isUserOpen ? "" : "hidden"}`}>
                                        <div className="p-3 border-b border-surface-100">
                                            <p className="font-semibold text-sm text-surface-900">{user.userName || "User"}</p>
                                            <p className="text-xs text-surface-500">@{user.userName || "user"}</p>
                                        </div>
                                        <div className="py-1">
                                            <button 
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setModalState(prev => ({...prev, isUserOpen: false}));
                                                    if (user.userName) navigate(`/user/${user.userName}`);
                                                    else navigate("/profile");
                                                }}>
                                                <Person style={{ fontSize: 18 }} className="text-surface-400" />
                                                Thông tin cá nhân
                                            </button>
                                            <button 
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors cursor-pointer"
                                                onClick={() => navigate("settings/account")}>
                                                <Settings style={{ fontSize: 18 }} className="text-surface-400" />
                                                Thiết lập
                                            </button>
                                        </div>
                                        <div className="border-t border-surface-100 py-1">
                                            <button 
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors cursor-pointer"
                                                onClick={handleLogout}>
                                                <Logout style={{ fontSize: 18 }} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile sidebar overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-in">
                        <MobileSidebar />
                    </div>
                </div>
            )}
        </>
    )
}

export default Header;
