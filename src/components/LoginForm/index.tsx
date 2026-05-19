import { useEffect, useRef, useState } from 'react';
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
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [failedLogin, setFailedLogin] = useState<boolean>(false);
    const loginForm = useRef<HTMLDivElement>(null);

    const [login] = apiSlice.useLoginMutation();
    const [oauthLogin] = apiSlice.useOauthLoginMutation();
    const dispatch = useDispatch();

    const validInput: boolean = username.length >= 5 && password.length >= 8;

    useEffect(() => {
        const handleCloseForm = (event: MouseEvent) => {
            if (loginForm.current && !loginForm.current.contains(event.target as Node)) {
                closeForm();
            }
        }

        document.addEventListener("click", handleCloseForm);

        return () => document.removeEventListener("click", handleCloseForm);
    }, []);

    // OAuth: Initialize Google and Facebook SDKs when the form is shown
    useEffect(() => {
        if (!showForm) return;

        // Initialize Google Identity Services (GSI)
        const google = (window as any).google;
        if (google) {
            google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
                callback: async (response: any) => {
                    try {
                        const result = await oauthLogin({
                            provider: "google",
                            idToken: response.credential
                        }).unwrap();
                        handleOauthSuccess(result);
                    } catch (err) {
                        console.error("Google Login failed", err);
                        setFailedLogin(true);
                    }
                }
            });

            // Render Google's native button dynamically in our container
            const btnContainer = document.getElementById("google-signin-btn");
            if (btnContainer) {
                google.accounts.id.renderButton(
                    btnContainer,
                    {
                        theme: "outline",
                        size: "large",
                        text: "signin_with",
                        shape: "rectangular",
                        logo_alignment: "left",
                        width: btnContainer.clientWidth || 180
                    }
                );
            }

            // Trigger Google One Tap automatic prompt
            google.accounts.id.prompt();
        }

        // Initialize Facebook SDK
        const FB = (window as any).FB;
        if (FB) {
            FB.init({
                appId: import.meta.env.VITE_FACEBOOK_APP_ID || "",
                cookie: true,
                xfbml: true,
                version: "v19.0"
            });
        }
    }, [showForm]);

    const handleOauthSuccess = (result: any) => {
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
    };

    const handleFacebookLogin = () => {
        const FB = (window as any).FB;
        if (!FB) {
            alert("Facebook SDK is still loading. Please try again in a moment.");
            return;
        }

        FB.login((response: any) => {
            if (response.authResponse) {
                const doOauth = async () => {
                    try {
                        const result = await oauthLogin({
                            provider: "facebook",
                            idToken: response.authResponse.accessToken
                        }).unwrap();
                        handleOauthSuccess(result);
                    } catch (err) {
                        console.error("Facebook Login failed", err);
                        setFailedLogin(true);
                    }
                };
                doOauth();
            } else {
                console.log("User cancelled Facebook login or did not authorize.");
            }
        }, { scope: "email,public_profile" });
    };

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
                <div className="p-8 pb-0 text-center">
                    <div className="mb-6">
                        <span className="font-logo font-extrabold text-3xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                            edyn
                        </span>
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
                    <div className="flex gap-3 items-center justify-center">
                        <div className="flex-1 relative min-h-[40px] flex items-center justify-center">
                            {/* Custom styled Google button */}
                            <button
                                className="w-full flex items-center justify-center gap-2 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 transition-all cursor-pointer min-h-[40px]"
                            >
                                <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
                                    <path
                                        fill="#EA4335"
                                        d="M5.26620003,9.76451671 C6.19875005,6.93863338 8.85233337,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.52545455 16.4,6.54545455 L19.9254545,3.02 C17.7927273,1.15090909 15.0272727,0 12,0 C7.33090909,0 3.32727273,2.69090909 1.39090909,6.61636364 L5.26620003,9.76451671 Z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M16.0407,17.6925833 C14.89675,18.4566667 13.5186,18.9090909 12,18.9090909 C8.85233337,18.9090909 6.19875005,16.8795485 5.26620003,14.0536652 L1.39090909,17.2018182 C3.32727273,21.1272727 7.33090909,23.8181818 12,23.8181818 C15.0272727,23.8181818 17.7981818,22.7181818 19.8981818,20.8418182 L16.0407,17.6925833 Z"
                                    />
                                    <path
                                        fill="#4285F4"
                                        d="M23.8181818,12 C23.8181818,11.16 23.7381818,10.3854545 23.5909091,9.63818182 L12,9.63818182 L12,14.1709091 L18.6272727,14.1709091 C18.3490909,15.66 17.5036364,16.9254545 16.2436364,17.7709091 L20.1010909,20.9200003 C22.3527273,18.8454545 23.8181818,15.7090909 23.8181818,12 Z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.26620003,9.76451671 C4.97855,10.6383333 4.81818182,11.57425 4.81818182,12.5454545 C4.81818182,13.5166591 4.97855,14.4525758 5.26620003,15.3263924 L1.39090909,12.1782394 C0.505454545,10.1509091 0.505454545,7.85454545 1.39090909,5.82727273 L5.26620003,9.76451671 Z"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-surface-700">Google</span>
                            </button>
                            {/* Hidden native GSI button mapped over it */}
                            <div
                                id="google-signin-btn"
                                className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!min-w-full [&_iframe]:!cursor-pointer"
                            ></div>
                        </div>
                        <button
                            onClick={handleFacebookLogin}
                            className="flex-1 flex items-center justify-center gap-2 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 transition-all cursor-pointer min-h-[40px]"
                        >
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
