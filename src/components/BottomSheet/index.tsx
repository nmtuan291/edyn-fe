interface BottomSheetProps {
    title: string,
    children: React.ReactNode
}

const BottomSheet: React.FC<BottomSheetProps> = ({ title, children }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50">
            <div className="w-full bg-white rounded-t-2xl shadow-modal">
                <div className="w-10 h-1 bg-surface-300 rounded-full mx-auto mt-3" />
                <div className="p-5">
                    <h2 className="text-lg font-bold text-surface-900 mb-4">{title}</h2>
                    {children}
                </div>
            </div>
        </div>
    )
}

export default BottomSheet;
