import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar";
import ChatWidget from "../components/Chat/ChatWidget";
import { ChatProvider } from "../contexts/ChatContext";

const Layout: React.FC = () => {

    return (
        <ChatProvider>
            <div>
                <Header />
                <main className="flex gap-60">
                    <div className="w-72 md:block hidden">
                        <Sidebar></Sidebar>
                    </div>
                    <Outlet />
                </main>
                <ChatWidget />
            </div>
        </ChatProvider>
    )
}

export default Layout;