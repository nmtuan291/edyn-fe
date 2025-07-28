import "./Loader.css";

const Loader: React.FC = () => {
    return (
        <div className="w-screen h-screen fixed top-0 flex justify-center items-center z-50 bg-[rgba(255,255,255,0.3)]">
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