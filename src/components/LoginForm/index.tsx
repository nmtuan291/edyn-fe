import GoogleIcon from '@mui/icons-material/Google';
import { FacebookRounded } from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';

interface LoginFormProps {
    showForm: boolean,
    closeForm: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ showForm, closeForm }) => {
    const [username, setUsername]  = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const loginForm = useRef<HTMLDivElement>(null);

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

    return (
        <div className={`fixed top-0 bg-[rgba(0,0,0,0.7)] w-screen h-screen flex items-center justify-center
            ${showForm ? "" : "hidden"} z-50`}>
            <div 
                className="bg-white h-10/12 p-16 rounded-2xl flex flex-col gap-4 w-[500px]"
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
                <span className='text-red-500 text-sm hidden'>Thông tin đăng nhập không chính xác</span>
                <div>
                    <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-500">Hoặc đăng nhập với</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <GoogleIcon style={{ color: '#4285F4', fontSize: 40 }} />
                    <FacebookRounded style={{ color: '#4285F4', fontSize: 40, marginLeft: 10 }} />
                </div>
                <button 
                    className={`mt-40 p-2 rounded-xl font-bold cursor-pointer
                        ${!validInput ? "bg-gray-300 text-gray-500" : "bg-orange-600 text-white"}`}
                    disabled={validInput}
                >
                    Đăng nhập
                </button>
            </div>
        </div>
    )
}

export default LoginForm;