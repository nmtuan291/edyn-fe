import { useState, useEffect, useRef } from "react"
import GoogleIcon from '@mui/icons-material/Google';
import { FacebookRounded, Password } from '@mui/icons-material';
import apiSlice from "../../store/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";

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

    const [register, { isLoading: isRegistering }] = apiSlice.useRegisterMutation();
    const dispatch = useDispatch<AppDispatch>();

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

        const verifyInfo = async (field: "email" | "userName", value: string) => {
            try {
                if (field === "email") {
                    await dispatch(apiSlice.endpoints.verifyEmail.initiate(value)).unwrap();
                } else {
                    await dispatch(apiSlice.endpoints.verifyUserName.initiate(value)).unwrap();
                }
                return true;
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    [field]: field === "email" ? "Email đã tồn tại" : "Tên đăng nhập đã tồn tại"
                }));
                return false;
            }
        };

        switch (stage) {
            case 0:
                const emailExists = await verifyInfo("email", userInfo.email);
                if (emailExists)
                    setStage(prev => prev + 1);
                break;
            case 1: 
                const userExists = await verifyInfo("userName", userInfo.userName);
                if (userExists)
                    setStage(prev => prev + 1);
                break;
            case 2:
                try {
                    await register(userInfo).unwrap();
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
                            <a className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"> Điều khoản dịch vụ</a> và 
                            <a className="text-emerald-600 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"> Chính sách quyền riêng tư </a> 
                            của chúng tôi.
                        </p>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="text" 
                                className="bg-green-50 border border-green-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200" 
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
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-green-50 cursor-pointer transition-colors ${userInfo.gender === 0 && "border-2 border-emerald-500 bg-green-50"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 0}))}>
                                        Nam
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-green-50 cursor-pointer transition-colors ${userInfo.gender === 1 && "border-2 border-emerald-500 bg-green-50"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 1}))}>
                                        Nữ
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-green-50 cursor-pointer transition-colors ${userInfo.gender === 2 && "border-2 border-emerald-500 bg-green-50"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 2}))}>
                                        Không thuộc nam hay nữ
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className={`bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-green-50 cursor-pointer transition-colors ${userInfo.gender === 3 && "border-2 border-emerald-500 bg-green-50"}`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: 3}))}>
                                        Không muốn tiết lộ
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                }


                <button 
                    className={`mt-40 p-2 rounded-xl font-bold cursor-pointer transition-all duration-200
                        ${!validInput ? "bg-gray-300 text-gray-500" : "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white"}`}
                    onClick={() => handleNextButton()}
                >
                    Tiếp tục
                </button>
            </div>
        </div>
    )
}

export default RegistrationForm;