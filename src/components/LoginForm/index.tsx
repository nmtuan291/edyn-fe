import { useEffect, useRef, useState } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import { FacebookRounded } from '@mui/icons-material';
import apiSlice from "../../store/api";
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/user';

interface LoginFormProps {
    showForm: boolean,
    closeForm: () => void,
    openRegistrationForm: () => void,
    onLoginSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ showForm, closeForm, openRegistrationForm, onLoginSuccess }) => {
    const [username, setUsername]  = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [failedLogin, setFailedLogin] = useState<boolean>(false);
    const loginForm = useRef<HTMLDivElement>(null);

    const [login, {isLoading}] = apiSlice.useLoginMutation();
    const dispatch = useDispatch();

    const validInput: boolean = username.length >= 5 && password.length >= 8

    useEffect(() => {
        const handleCloseForm = (event: MouseEvent) => {
            if (loginForm.current && !loginForm.current.contains(event.target as Node)) {
                closeForm();
            }
        }

        document.addEventListener("click", handleCloseForm);

        return () => document.removeEventListener("click", handleCloseForm);
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
            localStorage.setItem("jwt", result.accessToken);
            localStorage.setItem("refreshToken", result.refreshToken);
            if (result.id && result.userName) {
                dispatch(setUser({
                    id: result.id,
                    userName: result.userName,
                    email: result.email ?? "",
                }));
            }
            onLoginSuccess?.();
            closeForm();
        } catch (error) {
            setFailedLogin(true);
        }
    }

    if (!showForm) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
                className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 overflow-hidden"
                ref={loginForm}
            >
                {/* Header */}
                <div className="p-6 pb-0 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">🌱</span>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900 mb-2">Đăng nhập</h1>
                    <p className="text-sm text-surface-500 leading-relaxed">
                        Với việc tiếp tục, bạn đồng ý với{' '}
                        <a className="text-brand-600 hover:underline cursor-pointer">Điều khoản dịch vụ</a> và{' '}
                        <a className="text-brand-600 hover:underline cursor-pointer">Chính sách quyền riêng tư</a>.
                    </p>
                </div>

                {/* Form */}
                <div className="p-6">
                    <div className="flex flex-col gap-3 mb-4">
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                            placeholder="Tên người dùng hoặc email" 
                            onChange={(event) => setUsername(event.target.value)}
                            value={username}
                        />
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                            placeholder="Mật khẩu" 
                            onChange={(event) => setPassword(event.target.value)}
                            value={password}
                        />
                    </div>

                    {failedLogin && (
                        <p className="text-sm text-danger mb-4">Thông tin đăng nhập không chính xác</p>
                    )}

                    <button 
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer
                            ${!validInput 
                                ? "bg-surface-100 text-surface-400 cursor-not-allowed" 
                                : "bg-brand-600 hover:bg-brand-700 text-white"
                            }`}
                        onClick={() => handleLogin()}
                        disabled={!validInput}
                    >
                        Đăng nhập
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-5">
                        <div className="flex-1 h-px bg-surface-200" />
                        <span className="px-4 text-xs text-surface-400">Hoặc đăng nhập với</span>
                        <div className="flex-1 h-px bg-surface-200" />
                    </div>

                    {/* Social buttons */}
                    <div className="flex gap-3">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer">
                            <GoogleIcon style={{ fontSize: 20 }} className="text-[#4285F4]" />
                            <span className="text-sm font-medium text-surface-700">Google</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer">
                            <FacebookRounded style={{ fontSize: 20 }} className="text-[#1877F2]" />
                            <span className="text-sm font-medium text-surface-700">Facebook</span>
                        </button>
                    </div>

                    {/* Footer links */}
                    <div className="mt-5 text-center">
                        <a className="text-sm text-brand-600 hover:underline cursor-pointer">Quên mật khẩu?</a>
                        <p className="text-sm text-surface-500 mt-2">
                            Chưa có tài khoản?{' '}
                            <a 
                                className="text-brand-600 font-medium hover:underline cursor-pointer"
                                onClick={(event) => hanldeOpenRegistrationForm(event)}
                            >
                                Đăng ký ngay
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginForm;
