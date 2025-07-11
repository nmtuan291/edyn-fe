import { useState, useEffect, useRef } from "react"
import GoogleIcon from '@mui/icons-material/Google';
import { FacebookRounded, Password } from '@mui/icons-material';
import axios from "../../api/axios";
import { useStepContext } from "@mui/material/Step";
import { setUser } from "../../store/user";

interface RegistrationFormProps {
    showForm: boolean,
    closeForm: () => void
}


const RegistrationForm: React.FC<RegistrationFormProps> = ( {showForm, closeForm}) => {
    const registrationForm = useRef<HTMLDivElement>(null);
    const [userInfo, setUserInfo] = useState({
        email: "",
        userName: "",
        password: "",
        passwordVerify: "",
        gender: 0
    });
    const [errors, setErrors] = useState({
        email: "",
        userName: ""
    })
    const validInput: boolean = true;
    const [stage, setStage] = useState<number>(0);

    useEffect(() => {
        const handleCloseForm = (event: MouseEvent) => {
            if (registrationForm.current && !registrationForm.current.contains(event.target as Node)) {
                closeForm();
                setStage(0);
            }
        }

        document.addEventListener("click", handleCloseForm);

        return () => removeEventListener("click", handleCloseForm);
    }, [])

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setUserInfo(prev => ({
            ...prev,
            [field]: event.target.value
        }))
    }

    const  handleNextButton = async () => {

        const verifyInfo = async (field: "email" | "userName"): Promise<boolean> => {
            const info = field === "email" ? `/verify-email?email=${encodeURIComponent(userInfo.email)}` : `/verify-user?username=${encodeURIComponent(userInfo.userName)}`;
            try {
                await axios.get(`/auth${info}`)
                return true;
            } catch (error) {
                setErrors(prev => ({...prev, [field]: field === "email" ? "Email đã tồn tại" : "Tên đăng nhập đã tồn tại"}))
                return false
            }

        }

        switch (stage) {
            case 0:
                const emailExists = await verifyInfo("email");
                if (emailExists)
                    setStage(prev => prev + 1);
                break;
            case 1: 
                const userExists = await verifyInfo("userName");
                if (userExists)
                    setStage(prev => prev + 1);
                break;
            case 2:
                try {
                    const repsonse = axios.post("/auth/register", userInfo);
                } catch (error) {
                    console.log(error);                    
                }
                break;
        }
    }

    return (
        <div className={`fixed top-0 bg-[rgba(0,0,0,0.7)] w-screen h-screen flex items-center justify-center
            ${showForm ? "" : "hidden"} z-50`}>
            <div 
                className="bg-white h-4/5 p-16 rounded-2xl flex flex-col gap-4 w-[500px] relative"
                ref={registrationForm}>
                {
                    stage === 0 &&
                    <>
                        <h1 className="text-center text-2xl font-bold">Đăng ký</h1>
                        <p>
                            Với việc tiếp tục đăng ký, bạn sẽ đồng ý với 
                            <a className="text-blue-500 hover:underline cursor-pointer"> Điều khoản dịch vụ</a> và 
                            <a className="text-blue-500 hover:underline cursor-pointer"> Chính sách quyền riêng tư </a> 
                            của chúng tôi.
                        </p>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="text" 
                                className="bg-gray-300 p-3 rounded-md" 
                                placeholder="Email" 
                                onChange={(event) => handleFieldChange(event, "email")}
                                value={userInfo.email}
                                />
                            <span className="text-sm text-red-500">{errors.email}</span>
                        </div>
                        <div>
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 text-gray-500">Hoặc tiếp tục với</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                            <GoogleIcon style={{ color: '#4285F4', fontSize: 40 }} />
                            <FacebookRounded style={{ color: '#4285F4', fontSize: 40, marginLeft: 10 }} />
                        </div>
                    </>
                }

                {
                    stage === 1 &&
                    <>
                        <h1 className="text-center text-2xl font-bold">Đăng ký</h1>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="text" 
                                className="bg-gray-300 p-3 rounded-md" 
                                placeholder="Tên đăng nhập"
                                onChange={event => handleFieldChange(event, "userName")}
                                value={userInfo.userName}
                                />
                            <input 
                                type="text" 
                                className="bg-gray-300 p-3 rounded-md" 
                                placeholder="Mật khẩu"
                                onChange={event => handleFieldChange(event, "password")}
                                value={userInfo.password} 
                                />
                            <input 
                                type="text" 
                                className="bg-gray-300 p-3 rounded-md" 
                                placeholder="Xác nhận mật khẩu" 
                                onChange={event => handleFieldChange(event, "passwordVerify")}
                                value={userInfo.passwordVerify}
                                />
                        </div>
                        <div>
                            <div className="flex items-center my-4">
                                <div className="flex-grow border-t border-gray-300"></div>
                                <span className="mx-4 text-gray-500">Hoặc tiếp tục với</span>
                                <div className="flex-grow border-t border-gray-300"></div>
                            </div>
                            <GoogleIcon style={{ color: '#4285F4', fontSize: 40 }} />
                            <FacebookRounded style={{ color: '#4285F4', fontSize: 40, marginLeft: 10 }} />
                        </div>
                    </>
                }

{
                    stage === 2 &&
                    <>
                        <button className="absolute top-5 right-7 font-bold text-gray-400 hover:bg-gray-200 p-1 rounded-3xl cursor-pointer">Bỏ qua</button>
                        <h1 className="text-center text-2xl font-bold">Đăng ký</h1>
                        <p className="text-center text-sm">Hãy cho chúng tôi biết rõ hơn về bạn</p>
                        <div className="mt-10">
                            <p className="text-center text-sm font-bold text-gray-500">Giới tính của bạn là gì?</p>
                            <ul className="mt-2 flex flex-col gap-2">
                                <li>
                                    <button 
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer ${userInfo.gender === 0 && "border border-green-500"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 0}))}>
                                        Nam
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer ${userInfo.gender === 1 && "border border-green-500"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 1}))}>
                                        Nữ
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer ${userInfo.gender === 2 && "border border-green-500"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 2}))}>
                                        Không thuộc nam hay nữ
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer ${userInfo.gender === 3 && "border border-green-500"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 3}))}>
                                        Không muốn tiết lộ
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                }


                <button 
                    className={`mt-40 p-2 rounded-xl font-bold cursor-pointer
                        ${!validInput ? "bg-gray-300 text-gray-500" : "bg-orange-600 text-white"}`}
                    onClick={() => handleNextButton()}
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    )
}

export default RegistrationForm;