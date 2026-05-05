import "./Loader.css";

const Loader: React.FC = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/60 backdrop-blur-sm">
            <div className="loader">
                <span className="item"></span>
                <span className="item"></span>
                <span className="item"></span>
                <span className="item"></span>
            </div>
        </div>
    )
}

export default Loader;
