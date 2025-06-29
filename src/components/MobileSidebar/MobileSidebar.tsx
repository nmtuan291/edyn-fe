import Sidebar from "../Sidebar"

const MobileSidebar: React.FC = () => {

    return (
        <div className="bg-[rgba(0,0,0,0.5)] absolute top-13 w-screen h-screen">
            <div className="w-72">
                <Sidebar />
            </div>
        </div>
    )
}

export default MobileSidebar;