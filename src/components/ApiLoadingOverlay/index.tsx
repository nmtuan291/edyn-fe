import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import "../Loader/Loader.css";

/**
 * Full-screen overlay while any RTK Query request using the shared baseQuery is in flight.
 * Parallel requests share one overlay until all complete (see `apiInFlightCount` in ui slice).
 */
const ApiLoadingOverlay: React.FC = () => {
    const pending = useSelector((s: RootState) => s.ui.apiInFlightCount > 0);
    if (!pending) return null;

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-white/70 backdrop-blur-sm pointer-events-auto"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Đang tải"
        >
            <div className="loader" aria-hidden>
                <span className="item" />
                <span className="item" />
                <span className="item" />
                <span className="item" />
            </div>
        </div>
    );
};

export default ApiLoadingOverlay;
