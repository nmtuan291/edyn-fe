import { useState, useEffect, useRef } from "react"
import { FacebookRounded } from '@mui/icons-material';
import apiSlice from "../../store/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
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

    const [register] = apiSlice.useRegisterMutation();
    const [oauthLogin] = apiSlice.useOauthLoginMutation();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const handleCloseForm = (event: MouseEvent) => {
            if (registrationForm.current && !registrationForm.current.contains(event.target as Node)) {
                closeForm();
                setStage(0);
            }
        }

        document.addEventListener("click", handleCloseForm);

        return () => document.removeEventListener("click", handleCloseForm);
    }, []);

    // OAuth: Initialize Google and Facebook SDKs when the form is shown (at Stage 0)
    useEffect(() => {
        if (!showForm || stage !== 0) return;

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
                    }
                }
            });

            // Render Google's native button dynamically in our container
            const btnContainer = document.getElementById("google-signup-btn");
            if (btnContainer) {
                google.accounts.id.renderButton(
                    btnContainer,
                    { 
                        theme: "outline", 
                        size: "large", 
                        text: "signup_with",
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
    }, [showForm, stage]);

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
        closeForm();
        setStage(0);
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
                    }
                };
                doOauth();
            } else {
                console.log("User cancelled Facebook login or did not authorize.");
            }
        }, { scope: "email,public_profile" });
    };

    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setUserInfo(prev => ({
            ...prev,
            [field]: event.target.value
        }))
    }

    const handleNextButton = async () => {
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

    const genderOptions = [
        { value: 0, label: "Nam" },
        { value: 1, label: "Nữ" },
        { value: 2, label: "Không thuộc nam hay nữ" },
        { value: 3, label: "Không muốn tiết lộ" },
    ];

    if (!showForm) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div 
                className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 overflow-hidden"
                ref={registrationForm}
            >
                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <div className="mb-6">
                        <span className="font-logo font-extrabold text-3xl tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                            edyn
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-surface-900 mb-1">Đăng ký</h1>
                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                        {[0, 1, 2].map((step) => (
                            <div
                                key={step}
                                className={`h-1 rounded-full transition-all ${
                                    step <= stage ? "bg-brand-500 w-8" : "bg-surface-200 w-4"
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Stage 0: Email */}
                    {stage === 0 && (
                        <>
                            <p className="text-sm text-surface-500 leading-relaxed mb-5 text-center">
                                Với việc tiếp tục, bạn đồng ý với{' '}
                                <a className="text-brand-600 hover:underline cursor-pointer">Điều khoản dịch vụ</a> và{' '}
                                <a className="text-brand-600 hover:underline cursor-pointer">Chính sách quyền riêng tư</a>.
                            </p>
                            <div className="mb-4">
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                                    placeholder="Email" 
                                    onChange={(event) => handleFieldChange(event, "email")}
                                    value={userInfo.email}
                                />
                                {errors.email && (
                                    <p className="text-sm text-danger mt-1.5">{errors.email}</p>
                                )}
                            </div>

                            <div className="flex items-center my-5">
                                <div className="flex-1 h-px bg-surface-200" />
                                <span className="px-4 text-xs text-surface-400">Hoặc tiếp tục với</span>
                                <div className="flex-1 h-px bg-surface-200" />
                            </div>

                            {/* Social buttons */}
                            <div className="flex gap-3 items-center justify-center">
                                <div id="google-signup-btn" className="flex-1 flex justify-center min-h-[40px]"></div>
                                <button 
                                    onClick={handleFacebookLogin}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 transition-all cursor-pointer min-h-[40px]"
                                >
                                    <FacebookRounded style={{ fontSize: 20 }} className="text-[#1877F2]" />
                                    <span className="text-sm font-medium text-surface-700">Facebook</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Stage 1: Credentials */}
                    {stage === 1 && (
                        <div className="flex flex-col gap-3 mb-4">
                            <div>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                                    placeholder="Tên đăng nhập"
                                    onChange={event => handleFieldChange(event, "userName")}
                                    value={userInfo.userName}
                                />
                                {errors.userName && (
                                    <p className="text-sm text-danger mt-1.5">{errors.userName}</p>
                                )}
                            </div>
                            <input 
                                type="password" 
                                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                                placeholder="Mật khẩu"
                                onChange={event => handleFieldChange(event, "password")}
                                value={userInfo.password} 
                            />
                            <input 
                                type="password" 
                                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all placeholder:text-surface-400" 
                                placeholder="Xác nhận mật khẩu" 
                                onChange={event => handleFieldChange(event, "passwordVerify")}
                                value={userInfo.passwordVerify}
                            />
                        </div>
                    )}

                    {/* Stage 2: Gender */}
                    {stage === 2 && (
                        <div>
                            <button 
                                className="absolute top-5 right-5 text-sm text-surface-400 hover:text-surface-600 transition-colors cursor-pointer"
                                onClick={closeForm}
                            >
                                Bỏ qua
                            </button>
                            <p className="text-sm text-surface-500 text-center mb-6">
                                Hãy cho chúng tôi biết rõ hơn về bạn
                            </p>
                            <p className="text-sm font-semibold text-surface-700 text-center mb-3">
                                Giới tính của bạn là gì?
                            </p>
                            <div className="flex flex-col gap-2">
                                {genderOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer
                                            ${userInfo.gender === option.value 
                                                ? "bg-brand-50 border-2 border-brand-500 text-brand-700" 
                                                : "bg-surface-50 border border-surface-200 text-surface-700 hover:bg-surface-100"
                                            }`}
                                        onClick={() => setUserInfo(prev => ({...prev, gender: option.value}))}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action button */}
                    <button 
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer mt-6
                            ${!validInput 
                                ? "bg-surface-100 text-surface-400 cursor-not-allowed" 
                                : "bg-brand-600 hover:bg-brand-700 text-white"
                            }`}
                        onClick={() => handleNextButton()}
                    >
                        {stage === 2 ? "Hoàn tất" : "Tiếp tục"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegistrationForm;
