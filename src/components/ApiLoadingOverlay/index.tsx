import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const ApiLoadingOverlay: React.FC = () => {
    const pending = useSelector((s: RootState) => s.ui.apiInFlightCount > 0);
    if (!pending) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden pointer-events-none"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Đang tải"
        >
            <div
                className="h-full rounded-full"
                style={{
                    background: "linear-gradient(90deg, #10B981, #059669, #10B981)",
                    animation: "topbar-slide 1.4s ease-in-out infinite",
                }}
            />
            <style>{`
                @keyframes topbar-slide {
                    0%   { width: 0%;   margin-left: 0%; }
                    30%  { width: 40%;  margin-left: 0%; }
                    70%  { width: 40%;  margin-left: 60%; }
                    100% { width: 0%;   margin-left: 100%; }
                }
            `}</style>
        </div>
    );
};

export default ApiLoadingOverlay;
