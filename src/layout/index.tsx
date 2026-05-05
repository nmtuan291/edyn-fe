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
                <div className="flex w-full pt-16">
                    <aside className="hidden lg:flex w-[72px] shrink-0 flex-col items-center sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pl-2 pr-0 sm:pl-3">
                        <Sidebar />
                    </aside>
                    <main className="flex-1 min-w-0 max-w-2xl mx-auto px-4 py-6">
                        <Outlet />
                    </main>
                    <div id="context-panel" className="hidden xl:block w-80 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pl-4 pr-2 py-6 sm:pr-3" />
                </div>
                <ChatWidget />
            </div>
        </ChatProvider>
    )
}

export default Layout;
