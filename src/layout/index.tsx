import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar";

const Layout: React.FC = () => {

    return (
        <div>
            <Header />
            <main className="flex gap-60">
                <div className="w-72 md:block hidden">
                    <Sidebar></Sidebar>
                </div>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout;