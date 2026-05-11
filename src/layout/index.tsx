import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar";
import ChatWidget from "../components/Chat/ChatWidget";
import { ChatProvider } from "../contexts/ChatContext";

const Layout: React.FC = () => {

    return (
        <ChatProvider>
            <div className="min-h-screen bg-surface-50">
                <Header />
                <div className="flex w-full pt-16 px-4 sm:px-6 md:px-8">
                    {/* Left Slot - forces centering of main content */}
                    <div className="flex-1 hidden lg:flex justify-start">
                        <aside className="w-[72px] sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex flex-col items-center">
                            <Sidebar />
                        </aside>
                    </div>

                    {/* Center Slot - truly centered in the viewport */}
                    <main className="shrink-0 w-full max-w-2xl py-6">
                        <Outlet />
                    </main>

                    {/* Right Slot - balances the left side for perfect centering */}
                    <div className="flex-1 hidden lg:flex justify-end">
                        <div id="context-panel" className="hidden xl:block w-80 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6" />
                    </div>
                </div>
                <ChatWidget />
            </div>
        </ChatProvider>
    )
}

export default Layout;
