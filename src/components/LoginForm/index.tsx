import axios from "../../api/axios";
import GoogleIcon from '@mui/icons-material/Google';
import { AccessibleForwardOutlined, FacebookRounded } from '@mui/icons-material';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import apiSlice from "../../store/api";

interface LoginFormProps {
    showForm: boolean,
    closeForm: () => void,
    openRegistrationForm: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ showForm, closeForm, openRegistrationForm }) => {
    const [username, setUsername]  = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [failedLogin, setFailedLogin] = useState<boolean>(false);
    const loginForm = useRef<HTMLDivElement>(null);

    const [login, {isLoading}] = apiSlice.useLoginMutation();

    const validInput: boolean = username.length >= 5 && password.length >= 8

    useEffect(() => {
        const handleCloseForm = (event: MouseEvent) => {
            if (loginForm.current && !loginForm.current.contains(event.target as Node)) {
                closeForm();
            }
        }

        document.addEventListener("click", handleCloseForm);

        return () => removeEventListener("click", handleCloseForm);
    }, [])

    const hanldeOpenRegistrationForm = (event: React.MouseEvent) => {
        event.stopPropagation();
        closeForm();
        openRegistrationForm();
    }

    const handleLogin = async () => {
        try {
            const result = await login({
                username,
                password,
                isEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)
            }).unwrap();
            localStorage.setItem("jwt", result.token);
        } catch (error) {
            setFailedLogin(true);
        }
    }

    return (
        <div className={`fixed top-0 bg-[rgba(0,0,0,0.7)] w-screen h-screen flex items-center justify-center
            ${showForm ? "" : "hidden"} z-50`}>
            <div 
                className="bg-white h-10/12 p-16 rounded-2xl flex flex-col gap-2 w-[500px]"
                ref={loginForm}>
                <h1 className="text-center text-2xl font-bold">Đăng nhập</h1>
                <p>
                    Với việc tiếp tục đăng nhập, bạn sẽ đồng ý với 
                    <a className="text-blue-500 hover:underline cursor-pointer"> Điều khoản dịch vụ</a> và 
                    <a className="text-blue-500 hover:underline cursor-pointer"> Chính sách quyền riêng tư </a> 
                     của chúng tôi.
                </p>
                <div className="flex flex-col gap-2">
                    <input 
                        type="text" 
                        className="bg-gray-300 p-3 rounded-md" 
                        placeholder="Tên người dùng hoặc email" 
                        onChange={(event) => setUsername(event.target.value)}
                        value={username}/>
                    <input 
                        type="text" 
                        className="bg-gray-300 p-3 rounded-md" 
                        placeholder="Mật khẩu" 
                        onChange={(event) => setPassword(event.target.value)}
                        value={password}/>
                </div>
                <span className={`text-red-500 text-sm`}>{failedLogin ? "Thông tin đăng nhập không chính xác" : ""}</span>
                <div>
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-500">Hoặc đăng nhập với</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <GoogleIcon style={{ color: '#4285F4', fontSize: 40 }} />
                    <FacebookRounded style={{ color: '#4285F4', fontSize: 40, marginLeft: 10 }} />
                </div>
                <div className="mt-2">
                    <a className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">Quên mật khẩu?</a>
                    <p className="text-sm mt-2">
                        Chưa có tài khoản?
                        <a 
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            onClick={(event) => hanldeOpenRegistrationForm(event)}> 
                            Đăng ký ngay
                        </a>
                    </p>
                </div>
                <button 
                    className={`mt-40 p-2 rounded-xl font-bold cursor-pointer
                        ${!validInput ? "bg-gray-300 text-gray-500" : "bg-orange-600 text-white"}`}
                    
                    onClick={() => handleLogin()}
                >
                    Đăng nhập
                </button>
            </div>
        </div>
    )
}

export default LoginForm;