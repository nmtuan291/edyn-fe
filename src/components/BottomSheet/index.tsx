
interface BottomSheetProps {
    title: string,
    children: React.ReactNode
}

const BottomSheet: React.FC<BottomSheetProps> = ({ title, children }) => {
    
    return (
        <div className="fixed w-screen h-screen top-0 bg-[rgba(0,0,0,0.7)] flex items-end">
            <div className="w-full h-auto bg-white rounded-t-3xl p-4">
                <h2 className="text-xl font-bold text-gray-600">{title}</h2>
                <div className="mt-4">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default BottomSheet;