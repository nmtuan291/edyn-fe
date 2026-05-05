import { useState } from "react"
import Modal from "../Modal"
import axios from "../../api/axios";

interface CreateForumProps {
    show: boolean,
    closeModal: () => void
}

const CreateForum: React.FC<CreateForumProps> = ({ show, closeModal }) => {
    const [realmExist, setRealmExists] = useState<boolean>(false);
    const [createRealm, setCreateRelm] = useState({
        realmName: "",
        realmDescription: ""
    })

    const handleCreateRealm = async () => {
        try {
            await axios.post("/forum", {
                name: createRealm.realmName,
                shortName: createRealm.realmName,
                description: createRealm.realmDescription,
                forumBanner: "",
                forumImage: ""
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`
                }
            })
            closeModal();
        } catch (error) {
            console.log(error);
            setRealmExists(true);
        }    
    }
    
    return (
        <Modal show={show} closeModal={closeModal}>
            <div>
                <h2 className="text-lg font-bold text-surface-900 mb-1">Tạo cộng đồng</h2>
                <p className="text-sm text-surface-500 mb-5">Tạo cộng đồng của riêng bạn</p>
                <input 
                    className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                    placeholder="Tên cộng đồng" 
                    onChange={(event) => {
                        const value = event.target.value.replace(/[^a-zA-Z0-9]/g, "");
                        setCreateRelm(prev => ({...prev, realmName: value}))
                    }}
                    value={createRealm.realmName}
                />
                {realmExist && (
                    <p className="mt-1.5 text-sm text-danger">Cộng đồng đã tồn tại</p>
                )}
                <textarea 
                    className="w-full mt-3 px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm resize-none h-40 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                    placeholder="Mô tả cộng đồng"
                    onChange={(event) => setCreateRelm(prev => ({...prev, realmDescription: event.target.value}))}
                    value={createRealm.realmDescription}
                />
                <button 
                    className="mt-4 w-full py-2.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors cursor-pointer"
                    onClick={handleCreateRealm}
                >
                    Tạo cộng đồng
                </button>
            </div>
        </Modal>
    )
}   

export default CreateForum;
