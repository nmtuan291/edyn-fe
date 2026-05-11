import React, { useState, useEffect, useRef, useCallback } from "react";
import LoginForm from "../LoginForm";
import RegistrationForm from "../RegistrationForm";
import Avatar from "../Avatar";
import Loader from "../Loader";
import { Notifications, Person, Logout, Settings, Add } from "@mui/icons-material";
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
    const [showNoti, setShowNoti] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ forums: any[], threads: any[] } | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const optionRef = useRef<HTMLDivElement>(null);
	const userProfileRef= useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const { data: headerProfile } = apiSlice.useGetUserProfileQuery(user.id, { skip: !isLoggedIn || !user.id });
    const headerAvatarSrc = headerProfile?.avatar;

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
    const [ markAllRead ] = apiSlice.useMarkAllNotificationsReadMutation();
    const { data: unreadData } = apiSlice.useGetUnreadNotificationCountQuery(undefined, { skip: !isLoggedIn });
    const [logoutMutation] = apiSlice.useLogoutMutation();
    const [searchForumsQuery] = apiSlice.useLazySearchForumsQuery();
    const [searchThreadsQuery] = apiSlice.useLazySearchThreadsQuery();
    
    const handleMessage = useCallback((_message: string) => {
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
            }
    }, [isLoading, notifications])
    
    useEffect(() => {
        const closeOption = (_event: MouseEvent) => {
            setModalState(prev => ({ ...prev, isOptionOpen: false }));
        }

		const closeUserProfile = (_event: MouseEvent) => {
            setModalState(prev => ({ ...prev, isUserOpen: false }));
		}

        document.addEventListener("click", closeOption);
        document.addEventListener("click", closeUserProfile);

        return () => {
			document.removeEventListener("click", closeOption);
			document.removeEventListener("click", closeUserProfile);
		}
    }, [])

    // Close search results on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleOpenNotification = async () => {
        setShowNoti(!showNoti);
        if (showNoti) return; // closing
        if (notifications && notifications.length > 0) {
            const hasUnread = notifications.some((n: any) => !n.isRead);
            if (hasUnread) {
                try {
                    await markAllRead({}).unwrap();
                } catch (error) {
                    console.error("Error marking all as read:", error);
                }
            }
        }
    }

    const handleLogin = () => {
        setModalState(prev => ({ ...prev, showLoginForm: true }));
    }

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await logoutMutation(refreshToken).unwrap();
            }
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            localStorage.removeItem("jwt");
            localStorage.removeItem("refreshToken");
            dispatch(clearUser());
            setIsLoggedIn(false);
            setModalState(prev => ({ ...prev, isUserOpen: false }));
            setIsLoggingOut(false);
            navigate("/");
        }
    }

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setModalState(prev => ({ ...prev, showLoginForm: false }));
    }

    // Search with debounce
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setSearchQuery(q);

        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

        if (q.trim().length < 2) {
            setSearchResults(null);
            setShowSearchResults(false);
            return;
        }

        searchTimerRef.current = setTimeout(async () => {
            try {
                const [forumsRes, threadsRes] = await Promise.all([
                    searchForumsQuery(q).unwrap(),
                    searchThreadsQuery({ q, page: 1, pageSize: 5 }).unwrap(),
                ]);
                setSearchResults({
                    forums: forumsRes ?? [],
                    threads: threadsRes?.items ?? threadsRes ?? [],
                });
                setShowSearchResults(true);
            } catch {
                setSearchResults(null);
            }
        }, 350);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim().length >= 2) {
            setShowSearchResults(false);
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const unreadCount = unreadData?.unreadCount ?? notifications?.filter((n: any) => !n.isRead).length ?? 0;

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
                <div className="flex h-full w-full items-center px-4 sm:px-6 md:px-8">
                    
                    {/* Left Slot: Logo */}
                    <div className="flex-1 flex items-center justify-start">
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer mr-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg className="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <div className="flex items-center cursor-pointer group" onClick={() => navigate("/")}>
                            <span className="font-logo font-extrabold text-2xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent group-hover:from-brand-500 group-hover:to-brand-300 transition-all duration-300">
                                edyn
                            </span>
                        </div>
                    </div>

                    {/* Center Slot: Search */}
                    <div className="shrink-0 w-full max-w-xl relative mx-4" ref={searchRef}>
                        <div className="relative w-full">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                            </svg>
                            <input 
                                id="search-input"
                                type="text"
                                className="w-full bg-surface-100 border border-surface-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                                placeholder="Tìm kiếm trên Edyn"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
                                onFocus={() => { if (searchResults) setShowSearchResults(true); }}
                            />
                        </div>

                        {/* Search dropdown results */}
                        {showSearchResults && searchResults && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-dropdown border border-surface-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                                {/* Forum results */}
                                {searchResults.forums.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider bg-surface-50">
                                            Cộng đồng
                                        </div>
                                        {searchResults.forums.slice(0, 5).map((forum: any) => (
                                            <button
                                                key={forum.id}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 transition-colors cursor-pointer text-left"
                                                onClick={() => {
                                                    setShowSearchResults(false);
                                                    setSearchQuery("");
                                                    navigate(`/r/${forum.name}`);
                                                }}
                                            >
                                                <Avatar src={forum.forumImage} name={forum.name} className="w-8 h-8 rounded-lg" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-surface-900 truncate">{forum.name}</p>
                                                    <p className="text-xs text-surface-400 truncate">{forum.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Thread results */}
                                {searchResults.threads.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 text-xs font-semibold text-surface-400 uppercase tracking-wider bg-surface-50">
                                            Bài đăng
                                        </div>
                                        {searchResults.threads.slice(0, 5).map((thread: any) => (
                                            <button
                                                key={thread.id}
                                                className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-surface-50 transition-colors cursor-pointer text-left"
                                                onClick={() => {
                                                    setShowSearchResults(false);
                                                    setSearchQuery("");
                                                    navigate(`/r/${thread.forumName ?? "forum"}/${thread.id}`);
                                                }}
                                            >
                                                <svg className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-surface-900 truncate">{thread.title}</p>
                                                    {thread.forumName && (
                                                        <p className="text-xs text-brand-600">{thread.forumName}</p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchResults.forums.length === 0 && searchResults.threads.length === 0 && (
                                    <div className="px-4 py-8 text-center text-sm text-surface-400">
                                        Không tìm thấy kết quả
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Right Slot: Actions */}
                    <div className="flex-1 flex items-center justify-end gap-1">
                        {!isLoggedIn ? (
                            <div className="flex gap-2 items-center">
                                <button 
                                    className="text-sm font-medium text-surface-600 hover:text-surface-900 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setModalState(prev => ({ ...prev, showRegistrationForm: true }));
                                    }}>
                                    Đăng ký
                                </button>
                                <button 
                                    id="login-button"
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
                                    id="create-forum-button"
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
                                        {unreadCount > 0 && (
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
                                        <Avatar 
                                            className="w-8 h-8" 
                                            src={headerAvatarSrc}
                                            name={user.userName || "User"}
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
