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
            console.log(localStorage.getItem("jwt"))
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
        } catch (error) {
            console.log(error);
            setRealmExists(true);
        }    
    }
    
    return (
        <div>
            <Modal show={show} closeModal={closeModal}>
                <div className="p-2">
                    <h2>Tạo realm của riêng bạn</h2> 
                    <input 
                        className="mt-2 border border-gray-400 rounded-xl p-2 w-full" 
                        placeholder="Tên realm" 
                        onChange={(event) => {
                            const value = event.target.value.replace(/[^a-zA-Z0-9]/g, "");
                            setCreateRelm(prev => ({...prev, realmName: value}))
                        }}
                        value={createRealm.realmName}/>
                    <p className="mt-1 text-sm text-red-500">{realmExist && "Realm đã tồn tại"}</p>
                    <textarea 
                        className="border mt-2 resize-none h-[300px] w-full rounded-xl p-2 border-gray-400" 
                        placeholder="Mô tả realm"
                        onChange={(event) => setCreateRelm(prev => ({...prev, realmDescription: event.target.value}))}
                        value={createRealm.realmDescription}/>
                    <button 
                        className="block bg-orange-600 text-white p-2 rounded-3xl cursor-pointer hover:opacity-80 "
                        onClick={handleCreateRealm}>
                            Tạo realm
                        </button>
                </div>
            </Modal>
        </div>
    )
}   

export default CreateForum;