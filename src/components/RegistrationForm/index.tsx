import { useState, useEffect, useRef } from "react"
import GoogleIcon from '@mui/icons-material/Google';
import { FacebookRounded } from '@mui/icons-material';

interface RegistrationFormProps {
    showForm: boolean,
    closeForm: () => void
}


const RegistrationForm: React.FC<RegistrationFormProps> = ( {showForm, closeForm}) => {
    const registrationForm = useRef<HTMLDivElement>(null);
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
                                    />
                            </div>
                            <span className='text-red-500 text-sm hidden'>Thông tin đăng nhập không chính xác</span>
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
                                    />
                                <input 
                                    type="text" 
                                    className="bg-gray-300 p-3 rounded-md" 
                                    placeholder="Mật khẩu" 
                                    />
                                <input 
                                    type="text" 
                                    className="bg-gray-300 p-3 rounded-md" 
                                    placeholder="Xác nhận mật khẩu" 
                                    />
                            </div>
                            <span className='text-red-500 text-sm hidden'>Thông tin đăng nhập không chính xác</span>
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
                                        <button className="bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer">Nam</button>
                                    </li>
                                    <li>
                                        <button className="bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer">Nữ</button>
                                    </li>
                                    <li>
                                        <button className="bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer">Không thuộc nam hay nữ</button>
                                    </li>
                                    <li>
                                        <button className="bg-gray-200 w-full p-3 rounded-3xl font-bold hover:bg-gray-300 cursor-pointer    ">Không muốn tiết lộ</button>
                                    </li>
                                </ul>
                            </div>
                        </>
                    }


                    <button 
                        className={`mt-40 p-2 rounded-xl font-bold cursor-pointer
                            ${!validInput ? "bg-gray-300 text-gray-500" : "bg-orange-600 text-white"}`}
                        onClick={() => setStage(prev => Math.min(prev + 1, 2))}
                    >
                        Tiếp tục
                    </button>
                </div>
            </div>
    )
}

export default RegistrationForm;