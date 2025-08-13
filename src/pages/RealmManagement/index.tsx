import { useState } from "react"


const RealmManagement: React.FC = () => {
    const [currentTab, setCurrentTab] = useState<"member" | "mod" | "banned">("member");
    

    return (
        <div>
            <div className="px-6 py-10 w-screen md:w-3xl">
                <h1 className="text-3xl font-bold">Thiết lập</h1>
                <div className="mt-3 flex justify-center">
                    <button 
                        className="p-2 w-full text-sm text-center font-bold text-gray-500"
                        onClick={() => setCurrentTab("member")}
                    >
                        Thành viên
                    </button>
                    <button 
                        className="p-2 w-full text-sm text-center font-bold text-gray-500"
                        onClick={() => setCurrentTab("mod")}
                    >
                        Kiểm duyệt viên
                    </button>
                    <button 
                        className="p-2 w-full text-sm text-center font-bold text-gray-500"
                        onClick={() => setCurrentTab("banned")}
                    >
                        Bị chặn
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RealmManagement